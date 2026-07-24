import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import {
  compareOptionsPlain,
  optionTradeoffCard,
  salientTradeoffDimensions,
} from "../frameworks/tradeoffs";
import { opportunityCostsForOption } from "../frameworks/opportunityCost";
import type { StrategicOption } from "../optionContract";
import { memberFacingOptionName } from "../optionContract";
import type { EnrichedStrategyOption } from "../types";
import { generateFullStrategicOptions } from "./generateOptions";
import type { StrategyWorkItem } from "../../types";

export type ComparisonMode =
  | "side_by_side"
  | "one_at_a_time"
  | "summary_first"
  | "leading_plus_alternatives"
  | "plain_tradeoffs"
  | "one_criterion";

export type OptionComparisonCard = {
  name: string;
  whyFits: string;
  primaryBenefit: string;
  primaryTradeoff: string;
  capacityDemand: string;
  reversibility: string;
  mainRisk: string;
  smallestTest: string;
  whatWouldRuleItOut: string;
};

export type OptionComparisonResult = {
  dimensions: string[];
  lines: string[];
  style: string;
  mode: ComparisonMode;
  distinctnessNote: string;
  preferExperimentOverCommitment: boolean;
  opportunityCostLines: string[];
  reversibilityLines: string[];
  cards: OptionComparisonCard[];
  leadingId?: string;
};

function resolveMode(
  presentation?: AdaptivePresentationResolved,
): ComparisonMode {
  const style = presentation?.comparisonStyle ?? "plain_tradeoffs";
  if (style === "one_criterion") return "one_criterion";
  if (presentation?.choiceLoad === "one") return "one_at_a_time";
  if (style === "side_by_side") return "side_by_side";
  if (presentation?.structureLevel === "minimal") return "summary_first";
  return "leading_plus_alternatives";
}

function toCard(option: StrategicOption): OptionComparisonCard {
  const trade = optionTradeoffCard(option);
  return {
    name: memberFacingOptionName(option),
    whyFits: option.rationale || option.whyItMayFit || "",
    primaryBenefit: trade.primaryBenefit,
    primaryTradeoff: trade.primaryTradeoff,
    capacityDemand: trade.capacityBurden,
    reversibility: option.reversibility.replace(/_/g, " "),
    mainRisk: option.risksDetailed[0]?.description || option.risks || "",
    smallestTest:
      option.smallestUsefulTest ||
      option.experiment?.smallAction ||
      option.smallTest ||
      "",
    whatWouldRuleItOut:
      option.whatWouldRuleItOut ||
      option.assumptions[0] ||
      "If the key assumption does not hold.",
  };
}

function distinctnessNoteFor(options: EnrichedStrategyOption[]): string {
  const patterns = options.map((o) => o.patternId).filter(Boolean);
  if (patterns.length >= 2 && new Set(patterns).size >= 2) {
    return "These paths differ in direction — not just wording.";
  }
  return "Compare what each path protects and what it risks before choosing.";
}

