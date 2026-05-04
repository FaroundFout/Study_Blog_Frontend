#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const targets = [
  path.join(process.cwd(), ".next", "cache", "webpack"),
  path.join(process.cwd(), ".next", "cache", "webpack-stable")
];

for (const target of targets) {
  if (!fs.existsSync(target)) {
    continue;
  }

  fs.rmSync(target, {
    recursive: true,
    force: true
  });

  console.log(`[clear-next-webpack-cache] Removed ${target}`);
}
