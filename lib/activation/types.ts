/** Activation state — being stuck is not the same as being unwilling. */
import type { DayState } from "@/lib/companionStore";
import type { UserSignalCount } from "@/lib/ecosystem/userIntelligenceEngine";

export type ActivationState =
  | "moving"
  | "hesitant"
  | "stuck"
  | "frozen"
  | "recovering";

export type ActivationBlockerType =
  | "overwhelm"
  | "clarity"
  | "fear_rsd"
  | "perfectionism"
  | "energy"
  | "decision"
  | "task_friction";

export type ActivationConfidence = "low" | "medium" | "high";

/** One explainable likely blocker. */
export type LikelyBlocker = {
  type: ActivationBlockerType;
  label: string;
  reason: string;
  confidence: ActivationConfidence;
};

export type ActivationSnapshot = {
  state: ActivationState;
  likelyBlockers: LikelyBlocker[];
  confidence: ActivationConfidence;
  suggestedNextStep: string;
  companionOffer: string;
  createdAt: string;
};

export type CognitiveLoadLevelHint =
  | "light"
  | "moderate"
  | "heavy"
  | "overloaded";

/** Input signals for activation evaluation. */
export type ActivationInput = {
  now?: Date;
  text?: string;
  emotionalState?: string;
  cognitiveLoadLevel?: CognitiveLoadLevelHint | null;
  cognitiveLoadScore?: number | null;
  projectsMissingNextAction?: number;
  openBrainDumpCount?: number;
  dayState?: DayState | null;
  dayEnergyLow?: boolean;
  signalCounts?: UserSignalCount[];
};

export type FounderActivationReport = {
  generatedAt: string;
  stuckOrFrozenCount: number;
  sampleSize: number;
  commonBlockers: { type: ActivationBlockerType; label: string; count: number }[];
  commonRecommendations: { id: string; label: string; count: number }[];
  loadTrend: "rising" | "stable" | "easing";
  recommendedFounderAction: string;
  notes: string;
};
