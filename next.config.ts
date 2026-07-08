import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
// Monorepo parent lockfile can point Next at the wrong root — load companion-app env explicitly.
loadEnvConfig(appRoot);

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Ensure .env.local in companion-app is loaded (monorepo has parent lockfile).
  turbopack: {
    root: appRoot,
  },
  async headers() {
    return [
      {
        source: "/ecosystem/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com https://app.gohighlevel.com https://*.visualsparkstudios.com",
          },
        ],
      },
      {
        source: "/ghl/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com https://app.gohighlevel.com https://*.visualsparkstudios.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
