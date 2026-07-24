/**
 * Phase 3 — Strategic option contract.
 *
 * Extends persisted StrategyOption without renaming domainModel unions
 * or replacing EnrichedStrategyOption consumers.
 */

import type { Reversibility } from "../domainModel";
import type { StrategyOption } from "../types";
import type {
  EnrichedStrategyOption,
  OptionPatternId,
  StrategicExperiment,
} from "./types";

/** Alias kept for the Phase 3 contract name — same union as OptionPatternId. */
export type StrategicOptionPattern = OptionPatternId;

export type CapacityRequirementKind =
  | "time"
  | "energy"
  | "money"
  | "attention"
  | "skill"
  | "support";

export type CapacityRequirement = {
  kind: CapacityRequirementKind;
  note: string;
};

export type StrategicRisk = {
  description: string;
  severity: "low" | "medium" | "high" | "unknown";
  reversibility: Reversibility;
  mitigation?: string;
};

export type OptionConfidence = "low" | "moderate" | "high";

/**
 * Full strategic option — meaningfully distinct paths, honest about trade-offs.
 * `title` remains the persisted/UI name; `name` mirrors it for the contract.
 */
export type StrategicOption = StrategyOption & {
  name: string;
  summary: string;
  rationale: string;
  optionPattern: StrategicOptionPattern;
  benefits: string[];
  tradeoffs: string[];
  risksDetailed: StrategicRisk[];
  assumptions: string[];
  evidenceNeeded?: string[];
  capacityRequirements: CapacityRequirement[];
  opportunityCosts: string[];
  reversibility: Reversibility;
  secondOrderEffects?: string[];
  protectsList?: string[];
  delaysOrPrevents?: string[];
  /** Structured experiment when a small test is wiser than full commitment. */
  experiment?: StrategicExperiment;
  confidence: OptionConfidence;
  userConfirmed?: boolean;
  /** Compatibility with EnrichedStrategyOption */
  patternId: OptionPatternId;
  primaryBenefit?: string;
  mainTradeoff?: string;
  protects?: string;
  risks?: string;
  smallestUsefulTest?: string;
};

export function toEnrichedStrategyOption(
  option: StrategicOption,
): EnrichedStrategyOption {
  return {
    id: option.id,
    title: option.title,
    whyItMayFit: option.whyItMayFit || option.rationale,
    benefits: option.benefits,
    tradeoffs: option.tradeoffs,
    whatWouldNeedToBeTrue: option.whatWouldNeedToBeTrue || option.assumptions,
    smallTest: option.smallTest || option.smallestUsefulTest,
    patternId: option.optionPattern,
    primaryBenefit: option.primaryBenefit || option.benefits[0],
    mainTradeoff: option.mainTradeoff || option.tradeoffs[0],
    protects: option.protects || option.protectsList?.[0],
    risks: option.risks || option.risksDetailed[0]?.description,
    smallestUsefulTest:
      option.smallestUsefulTest || option.experiment?.smallAction,
  };
}

export function strategicOptionsAreDistinct(
  options: readonly StrategicOption[],
): boolean {
  if (options.length < 2) return true;
  const patterns = new Set(options.map((o) => o.optionPattern));
  return patterns.size >= Math.min(2, options.length);
}
