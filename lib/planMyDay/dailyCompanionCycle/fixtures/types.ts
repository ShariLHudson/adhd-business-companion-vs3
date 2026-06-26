/**
 * Companion Judgment simulation fixtures — Sprint 1.75 → Sprint 2 regression gate.
 */

import type {
  ConfidenceBehavior,
  CycleState,
  DayMode,
  LearningSignalKind,
  MomentumBehavior,
  OrientationType,
  PermissionDisplay,
} from "../types";

export type SimulationId =
  | "normal-tuesday"
  | "high-energy-launch"
  | "low-energy"
  | "overwhelm"
  | "hyperfocus"
  | "recovery"
  | "health"
  | "family-first"
  | "creative"
  | "celebration"
  | "day-after-launch";

export type AdaptMyDayFixture = {
  energy: "low" | "medium" | "medium-high" | "high";
  motivation:
    | "low"
    | "steady"
    | "scattered"
    | "overwhelmed"
    | "focused"
    | "excited";
  vibe?: "foggy" | "focused" | "creative" | "scattered";
  healthNote?: string;
  fresh: boolean;
};

export type SimulationInputContext = {
  dayKey: string;
  persona: "alex";
  adaptMyDay: AdaptMyDayFixture;
  cmmThoughtCount?: number;
  cmmRecentCaptures?: string[];
  hyperfocusSessionActive?: boolean;
  hyperfocusMinutes?: number;
  yesterdayOutcome?: string;
  brainPredictionAccuracyEwma?: number;
  activeCooldowns?: Array<"celebration" | "survival">;
  calendarHighlights?: string[];
  projectFocus?: string[];
  mustNotSurface: string[];
};

export type ProposalCountRange = {
  min: number;
  max: number;
};

export type ReflectionExpectation = {
  shouldEmitSignals: boolean;
  allowedSignalKinds?: LearningSignalKind[];
  judgmentMayChange: boolean;
  mustNotCompensateTomorrow: boolean;
  mustNotMentionIncomplete?: boolean;
};

export type CompanionJudgmentFixture = {
  id: SimulationId;
  title: string;
  description: string;
  input: SimulationInputContext;
  expected: {
    dayMode: DayMode;
    cycleState: CycleState;
    orientationType: OrientationType;
    orientationOnly: boolean;
    permissionDisplay: PermissionDisplay;
    proposalCount: ProposalCountRange;
    momentum: MomentumBehavior;
    confidence: ConfidenceBehavior;
    reflection: ReflectionExpectation;
    celebrationCooldownActive?: boolean;
    survivalCooldownActive?: boolean;
  };
  prohibitedBehaviors: string[];
  /** Sprint 2 orchestrator tests assert output contains none of these patterns. */
  prohibitedCopyPatterns?: RegExp[];
};
