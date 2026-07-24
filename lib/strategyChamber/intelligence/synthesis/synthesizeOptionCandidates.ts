/**
 * Build option-pattern candidates from synthesized contributions.
 * Shared option generator remains the final authority (≤3, diversity, readiness).
 */

import type { OptionPatternId, StrategyTypeId } from "../types";
import { normalizeOptionPattern } from "../patternLabels";
import { growthOptionPatterns } from "../domains/growth";
import { pricingOptionPatterns } from "../domains/pricing";
import type { StrategyDomainContribution } from "./types";
import { secondaryRestraintShouldBiasOptions } from "./resolveConflicts";

export function synthesizeOptionPatternCandidates(input: {
  primaryId: StrategyTypeId;
  secondaryId?: StrategyTypeId;
  text: string;
  contributions: StrategyDomainContribution[];
  capacityTight?: boolean;
}): OptionPatternId[] {
  const {
    primaryId,
    secondaryId,
    text,
    contributions,
    capacityTight = false,
  } = input;
  const lower = text.toLowerCase();

  const fromContributions = contributions
    .filter((c) => c.contributionType === "option")
    .map((c) => normalizeOptionPattern(c.content as OptionPatternId));

  let primaryPatterns: OptionPatternId[] = [];
  if (primaryId === "pricing") {
    primaryPatterns = pricingOptionPatterns({
      capacityTight,
      deliveryBurden: /too much for what|doing too much|delivery/.test(lower),
      fearChurn: /leave|churn|upset/.test(lower),
      weakConversion: /not buying|not converting/.test(lower),
      weakEvidence: /not much evidence|unsure/.test(lower),
    });
  } else if (primaryId === "growth") {
    primaryPatterns = growthOptionPatterns({
      capacityTight,
      retentionLeak: /churn|don't stay|do not stay|retention/.test(lower),
      focusScattered: /three new offers|many offers/.test(lower),
      wantMaintainSize: /stay small|don't want (a )?bigger|do not want (a )?bigger/.test(
        lower,
      ),
      revenueNotVolume:
        /plenty of customers|revenue is still low/.test(lower) &&
        !/more customers/.test(lower),
      marketExpansion: /another market|new market/.test(lower),
      hireToGrow: /hire.*(grow|growth)|(grow|growth).*hire/.test(lower),
    });
  }

  let secondaryBias: OptionPatternId[] = [];
  if (secondaryId === "pricing" && primaryId === "growth") {
    secondaryBias = pricingOptionPatterns({
      weakEvidence: false,
      revenueNotVolume: /revenue|price|value/.test(lower),
    }).filter((p) =>
      ["add_value", "protect_current_base", "test", "improve"].includes(p),
    );
  }
  if (secondaryId === "growth" && primaryId === "pricing") {
    secondaryBias = ["narrow", "test", "improve", "protect_current_base"];
  }
  if (
    secondaryRestraintShouldBiasOptions(primaryId, secondaryId) ||
    capacityTight
  ) {
    secondaryBias = [
      "stabilize",
      "simplify",
      "protect_current_base",
      "test",
      "delay",
      "reduce_scope",
      ...secondaryBias,
    ];
  }

  // Integrated pairs for classic cross-domain asks
  if (
    primaryId === "pricing" &&
    secondaryId === "capacity_focus" &&
    /too much for what|doing too much/.test(lower)
  ) {
    return [
      "increase_price",
      "reduce_scope",
      "restructure_price",
      "simplify",
      "test",
      "protect_current_base",
    ];
  }
  if (
    primaryId === "growth" &&
    secondaryId === "capacity_focus" &&
    /overwhelm|cannot keep|can't keep|burned out/.test(lower)
  ) {
    return ["stabilize", "simplify", "protect_current_base", "test", "delay"];
  }
  if (
    primaryId === "growth" &&
    secondaryId === "pricing" &&
    /plenty of customers|revenue is still low/.test(lower)
  ) {
    return ["add_value", "improve", "narrow", "test", "protect_current_base"];
  }

  const merged = [
    ...primaryPatterns,
    ...secondaryBias,
    ...fromContributions,
  ].map(normalizeOptionPattern);

  // Never let expand lead when restraint applies
  if (secondaryRestraintShouldBiasOptions(primaryId, secondaryId)) {
    const rest = merged.filter((p) => p !== "expand" && p !== "increase_price");
    const raises = merged.filter((p) => p === "increase_price");
    // Keep raise as a candidate for pricing+capacity, but not first
    return [...new Set([...rest, ...raises, "expand"])];
  }

  return [...new Set(merged)];
}
