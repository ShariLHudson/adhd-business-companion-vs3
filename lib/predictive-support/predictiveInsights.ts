/**
 * Predictive support labels and explanations.
 */

import type { PredictiveRiskLevel, PredictiveRiskType } from "./types";

const RISK_LABELS: Record<PredictiveRiskType, string> = {
  overwhelm_risk: "Overwhelm risk",
  burnout_risk: "Burnout risk",
  decision_fatigue_risk: "Decision fatigue risk",
  freeze_risk: "Freeze risk",
  project_abandonment_risk: "Project abandonment risk",
  recovery_needed_risk: "Recovery needed",
  relationship_followup_risk: "Relationship follow-up risk",
  founder_overload_risk: "Founder overload risk",
  momentum_loss_risk: "Momentum loss risk",
  custom: "Emerging pattern",
};

const LEVEL_LABELS: Record<PredictiveRiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
};

export function riskTypeLabel(type: PredictiveRiskType): string {
  return RISK_LABELS[type];
}

export function riskLevelLabel(level: PredictiveRiskLevel): string {
  return LEVEL_LABELS[level];
}

export function founderActionFor(
  topType: PredictiveRiskType | undefined,
  elevatedCount: number,
): string {
  if (elevatedCount >= 3) {
    return "Predictive support is firing often — tighten early prevention copy.";
  }
  switch (topType) {
    case "burnout_risk":
    case "recovery_needed_risk":
      return "Lead with recovery-before-productivity in predictive offers.";
    case "freeze_risk":
      return "Emphasize tiny next steps in freeze-risk prevention.";
    case "founder_overload_risk":
      return "Surface capacity protection before growth in founder flows.";
    default:
      return "Keep predictive offers optional, warm, and never doom-framed.";
  }
}
