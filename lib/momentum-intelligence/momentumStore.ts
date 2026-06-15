/**
 * Local persistence for momentum snapshots — founder insight only.
 */

import type {
  MomentumBlocker,
  MomentumBuilder,
  MomentumLevel,
  MomentumSnapshot,
} from "./types";

const STORE_KEY = "companion-momentum-intelligence-v1";

export type MomentumStore = {
  history: MomentumSnapshot[];
  founderSamples: {
    at: string;
    level: MomentumLevel;
    trend: string;
    builders: MomentumBuilder[];
    blockers: MomentumBlocker[];
  }[];
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: MomentumStore = {
  history: [],
  founderSamples: [],
  offerDismissedOn: null,
};

export function getMomentumStore(): MomentumStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<MomentumStore>;
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

export function saveMomentumStore(update: Partial<MomentumStore>): MomentumStore {
  const next = { ...getMomentumStore(), ...update };
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

export function recordMomentumSnapshot(snapshot: MomentumSnapshot): void {
  const store = getMomentumStore();
  saveMomentumStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        level: snapshot.momentumLevel,
        trend: snapshot.momentumTrend,
        builders: snapshot.momentumBuilders,
        blockers: snapshot.momentumBlockers,
      },
    ].slice(-500),
  });
}

export function isMomentumOfferDismissedToday(now = new Date()): boolean {
  return getMomentumStore().offerDismissedOn === dayKey(now);
}

export function dismissMomentumOffer(now = new Date()): void {
  saveMomentumStore({ offerDismissedOn: dayKey(now) });
}

export const MOMENTUM_UPDATED_EVENT = "companion-momentum-updated";

export function notifyMomentumUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MOMENTUM_UPDATED_EVENT));
  }
}
