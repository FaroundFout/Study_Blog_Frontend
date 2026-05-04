const isWin32Ia32 = process.platform === "win32" && process.arch === "ia32";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true
  }
};

if (isWin32Ia32) {
  nextConfig.experimental = {
    useWasmBinary: true
  };
}

module.exports = nextConfig;
