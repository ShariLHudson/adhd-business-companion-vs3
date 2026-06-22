"use client";

import dynamic from "next/dynamic";

// The companion shell is ~12k lines of client state. Static prerender + hydration in
// production left buttons visible but inert (React never attached handlers).
// Client-only load avoids SSR mismatch entirely.
const CompanionPageClient = dynamic(() => import("./CompanionPageClient"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
      Loading your workspace…
    </main>
  ),
});

export default function CompanionPage() {
  return <CompanionPageClient />;
}
