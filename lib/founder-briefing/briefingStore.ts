/**
 * Optional persistence for last viewed briefing — founder only.
 */

import type { FounderBriefing } from "./types";

const STORE_KEY = "founder-morning-briefing-v2";

export type BriefingStore = {
  lastViewedAt: string | null;
  lastBriefingDate: string | null;
};

const DEFAULT: BriefingStore = {
  lastViewedAt: null,
  lastBriefingDate: null,
};

export function getBriefingStore(): BriefingStore {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<BriefingStore>) };
  } catch {
    return { ...DEFAULT };
  }
}

export function markBriefingViewed(briefing: FounderBriefing): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        lastViewedAt: new Date().toISOString(),
        lastBriefingDate: briefing.date,
      } satisfies BriefingStore),
    );
  } catch {
    /* noop */
  }
}
