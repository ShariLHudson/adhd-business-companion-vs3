/**
 * Local persistence for activation snapshots — support insights only.
 */

import type { ActivationBlockerType, ActivationSnapshot } from "./types";

const STORE_KEY = "companion-activation-v1";

export type ActivationStore = {
  history: ActivationSnapshot[];
  founderSamples: {
    at: string;
    state: string;
    primaryBlocker: ActivationBlockerType | null;
    suggestedNextStep: string;
  }[];
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: ActivationStore = {
  history: [],
  founderSamples: [],
  offerDismissedOn: null,
};

export function getActivationStore(): ActivationStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<ActivationStore>;
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

export function saveActivationStore(
  update: Partial<ActivationStore>,
): ActivationStore {
  const next = { ...getActivationStore(), ...update };
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

export function recordActivationSnapshot(snapshot: ActivationSnapshot): void {
  const store = getActivationStore();
  const primary = snapshot.likelyBlockers[0]?.type ?? null;
  saveActivationStore({
    history: [...store.history, snapshot].slice(-120),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        state: snapshot.state,
        primaryBlocker: primary,
        suggestedNextStep: snapshot.suggestedNextStep,
      },
    ].slice(-500),
  });
}

export function isActivationOfferDismissedToday(now = new Date()): boolean {
  return getActivationStore().offerDismissedOn === dayKey(now);
}

export function dismissActivationOffer(now = new Date()): void {
  saveActivationStore({ offerDismissedOn: dayKey(now) });
}

export const ACTIVATION_UPDATED_EVENT = "companion-activation-updated";

export function notifyActivationUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACTIVATION_UPDATED_EVENT));
  }
}
