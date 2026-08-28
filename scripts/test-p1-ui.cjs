const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

function load(file, globals = {}, dependencies = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, Event, ...globals, require: name => {
    if (name in dependencies) return dependencies[name];
    throw new Error(`Unexpected dependency: ${name}`);
  } }, { filename: file });
  return exports;
}

const { validateSiteConfigFields } = load("src/lib/site-config-validation.ts");
const valid = { siteName: "Garden", email: "fixture@example.test", githubUrl: "https://github.com/example", bilibiliUrl: "", xiaohongshuUrl: "" };
test("configuration accepts valid and empty optional fields", () => {
  assert.equal(Object.keys(validateSiteConfigFields(valid)).length, 0);
  assert.equal(Object.keys(validateSiteConfigFields({ ...valid, email: "", githubUrl: "" })).length, 0);
});
test("configuration reports required, email and URL errors together in focus order", () => {
  const result = validateSiteConfigFields({ ...valid, siteName: "  ", email: "bad", githubUrl: "javascript:alert(1)", bilibiliUrl: "not a url" });
  assert.deepEqual(Object.keys(result), ["siteName", "email", "githubUrl", "bilibiliUrl"]);
});

function guardHost({ dirty = true, accept = false, navigation = true } = {}) {
  const win = new EventTarget();
  const doc = new EventTarget();
  let prompts = 0;
  let clock = 10000;
  win.location = { href: "http://localhost/admin/site" };
  win.confirm = () => { prompts++; return accept; };
  if (navigation) win.navigation = new EventTarget();
  class Element { closest() { return this; } hasAttribute(name) { return name === "download" && this.download; } }
  const api = load("src/lib/unsaved-changes.ts", { window: win, document: doc, Element, Date: { now: () => clock } });
  const cleanup = api.installUnsavedChangesGuard(() => dirty);
  return {
    api, win, cleanup, setDirty: value => { dirty = value; }, setAccept: value => { accept = value; },
    advance: () => { clock += 2000; }, prompts: () => prompts,
    click(options = {}) {
      const anchor = Object.assign(new Element(), { href: "http://localhost/admin/media", target: "", download: false }, options);
      const event = new Event("click", { cancelable: true });
      Object.defineProperty(event, "target", { value: anchor });
      const { target, href, download, ...mouseOptions } = options;
      Object.assign(event, { button: 0, ...mouseOptions });
      doc.dispatchEvent(event);
      return event;
    },
    unload() { const event = new Event("beforeunload", { cancelable: true }); win.dispatchEvent(event); return event; },
    traverse(options = {}) {
      const event = new Event("navigate", { cancelable: true });
      Object.assign(event, { navigationType: "traverse", hashChange: false, destination: { sameDocument: true }, ...options });
      win.navigation.dispatchEvent(event);
      return event;
    }
  };
}
test("dirty internal link can be cancelled before the router runs", () => {
  const host = guardHost();
  assert.equal(host.click().defaultPrevented, true);
  assert.equal(host.prompts(), 1);
  host.cleanup();
});
test("accepted link has no duplicate unload prompt and approval expires", () => {
  const host = guardHost({ accept: true });
  assert.equal(host.click().defaultPrevented, false);
  assert.equal(host.unload().defaultPrevented, false);
  host.advance();
  assert.equal(host.unload().defaultPrevented, true);
  host.cleanup();
});
test("clean state and restored original content leave without prompts", () => {
  const host = guardHost({ dirty: false });
  assert.equal(host.click().defaultPrevented, false);
  assert.equal(host.unload().defaultPrevented, false);
  assert.equal(host.prompts(), 0);
  host.cleanup();
});
test("new tab, modifier, download, same-page fragment and external links retain native behavior", () => {
  const host = guardHost();
  for (const options of [{ target: "_blank" }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }, { download: true }, { href: "http://localhost/admin/site#contact" }, { href: "https://example.test" }, { href: "mailto:fixture@example.test" }]) {
    assert.equal(host.click(options).defaultPrevented, false);
  }
  assert.equal(host.prompts(), 0);
  assert.equal(host.unload().defaultPrevented, true);
  host.cleanup();
});
test("same-document history traversals can be cancelled without history mutation", () => {
  const host = guardHost();
  assert.equal(host.traverse().defaultPrevented, true);
  assert.equal(host.traverse({ hashChange: true }).defaultPrevented, false);
  assert.equal(host.traverse({ navigationType: "replace" }).defaultPrevented, false);
  host.cleanup();
});
test("logout is cancellable before auth or server changes", () => {
  const host = guardHost();
  assert.equal(host.api.confirmUnsavedChanges(), false);
  host.setAccept(true);
  assert.equal(host.api.confirmUnsavedChanges(), true);
  host.cleanup();
});
test("old browsers retain link and reload protection; cleanup removes all listeners", () => {
  const host = guardHost({ navigation: false });
  assert.equal(host.unload().defaultPrevented, true);
  host.cleanup();
  assert.equal(host.unload().defaultPrevented, false);
  assert.equal(host.click().defaultPrevented, false);
  assert.equal(host.api.confirmUnsavedChanges(), true);
});

function hookHost(initial) {
  const slots = [];
  let cursor = 0;
  let dirtyGetter;
  const react = {
    useState(initialValue) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initialValue === "function" ? initialValue() : initialValue;
      return [slots[index], value => { slots[index] = value; }];
    },
    useRef(value) { const index = cursor++; return slots[index] ||= { current: value }; },
    useCallback(fn) { cursor++; return fn; },
    useEffect(fn) { cursor++; fn(); }
  };
  const { useUnsavedChanges } = load("src/hooks/use-unsaved-changes.ts", {}, {
    react, "@/lib/unsaved-changes": { installUnsavedChangesGuard: fn => { dirtyGetter = fn; return () => {}; } }
  });
  const render = (value, enabled = true) => { cursor = 0; return useUnsavedChanges(value, enabled); };
  render(initial);
  return { render, dirty: () => dirtyGetter() };
}
test("saved snapshot does not clear edits made while request was pending", () => {
  const host = hookHost({ title: "loaded" });
  host.render({ title: "submitted" });
  const latest = host.render({ title: "new edit" });
  latest.markSaved({ title: "submitted" });
  assert.equal(host.dirty(), true);
  assert.equal(host.render({ title: "new edit" }).isDirty, true);
  assert.equal(host.render({ title: "submitted" }).isDirty, false);
});
test("success resets baseline synchronously; failure with no markSaved remains dirty", () => {
  const host = hookHost({ title: "loaded" });
  const changed = host.render({ title: "edited" });
  assert.equal(host.dirty(), true);
  changed.markSaved({ title: "edited" });
  assert.equal(host.dirty(), false);
  assert.equal(host.render({ title: "edited" }).isDirty, false);
});
