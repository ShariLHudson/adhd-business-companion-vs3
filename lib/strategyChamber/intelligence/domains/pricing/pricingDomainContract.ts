/**
 * Phase 4A — Pricing Strategy domain contract.
 * Plugs into the shared Strategy Chamber engine; not a separate pricing engine.
 */

import type { ContinueJourneyDestinationId } from "../../../types";
import type { OptionPatternId, StrategyTypeContract } from "../../types";

export type PricingProblemDistinctionId =
  | "unclear_value"
  | "weak_positioning"
  | "poor_customer_fit"
  | "low_awareness"
  | "conversion_problem"
  | "retention_problem"
  | "delivery_problem"
  | "capacity_problem"
  | "cash_flow_pressure"
  | "offer_complexity"
  | "discount_dependence"
  | "genuine_pricing_decision";

export type PricingDomainContract = {
  id: "pricing";
  name: string;
  description: string;
  useWhen: string[];
  avoidWhen: string[];
  entrySignals: RegExp[];
  possibleUnderlyingQuestions: string[];
  importantContext: string[];
  commonFacts: string[];
  commonObservations: string[];
  commonInterpretations: string[];
  commonAssumptions: string[];
  commonUnknowns: string[];
  commonConcerns: string[];
  commonOpportunities: string[];
  commonConstraints: string[];
  evidencePrompts: string[];
  valueChecks: string[];
  customerImpactChecks: string[];
  capacityChecks: string[];
  optionPatterns: OptionPatternId[];
  tradeoffDimensions: string[];
  riskPatterns: string[];
  reversibilityGuidance: string[];
  experimentPatterns: string[];
  successSignals: string[];
  stopSignals: string[];
  reviewTriggers: string[];
  recommendedPerspectives: string[];
  recommendedDestinations: ContinueJourneyDestinationId[];
  qualityChecks: string[];
  /** Maps into shared StrategyTypeContract for the registry. */
  strategyTypeBridge: Omit<StrategyTypeContract, "id" | "family" | "version"> & {
    family: StrategyTypeContract["family"];
  };
  version: 1;
};
