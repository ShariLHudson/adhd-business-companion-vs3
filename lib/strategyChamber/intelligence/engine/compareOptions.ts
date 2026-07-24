import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import {
  compareOptionsPlain,
  salientTradeoffDimensions,
} from "../frameworks/tradeoffs";
import type { StrategicOption } from "../optionContract";
import type { EnrichedStrategyOption } from "../types";
import { generateFullStrategicOptions } from "./generateOptions";
import type { StrategyWorkItem } from "../../types";

export type OptionComparisonResult = {
  dimensions: string[];
  lines: string[];
  style: string;
  /** One honest line about what differs most across the set. */
  distinctnessNote: string;
  /** Whether a small experiment looks wiser than full commitment for any option. */
  preferExperimentOverCommitment: boolean;
  opportunityCostLines: string[];
  reversibilityLines: string[];
};

function distinctnessNoteFor(options: EnrichedStrategyOption[]): string {
  const patterns = options.map((o) => o.patternId).filter(Boolean);
  if (patterns.length >= 2 && new Set(patterns).size >= 2) {
    return "These paths differ in direction — not just wording.";
  }
  return "Compare what each path protects and what it risks before choosing.";
}

/**
 * Compare trade-offs across enriched options (Adaptive presentation only).
 */
export function compareStrategicOptions(
  options: EnrichedStrategyOption[],
  presentation?: AdaptivePresentationResolved,
): OptionComparisonResult {
  const dims = salientTradeoffDimensions(options);
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
    if (o.patternId === "test" || o.patternId === "delay" || o.patternId === "simplify") {
      return `${o.title}: relatively easier to reverse or pause.`;
    }
    if (o.patternId === "stop" || o.patternId === "raise_price") {
      return `${o.title}: harder to undo — deserves extra care.`;
    }
    return `${o.title}: reversibility depends on how far you commit.`;
  });

  if (style === "one_criterion" && dims[0]) {
    return {
      dimensions: [dims[0]],
      style,
      lines: options.slice(0, 3).map((o) => {
        const trade = o.mainTradeoff || o.tradeoffs?.[0] || "unclear trade-off";
        return `${o.title} — on ${dims[0]}: ${trade}`;
      }),
      distinctnessNote: distinctnessNoteFor(options),
      preferExperimentOverCommitment,
      opportunityCostLines,
      reversibilityLines,
    };
  }

  return {
    dimensions: dims,
    style,
    lines: compareOptionsPlain(options),
    distinctnessNote: distinctnessNoteFor(options),
    preferExperimentOverCommitment,
    opportunityCostLines,
    reversibilityLines,
  };
}

/** Compare using the full StrategicOption contract when available. */
export function compareFullStrategicOptions(
  options: StrategicOption[],
  presentation?: AdaptivePresentationResolved,
): OptionComparisonResult {
  const enriched = options.map((o) => ({
    id: o.id,
    title: o.title,
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
  }));
  const base = compareStrategicOptions(enriched, presentation);
  return {
    ...base,
    opportunityCostLines: options.slice(0, 3).map((o) => {
      const cost = o.opportunityCosts[0] || o.tradeoffs[0] || "another path waits";
      return `${o.name}: opportunity cost — ${cost}`;
    }),
    reversibilityLines: options.slice(0, 3).map((o) => {
      return `${o.name}: ${o.reversibility.replace(/_/g, " ")}.`;
    }),
    preferExperimentOverCommitment:
      base.preferExperimentOverCommitment ||
      options.some(
        (o) =>
          o.optionPattern === "test" ||
          o.reversibility === "easily_reversible" &&
            o.confidence !== "high",
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
