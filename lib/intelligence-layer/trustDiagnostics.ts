/**
 * Sprint 2B-B PR 4 — Trust collection diagnostics (in-memory).
 */

import type { TrustSignalCategory } from "./trustSignals";

export type TrustEvolutionBlockedReason =
  | "profile_learning_disabled"
  | "render_only_signal"
  | "system_causation"
  | "attribution_invalid"
  | "unknown_intervention_bucket"
  | "no_trait_mapping"
  | "gates_blocked";

export type TrustEvolutionDecision = {
  at: string;
  signalId: string;
  category: TrustSignalCategory;
  evolve: boolean;
  reason: TrustEvolutionBlockedReason | "evolved";
};

export type TrustCollectionDiagnostics = {
  recorded: number;
  evolved: number;
  blocked: number;
  blockedByReason: Record<string, number>;
  lastDecisions: TrustEvolutionDecision[];
};

const MAX_DECISIONS = 100;

let recorded = 0;
let evolved = 0;
let blocked = 0;
let blockedByReason: Record<string, number> = {};
let lastDecisions: TrustEvolutionDecision[] = [];

export function recordTrustSignalRecorded(): void {
  recorded += 1;
}

export function logTrustEvolutionDecision(decision: TrustEvolutionDecision): void {
  if (decision.evolve) {
    evolved += 1;
  } else {
    blocked += 1;
    blockedByReason = {
      ...blockedByReason,
      [decision.reason]: (blockedByReason[decision.reason] ?? 0) + 1,
    };
  }
  lastDecisions = [...lastDecisions, decision].slice(-MAX_DECISIONS);
}

export function getTrustCollectionDiagnostics(): TrustCollectionDiagnostics {
  return {
    recorded,
    evolved,
    blocked,
    blockedByReason: { ...blockedByReason },
    lastDecisions: [...lastDecisions],
  };
}

export function resetTrustDiagnosticsForTests(): void {
  recorded = 0;
  evolved = 0;
  blocked = 0;
  blockedByReason = {};
  lastDecisions = [];
}
