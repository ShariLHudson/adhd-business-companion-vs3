/**
 * Phase 4C — Growth Strategy domain contract.
 * Plugs into the shared Strategy Chamber engine; not a separate growth engine.
 * Maps onto StrategyTypeContract via strategyTypeBridge.
 */

import type { ContinueJourneyDestinationId } from "../../../types";
import type { OptionPatternId, StrategyTypeContract, StrategyTypeId } from "../../types";
import type { Reversibility } from "../../../domainModel";

/** Internal growth forms — inferred, never forced as a member menu. */
export type GrowthTypeId =
  | "customer_growth"
  | "revenue_growth"
  | "profit_growth"
  | "retention_growth"
  | "repeat_purchase_growth"
  | "referral_growth"
  | "audience_growth"
  | "market_share_growth"
  | "offer_expansion"
  | "geographic_expansion"
  | "channel_expansion"
  | "capacity_growth"
  | "team_growth"
  | "partnership_led_growth"
  | "recurring_revenue_growth"
  | "customer_value_growth"
  | "operational_maturity"
  | "strategic_simplification";

export type GrowthConstraintId =
  | "demand_constraint"
  | "audience_constraint"
  | "positioning_constraint"
  | "offer_constraint"
  | "trust_constraint"
  | "sales_constraint"
  | "retention_constraint"
  | "pricing_constraint"
  | "delivery_constraint"
  | "founder_capacity_constraint"
  | "team_constraint"
  | "financial_constraint"
  | "channel_constraint"
  | "operational_constraint"
  | "focus_constraint"
  | "evidence_constraint";

export type GrowthReadinessConclusion =
  | "ready_for_focused_growth"
  | "ready_for_limited_experiment"
  | "ready_to_improve_retention_first"
  | "ready_to_strengthen_positioning_first"
  | "ready_to_stabilize_delivery_first"
  | "ready_to_simplify_before_growing"
  | "needs_more_evidence"
  | "current_scale_appropriate"
  | "growth_not_immediate_priority";

export type GrowthDiagnosisArea =
  | "awareness"
  | "audience_fit"
  | "positioning"
  | "offer_relevance"
  | "pricing"
  | "trust"
  | "lead_quality"
  | "lead_volume"
  | "conversion"
  | "retention"
  | "repeat_purchase"
  | "referrals"
  | "customer_outcomes"
  | "delivery_capacity"
  | "operational_capacity"
  | "founder_capacity"
  | "team_capacity"
  | "financial_capacity"
  | "channel_effectiveness"
  | "market_timing"
  | "competitive_pressure"
  | "seasonality"
  | "business_model_fit";

export type GrowthExperimentBlueprint = {
  id: string;
  name: string;
  assumption: string;
  strategicQuestion: string;
  action: string;
  scope: string;
  durationOrReview: string;
  evidence: string[];
  successSignal: string;
  stopSignal: string;
  capacityLimit: string;
  nextDecision: string;
  typicalReversibility: Reversibility;
};

export type GrowthRoutingBoundary = {
  owner:
    | "growth_strategy"
    | "marketing"
    | "finance"
    | "offer"
    | "customer_and_market"
    | "capacity_and_focus"
    | "hiring_and_delegation"
    | "projects"
    | "execution_manager"
    | "board"
    | "talk_it_out"
    | "create";
  destinationId?: ContinueJourneyDestinationId;
  owns: string;
  when: string;
};

export type GrowthDomainContract = {
  id: "growth";
  name: string;
  description: string;
  useWhen: string[];
  avoidWhen: string[];
  entrySignals: RegExp[];
  possibleUnderlyingQuestions: string[];
  requiredContext: string[];
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
  heuristics: string[];
  warningSigns: string[];
  readinessAreas: string[];
  readinessConclusions: GrowthReadinessConclusion[];
  diagnosisAreas: GrowthDiagnosisArea[];
  growthTypesSupported: GrowthTypeId[];
  constraintCategories: GrowthConstraintId[];
  capacityChecks: string[];
  optionPatterns: OptionPatternId[];
  strategicOptionPatterns: string[];
  growthPathCategories: string[];
  tradeoffDimensions: string[];
  opportunityCostPrompts: string[];
  riskPatterns: string[];
  reversibilityGuidance: string[];
  experimentPatterns: string[];
  experimentBlueprints: GrowthExperimentBlueprint[];
  successSignals: string[];
  stopSignals: string[];
  reviewTriggers: string[];
  recommendedPerspectives: string[];
  recommendedDestinations: ContinueJourneyDestinationId[];
  /** Secondary domains that may load with Growth when material. */
  possibleSecondaryDomains: StrategyTypeId[];
  routingBoundaries: GrowthRoutingBoundary[];
  adaptivePresentationNotes: string;
  qualityChecks: string[];
  maintenanceNotes: string[];
  strategyTypeBridge: Omit<StrategyTypeContract, "id" | "family" | "version"> & {
    family: StrategyTypeContract["family"];
  };
  version: 2;
};
