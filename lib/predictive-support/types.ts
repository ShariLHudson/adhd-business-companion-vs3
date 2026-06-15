/** Predictive Support Intelligence — prevention, not intervention. */

export type PredictiveRiskType =
  | "overwhelm_risk"
  | "burnout_risk"
  | "decision_fatigue_risk"
  | "freeze_risk"
  | "project_abandonment_risk"
  | "recovery_needed_risk"
  | "relationship_followup_risk"
  | "founder_overload_risk"
  | "momentum_loss_risk"
  | "custom";

export type PredictiveRiskLevel = "low" | "moderate" | "elevated" | "high";

export type PredictiveConfidence = "low" | "medium" | "high";

export type PredictiveSupportSnapshot = {
  riskType: PredictiveRiskType;
  confidence: PredictiveConfidence;
  riskLevel: PredictiveRiskLevel;
  predictedOutcome: string;
  recommendedSupport: string;
  sourceSignals: string[];
  createdAt: string;
};

export type PredictiveSupportInput = {
  now?: Date;
  text?: string;
};

export type PredictiveSupportOffer = {
  snapshot: PredictiveSupportSnapshot;
  companionOffer: string;
  createdAt: string;
};

export type FounderPredictiveReport = {
  generatedAt: string;
  sampleSize: number;
  emergingRisks: {
    riskType: PredictiveRiskType;
    label: string;
    count: number;
    trend: "rising" | "stable" | "easing";
  }[];
  riskTrend: "rising" | "stable" | "easing";
  commonSupportOpportunities: { support: string; count: number }[];
  founderOverloadCount: number;
  elevatedOrHighCount: number;
  recommendedFounderAction: string;
  notes: string;
};
