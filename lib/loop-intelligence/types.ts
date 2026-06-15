/** Loop Intelligence — awareness without diagnosis or labels. */

import type { UserSignalCount } from "@/lib/ecosystem/userIntelligenceEngine";

export type LoopType =
  | "anxiety_loop"
  | "rumination_loop"
  | "perfectionism_loop"
  | "guilt_loop"
  | "shame_loop"
  | "comparison_loop"
  | "impostor_loop"
  | "control_loop"
  | "connection_loop"
  | "achievement_loop"
  | "rsd_loop"
  | "certainty_loop"
  | "potential_loop"
  | "research_loop"
  | "planning_loop"
  | "optimization_loop"
  | "productivity_loop"
  | "overwhelm_loop"
  | "restart_loop"
  | "recovery_loop";

export type LoopConfidence = "low" | "medium" | "high";

export type LoopSeverity = "light" | "moderate" | "heavy";

/** Explainable signal — never stores raw message text. */
export type LoopRelatedSignal = {
  id: string;
  label: string;
  count: number;
  lastSeen: string;
};

export type LoopSnapshot = {
  loopType: LoopType;
  confidence: LoopConfidence;
  frequency: number;
  severity: LoopSeverity;
  description: string;
  possiblePurpose: string;
  companionResponse: string;
  relatedSignals: LoopRelatedSignal[];
  createdAt: string;
};

export type CognitiveLoadLevelHint =
  | "light"
  | "moderate"
  | "heavy"
  | "overloaded";

export type ActivationStateHint =
  | "moving"
  | "hesitant"
  | "stuck"
  | "frozen"
  | "recovering";

export type LoopInput = {
  now?: Date;
  text?: string;
  cognitiveLoadLevel?: CognitiveLoadLevelHint | null;
  activationState?: ActivationStateHint | null;
  signalCounts?: UserSignalCount[];
};

export type LoopSignalObservation = {
  loopType: LoopType;
  signalId: string;
  signalLabel: string;
  at: string;
  dayKey: string;
};

export type FounderLoopReport = {
  generatedAt: string;
  sampleSize: number;
  commonLoopTypes: { type: LoopType; label: string; count: number }[];
  emergingLoops: { type: LoopType; label: string; trend: "rising" | "new" }[];
  loadTrend: "rising" | "stable" | "easing";
  commonPurposes: { purpose: string; count: number }[];
  recommendedFounderAction: string;
  contentOpportunities: string[];
  notes: string;
};
