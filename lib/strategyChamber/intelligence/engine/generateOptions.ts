import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { shouldPreferStabilizeOrTest } from "../frameworks/capacityFit";
import { getStrategyType } from "../registry";
import type { EnrichedStrategyOption, OptionPatternId } from "../types";
import { assessOptionReadiness } from "./assessOptionReadiness";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

function opt(
  id: string,
  title: string,
  patternId: OptionPatternId,
  fields: Partial<EnrichedStrategyOption>,
): EnrichedStrategyOption {
  return {
    id,
    title,
    patternId,
    whyItMayFit: fields.whyItMayFit,
    benefits: fields.benefits,
    tradeoffs: fields.tradeoffs,
    whatWouldNeedToBeTrue: fields.whatWouldNeedToBeTrue,
    smallTest: fields.smallTest || fields.smallestUsefulTest,
    primaryBenefit: fields.primaryBenefit || fields.benefits?.[0],
    mainTradeoff: fields.mainTradeoff || fields.tradeoffs?.[0],
    protects: fields.protects,
    risks: fields.risks,
    smallestUsefulTest: fields.smallestUsefulTest || fields.smallTest,
  };
}

function pricingOptions(capacityTight: boolean): EnrichedStrategyOption[] {
  const options = [
    opt("raise_all", "Raise the price for everyone", "raise_price", {
      whyItMayFit:
        "Improves revenue more directly when the offer already feels underpriced.",
      benefits: ["Clearer revenue impact"],
      tradeoffs: ["May create more concern among current members"],
      whatWouldNeedToBeTrue: ["Members still see enough value after the change"],
      protects: "Revenue sustainability",
      risks: "Trust with current members",
      smallestUsefulTest: "Announce a planned change to a small group first",
    }),
    opt(
      "grandfather",
      "Keep current members at their price; update new joins",
      "protect_base",
      {
        whyItMayFit:
          "Protects trust with people already committed while updating new joins.",
        benefits: ["Protects current member relationships"],
        tradeoffs: ["Slower revenue change"],
        whatWouldNeedToBeTrue: ["New-member pricing alone is enough for now"],
        protects: "Current member trust",
        risks: "Two-tier complexity",
        smallestUsefulTest: "Apply the new price to new members for 30 days",
      },
    ),
    opt(
      "value_first",
      "Strengthen or clarify value before changing the price",
      "raise_value",
      {
        whyItMayFit:
          "Useful when the worry is less about the number and more about how the change will feel.",
        benefits: ["Stronger explanation before asking more"],
        tradeoffs: ["Takes more time before revenue changes"],
        whatWouldNeedToBeTrue: ["There is a clear value improvement to show"],
        protects: "Perceived fairness",
        risks: "Delayed cash improvement",
        smallestUsefulTest: "Improve one value proof point, then revisit price",
      },
    ),
  ];
  if (capacityTight) {
    return [
      opt("stabilize", "Stabilize delivery before any price change", "stabilize", {
        whyItMayFit: "Capacity is already tight; raising price can raise expectations.",
        benefits: ["Protects delivery quality"],
        tradeoffs: ["Delays revenue change"],
        protects: "Capacity and reputation",
        risks: "Cash pressure continues",
        smallestUsefulTest: "Protect capacity for 30 days, then revisit pricing",
      }),
      options[1],
      options[2],
    ];
  }
  return options;
}

