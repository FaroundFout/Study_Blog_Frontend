const {
  ensureNextInstalled,
  preloadWasmBindings
} = require("./next-runtime.cjs");

ensureNextInstalled();

preloadWasmBindings({
  quiet: true
}).catch((error) => {
  console.warn("[preload-wasm-async] Failed to preload wasm SWC bindings.");
  console.warn(error);
});
