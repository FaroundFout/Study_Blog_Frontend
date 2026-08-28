const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const loginFile = "src/app/admin/login/page.tsx";
const guardFile = "src/hooks/use-require-admin.ts";

// Exercise the actual components and installed router wrapper without a browser,
// credentials, or network. This small hook host models dependency comparison,
// state-driven renders, and effect cleanup; it is not a DOM/integration test.
function createHost(file, { token = "test-token", hydrated = true, pending = false } = {}) {
  const slots = [];
  const requests = [];
  const redirects = [];
  const authWrites = [];
  let cursor = 0;
  let queuedEffects = [];
  let dirty = true;
  let mounted = true;
  let output;

  function changed(previous, next) {
    return !previous || !next || previous.length !== next.length ||
      next.some((value, index) => !Object.is(value, previous[index]));
  }

  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) {
        const slot = { value: typeof initial === "function" ? initial() : initial };
        slot.set = (next) => {
          const value = typeof next === "function" ? next(slot.value) : next;
          if (!Object.is(value, slot.value)) {
            slot.value = value;
            dirty = true;
          }
        };
        slots[index] = slot;
      }
      return [slots[index].value, slots[index].set];
    },
    useEffect(setup, dependencies) {
      const index = cursor++;
      if (changed(slots[index]?.dependencies, dependencies)) {
        const previous = slots[index];
        queuedEffects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, setup, cleanup: setup() };
        });
      }
    },
    useMemo(create, dependencies) {
      const index = cursor++;
      if (changed(slots[index]?.dependencies, dependencies)) {
        slots[index] = { dependencies, value: create() };
      }
      return slots[index].value;
    },
    useCallback(callback, dependencies) {
      return react.useMemo(() => callback, dependencies);
    },
    useTransition() {
      return [false, (action) => action()];
    }
  };
  const store = {
    token, hydrated, user: null,
    restore() { dirty = true; },
    setAuth(payload) {
      authWrites.push(payload);
      Object.assign(store, payload, { hydrated: true });
      dirty = true;
    },
    clearAuth() {
      Object.assign(store, { token: null, user: null, hydrated: true });
      dirty = true;
    }
  };
  const pathname = file === loginFile ? "/admin/login" : "/write";
  const searchParams = new URLSearchParams();
  const nextRouter = { replace: (href) => redirects.push(href), push() {} };
  const emptyComponent = () => null;
  const mocks = {
    react,
    "react/jsx-runtime": { jsx: emptyComponent, jsxs: emptyComponent },
    "next/navigation": {
      useRouter: () => nextRouter,
      usePathname: () => pathname,
      useSearchParams: () => searchParams
    },
    nprogress: { start() {}, done() {} },
    "lucide-react": {},
    "next/image": emptyComponent,
    "next/link": emptyComponent,
    "@/components/ui/button": { Button: emptyComponent },
    "@/components/ui/input": { Input: emptyComponent },
    "@/store/auth-store": { useAuthStore: () => store },
    "@/lib/auth-storage": {
      ADMIN_AUTH_CHANGED_EVENT: "test-auth-changed",
      readStoredAdminAuth: () => ({ token: store.token, user: store.user })
    },
    "@/lib/article-editor": {
      buildAdminLoginPath: (redirect, reason) =>
        `/admin/login?redirect=${encodeURIComponent(redirect)}${reason ? `&reason=${reason}` : ""}`
    },
    "@/lib/api": {
      getCurrentAdmin(requestToken) {
        let resolve, reject;
        const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
        requests.push({ token: requestToken, resolve, reject });
        if (!pending) resolve({ id: 1, nickname: "Test admin" });
        return promise;
      },
      loginAdmin() { throw new Error("Login submission is outside this unit test."); }
    },
    "./admin-login.module.css": {}
  };

  function load(source, filename) {
    const module = { exports: {} };
    vm.runInNewContext(source, {
      module, exports: module.exports,
      require(id) {
        if (!(id in mocks)) throw new Error(`Unexpected import: ${id}`);
        return mocks[id];
      },
      window: {
        requestAnimationFrame(callback) { callback(); return 1; },
        cancelAnimationFrame() {}, addEventListener() {}, removeEventListener() {}
      }
    }, { filename });
    return module.exports;
  }

  // Use the real package: its router object is new on every render, while its
  // replace/push callbacks keep their identity when pathname/router are unchanged.
  const routerFile = require.resolve("nextjs-toploader/app");
  mocks["nextjs-toploader/app"] = load(fs.readFileSync(routerFile, "utf8"), routerFile);
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
  }).outputText;
  const exports = load(compiled, file);
  const component = exports.default || exports.useRequireAdmin;

  function render() {
    assert.ok(mounted, "Cannot render an unmounted host");
    dirty = false;
    cursor = 0;
    queuedEffects = [];
    output = component();
    queuedEffects.forEach((effect) => effect());
  }
  async function settle() {
    for (let count = 0; count < 30; count++) {
      if (dirty && mounted) render();
      for (let tick = 0; tick < 8; tick++) await Promise.resolve();
      if (!dirty || !mounted) return;
    }
    throw new Error(`Effects did not settle; ${requests.length} auth requests issued`);
  }
  return {
    requests, redirects, authWrites, store, render, settle,
    get output() { return output; },
    replayEffects() {
      slots.filter((slot) => slot?.setup).forEach((slot) => {
        slot.cleanup?.();
        slot.cleanup = slot.setup();
      });
    },
    unmount() {
      mounted = false;
      slots.forEach((slot) => slot?.cleanup?.());
    }
  };
}

