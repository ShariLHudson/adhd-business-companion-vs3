/** Recovery Intelligence — recovery is productive. */
/** Experience rules: docs/ENTREPRENEURIAL_RESILIENCE.md (T-007) */

import type { ActivationState } from "@/lib/activation/types";
import type { CompanionResponseMode } from "@/lib/adaptive-companion/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { MomentumLevel, MomentumTrend } from "@/lib/momentum-intelligence/types";
import type { UserHealthStatus } from "@/lib/user-health/types";

export type RecoveryLevel =
  | "fully_recovered"
  | "stable"
  | "strained"
  | "depleted"
  | "burnout_risk";

export type EnergyTrend = "improving" | "stable" | "declining";

export type RecoveryConfidence = "low" | "medium" | "high";

export type RecoveryRiskLevel = "low" | "moderate" | "elevated" | "high";

export type RecoveryNeed =
  | "sleep"
  | "rest"
  | "lighter_workload"
  | "recovery_day"
  | "emotional_support"
  | "decision_reduction"
  | "sensory_recovery"
  | "social_recovery"
  | "reduced_commitments"
  | "mental_decompression";

export type RecoverySignalCategory =
  | "physical"
  | "mental"
  | "emotional"
  | "behavioral";

export type RecoverySignal = {
  id: string;
  label: string;
  category: RecoverySignalCategory;
  weight: number;
};

export type RecoverySnapshot = {
  recoveryLevel: RecoveryLevel;
  confidence: RecoveryConfidence;
  recoveryNeeds: RecoveryNeed[];
  recoverySignals: RecoverySignal[];
  energyTrend: EnergyTrend;
  riskLevel: RecoveryRiskLevel;
  recommendedRecovery: string;
  createdAt: string;
};

export type RecoveryInput = {
  now?: Date;
  text?: string;
  emotionalState?: EmotionalState;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  priorCognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  userHealthStatus?: UserHealthStatus | null;
  adaptiveMode?: CompanionResponseMode | null;
  momentumLevel?: MomentumLevel | null;
  momentumTrend?: MomentumTrend | null;
  dayEnergyLow?: boolean;
  dayOverwhelmHigh?: boolean;
  recognitionRecent?: boolean;
  stalledProjectCount?: number;
  unfinishedOutcomeCount?: number;
};

export type FounderRecoveryReport = {
  generatedAt: string;
  sampleSize: number;
  distribution: { level: RecoveryLevel; label: string; count: number }[];
  burnoutRiskCount: number;
  decliningEnergyCount: number;
  commonRecoveryNeeds: { need: RecoveryNeed; label: string; count: number }[];
  recoveryImprovements: string[];
  recommendedFounderAction: string;
  notes: string;
};