function growthOptions(capacityTight: boolean): EnrichedStrategyOption[] {
  if (capacityTight) {
    return [
      opt("stabilize", "Stabilize and protect capacity first", "stabilize", {
        whyItMayFit: "More customers may worsen delivery strain.",
        benefits: ["Protects quality"],
        tradeoffs: ["Slower top-line growth"],
        protects: "Delivery promise",
        smallestUsefulTest: "Pause new acquisition experiments for 30 days",
      }),
      opt("retain", "Focus on retention and referrals before acquisition", "protect_base", {
        whyItMayFit: "Growth may already exist inside the current base.",
        benefits: ["Lower acquisition pressure"],
        tradeoffs: ["Fewer new logos short-term"],
        protects: "Current relationships",
        smallestUsefulTest: "Ask five happy customers for referrals",
      }),
      opt("test_segment", "Test one small segment before broad growth", "test", {
        whyItMayFit: "Reduces uncertainty without a full expansion.",
        benefits: ["Learning with less risk"],
        tradeoffs: ["Slower scale"],
        smallestUsefulTest: "Run one segment campaign for 30 days",
      }),
    ];
  }
  return [
    opt("expand_acq", "Increase awareness in one clear channel", "expand", {
      whyItMayFit: "Fits when the offer and capacity already work.",
      benefits: ["More reach"],
      tradeoffs: ["Time and cost of acquisition"],
      smallestUsefulTest: "Test one channel for 30 days",
    }),
    opt("narrow", "Narrow to the best-fit customers first", "narrow", {
      whyItMayFit: "Clarity can grow revenue without broader noise.",
      benefits: ["Stronger fit"],
      tradeoffs: ["Some audiences feel farther away"],
      smallestUsefulTest: "Speak only to one segment for a month",
    }),
    opt("offer_fix", "Strengthen the offer before buying more attention", "raise_value", {
      whyItMayFit: "Useful when conversion, not awareness, is weak.",
      benefits: ["Better use of attention"],
      tradeoffs: ["Takes product/offer work first"],
      smallestUsefulTest: "Improve one objection in the offer",
    }),
  ];
}

function genericOptions(capacityTight: boolean): EnrichedStrategyOption[] {
  return [
    opt(
      "commit",
      "Choose a clear direction and commit for a season",
      "continue",
      {
        whyItMayFit: "Helpful when scattered effort is the real cost.",
        benefits: ["Focus"],
        tradeoffs: ["Less flexibility short-term"],
        protects: "Attention",
        smallestUsefulTest: "Protect one priority for 30 days",
      },
    ),
    opt("pilot", "Run a small experiment before a full commitment", "test", {
      whyItMayFit: "Useful when certainty is still low.",
      benefits: ["Learning with less risk"],
      tradeoffs: ["Slower final decision"],
      protects: "Future flexibility",
      smallestUsefulTest: "Define a 30-day test with a stop signal",
    }),
    capacityTight
      ? opt("pause", "Pause and protect capacity first", "stabilize", {
          whyItMayFit: "Fits when energy or resources are already stretched.",
          benefits: ["Reduces overload"],
          tradeoffs: ["Delays progress on the opportunity"],
          protects: "Capacity",
          smallestUsefulTest: "Remove one commitment for two weeks",
        })
      : opt("simplify", "Simplify before expanding", "simplify", {
          whyItMayFit: "Doing less can be the strategic move.",
          benefits: ["Clearer execution"],
          tradeoffs: ["Some ideas wait"],
          protects: "Focus",
          smallestUsefulTest: "Stop one low-value activity for 30 days",
        }),
  ];
}

/**
 * At most three meaningfully different options. Growth is never the default.
 */
export function generateStrategicOptions(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): EnrichedStrategyOption[] {
  if (item.optionsConsidered?.length) {
    return item.optionsConsidered.slice(0, 3).map((o) => ({
      ...o,
      primaryBenefit: o.benefits?.[0],
      mainTradeoff: o.tradeoffs?.[0],
      smallestUsefulTest: o.smallTest,
    }));
  }

  const analysis = identifyStrategicQuestion(item);
  const capacityTight = shouldPreferStabilizeOrTest(item);
  const max = Math.min(3, presentation?.maxVisibleChoices ?? 3);

  let options: EnrichedStrategyOption[];
  if (analysis.strategyTypeId === "pricing" || analysis.questionType === "pricing_decision") {
    options = pricingOptions(capacityTight);
  } else if (
    analysis.strategyTypeId === "growth" ||
    analysis.questionType === "growth_decision" ||
    /\bmore customers?\b/i.test(item.decisionStatement || "")
  ) {
    options = growthOptions(capacityTight);
  } else {
    const type = getStrategyType(analysis.strategyTypeId);
    if (type?.id === "capacity_focus") {
      options = genericOptions(true);
    } else {
      options = genericOptions(capacityTight);
    }
  }

  return options.slice(0, max);
}

export function shouldOfferStrategicOptions(item: StrategyWorkItem): boolean {
  if (item.chosenDirection?.trim()) return false;
  if (item.optionsOffered === false) return false;
  if (item.optionsConsidered?.length) return true;
  return assessOptionReadiness(item).optionsReady;
}
