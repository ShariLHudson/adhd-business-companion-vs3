/**
 * Explainable future friction insights.
 */

import type { FutureOpportunityType, FutureShariSnapshot } from "./types";

const OPPORTUNITY_LABELS: Record<FutureOpportunityType, string> = {
  organization: "Organization",
  planning: "Planning",
  health: "Health",
  relationship: "Relationship",
  recovery: "Recovery",
  business: "Business",
  financial: "Financial",
  home: "Home",
  learning: "Learning",
  custom: "Custom",
};

export function opportunityLabel(type: FutureOpportunityType): string {
  return OPPORTUNITY_LABELS[type];
}

export function explainFutureSnapshot(snapshot: FutureShariSnapshot): string {
  return [
    opportunityLabel(snapshot.opportunity),
    snapshot.futureBenefit,
    `Timeframe: ${snapshot.timeframe}`,
  ].join(" · ");
}

export function frictionFromSnapshot(snapshot: FutureShariSnapshot): string {
  switch (snapshot.opportunity) {
    case "organization":
      return "Mental clutter / uncaptured thoughts";
    case "planning":
      return "Tomorrow starts without setup";
    case "relationship":
      return "Open communication loops";
    case "recovery":
      return "Low recovery buffer";
    default:
      return "Small friction Future You could avoid";
  }
}
