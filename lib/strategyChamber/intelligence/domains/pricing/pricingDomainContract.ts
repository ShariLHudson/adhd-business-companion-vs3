/**
 * Phase 4B — Pricing Strategy domain contract.
 * Plugs into the shared Strategy Chamber engine; not a separate pricing engine.
 * Maps onto StrategyTypeContract via strategyTypeBridge.
 */

import type { ContinueJourneyDestinationId } from "../../../types";
import type { OptionPatternId, StrategyTypeContract } from "../../types";
import type { Reversibility } from "../../../domainModel";

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

/** Offer shapes Pricing Strategy can reason about (not UI types). */
export type PricingOfferShape =
  | "membership"
  | "subscription"
  | "retainer"
  | "service"
  | "consulting"
  | "coaching"
  | "program"
  | "package"
  | "digital_offer"
  | "workshop"
  | "event"
  | "productized_service"
  | "new_offer"
  | "existing_offer"
  | "hourly"
  | "project";

export type PricingExperimentBlueprint = {
  id: string;
  name: string;
  assumption: string;
  action: string;
  scope: string;
  durationOrReview: string;
  evidence: string[];
  successSignal: string;
  stopSignal: string;
  nextDecision: string;
  typicalReversibility: Reversibility;
};

export type PricingRoutingBoundary = {
  owner:
    | "pricing_strategy"
    | "finance"
    | "marketing"
    | "create"
    | "projects"
    | "calendar"
    | "board"
    | "talk_it_out";
  destinationId?: ContinueJourneyDestinationId;
  owns: string;
  when: string;
};

export type PricingDomainContract = {
  id: "pricing";
  name: string;
  description: string;
  useWhen: string[];
  avoidWhen: string[];
  entrySignals: RegExp[];
  possibleUnderlyingQuestions: string[];
  /** Context that usually changes the decision. */
  requiredContext: string[];
  /** Context that may help when available — never a long intake. */
  optionalContext: string[];
  /** @deprecated Prefer requiredContext + optionalContext */
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
  /** Practical heuristics — guide reasoning, not a generic checklist. */
  heuristics: string[];
  warningSigns: string[];
  valueChecks: string[];
  customerImpactChecks: string[];
  capacityChecks: string[];
  optionPatterns: OptionPatternId[];
  /** Human-readable strategic option patterns (beyond OptionPatternId). */
  strategicOptionPatterns: string[];
  tradeoffDimensions: string[];
  riskPatterns: string[];
  reversibilityGuidance: string[];
  experimentPatterns: string[];
  experimentBlueprints: PricingExperimentBlueprint[];
  successSignals: string[];
  stopSignals: string[];
  reviewTriggers: string[];
  recommendedPerspectives: string[];
  recommendedDestinations: ContinueJourneyDestinationId[];
  routingBoundaries: PricingRoutingBoundary[];
  adaptivePresentationNotes: string;
  qualityChecks: string[];
  maintenanceNotes: string[];
  offerShapesSupported: PricingOfferShape[];
  /** Maps into shared StrategyTypeContract for the registry. */
  strategyTypeBridge: Omit<StrategyTypeContract, "id" | "family" | "version"> & {
    family: StrategyTypeContract["family"];
  };
  version: 2;
};
