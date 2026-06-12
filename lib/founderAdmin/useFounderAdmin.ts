"use client";

import { useEffect, useState } from "react";

/** Client-side check — sidebar link only; routes are still protected by middleware. */
export function useFounderAdmin(): { isFounderAdmin: boolean; checking: boolean } {
  const [isFounderAdmin, setIsFounderAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/founder-admin/verify", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean };
        if (!cancelled) setIsFounderAdmin(Boolean(data.ok));
      } catch {
        if (!cancelled) setIsFounderAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isFounderAdmin, checking };
}
