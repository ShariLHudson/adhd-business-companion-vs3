/**
 * One warm member-facing recommendation hint.
 * Never “Pricing recommends…” — and never a confirmed decision.
 */

import type { StrategyTypeId } from "../types";
import type { SynthesisConfidence, StrategySynthesisConflict } from "./types";

export function synthesizeMemberFacingRecommendation(input: {
  primaryId: StrategyTypeId;
  secondaryId?: StrategyTypeId;
  conflicts: StrategySynthesisConflict[];
  confidence: SynthesisConfidence;
  strategicQuestion?: string;
}): string | undefined {
  const { primaryId, secondaryId, conflicts, confidence } = input;

  if (confidence === "low") {
    return "Before we choose a path, I want to understand what you most need this decision to change. One clearer question will help more than a list of options.";
  }

  if (primaryId === "pricing" && secondaryId === "capacity_focus") {
    return "Based on what you’ve shared, testing a higher price with new customers while tightening what is included looks strongest. It gives you evidence about pricing without disrupting current members, and it also addresses the workload that is making the offer hard to sustain. The main uncertainty is whether the clearer boundaries still feel aligned with the outcome people expect. This is a recommendation — not a decision.";
  }

  if (primaryId === "growth" && secondaryId === "pricing") {
    return "With customers already present, the stronger path looks like improving revenue per customer — through value, pricing, or retention — rather than chasing more volume. The main trade-off is patience versus the comfort of familiar acquisition activity. This is a recommendation — not a decision.";
  }

  if (primaryId === "growth" && secondaryId === "capacity_focus") {
    return "Stabilizing delivery before expanding demand looks strongest right now. Growth that leaves you exhausted and customers less supported would not be healthy growth. A limited test can wait until capacity has a little room. This is a recommendation — not a decision.";
  }

  if (primaryId === "hiring_delegation" && secondaryId === "capacity_focus") {
    return "Before hiring, the strongest move may be naming the work that does not require you and testing relief through simplification or a bounded contractor trial. Management effort matters as much as hours saved. This is a recommendation — not a decision.";
  }

  if (primaryId === "offer" && secondaryId === "market_customer") {
    return "Clarifying who this is for — and what change it creates — looks stronger than building the full program yet. A small validation test can protect your energy. This is a recommendation — not a decision.";
  }

  if (conflicts[0]?.resolutionMethod === "experiment") {
    return "A small bounded test looks wiser than a full commitment while two concerns are still in tension. We can learn without locking you in. This is a recommendation — not a decision.";
  }

  return undefined;
}

export function synthesizeExperimentHint(input: {
  primaryId: StrategyTypeId;
  secondaryId?: StrategyTypeId;
  conflicts: StrategySynthesisConflict[];
}): string | undefined {
  const { primaryId, secondaryId, conflicts } = input;

  if (primaryId === "pricing" && secondaryId === "capacity_focus") {
    return "Offer a higher-priced, more clearly bounded version to five new prospects. Track conversion, objections, delivery time, and support burden. Review after five decisions or 30 days.";
  }
  if (primaryId === "growth" && secondaryId === "market_customer") {
    return "Test one narrowed audience with the current offer. Track qualified interest, conversion, and fit. Do not build a new offer until the audience signal is clearer.";
  }
  if (primaryId === "hiring_delegation") {
    return "Use a contractor for one defined recurring task for 30 days. Track time saved, management effort, quality, and whether the work truly relieved the constraint.";
  }
  if (primaryId === "growth" && secondaryId === "pricing") {
    return "Test a clearer value or price path with a small set of current or new customers before spending more on acquisition.";
  }
  if (conflicts[0]?.resolutionMethod === "experiment") {
    return "Run one bounded test that answers the shared uncertainty before a broad change.";
  }
  return undefined;
}

export function synthesizeIntegratedRiskSummaries(input: {
  primaryId: StrategyTypeId;
  secondaryId?: StrategyTypeId;
  riskLines: string[];
}): string[] {
  const { primaryId, secondaryId, riskLines } = input;
  if (primaryId === "pricing" && secondaryId === "capacity_focus") {
    return [
      "The two main risks are changing the price without enough evidence and keeping the current structure long enough that delivery remains unsustainable.",
    ];
  }
  if (primaryId === "growth" && secondaryId === "capacity_focus") {
    return [
      "The main risks are growing demand beyond what you can deliver well, and delaying needed stabilization.",
    ];
  }
  // Cap material risks only
  return riskLines.slice(0, 2);
}
