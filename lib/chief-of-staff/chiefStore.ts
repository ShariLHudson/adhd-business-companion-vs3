/**
 * Local persistence for Chief of Staff snapshots.
 */

import type { ChiefAssessmentLevel, ChiefOfStaffSnapshot } from "./types";

const STORE_KEY = "companion-chief-of-staff-v1";

export type ChiefStore = {
  history: ChiefOfStaffSnapshot[];
  founderSamples: {
    at: string;
    assessment: ChiefAssessmentLevel;
    capacity: string;
    ignoreCount: number;
    actionCount: number;
  }[];
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: ChiefStore = {
  history: [],
  founderSamples: [],
  offerDismissedOn: null,
};

export function getChiefStore(): ChiefStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<ChiefStore>;
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

export function saveChiefStore(update: Partial<ChiefStore>): ChiefStore {
  const next = { ...getChiefStore(), ...update };
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

export function recordChiefSnapshot(snapshot: ChiefOfStaffSnapshot): void {
  const store = getChiefStore();
  saveChiefStore({
    history: [...store.history, snapshot].slice(-120),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        assessment: snapshot.overallAssessment,
        capacity: snapshot.founderCapacity,
        ignoreCount: snapshot.projectsToIgnore.length,
        actionCount: snapshot.recommendedActions.length,
      },
    ].slice(-500),
  });
}

export function isChiefOfferDismissedToday(now = new Date()): boolean {
  return getChiefStore().offerDismissedOn === dayKey(now);
}

export function dismissChiefOffer(now = new Date()): void {
  saveChiefStore({ offerDismissedOn: dayKey(now) });
}

export const CHIEF_UPDATED_EVENT = "companion-chief-of-staff-updated";

export function notifyChiefUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHIEF_UPDATED_EVENT));
  }
}
