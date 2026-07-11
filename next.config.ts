import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
// Monorepo parent lockfile can point Next at the wrong root — load companion-app env explicitly.
loadEnvConfig(appRoot);

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  // ESLint is no longer configured via next.config (Next 16+) — use `npm run lint`.
  // Ensure .env.local in companion-app is loaded (monorepo has parent lockfile).
  turbopack: {
    root: appRoot,
  },
  async redirects() {
    // Sprint 1 — remove prototype routing from the live product surface.
    // Prototypes remain in the repo for design reference but are not navigable.
    const prototypePaths = [
      "/prototype/:path*",
      "/workspace-prototype",
      "/workspace-prototype/:path*",
      "/estate-map-prototype",
      "/estate-map-prototype/:path*",
      "/spark-estate-guide-prototype",
      "/spark-estate-guide-prototype/:path*",
      "/companion/hospitality-prototype",
      "/companion/hospitality-prototype/:path*",
    ];
    return prototypePaths.map((source) => ({
      source,
      destination: "/companion",
      permanent: false,
    })).concat([
      {
        source: "/companion/journal-gazebo-prototype",
        destination: "/companion?section=growth-journal",
        permanent: false,
      },
      {
        source: "/companion/journal-gazebo-prototype/:path*",
        destination: "/companion?section=growth-journal",
        permanent: false,
      },
    ]);
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
