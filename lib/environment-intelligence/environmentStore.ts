/**
 * Local persistence for environment snapshots.
 */

import type { EnvironmentAdjustment, EnvironmentSnapshot } from "./types";

const STORE_KEY = "companion-environment-intelligence-v1";

export type EnvironmentStore = {
  history: EnvironmentSnapshot[];
  founderSamples: {
    at: string;
    sensoryLoad: string;
    focusFit: string;
    adjustment: EnvironmentAdjustment;
    frictionId: string;
  }[];
  helpfulAdjustments: Record<EnvironmentAdjustment, number>;
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: EnvironmentStore = {
  history: [],
  founderSamples: [],
  helpfulAdjustments: {} as Record<EnvironmentAdjustment, number>,
  offerDismissedOn: null,
};

export function getEnvironmentStore(): EnvironmentStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<EnvironmentStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
      helpfulAdjustments:
        (parsed.helpfulAdjustments as EnvironmentStore["helpfulAdjustments"]) ??
        {},
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveEnvironmentStore(
  update: Partial<EnvironmentStore>,
): EnvironmentStore {
  const next = { ...getEnvironmentStore(), ...update };
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

export function recordEnvironmentSnapshot(snapshot: EnvironmentSnapshot): void {
  const store = getEnvironmentStore();
  const frictionId = snapshot.recommendedAdjustment;
  saveEnvironmentStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        sensoryLoad: snapshot.sensoryLoad,
        focusFit: snapshot.focusFit,
        adjustment: snapshot.recommendedAdjustment,
        frictionId,
      },
    ].slice(-500),
  });
}

export function recordHelpfulAdjustment(adj: EnvironmentAdjustment): void {
  const store = getEnvironmentStore();
  saveEnvironmentStore({
    helpfulAdjustments: {
      ...store.helpfulAdjustments,
      [adj]: (store.helpfulAdjustments[adj] ?? 0) + 1,
    },
  });
}

export function isEnvironmentOfferDismissedToday(now = new Date()): boolean {
  return getEnvironmentStore().offerDismissedOn === dayKey(now);
}

export function dismissEnvironmentOffer(now = new Date()): void {
  saveEnvironmentStore({ offerDismissedOn: dayKey(now) });
}

export const ENVIRONMENT_UPDATED_EVENT = "companion-environment-updated";

export function notifyEnvironmentUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ENVIRONMENT_UPDATED_EVENT));
  }
}
