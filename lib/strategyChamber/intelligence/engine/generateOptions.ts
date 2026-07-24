import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { shouldPreferStabilizeOrTest } from "../frameworks/capacityFit";
import { materializeStrategicOption } from "../frameworks/optionCatalog";
import {
  strategicOptionsAreDistinct,
  toEnrichedStrategyOption,
  type StrategicOption,
} from "../optionContract";
import {
  optionsAreMeaningfullyDifferent,
  strategyQualityIssues,
} from "../quality/strategyQuality";
import { getStrategyType } from "../registry";
import type { EnrichedStrategyOption, OptionPatternId } from "../types";
import { assessOptionReadiness } from "./assessOptionReadiness";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { selectDistinctOptionPatterns } from "./selectDistinctOptionPatterns";

function fromPersisted(item: StrategyWorkItem): EnrichedStrategyOption[] {
  return (item.optionsConsidered ?? []).slice(0, 3).map((o) => ({
    ...o,
    primaryBenefit: o.benefits?.[0],
    mainTradeoff: o.tradeoffs?.[0],
    smallestUsefulTest: o.smallTest,
  }));
}

function pricingPatterns(capacityTight: boolean): OptionPatternId[] {
  if (capacityTight) {
    return ["stabilize", "protect_base", "raise_value"];
  }
  return ["raise_price", "protect_base", "raise_value", "test", "delay"];
}

function growthPatterns(capacityTight: boolean): OptionPatternId[] {
  if (capacityTight) {
    return ["stabilize", "protect_base", "test", "simplify"];
  }
  return ["narrow", "test", "expand", "raise_value", "simplify"];
}

/**
 * Full Phase 3 options — typed contract with trade-offs, risk, reversibility, experiments.
 */
export function generateFullStrategicOptions(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): StrategicOption[] {
  if (item.optionsConsidered?.length) {
    return item.optionsConsidered.slice(0, 3).map((o, index) => {
      const pattern = (["continue", "test", "simplify"] as OptionPatternId[])[
        index
      ]!;
      const base = materializeStrategicOption(pattern, {
        id: o.id,
        titleOverride: o.title,
      });
      return {
        ...base,
        title: o.title,
        name: o.title,
        whyItMayFit: o.whyItMayFit || base.rationale,
        benefits: o.benefits?.length ? o.benefits : base.benefits,
        tradeoffs: o.tradeoffs?.length ? o.tradeoffs : base.tradeoffs,
        whatWouldNeedToBeTrue:
          o.whatWouldNeedToBeTrue?.length
            ? o.whatWouldNeedToBeTrue
            : base.assumptions,
        smallTest: o.smallTest || base.smallestUsefulTest,
        smallestUsefulTest: o.smallTest || base.smallestUsefulTest,
        primaryBenefit: o.benefits?.[0] || base.primaryBenefit,
        mainTradeoff: o.tradeoffs?.[0] || base.mainTradeoff,
        userConfirmed: true,
      };
    });
  }

  const analysis = identifyStrategicQuestion(item);
  const capacityTight = shouldPreferStabilizeOrTest(item);
  const max = Math.min(3, presentation?.maxVisibleChoices ?? 3);
  const type = getStrategyType(analysis.strategyTypeId);

  let candidates: OptionPatternId[];
  if (analysis.strategyTypeId === "pricing" || analysis.questionType === "pricing_decision") {
    candidates = pricingPatterns(capacityTight);
  } else if (
    analysis.strategyTypeId === "growth" ||
    analysis.questionType === "growth_decision" ||
    /\bmore customers?\b/i.test(item.decisionStatement || "")
  ) {
    candidates = growthPatterns(capacityTight);
  } else if (type) {
    candidates = [...type.optionPatterns];
    if (capacityTight || type.id === "capacity_focus") {
      candidates = ["stabilize", "simplify", "test", ...candidates];
    }
  } else {
    candidates = capacityTight
      ? ["stabilize", "test", "simplify", "delay"]
      : ["continue", "test", "simplify", "delay"];
  }

  // Deduplicate while preserving order
  const uniqueCandidates = [...new Set(candidates)];
  const selected = selectDistinctOptionPatterns(uniqueCandidates, item, {
    strategyTypeId: analysis.strategyTypeId,
    max,
  });

  const options = selected.map((pattern) =>
    materializeStrategicOption(pattern, {
      typeId: analysis.strategyTypeId,
      commonTradeoffs: type?.commonTradeoffs,
      commonRisks: type?.commonRisks,
      experimentHint: type?.experimentPatterns?.[0],
    }),
  );

  // Quality gate — if somehow too similar, force a test + simplify pair
  if (!strategicOptionsAreDistinct(options) && options.length >= 2) {
    return [
      materializeStrategicOption("test", { typeId: analysis.strategyTypeId }),
      materializeStrategicOption("simplify", { typeId: analysis.strategyTypeId }),
      materializeStrategicOption(
        capacityTight ? "stabilize" : "continue",
        { typeId: analysis.strategyTypeId },
      ),
    ].slice(0, max);
  }

  return options.slice(0, max);
}

/**
 * At most three meaningfully different options. Growth is never the default.
 * Returns EnrichedStrategyOption for Phase 1/2 / conversation compatibility.
 */
export function generateStrategicOptions(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): EnrichedStrategyOption[] {
  if (item.optionsConsidered?.length) {
    return fromPersisted(item);
  }
  const full = generateFullStrategicOptions(item, presentation);
  const enriched = full.map(toEnrichedStrategyOption);
  const similarityOnly = strategyQualityIssues(enriched).filter(
    (issue) => issue === "options_too_similar" || issue === "more_than_three_options",
  );
  if (similarityOnly.length > 0 || !optionsAreMeaningfullyDifferent(enriched)) {
    return [
      toEnrichedStrategyOption(full[0] ?? materializeStrategicOption("test")),
      toEnrichedStrategyOption(materializeStrategicOption("simplify")),
      toEnrichedStrategyOption(materializeStrategicOption("continue")),
    ].slice(0, Math.min(3, presentation?.maxVisibleChoices ?? 3));
  }
  return enriched;
}

export function shouldOfferStrategicOptions(item: StrategyWorkItem): boolean {
  if (item.chosenDirection?.trim()) return false;
  if (item.optionsOffered === false) return false;
  if (item.optionsConsidered?.length) return true;
  return assessOptionReadiness(item).optionsReady;
}
