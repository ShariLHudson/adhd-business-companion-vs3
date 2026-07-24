import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { shouldPreferStabilizeOrTest } from "../frameworks/capacityFit";
import { materializeStrategicOption } from "../frameworks/optionCatalog";
import { normalizeOptionPattern } from "../patternLabels";
import {
  strategicOptionsAreDistinct,
  toEnrichedStrategyOption,
  type StrategicOption,
} from "../optionContract";
import {
  optionsAreMeaningfullyDifferent,
  strategyQualityIssues,
} from "../quality/strategyQuality";
import {
  getDomainIntelligence,
  matchProblemDistinction,
} from "../domainIntelligence";
import { getStrategyType } from "../registry";
import type { EnrichedStrategyOption, OptionPatternId } from "../types";
import { assessOptionReadiness } from "./assessOptionReadiness";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { selectDistinctOptionPatterns } from "./selectDistinctOptionPatterns";
import { validateOptionDiversity } from "./validateOptionDiversity";

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
    return ["stabilize", "protect_current_base", "add_value"];
  }
  // Meaningfully different pricing paths — not percentage variants
  return [
    "protect_current_base",
    "restructure_price",
    "test",
    "add_value",
    "increase_price",
    "delay",
  ];
}

function growthPatterns(capacityTight: boolean): OptionPatternId[] {
  if (capacityTight) {
    return ["stabilize", "protect_current_base", "test", "simplify"];
  }
  return ["narrow", "test", "improve", "expand", "simplify"];
}

function ideasPatterns(): OptionPatternId[] {
  return ["narrow", "test", "stabilize", "maintain_current_direction", "simplify"];
}

function hiringPatterns(): OptionPatternId[] {
  return ["delegate", "automate", "simplify", "test", "delay", "partner"];
}

function partnershipPatterns(): OptionPatternId[] {
  return ["test", "delay", "partner", "pause"];
}

function pivotPatterns(): OptionPatternId[] {
  return ["improve", "narrow", "reposition", "pause", "stop", "test"];
}

/**
 * Full Phase 3 options — typed contract with trade-offs, risk, reversibility, experiments.
 * Respects OptionReadiness — callers should use shouldOfferStrategicOptions before showing.
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
  const statement = (item.decisionStatement || "").toLowerCase();

  let candidates: OptionPatternId[];
  if (analysis.strategyTypeId === "pricing" || analysis.questionType === "pricing_decision") {
    candidates = pricingPatterns(capacityTight);
  } else if (
    analysis.strategyTypeId === "growth" ||
    analysis.questionType === "growth_decision" ||
    /\bmore customers?\b/i.test(statement)
  ) {
    candidates = growthPatterns(capacityTight);
  } else if (
    /\b(ten things|too many ideas|many ideas|ten ideas)\b/i.test(statement)
  ) {
    candidates = ideasPatterns();
  } else if (
    analysis.strategyTypeId === "hiring_delegation" ||
    /\bhire|va|assistant|delegate\b/i.test(statement)
  ) {
    candidates = hiringPatterns();
  } else if (
    analysis.strategyTypeId === "partnership" ||
    analysis.questionType === "partnership_decision" ||
    /\b(collaborat|partner with|partnership)\b/i.test(statement)
  ) {
    candidates = partnershipPatterns();
  } else if (
    analysis.strategyTypeId === "pivot_rethink" ||
    /\b(isn'?t working|not working|pivot)\b/i.test(statement)
  ) {
    candidates = pivotPatterns();
  } else if (type) {
    candidates = type.optionPatterns.map(normalizeOptionPattern);
    if (capacityTight || type.id === "capacity_focus") {
      candidates = ["stabilize", "simplify", "test", ...candidates];
    }
  } else {
    candidates = capacityTight
      ? ["stabilize", "test", "simplify", "delay"]
      : ["continue", "test", "simplify", "improve", "delay"];
  }

  // Phase 4 — bias candidate pool with matched problem distinction patterns
  const domain = getDomainIntelligence(analysis.strategyTypeId) ?? type;
  const distinction = matchProblemDistinction(
    domain,
    `${item.decisionStatement ?? ""} ${item.currentReality ?? ""} ${item.desiredDirection ?? ""}`,
  );
  if (distinction?.preferredPatterns?.length) {
    candidates = [
      ...distinction.preferredPatterns,
      ...candidates,
    ];
  }

  const uniqueCandidates = [...new Set(candidates.map(normalizeOptionPattern))];
  const selected = selectDistinctOptionPatterns(uniqueCandidates, item, {
    strategyTypeId: analysis.strategyTypeId,
    max: Math.max(max, 3),
  });

  const rejected = new Set(
    (item.notChosen ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean),
  );

  const knowledge = domain ?? type;
  let options = selected
    .map((pattern) =>
      materializeStrategicOption(pattern, {
        typeId: analysis.strategyTypeId,
        commonTradeoffs: knowledge?.commonTradeoffs,
        commonRisks: knowledge?.commonRisks,
        experimentHint: knowledge?.experimentPatterns?.[0],
        possibleNextDestination: knowledge?.handoffDestinations?.[0],
      }),
    )
    .filter((o) => !rejected.has(o.title.toLowerCase()));

  const diversity = validateOptionDiversity(options);
  options = diversity.kept;

  if (!strategicOptionsAreDistinct(options) && options.length >= 2) {
    options = [
      materializeStrategicOption("test", { typeId: analysis.strategyTypeId }),
      materializeStrategicOption("simplify", { typeId: analysis.strategyTypeId }),
      materializeStrategicOption(capacityTight ? "stabilize" : "maintain_current_direction", {
        typeId: analysis.strategyTypeId,
      }),
    ];
  }

  return options.slice(0, max);
}

/**
 * At most three meaningfully different options. Growth is never the default.
 */
export function generateStrategicOptions(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): EnrichedStrategyOption[] {
  if (item.optionsConsidered?.length) {
    return fromPersisted(item);
  }
  // Hard gate — do not invent options before readiness (unless already persisted)
  if (!shouldOfferStrategicOptions(item) && !item.optionsConsidered?.length) {
    return [];
  }
  const full = generateFullStrategicOptions(item, presentation);
  const enriched = full.map(toEnrichedStrategyOption);
  const similarityOnly = strategyQualityIssues(enriched).filter(
    (issue) =>
      issue === "options_too_similar" || issue === "more_than_three_options",
  );
  if (similarityOnly.length > 0 || !optionsAreMeaningfullyDifferent(enriched)) {
    return [
      toEnrichedStrategyOption(full[0] ?? materializeStrategicOption("test")),
      toEnrichedStrategyOption(materializeStrategicOption("simplify")),
      toEnrichedStrategyOption(
        materializeStrategicOption("maintain_current_direction"),
      ),
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
