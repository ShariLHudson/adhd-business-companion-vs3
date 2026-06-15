/**
 * Founder-facing Future Shari reporting.
 */

import { getFutureShariStore } from "./futureStore";
import type { FounderFutureReport, FutureOpportunityType } from "./types";

const MS_DAY = 86_400_000;

const TYPE_LABELS: Record<FutureOpportunityType, string> = {
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

export function opportunityTypeLabel(type: FutureOpportunityType): string {
  return TYPE_LABELS[type];
}

export function buildFounderFutureReport(now = new Date()): FounderFutureReport {
  const store = getFutureShariStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const typeCounts = new Map<FutureOpportunityType, number>();
  const frictionCounts = new Map<string, number>();

  for (const s of recent) {
    typeCounts.set(
      s.opportunity,
      (typeCounts.get(s.opportunity) ?? 0) + 1,
    );
    if (s.frictionPoint) {
      frictionCounts.set(
        s.frictionPoint,
        (frictionCounts.get(s.frictionPoint) ?? 0) + 1,
      );
    }
  }

  const commonOpportunities = [...typeCounts.entries()]
    .map(([type, count]) => ({
      type,
      label: opportunityTypeLabel(type),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const commonFrictionPoints = [...frictionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([point]) => point)
    .slice(0, 5);

  const top = commonOpportunities[0]?.type;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    commonOpportunities,
    acceptedCount: store.acceptedCount,
    ignoredCount: store.ignoredCount,
    commonFrictionPoints,
    recommendedFounderAction: founderActionFor(top),
    notes:
      "Local preview — Future Shari is optional; never pressure or guilt.",
  };
}

function founderActionFor(type: FutureOpportunityType | undefined): string {
  switch (type) {
    case "organization":
      return "Promote capture-and-park flows for mental clutter.";
    case "planning":
      return "Tomorrow-setup prompts are landing — keep them tiny.";
    case "recovery":
      return "Future setup + rest pairing works — avoid hustle framing.";
    case "relationship":
      return "Quick follow-up suggestions help — stay human, not polished.";
    default:
      return "Monitor friction points — suggestions stay optional.";
  }
}
