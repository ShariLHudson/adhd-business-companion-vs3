/** Decision Intelligence — lighter, clearer decisions without deciding for the user. */

import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { LoopType } from "@/lib/loop-intelligence/types";
import type { UserHealthStatus } from "@/lib/user-health/types";

export type DecisionState =
  | "clear"
  | "considering"
  | "overloaded"
  | "stuck"
  | "avoiding"
  | "decided";

export type DecisionConfidence = "low" | "medium" | "high";

export type DecisionType =
  | "priority_decision"
  | "business_decision"
  | "project_decision"
  | "content_decision"
  | "relationship_decision"
  | "time_decision"
  | "money_decision"
  | "personal_decision"
  | "custom";

export type DecisionBlocker =
  | "too_many_options"
  | "fear_of_wrong_choice"
  | "perfectionism"
  | "lack_of_information"
  | "too_much_information"
  | "low_energy"
  | "high_cognitive_load"
  | "rsd_or_rejection_fear"
  | "urgency_pressure"
  | "unclear_goal";

export type DecisionSupportMethod =
  | "reduce_options"
  | "clarify_goal"
  | "good_enough_choice"
  | "future_self_lens"
  | "energy_match"
  | "impact_effort_lens"
  | "reversible_vs_irreversible"
  | "park_it";

export type DecisionSnapshot = {
  decisionState: DecisionState;
  confidence: DecisionConfidence;
  decisionType: DecisionType;
  options: string[];
  blockers: DecisionBlocker[];
  recommendedFrame: DecisionSupportMethod;
  suggestedNextStep: string;
  createdAt: string;
};

export type DecisionInput = {
  now?: Date;
  text?: string;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  loopType?: LoopType | null;
  userHealthStatus?: UserHealthStatus | null;
  dayEnergyLow?: boolean;
  hasDayPlan?: boolean;
};

export type DecisionOffer = {
  snapshot: DecisionSnapshot;
  companionOffer: string;
  insight: string;
  createdAt: string;
};

export type FounderDecisionReport = {
  generatedAt: string;
  sampleSize: number;
  commonBlockers: { blocker: DecisionBlocker; label: string; count: number }[];
  commonTypes: { type: DecisionType; label: string; count: number }[];
  stuckInLoopCount: number;
  parkedCount: number;
  resolvedCount: number;
  recommendedFounderAction: string;
  notes: string;
};
