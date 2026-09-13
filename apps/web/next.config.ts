import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@admission-engine/types"],
  reactStrictMode: true,
};

export default nextConfig;
