/** Momentum Intelligence — notice progress, not perfection. */

import type { ActivationState } from "@/lib/activation/types";
import type { CompanionResponseMode } from "@/lib/adaptive-companion/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { LoopType } from "@/lib/loop-intelligence/types";
import type { UserHealthStatus } from "@/lib/user-health/types";

export type MomentumLevel =
  | "stalled"
  | "restarting"
  | "building"
  | "steady"
  | "strong";

export type MomentumTrend = "rising" | "stable" | "falling";

export type MomentumConfidence = "low" | "medium" | "high";

export type MomentumBuilder =
  | "completed_action"
  | "completed_outcome"
  | "project_progress"
  | "activation_success"
  | "day_plan_completed"
  | "asked_for_help"
  | "returned_after_absence"
  | "overcame_blocker"
  | "reduced_overwhelm"
  | "made_decision"
  | "first_step"
  | "recognition_milestone"
  | "conversation_to_action";

export type MomentumBlocker =
  | "repeated_freezing"
  | "repeated_overwhelm"
  | "avoidance"
  | "rising_cognitive_load"
  | "stalled_projects"
  | "decision_paralysis"
  | "burnout_indicators"
  | "declining_activity"
  | "unfinished_outcomes";

export type MomentumWin = {
  id: string;
  label: string;
  at: string;
};

export type MomentumSnapshot = {
  momentumLevel: MomentumLevel;
  confidence: MomentumConfidence;
  momentumTrend: MomentumTrend;
  wins: MomentumWin[];
  momentumBuilders: MomentumBuilder[];
  momentumBlockers: MomentumBlocker[];
  recommendedSupport: string;
  createdAt: string;
};

export type MomentumInput = {
  now?: Date;
  text?: string;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  priorCognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  userHealthStatus?: UserHealthStatus | null;
  adaptiveMode?: CompanionResponseMode | null;
  loopType?: LoopType | null;
  recognitionMomentsRecent?: number;
  dayPlansCompleted?: number;
  stalledProjectCount?: number;
  daysSinceLastActivity?: number | null;
};

export type MomentumOffer = {
  snapshot: MomentumSnapshot;
  companionOffer: string;
  createdAt: string;
};

export type FounderMomentumReport = {
  generatedAt: string;
  sampleSize: number;
  distribution: { level: MomentumLevel; label: string; count: number }[];
  stalledCount: number;
  restartingCount: number;
  risingCount: number;
  strongCount: number;
  commonBuilders: { builder: MomentumBuilder; label: string; count: number }[];
  commonBlockers: { blocker: MomentumBlocker; label: string; count: number }[];
  recommendedFounderAction: string;
  notes: string;
};
