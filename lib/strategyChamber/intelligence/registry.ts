import type { StrategyTypeContract, StrategyTypeId } from "./types";
import { businessDirectionStrategyType } from "./strategyTypes/businessDirection";
import { growthStrategyType } from "./strategyTypes/growth";
import { pricingStrategyType } from "./strategyTypes/pricing";
import { offerStrategyType } from "./strategyTypes/offer";
import { marketCustomerStrategyType } from "./strategyTypes/marketCustomer";
import { capacityFocusStrategyType } from "./strategyTypes/capacityFocus";
import { hiringDelegationStrategyType } from "./strategyTypes/hiringDelegation";
import { partnershipStrategyType } from "./strategyTypes/partnership";
import { personalDirectionStrategyType } from "./strategyTypes/personalDirection";
import { pivotRethinkStrategyType } from "./strategyTypes/pivotRethink";
import { ninetyDayStrategyType } from "./strategyTypes/ninetyDay";

const STRATEGY_TYPES: StrategyTypeContract[] = [
  businessDirectionStrategyType,
  growthStrategyType,
  pricingStrategyType,
  offerStrategyType,
  marketCustomerStrategyType,
  capacityFocusStrategyType,
  hiringDelegationStrategyType,
  partnershipStrategyType,
  personalDirectionStrategyType,
  pivotRethinkStrategyType,
  ninetyDayStrategyType,
];

const BY_ID = new Map<StrategyTypeId, StrategyTypeContract>(
  STRATEGY_TYPES.map((t) => [t.id, t]),
);

export function listStrategyTypes(): StrategyTypeContract[] {
  return [...STRATEGY_TYPES];
}

export function getStrategyType(
  id: StrategyTypeId | string | null | undefined,
): StrategyTypeContract | null {
  if (!id) return null;
  return BY_ID.get(id as StrategyTypeId) ?? null;
}

/**
 * Score strategy types by entry signals against member text.
 * First statement is a hint — not a final classification.
 */
export function matchStrategyTypesFromText(
  text: string,
): Array<{ type: StrategyTypeContract; score: number }> {
  const t = text.trim();
  if (!t) return [];
  const scored = STRATEGY_TYPES.map((type) => {
    let score = 0;
    for (const signal of type.entrySignals) {
      if (signal.test(t)) score += 1;
    }
    // Prefer more specific domains when language is shared (e.g. partnership vs offer)
    if (score > 0 && type.id === "partnership") score += 2;
    if (score > 0 && type.id === "hiring_delegation") score += 1;
    if (score > 0 && type.id === "pricing") score += 1;
    if (score > 0 && type.id === "pivot_rethink") score += 1;
    return { type, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function resolvePrimaryStrategyType(
  text: string,
): StrategyTypeContract | null {
  return matchStrategyTypesFromText(text)[0]?.type ?? null;
}
