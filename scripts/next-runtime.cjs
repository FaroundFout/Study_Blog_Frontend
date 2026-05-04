#!/usr/bin/env node

const path = require("path");

const projectRoot = process.cwd();
const shouldUseWasmFallback = process.platform === "win32" && process.arch === "ia32";

function resolveProjectModule(moduleName) {
  return require.resolve(moduleName, {
    paths: [projectRoot]
  });
}

function ensureNextInstalled() {
  try {
    resolveProjectModule("next/package.json");
  } catch (error) {
    const wrapped = new Error(
      `[next-wasm] Could not find the local Next.js installation. Run "npm install" in ${projectRoot} and try again.`
    );

    wrapped.code = "NEXT_NOT_INSTALLED";
    wrapped.cause = error;
    throw wrapped;
  }
}

function requireProjectModule(moduleName) {
  return require(resolveProjectModule(moduleName));
}

function getPreloadPath() {
  return path.join(projectRoot, "scripts", "preload-wasm-async.cjs").replace(/\\/g, "/");
}

function addPreloadToNodeOptions() {
  if (!shouldUseWasmFallback) {
    return;
  }

  const preloadFlag = `--require=${getPreloadPath()}`;
  const nodeOptions = process.env.NODE_OPTIONS || "";

  if (nodeOptions.includes(preloadFlag)) {
    return;
  }

  process.env.NODE_OPTIONS = nodeOptions
    ? `${nodeOptions} ${preloadFlag}`
    : preloadFlag;
}

function isMissingSwcEntrypoint(error) {
  return error?.code === "MODULE_NOT_FOUND"
    && typeof error.message === "string"
    && error.message.includes("next/dist/build/swc");
}

async function preloadWasmBindings(options = {}) {
  const { quiet = false } = options;

  if (!shouldUseWasmFallback) {
    return false;
  }

  try {
    const swc = requireProjectModule("next/dist/build/swc");

    if (typeof swc.loadBindings !== "function") {
      if (!quiet) {
        console.warn("[next-wasm] Next.js does not expose SWC preloading in this version. Falling back to the default loader.");
      }

      return false;
    }

    await swc.loadBindings(true);
    return true;
  } catch (error) {
    if (isMissingSwcEntrypoint(error)) {
      if (!quiet) {
        console.warn("[next-wasm] Next.js no longer exposes the internal SWC entrypoint. Falling back to the default loader.");
      }

      return false;
    }

    throw error;
  }
}

function runNextCli(command, extraArgs = []) {
  const nextBin = resolveProjectModule("next/dist/bin/next");

  process.argv = [process.argv[0], nextBin, command, ...extraArgs];
  require(nextBin);
}

module.exports = {
  addPreloadToNodeOptions,
  ensureNextInstalled,
  preloadWasmBindings,
  runNextCli
};
