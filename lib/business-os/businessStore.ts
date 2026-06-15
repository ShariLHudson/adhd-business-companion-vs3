/**
 * Local persistence for Business OS snapshots.
 */

import type { BusinessHealthLevel, BusinessOSSnapshot } from "./types";

const STORE_KEY = "companion-business-os-v1";

export type BusinessOSStore = {
  history: BusinessOSSnapshot[];
  founderSamples: {
    at: string;
    health: BusinessHealthLevel;
    founderLoad: string;
    riskCount: number;
    opportunityCount: number;
    highestRiskArea: string | null;
  }[];
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: BusinessOSStore = {
  history: [],
  founderSamples: [],
  offerDismissedOn: null,
};

export function getBusinessOSStore(): BusinessOSStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<BusinessOSStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveBusinessOSStore(
  update: Partial<BusinessOSStore>,
): BusinessOSStore {
  const next = { ...getBusinessOSStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function recordBusinessOSSnapshot(snapshot: BusinessOSSnapshot): void {
  const store = getBusinessOSStore();
  saveBusinessOSStore({
    history: [...store.history, snapshot].slice(-120),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        health: snapshot.businessHealth,
        founderLoad: snapshot.founderLoad,
        riskCount: snapshot.activeRisks.length,
        opportunityCount: snapshot.activeOpportunities.length,
        highestRiskArea: snapshot.highestRiskArea,
      },
    ].slice(-500),
  });
}

export function isBusinessOSSortDismissedToday(now = new Date()): boolean {
  return getBusinessOSStore().offerDismissedOn === dayKey(now);
}

export function dismissBusinessOSSortOffer(now = new Date()): void {
  saveBusinessOSStore({ offerDismissedOn: dayKey(now) });
}

export const BUSINESS_OS_UPDATED_EVENT = "companion-business-os-updated";

export function notifyBusinessOSUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BUSINESS_OS_UPDATED_EVENT));
  }
}
