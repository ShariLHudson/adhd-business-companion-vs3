/**
 * Explainable opportunity scoring — high impact + low effort first.
 */

import type { OpportunityCandidate } from "./opportunityDetection";
import type { OpportunityLevel, OpportunityType } from "./types";

const IMPACT_BY_TYPE: Partial<Record<OpportunityType, OpportunityLevel>> = {
  lead_magnet_opportunity: "high",
  content_opportunity: "high",
  product_opportunity: "high",
  relationship_opportunity: "medium",
  workflow_opportunity: "medium",
  workshop_opportunity: "medium",
  offer_opportunity: "high",
  referral_opportunity: "medium",
  retention_opportunity: "medium",
  founder_action_opportunity: "medium",
};

const EFFORT_BY_TYPE: Partial<Record<OpportunityType, OpportunityLevel>> = {
  workflow_opportunity: "low",
  content_opportunity: "medium",
  lead_magnet_opportunity: "medium",
  relationship_opportunity: "low",
  referral_opportunity: "low",
  product_opportunity: "high",
  workshop_opportunity: "high",
  offer_opportunity: "high",
};

export function scoreOpportunity(candidate: OpportunityCandidate): {
  confidence: OpportunityLevel;
  impact: OpportunityLevel;
  effort: OpportunityLevel;
  urgency: OpportunityLevel;
} {
  const confidence = confidenceFromWeight(
    candidate.totalWeight,
    candidate.signals.length,
  );
  const impact =
    IMPACT_BY_TYPE[candidate.opportunityType] ??
    (candidate.totalWeight >= 5 ? "medium" : "low");
  const effort = EFFORT_BY_TYPE[candidate.opportunityType] ?? "medium";
  const urgency =
    candidate.source === "conversation" ? "medium" : "low";

  return { confidence, impact, effort, urgency };
}

function confidenceFromWeight(
  weight: number,
  signalCount: number,
): OpportunityLevel {
  if (weight >= 7 && signalCount >= 2) return "high";
  if (weight >= 4 || signalCount >= 2) return "medium";
  return "low";
}

export function isHighImpactLowEffort(
  impact: OpportunityLevel,
  effort: OpportunityLevel,
): boolean {
  return impact === "high" && effort === "low";
}
