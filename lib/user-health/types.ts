/** User Health Intelligence — well-being before engagement. */

import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { LoopType } from "@/lib/loop-intelligence/types";

export type UserHealthStatus =
  | "supported"
  | "steady"
  | "needs_support"
  | "overloaded"
  | "disengaging"
  | "recovering"
  | "unknown";

export type HealthConfidence = "low" | "medium" | "high";

export type SupportNeed =
  | "emotional_support"
  | "sorting_help"
  | "activation_help"
  | "recovery_support"
  | "planning_help"
  | "relationship_followup"
  | "business_clarity"
  | "celebration_recognition";

export type UserHealthSnapshot = {
  status: UserHealthStatus;
  confidence: HealthConfidence;
  supportNeeds: SupportNeed[];
  riskFactors: string[];
  strengths: string[];
  recommendedSupport: string;
  createdAt: string;
};

export type UserHealthInput = {
  now?: Date;
  text?: string;
  emotionalState?: EmotionalState;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  primaryLoopType?: LoopType | null;
  /** Days since last conversation activity. */
  daysSinceLastActivity?: number | null;
  /** Count of intelligence offer dismissals (not now) in recent window. */
  recentDismissalCount?: number;
  dayDesignerPlansCount?: number;
  recognitionMomentsRecent?: number;
  opportunityDismissalCount?: number;
  stalledProjectCount?: number;
  unfinishedOutcomeCount?: number;
  overwhelmLanguageCount?: number;
  stuckLanguageCount?: number;
  winLanguageCount?: number;
  conversationStarts?: number;
};

export type FounderUserHealthReport = {
  generatedAt: string;
  sampleSize: number;
  distribution: { status: UserHealthStatus; label: string; count: number }[];
  needsSupportCount: number;
  overloadedCount: number;
  disengagingCount: number;
  recoveringCount: number;
  commonSupportNeeds: { need: SupportNeed; label: string; count: number }[];
  recommendedFounderAction: string;
  notes: string;
};
