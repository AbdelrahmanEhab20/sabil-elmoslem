import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix workspace root warning
  outputFileTracingRoot: require('path').join(__dirname),
};

export default nextConfig;
