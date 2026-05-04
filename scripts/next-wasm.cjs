#!/usr/bin/env node

const {
  addPreloadToNodeOptions,
  ensureNextInstalled,
  preloadWasmBindings,
  runNextCli
} = require("./next-runtime.cjs");

async function main() {
  const command = process.argv[2];
  const extraArgs = process.argv.slice(3);

  ensureNextInstalled();
  addPreloadToNodeOptions();
  await preloadWasmBindings();
  runNextCli(command, extraArgs);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
