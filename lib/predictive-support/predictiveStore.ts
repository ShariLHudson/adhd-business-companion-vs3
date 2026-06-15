/**
 * Local persistence for predictive support snapshots.
 */

import type {
  PredictiveRiskLevel,
  PredictiveRiskType,
  PredictiveSupportSnapshot,
} from "./types";

const STORE_KEY = "companion-predictive-support-v1";

export type PredictiveStore = {
  history: PredictiveSupportSnapshot[];
  founderSamples: {
    at: string;
    riskType: PredictiveRiskType;
    riskLevel: PredictiveRiskLevel;
    confidence: string;
  }[];
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: PredictiveStore = {
  history: [],
  founderSamples: [],
  offerDismissedOn: null,
};

export function getPredictiveStore(): PredictiveStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<PredictiveStore>;
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

export function savePredictiveStore(
  update: Partial<PredictiveStore>,
): PredictiveStore {
  const next = { ...getPredictiveStore(), ...update };
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

export function recordPredictiveSnapshot(
  snapshot: PredictiveSupportSnapshot,
): void {
  const store = getPredictiveStore();
  savePredictiveStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        riskType: snapshot.riskType,
        riskLevel: snapshot.riskLevel,
        confidence: snapshot.confidence,
      },
    ].slice(-500),
  });
}

export function isPredictiveOfferDismissedToday(now = new Date()): boolean {
  return getPredictiveStore().offerDismissedOn === dayKey(now);
}

export function dismissPredictiveOffer(now = new Date()): void {
  savePredictiveStore({ offerDismissedOn: dayKey(now) });
}

export const PREDICTIVE_UPDATED_EVENT = "companion-predictive-updated";

export function notifyPredictiveUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PREDICTIVE_UPDATED_EVENT));
  }
}
