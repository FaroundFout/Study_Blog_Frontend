#!/usr/bin/env node

const {
  addPreloadToNodeOptions,
  ensureNextInstalled,
  preloadWasmBindings,
  runNextCli
} = require("./next-runtime.cjs");

async function main() {
  const extraArgs = process.argv.slice(2);

  ensureNextInstalled();
  addPreloadToNodeOptions();
  await preloadWasmBindings();
  process.env.STUDY_BLOG_BUILD_PHASE = "production-build";
  runNextCli("build", extraArgs);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
