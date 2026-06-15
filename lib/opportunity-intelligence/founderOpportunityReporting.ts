/**
 * Founder-facing opportunity reporting — what may be worth acting on.
 */

import { isHighImpactLowEffort } from "./opportunityScoring";
import { priorityScore } from "./opportunityDetection";
import { getOpportunityStore } from "./opportunityStore";
import type { FounderOpportunityReport, OpportunityType } from "./types";

export function buildFounderOpportunityReport(
  now = new Date(),
): FounderOpportunityReport {
  const store = getOpportunityStore();
  const opportunities = store.opportunities.filter(
    (o) => o.status !== "dismissed",
  );

  const ranked = [...opportunities].sort(
    (a, b) => priorityScore(b) - priorityScore(a),
  );

  const topOpportunities = ranked.slice(0, 5).map((o) => ({
    title: o.title,
    type: o.opportunityType,
    score: priorityScore(o),
  }));

  const newestOpportunities = [...opportunities]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((o) => ({
      title: o.title,
      type: o.opportunityType,
      createdAt: o.createdAt,
    }));

  const highImpactLowEffort = ranked
    .filter((o) => isHighImpactLowEffort(o.impact, o.effort))
    .slice(0, 5)
    .map((o) => ({ title: o.title, type: o.opportunityType }));

  const countType = (type: OpportunityType) =>
    opportunities.filter((o) => o.opportunityType === type).length;

  const topType = topOpportunities[0]?.type;

  return {
    generatedAt: now.toISOString(),
    sampleSize: opportunities.length,
    topOpportunities,
    newestOpportunities,
    highImpactLowEffort,
    contentOpportunities:
      countType("content_opportunity") +
      countType("lead_magnet_opportunity") +
      countType("workshop_opportunity"),
    productOpportunities: countType("product_opportunity"),
    relationshipOpportunities:
      countType("relationship_opportunity") +
      countType("referral_opportunity"),
    recommendedFounderAction: founderActionFor(topType),
    notes:
      "Local preview — opportunities are suggestions only, never pressure.",
  };
}

function founderActionFor(type: OpportunityType | undefined): string {
  switch (type) {
    case "content_opportunity":
    case "lead_magnet_opportunity":
    case "workshop_opportunity":
      return "Content themes are surfacing — consider a post, guide, or workshop outline.";
    case "product_opportunity":
    case "workflow_opportunity":
      return "Product/workflow friction is repeating — capture a small improvement experiment.";
    case "relationship_opportunity":
    case "referral_opportunity":
      return "Relationship opportunities are warm — keep follow-ups optional and gentle.";
    case "offer_opportunity":
      return "Offer ideas are emerging — validate with a one-sentence hypothesis first.";
    default:
      return "Monitor opportunity patterns — act only on high impact, low effort items.";
  }
}
