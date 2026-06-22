"use client";

import { useEffect, useState, type ComponentType } from "react";

import { CompanionAuthGate } from "@/components/companion/CompanionAuthGate";

const LOADING = (
  <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
    Loading your workspace…
  </main>
);

/**
 * Loads the companion shell only in the browser (useEffect import). This avoids
 * SSR/hydration of the 12k-line tree, which left buttons visible but inert.
 */
export function CompanionPageLoader() {
  const [Page, setPage] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/app/companion/CompanionPageClient")
      .then((mod) => {
        if (!cancelled) setPage(() => mod.default);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load app");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#f5f0e8] p-6 text-center text-[#6b635a]">
        <p className="text-base font-medium">Could not load your workspace.</p>
        <p className="text-sm">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
        >
          Reload
        </button>
      </main>
    );
  }

  if (!Page) return LOADING;

  return (
    <CompanionAuthGate>
      <Page />
    </CompanionAuthGate>
  );
}
