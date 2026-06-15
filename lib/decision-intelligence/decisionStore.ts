/**
 * Local persistence for decision snapshots — user-controlled.
 */

import type {
  DecisionBlocker,
  DecisionSnapshot,
  DecisionType,
} from "./types";

const STORE_KEY = "companion-decision-intelligence-v1";

export type ParkedDecision = {
  id: string;
  summary: string;
  decisionType: DecisionType;
  parkedAt: string;
};

export type DecisionStore = {
  history: DecisionSnapshot[];
  founderSamples: {
    at: string;
    state: string;
    type: string;
    blockers: DecisionBlocker[];
    frame: string;
  }[];
  parked: ParkedDecision[];
  resolvedCount: number;
  offerDismissedOn: string | null;
};

const DEFAULT_STORE: DecisionStore = {
  history: [],
  founderSamples: [],
  parked: [],
  resolvedCount: 0,
  offerDismissedOn: null,
};

export function getDecisionStore(): DecisionStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<DecisionStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
      parked: Array.isArray(parsed.parked) ? parsed.parked : [],
      resolvedCount:
        typeof parsed.resolvedCount === "number" ? parsed.resolvedCount : 0,
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveDecisionStore(
  update: Partial<DecisionStore>,
): DecisionStore {
  const next = { ...getDecisionStore(), ...update };
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

export function recordDecisionSnapshot(snapshot: DecisionSnapshot): void {
  const store = getDecisionStore();
  saveDecisionStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        state: snapshot.decisionState,
        type: snapshot.decisionType,
        blockers: snapshot.blockers,
        frame: snapshot.recommendedFrame,
      },
    ].slice(-500),
  });
}

export function parkDecision(
  summary: string,
  decisionType: DecisionType,
  now = new Date(),
): ParkedDecision {
  const parked: ParkedDecision = {
    id: `park-${Date.now()}`,
    summary: summary.slice(0, 200),
    decisionType,
    parkedAt: now.toISOString(),
  };
  const store = getDecisionStore();
  saveDecisionStore({
    parked: [...store.parked, parked].slice(-50),
  });
  return parked;
}

export function recordDecisionResolved(): void {
  const store = getDecisionStore();
  saveDecisionStore({ resolvedCount: store.resolvedCount + 1 });
}

export function isDecisionOfferDismissedToday(now = new Date()): boolean {
  return getDecisionStore().offerDismissedOn === dayKey(now);
}

export function dismissDecisionOffer(now = new Date()): void {
  saveDecisionStore({ offerDismissedOn: dayKey(now) });
}

export const DECISION_UPDATED_EVENT = "companion-decision-updated";

export function notifyDecisionUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DECISION_UPDATED_EVENT));
  }
}
