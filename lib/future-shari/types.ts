/** Future Shari Intelligence — caring friend for tomorrow, not a productivity coach. */

import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { DecisionState } from "@/lib/decision-intelligence/types";
import type { RecoveryLevel } from "@/lib/recovery-intelligence/types";

export type FutureTimeframe =
  | "later_today"
  | "tomorrow"
  | "this_week"
  | "this_month"
  | "long_term";

export type FutureOpportunityType =
  | "organization"
  | "planning"
  | "health"
  | "relationship"
  | "recovery"
  | "business"
  | "financial"
  | "home"
  | "learning"
  | "custom";

export type FutureConfidence = "low" | "medium" | "high";

export type FutureShariSnapshot = {
  opportunity: FutureOpportunityType;
  confidence: FutureConfidence;
  futureBenefit: string;
  futureCost: string;
  timeframe: FutureTimeframe;
  suggestedAction: string;
  futureMessage: string;
  createdAt: string;
};

export type FutureShariInput = {
  now?: Date;
  text?: string;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  recoveryLevel?: RecoveryLevel | null;
  decisionState?: DecisionState | null;
  dayEnergyLow?: boolean;
  hasOpenBrainDumps?: boolean;
  relationshipMention?: boolean;
};

export type FutureShariOffer = {
  snapshot: FutureShariSnapshot;
  introLine: string;
  createdAt: string;
};

export type FounderFutureReport = {
  generatedAt: string;
  sampleSize: number;
  commonOpportunities: {
    type: FutureOpportunityType;
    label: string;
    count: number;
  }[];
  acceptedCount: number;
  ignoredCount: number;
  commonFrictionPoints: string[];
  recommendedFounderAction: string;
  notes: string;
};
