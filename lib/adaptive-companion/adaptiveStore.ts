/**
 * Local persistence for adaptive mode decisions — founder preview only.
 */

import type { AdaptiveDecision } from "./types";

const STORE_KEY = "companion-adaptive-v1";

export type AdaptiveStore = {
  history: AdaptiveDecision[];
  founderSamples: { at: string; mode: string; confidence: string }[];
};

const DEFAULT_STORE: AdaptiveStore = {
  history: [],
  founderSamples: [],
};

export function getAdaptiveStore(): AdaptiveStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<AdaptiveStore>;
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

export function saveAdaptiveStore(update: Partial<AdaptiveStore>): AdaptiveStore {
  const next = { ...getAdaptiveStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function recordAdaptiveDecision(decision: AdaptiveDecision): void {
  const store = getAdaptiveStore();
  saveAdaptiveStore({
    history: [...store.history, decision].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: decision.createdAt,
        mode: decision.mode,
        confidence: decision.confidence,
      },
    ].slice(-500),
  });
}

export const ADAPTIVE_UPDATED_EVENT = "companion-adaptive-updated";

export function notifyAdaptiveUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADAPTIVE_UPDATED_EVENT));
  }
}
