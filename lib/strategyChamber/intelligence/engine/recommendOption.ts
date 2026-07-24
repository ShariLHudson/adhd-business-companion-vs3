/**
 * Recommendation ≠ decision. Never mark chosen until the member confirms.
 */

import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { getDomainIntelligence } from "../domainIntelligence";
import type { StrategicOption } from "../optionContract";
import { memberFacingOptionName } from "../optionContract";
import { generateFullStrategicOptions } from "./generateOptions";
import { shouldOfferStrategicOptions } from "./generateOptions";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

export type StrategicRecommendation = {
  /** Leading option — recommendation only. */
  leading: StrategicOption;
  alternatives: StrategicOption[];
  whyStrongest: string;
  biggestUncertainty: string;
  mainTradeoff: string;
  memberCopy: string;
  /** Always false until user confirms a direction on the work item. */
  isDecision: false;
  finalQuestion?: string;
};

function scoreOption(option: StrategicOption, item: StrategyWorkItem): number {
  let score = 0;
  const capacityTight =
    /\b(overwhelm|capacity|tired|stretched|burn)/i.test(
      [...(item.constraints ?? []), item.currentReality ?? ""].join(" "),
    );
  if (capacityTight) {
    if (
      ["stabilize", "simplify", "test", "protect_current_base", "delay", "pause"].includes(
        option.optionPattern,
      )
    ) {
      score += 3;
    }
    if (option.optionPattern === "expand" || option.optionPattern === "increase_price") {
      score -= 2;
    }
  }
  if (option.reversibility === "easily_reversible") score += 2;
  if (option.reversibility === "difficult_to_reverse") score -= 1;
  if (option.optionPattern === "test") score += 1;
  if (option.confidence === "high") score += 1;
  if (option.confidence === "low") score -= 1;

  // Phase 4 — domain recommendation rules bias scoring (never auto-decide)
  const analysis = identifyStrategicQuestion(item);
  const domain = getDomainIntelligence(analysis.strategyTypeId);
  const rules = (domain?.recommendationRules ?? []).join(" ").toLowerCase();
  if (rules) {
    if (/do not grow|stabilize|delay/.test(rules) && option.optionPattern === "expand") {
      score -= 2;
    }
    if (/last resort|staged|diagnose/.test(rules) && option.optionPattern === "stop") {
      score -= 1;
    }
    if (/pilot|test/.test(rules) && option.optionPattern === "test") score += 2;
    if (/value|grandfather|protect/.test(rules) &&
      ["add_value", "protect_current_base", "staged_transition"].includes(option.optionPattern)
    ) {
      score += 2;
    }
    if (/simplify|stop doing|pause/.test(rules) &&
      ["simplify", "stop", "pause", "narrow"].includes(option.optionPattern)
    ) {
      score += 2;
    }
    if (/automate|contractor|pilot/.test(rules) &&
      ["automate", "delegate", "test", "delay"].includes(option.optionPattern)
    ) {
      score += 1;
    }
  }
  return score;
}

/**
 * When enough context exists, recommend a leading option without choosing for the member.
 */
export function recommendStrategicOption(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { helpMeChoose?: boolean },
): StrategicRecommendation | null {
  if (!shouldOfferStrategicOptions(item)) return null;
  if (item.chosenDirection?.trim()) return null;

  const options = generateFullStrategicOptions(item, presentation);
  if (!options.length) return null;

  const ranked = [...options].sort(
    (a, b) => scoreOption(b, item) - scoreOption(a, item),
  );
  const leading = ranked[0]!;
  const alternatives = ranked.slice(1, 3);
  const name = memberFacingOptionName(leading);
  const whyStrongest =
    leading.rationale ||
    leading.whyItMayFit ||
    "It fits what you have shared so far.";
  const biggestUncertainty =
    leading.assumptions[0] ||
    leading.evidenceNeeded?.[0] ||
    "Whether this still feels aligned once you see early evidence.";
  const mainTradeoff =
    leading.mainTradeoff || leading.tradeoffs[0] || "Something else waits.";

  const memberCopy = `Based on what you’ve shared, ${name.charAt(0).toLowerCase()}${name.slice(1)} looks like the strongest next move. ${whyStrongest} The main trade-off is ${mainTradeoff.charAt(0).toLowerCase()}${mainTradeoff.slice(1)}. The biggest open question is ${biggestUncertainty.charAt(0).toLowerCase()}${biggestUncertainty.slice(1)} This is a recommendation — you still choose.`;

  let finalQuestion: string | undefined;
  if (opts?.helpMeChoose) {
    finalQuestion =
      "How would you feel once this decision was made and you knew what you were moving toward?";
  }

  return {
    leading,
    alternatives,
    whyStrongest,
    biggestUncertainty,
    mainTradeoff,
    memberCopy,
    isDecision: false,
    finalQuestion,
  };
}

/** Explicit “help me choose” path — one optional final question only if it could change the recommendation. */
export function helpMeChoose(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): StrategicRecommendation | null {
  const rec = recommendStrategicOption(item, presentation, {
    helpMeChoose: true,
  });
  if (!rec) return null;
  // Only keep the feeling question when uncertainty is still material
  if (rec.leading.confidence === "high" && rec.leading.reversibility === "easily_reversible") {
    return { ...rec, finalQuestion: undefined };
  }
  return rec;
}
