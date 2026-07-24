/**
 * Secondary domain loads only when it could materially change judgment.
 */

import type { StrategyTypeId } from "../types";
import type { SecondaryThresholdReason } from "./types";

export function evaluateSecondaryThreshold(input: {
  primaryId: StrategyTypeId;
  secondaryId: StrategyTypeId;
  text: string;
}): SecondaryThresholdReason[] {
  const t = input.text.toLowerCase();
  const reasons: SecondaryThresholdReason[] = [];
  const { primaryId, secondaryId } = input;

  // Capacity secondary — major constraint / can reverse growth or raise
  if (secondaryId === "capacity_focus") {
    if (/overwhelm|burned out|cannot keep|can't keep|too much|delivery|capacity/.test(t)) {
      reasons.push("reveals_major_constraint");
      reasons.push("could_reverse_recommendation");
      reasons.push("could_eliminate_options");
    }
    if (/grow|growth|more customers|raise|charge|hire/.test(t)) {
      reasons.push("changes_reversibility_or_risk");
    }
  }

  // Pricing secondary on growth — value path
  if (primaryId === "growth" && secondaryId === "pricing") {
    if (/plenty of customers|lots of customers|revenue is still low|more revenue/.test(t)) {
      reasons.push("could_reverse_recommendation");
      reasons.push("could_eliminate_options");
      reasons.push("better_experiment");
    }
  }

  // Growth secondary on pricing — demand vs price
  if (primaryId === "pricing" && secondaryId === "growth") {
    if (/not buying|not converting|weak demand|no one|nobody/.test(t)) {
      reasons.push("missing_essential_evidence");
      reasons.push("could_reverse_recommendation");
    }
  }

  // Market secondary
  if (secondaryId === "market_customer") {
    if (/wrong customers|right customers|who .{0,24}for|audience|fit|posting regularly/.test(t)) {
      reasons.push("missing_essential_evidence");
      reasons.push("better_experiment");
      reasons.push("could_reverse_recommendation");
    }
  }

  // Hiring + capacity/growth
  if (primaryId === "hiring_delegation") {
    if (secondaryId === "capacity_focus" && /cannot keep|can't keep|overwhelm|too much/.test(t)) {
      reasons.push("reveals_major_constraint");
      reasons.push("could_eliminate_options");
    }
    if (secondaryId === "growth" && /grow|growth/.test(t)) {
      reasons.push("could_reverse_recommendation");
      reasons.push("better_experiment");
    }
  }

  // Offer + market
  if (primaryId === "offer" && secondaryId === "market_customer") {
    if (/who .{0,24}for|audience|don't know who|do not know who/.test(t)) {
      reasons.push("missing_essential_evidence");
      reasons.push("better_experiment");
    }
  }

  // Destination change (capacity → not marketing)
  if (
    secondaryId === "capacity_focus" &&
    /grow|growth|marketing|leads|customers/.test(t)
  ) {
    reasons.push("changes_destination");
  }

  return [...new Set(reasons)];
}

export function secondaryClearsThreshold(
  reasons: SecondaryThresholdReason[],
): boolean {
  return reasons.length > 0;
}
