/**
 * Local persistence for Future Shari — optional suggestions only.
 */

import type { FutureOpportunityType, FutureShariSnapshot } from "./types";

const STORE_KEY = "companion-future-shari-v1";

export type FutureShariStore = {
  history: FutureShariSnapshot[];
  founderSamples: {
    at: string;
    opportunity: FutureOpportunityType;
    confidence: string;
    accepted: boolean;
    frictionPoint: string;
  }[];
  acceptedCount: number;
  ignoredCount: number;
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: FutureShariStore = {
  history: [],
  founderSamples: [],
  acceptedCount: 0,
  ignoredCount: 0,
  offerDismissedOn: null,
};

export function getFutureShariStore(): FutureShariStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<FutureShariStore>;
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

export function saveFutureShariStore(
  update: Partial<FutureShariStore>,
): FutureShariStore {
  const next = { ...getFutureShariStore(), ...update };
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

export function recordFutureSnapshot(
  snapshot: FutureShariSnapshot,
  frictionPoint: string,
): void {
  const store = getFutureShariStore();
  saveFutureShariStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        opportunity: snapshot.opportunity,
        confidence: snapshot.confidence,
        accepted: false,
        frictionPoint,
      },
    ].slice(-500),
  });
}

export function recordFutureAccepted(snapshot: FutureShariSnapshot): void {
  const store = getFutureShariStore();
  const samples = [...store.founderSamples];
  const last = samples[samples.length - 1];
  if (last && last.at === snapshot.createdAt) {
    last.accepted = true;
  }
  saveFutureShariStore({
    acceptedCount: store.acceptedCount + 1,
    founderSamples: samples,
  });
}

export function recordFutureIgnored(): void {
  const store = getFutureShariStore();
  saveFutureShariStore({ ignoredCount: store.ignoredCount + 1 });
}

export function isFutureOfferDismissedToday(now = new Date()): boolean {
  return getFutureShariStore().offerDismissedOn === dayKey(now);
}

export function dismissFutureOffer(now = new Date()): void {
  recordFutureIgnored();
  saveFutureShariStore({ offerDismissedOn: dayKey(now) });
}

export const FUTURE_SHARI_UPDATED_EVENT = "companion-future-shari-updated";

export function notifyFutureShariUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FUTURE_SHARI_UPDATED_EVENT));
  }
}
