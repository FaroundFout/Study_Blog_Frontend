#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const isWin32Ia32 = process.platform === "win32" && process.arch === "ia32";

if (!isWin32Ia32) {
  process.exit(0);
}

const target = path.join(
  process.cwd(),
  "node_modules",
  "@next",
  "swc-win32-ia32-msvc",
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

fs.rmSync(target, {
  recursive: true,
  force: true
});

console.log("[prepare-ia32-swc] Removed native SWC package for win32/ia32 and kept wasm fallback.");
