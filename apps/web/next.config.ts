import type { NextConfig } from "next";

function sanitizeTargetUrl(raw?: string): string {
  if (!raw) return "http://127.0.0.1:3000";

  // 1. Remove leading/trailing spaces and quotes
  let cleaned = raw.trim().replace(/^['"`]+|['"`]+$/g, "").trim();
  if (!cleaned) return "http://127.0.0.1:3000";

  // 2. Ensure http:// or https:// protocol is present
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }

  // 3. Normalize trailing slashes and trailing /api/v1
  cleaned = cleaned.replace(/\/+$/, "");
  cleaned = cleaned.replace(/\/api\/v1\/?$/, "");
  cleaned = cleaned.replace(/\/+$/, "");

  return cleaned || "http://127.0.0.1:3000";
}

const nextConfig: NextConfig = {
  transpilePackages: ["@admission-engine/types"],
  reactStrictMode: true,
  async rewrites() {
    const rawApiUrl =
      process.env["API_INTERNAL_URL"] ||
      process.env["NEXT_PUBLIC_API_URL"] ||
      "http://127.0.0.1:3000";

    const baseTarget = sanitizeTargetUrl(rawApiUrl);

    return [
      {
        source: "/api/backend/:path*",
        destination: `${baseTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