export function compareStrategicOptions(
  options: EnrichedStrategyOption[],
  presentation?: AdaptivePresentationResolved,
): OptionComparisonResult {
  const dims = salientTradeoffDimensions(options);
  const mode = resolveMode(presentation);
  const style = presentation?.comparisonStyle ?? "plain_tradeoffs";
  const preferExperimentOverCommitment = options.some(
    (o) =>
      o.patternId === "test" ||
      /\b(test|pilot|experiment|30 days)\b/i.test(
        o.smallestUsefulTest || o.smallTest || o.title,
      ),
  );

  const opportunityCostLines = options.slice(0, 3).map((o) => {
    const trade = o.mainTradeoff || o.tradeoffs?.[0] || "something else waits";
    return `${o.title}: choosing this means accepting that ${trade}.`;
  });

  const reversibilityLines = options.slice(0, 3).map((o) => {
    if (
      o.patternId === "test" ||
      o.patternId === "delay" ||
      o.patternId === "pause" ||
      o.patternId === "simplify"
    ) {
      return `${o.title}: relatively easier to reverse or pause.`;
    }
    if (
      o.patternId === "stop" ||
      o.patternId === "increase_price" ||
      o.patternId === "raise_price"
    ) {
      return `${o.title}: harder to undo — deserves extra care.`;
    }
    return `${o.title}: reversibility depends on how far you commit.`;
  });

  const cards: OptionComparisonCard[] = options.slice(0, 3).map((o) => ({
    name: o.title,
    whyFits: o.whyItMayFit || "",
    primaryBenefit: o.primaryBenefit || o.benefits?.[0] || "",
    primaryTradeoff: o.mainTradeoff || o.tradeoffs?.[0] || "",
    capacityDemand: "Some attention and follow-through",
    reversibility: "see option detail",
    mainRisk: typeof o.risks === "string" ? o.risks : "",
    smallestTest: o.smallestUsefulTest || o.smallTest || "",
    whatWouldRuleItOut: o.whatWouldNeedToBeTrue?.[0] || "If the key assumption fails.",
  }));

  if (mode === "one_criterion" && dims[0]) {
    return {
      dimensions: [dims[0]],
      style,
      mode,
      lines: options.slice(0, 3).map((o) => {
        const trade = o.mainTradeoff || o.tradeoffs?.[0] || "unclear trade-off";
        return `${o.title} — on ${dims[0]}: ${trade}`;
      }),
      distinctnessNote: distinctnessNoteFor(options),
      preferExperimentOverCommitment,
      opportunityCostLines,
      reversibilityLines,
      cards: mode === "one_at_a_time" ? cards.slice(0, 1) : cards,
      leadingId: options[0]?.id,
    };
  }

  if (mode === "one_at_a_time") {
    return {
      dimensions: dims,
      style,
      mode,
      lines: compareOptionsPlain(options.slice(0, 1)),
      distinctnessNote: distinctnessNoteFor(options),
      preferExperimentOverCommitment,
      opportunityCostLines: opportunityCostLines.slice(0, 1),
      reversibilityLines: reversibilityLines.slice(0, 1),
      cards: cards.slice(0, 1),
      leadingId: options[0]?.id,
    };
  }

  if (mode === "summary_first" || mode === "leading_plus_alternatives") {
    const lines =
      options.length > 0
        ? [
            `Leading path: ${options[0]!.title} — ${options[0]!.primaryBenefit || options[0]!.benefits?.[0] || "fits current context"}.`,
            ...options.slice(1, 3).map(
              (o) =>
                `Alternative: ${o.title} — trade-off: ${o.mainTradeoff || o.tradeoffs?.[0] || "different cost"}.`,
            ),
          ]
        : [];
    return {
      dimensions: dims,
      style,
      mode,
      lines,
      distinctnessNote: distinctnessNoteFor(options),
      preferExperimentOverCommitment,
      opportunityCostLines,
      reversibilityLines,
      cards,
      leadingId: options[0]?.id,
    };
  }

  return {
    dimensions: dims,
    style,
    mode: "side_by_side",
    lines: compareOptionsPlain(options),
    distinctnessNote: distinctnessNoteFor(options),
    preferExperimentOverCommitment,
    opportunityCostLines,
    reversibilityLines,
    cards,
    leadingId: options[0]?.id,
  };
}

export function compareFullStrategicOptions(
  options: StrategicOption[],
  presentation?: AdaptivePresentationResolved,
): OptionComparisonResult {
  const enriched = options.map((o) => ({
    id: o.id,
    title: memberFacingOptionName(o),
    whyItMayFit: o.rationale,
    benefits: o.benefits,
    tradeoffs: o.tradeoffs,
    smallTest: o.smallestUsefulTest,
    patternId: o.optionPattern,
    primaryBenefit: o.primaryBenefit,
    mainTradeoff: o.mainTradeoff,
    protects: o.protects,
    risks: o.risks,
    smallestUsefulTest: o.smallestUsefulTest,
    whatWouldNeedToBeTrue: o.assumptions,
  }));
  const base = compareStrategicOptions(enriched, presentation);
  return {
    ...base,
    cards: options.slice(0, 3).map(toCard),
    opportunityCostLines: options.slice(0, 3).map((o) => {
      const cost =
        opportunityCostsForOption(o)[0] ||
        o.tradeoffs[0] ||
        "another path waits";
      return `${memberFacingOptionName(o)}: opportunity cost — ${cost}`;
    }),
    reversibilityLines: options.slice(0, 3).map((o) => {
      return `${memberFacingOptionName(o)}: ${o.reversibility.replace(/_/g, " ")}.`;
    }),
    preferExperimentOverCommitment:
      base.preferExperimentOverCommitment ||
      options.some(
        (o) =>
          o.optionPattern === "test" ||
          (o.reversibility === "easily_reversible" && o.confidence !== "high"),
      ),
  };
}

export function compareOptionsForWorkItem(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): OptionComparisonResult {
  const full = generateFullStrategicOptions(item, presentation);
  return compareFullStrategicOptions(full, presentation);
}
