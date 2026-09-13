import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@admission-engine/types"],
  reactStrictMode: true,
  async rewrites() {
    const rawApiUrl =
      process.env["API_INTERNAL_URL"] ||
      process.env["NEXT_PUBLIC_API_URL"] ||
      "http://127.0.0.1:3000/api/v1";
    const baseTarget = rawApiUrl.replace(/\/api\/v1\/?$/, "");

    return [
      {
        source: "/api/backend/:path*",
        destination: `${baseTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
