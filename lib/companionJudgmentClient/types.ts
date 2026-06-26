/**
 * Live Reality™ — shared types for ecosystem-wide judgment.
 * One reality. One brain. Many experiences.
 */

import type { CompanionJudgmentResult, ReasoningCycleResult } from "@/lib/companionBrain";

/** Sources that may change today's reality — extensible. */
export type RealitySignalSource =
  | "todays-reality"
  | "clear-my-mind"
  | "my-thoughts"
  | "plan-my-day"
  | "focus"
  | "health"
  | "family"
  | "business"
  | "mood"
  | "capacity"
  | "unexpected-event"
  | "future";

export type RealitySignalKind =
  | "day-state"
  | "plan-items"
  | "focus-session"
  | "capture"
  | "project"
  | "generic";

export type RealitySignal = {
  source: RealitySignalSource;
  kind: RealitySignalKind;
  at: string;
  /** Optional hint for adaptation copy */
  note?: string;
};

export type LiveJudgmentSnapshot = {
  dayKey: string;
  revision: number;
  evaluatedAt: string;
  cycle: ReasoningCycleResult;
  lastSignal: RealitySignal;
  adaptationMessage: string | null;
  meaningfulShift: boolean;
};

export type LiveAdaptationResult = {
  snapshot: LiveJudgmentSnapshot;
  previousDayMode: CompanionJudgmentResult["dayMode"] | null;
};
