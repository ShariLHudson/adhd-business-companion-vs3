/**
 * Phase 3 — Strategic option & risk contracts.
 * Extends persisted StrategyOption; does not replace domainModel unions.
 */

import type { Reversibility } from "../domainModel";
import type { StrategyOption } from "../types";
import {
  normalizeOptionPattern,
  optionPatternMemberLabel,
} from "./patternLabels";
import type {
  EnrichedStrategyOption,
  OptionPatternId,
  StrategicExperiment,
} from "./types";

/** Alias — same union as OptionPatternId (internal only). */
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

/** Proportionate risk — adapt of the Phase 3 risk contract. */
export type StrategicRisk = {
  id: string;
  description: string;
  likelihood: "low" | "moderate" | "high" | "unknown";
  impact: "low" | "moderate" | "high";
  detectability: "early" | "delayed" | "unclear";
  controllability: "high" | "moderate" | "low";
  reversibility: Reversibility;
  warningSigns: string[];
  mitigations: string[];
  acceptable?: boolean;
  /** Why it matters — calm, not fear-heavy. */
  whyItMatters?: string;
};

export type OptionConfidence = "low" | "moderate" | "high";

/**
 * Full strategic option — meaningfully distinct paths, honest about trade-offs.
 * `title` / `name` are member-facing; never expose optionPattern ids in UI copy.
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
  makesHarder?: string[];
  capacityBurden?: string;
  experiment?: StrategicExperiment;
  confidence: OptionConfidence;
  userConfirmed?: boolean;
  /** Possible next destination id — recommend only; never auto-transfer. */
  possibleNextDestination?: string;
  whatWouldRuleItOut?: string;
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
    patternId: normalizeOptionPattern(option.optionPattern),
    primaryBenefit: option.primaryBenefit || option.benefits[0],
    mainTradeoff: option.mainTradeoff || option.tradeoffs[0],
    protects: option.protects || option.protectsList?.[0],
    risks: option.risks || option.risksDetailed[0]?.description,
    smallestUsefulTest:
      option.smallestUsefulTest ||
      option.experiment?.smallAction ||
      option.experiment?.action,
  };
}

export function strategicOptionsAreDistinct(
  options: readonly StrategicOption[],
): boolean {
  if (options.length < 2) return true;
  const patterns = new Set(
    options.map((o) => normalizeOptionPattern(o.optionPattern)),
  );
  return patterns.size >= Math.min(2, options.length);
}

/** Safe member title — never a raw pattern id. */
export function memberFacingOptionName(
  option: Pick<StrategicOption, "name" | "title" | "optionPattern">,
): string {
  const name = (option.name || option.title || "").trim();
  if (name && !/^[a-z_]+$/.test(name)) return name;
  return optionPatternMemberLabel(option.optionPattern);
}
