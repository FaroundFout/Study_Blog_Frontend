const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, "../src/lib/request.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

function loadRequest(env, fetch) {
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module, exports: module.exports, URL, FormData, fetch,
    process: { env }, console: { warn() {} }
  });
  return module.exports;
}

for (const mock of [undefined, "false", "true"]) {
  for (const failure of ["network", "server", "invalid-json", "business"]) {
    test(`production rejects ${failure} instead of fallback (mock=${mock})`, async () => {
      const request = loadRequest({
        NODE_ENV: "production", NEXT_PUBLIC_ENABLE_MOCK: mock,
        // A stale deployment variable must not re-enable the old bypass.
        STUDY_BLOG_BUILD_PHASE: "production-build"
      }, async () => {
        if (failure === "network") throw new TypeError("network unavailable");
        if (failure === "invalid-json") return { ok: true, json: async () => { throw new SyntaxError("invalid JSON"); } };
        return { ok: failure !== "server", status: failure === "server" ? 503 : 200,
          json: async () => ({ code: 500, message: "upstream unavailable" }) };
      });
      assert.equal(request.isMockEnabled(), false);
      await assert.rejects(request.requestWithFallback("/api/public/home", "DEMO"));
    });
  }
}

test("successful production requests return real data", async () => {
  const request = loadRequest({ NODE_ENV: "production" }, async () => ({
    ok: true, status: 200, json: async () => ({ code: 200, data: "REAL" })
  }));
  assert.equal(await request.requestWithFallback("/api/public/home", "DEMO"), "REAL");
});

test("development fallback requires explicit opt-in", async () => {
  for (const mock of [undefined, "false", "true"]) {
    const request = loadRequest({ NODE_ENV: "development", NEXT_PUBLIC_ENABLE_MOCK: mock },
      async () => { throw new Error("offline"); });
    if (mock === "true") {
      assert.equal(await request.requestWithFallback("/api/public/home", "DEMO"), "DEMO");
    } else {
      await assert.rejects(request.requestWithFallback("/api/public/home", "DEMO"));
    }
  }
});

test("an empty real homepage does not invent a featured article", async () => {
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
  }).outputText;
  const realHome = { latestArticles: [], latestDiaries: [], featuredProjects: [], resourceCollections: [] };
  const imports = {
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
    "@/components/sections/home-desktop-board": { HomeDesktopBoard: "HomeDesktopBoard" },
    "@/lib/api": { getHomeData: async () => realHome, getCurrentHomeMusic: async () => null }
  };
  vm.runInNewContext(compiled, { module, exports: module.exports, require: id => imports[id] });
  const page = await module.exports.default();
  assert.equal(page.props.featuredArticle, undefined);
  assert.equal(page.props.latestArticles.length, 0);
});