for (const file of [loginFile, guardFile]) {
  test(`${file}: ordinary renders do not repeat /auth/me`, async () => {
    const host = createHost(file);
    await host.settle();
    for (let render = 0; render < 20; render++) {
      host.render();
      await host.settle();
    }
    assert.equal(host.requests.length, 1);
    assert.equal(host.authWrites.length, 1);
    if (file === guardFile) assert.equal(host.output.ready, true);

    host.store.token = "new-test-token";
    host.render();
    await host.settle();
    assert.equal(host.requests.length, 2, "A changed token must still be validated");
    host.unmount();
  });

  test(`${file}: hydration and anonymous sessions do not send /auth/me`, async () => {
    const host = createHost(file, { hydrated: false, token: null });
    await host.settle();
    assert.equal(host.requests.length, 0);
    host.store.hydrated = true;
    host.render();
    await host.settle();
    assert.equal(host.requests.length, 0);
    if (file === guardFile) {
      assert.equal(host.output.ready, false);
      assert.equal(host.redirects.length, 1);
    }
    host.unmount();
  });

  test(`${file}: ignore a response after unmount`, async () => {
    const host = createHost(file, { pending: true });
    await host.settle();
    host.unmount();
    host.requests[0].resolve({ id: 1 });
    await host.settle();
    assert.equal(host.authWrites.length, 0);
    assert.equal(host.redirects.length, 0);
  });

  test(`${file}: effect replay cancels the old response and settles`, async () => {
    const host = createHost(file, { pending: true });
    await host.settle();
    host.replayEffects();
    await host.settle();
    assert.equal(host.requests.length, 2);
    host.requests.forEach((request) => request.resolve({ id: 1 }));
    await host.settle();
    assert.equal(host.authWrites.length, 1);
    assert.equal(host.requests.length, 2);
    host.unmount();
  });
}

test("a failed login-page session check does not retry on subsequent renders", async () => {
  const host = createHost(loginFile, { pending: true });
  await host.settle();
  host.requests[0].reject(new Error("Session expired"));
  await host.settle();
  host.render();
  await host.settle();
  assert.equal(host.requests.length, 1);
  assert.equal(host.authWrites.length, 0);
  assert.equal(host.redirects.length, 0);
  host.unmount();
});

test("the editor guard still rejects an invalid session", async () => {
  const host = createHost(guardFile, { pending: true });
  await host.settle();
  host.requests[0].reject(new Error("Session expired"));
  await host.settle();
  assert.equal(host.store.token, null);
  assert.equal(host.output.ready, false);
  assert.ok(host.redirects.some((href) => href.includes("session-expired")));
  assert.equal(host.requests.length, 1);
  host.unmount();
});
