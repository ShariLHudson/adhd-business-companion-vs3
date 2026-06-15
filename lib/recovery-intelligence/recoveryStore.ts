/**
 * Local persistence for recovery snapshots — founder insight only.
 */

import type { RecoveryLevel, RecoveryNeed, RecoverySnapshot } from "./types";

const STORE_KEY = "companion-recovery-intelligence-v1";

export type RecoveryStore = {
  history: RecoverySnapshot[];
  founderSamples: {
    at: string;
    level: RecoveryLevel;
    confidence: string;
    riskLevel: string;
    energyTrend: string;
    recoveryNeeds: RecoveryNeed[];
  }[];
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: RecoveryStore = {
  history: [],
  founderSamples: [],
  offerDismissedOn: null,
};

export function getRecoveryStore(): RecoveryStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<RecoveryStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
      offerDismissedOn: parsed.offerDismissedOn ?? null,
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveRecoveryStore(update: Partial<RecoveryStore>): RecoveryStore {
  const next = { ...getRecoveryStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function recordRecoverySnapshot(snapshot: RecoverySnapshot): void {
  const store = getRecoveryStore();
  saveRecoveryStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        level: snapshot.recoveryLevel,
        confidence: snapshot.confidence,
        riskLevel: snapshot.riskLevel,
        energyTrend: snapshot.energyTrend,
        recoveryNeeds: snapshot.recoveryNeeds,
      },
    ].slice(-500),
  });
}

export const RECOVERY_UPDATED_EVENT = "companion-recovery-updated";

export function notifyRecoveryUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RECOVERY_UPDATED_EVENT));
  }
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isRecoveryOfferDismissedToday(now = new Date()): boolean {
  return getRecoveryStore().offerDismissedOn === dayKey(now);
}

export function dismissRecoveryOffer(now = new Date()): void {
  saveRecoveryStore({ offerDismissedOn: dayKey(now) });
}
