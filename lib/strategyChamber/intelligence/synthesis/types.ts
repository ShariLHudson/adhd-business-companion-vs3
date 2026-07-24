/**
 * Phase 5 — Cross-Domain Strategy Synthesis contracts.
 * Advises the shared Strategy engine — does not duplicate live option/risk/experiment/recommendation types.
 */

import type { StrategyTypeId } from "../types";
import type { OptionPatternId } from "../types";
import type { ContinueJourneyDestinationId } from "../../types";

/** Reuse shared move confidence bands. */
export type SynthesisConfidence = "low" | "moderate" | "high";

export type StrategyDomainContributionType =
  | "question"
  | "evidence"
  | "assumption"
  | "constraint"
  | "capacity"
  | "option"
  | "tradeoff"
  | "risk"
  | "experiment"
  | "review_trigger"
  | "handoff";

export type StrategyDomainCandidate = {
  domainId: StrategyTypeId;
  relevance: "low" | "moderate" | "high";
  reason: string;
  matchedSignals: string[];
  contributionTypes: StrategyDomainContributionType[];
};

export type SecondaryThresholdReason =
  | "could_reverse_recommendation"
  | "could_eliminate_options"
  | "reveals_major_constraint"
  | "changes_reversibility_or_risk"
  | "missing_essential_evidence"
  | "better_experiment"
  | "changes_destination";

export type StrategyDomainSelection = {
  primaryDomainId: StrategyTypeId;
  secondaryDomainId?: StrategyTypeId;
  primaryReason: string;
  secondaryReason?: string;
  /** Why secondary cleared the materiality threshold. */
  secondaryThresholdReasons?: SecondaryThresholdReason[];
  confidence: SynthesisConfidence;
  alternativesConsidered?: StrategyTypeId[];
  /** True when the ask is too broad to load domains aggressively. */
  needsClarification?: boolean;
  /** Pair status when secondary requested but pack incomplete. */
  secondaryStatus?: "active" | "partial" | "unavailable";
};

export type StrategyDomainContribution = {
  domainId: StrategyTypeId;
  contributionType: StrategyDomainContributionType;
  id: string;
  content: string;
  priority: number;
  useWhen?: string[];
  conflictsWith?: string[];
  evidenceRequirement?: string;
  /** Internal by default — never dump domain labels into member copy. */
  userFacing?: boolean;
};

export type StrategySynthesisConflictResolutionMethod =
  | "shared_constraint"
  | "evidence_priority"
  | "capacity_priority"
  | "reversibility_priority"
  | "user_value_priority"
  | "staged_option"
  | "experiment"
  | "ask_user";

/**
 * Internal conflict record — never expose mechanics or domain jargon to members.
 */
export type StrategySynthesisConflict = {
  id: string;
  primaryDomainId: StrategyTypeId;
  secondaryDomainId: StrategyTypeId;
  issue: string;
  primaryPosition: string;
  secondaryPosition: string;
  materiality: "low" | "moderate" | "high";
  resolutionMethod: StrategySynthesisConflictResolutionMethod;
  resolution?: string;
  /** Derived: ask before forceful recommendation. */
  preferClarify: boolean;
};

export type StrategyDomainPairRule = {
  primaryDomainId: StrategyTypeId;
  secondaryDomainId: StrategyTypeId;
  status: "active" | "partial" | "unavailable";
  useWhen: string[];
  avoidWhen: string[];
  contributionPriorities: StrategyDomainContributionType[];
  commonConflicts?: string[];
  mergeGuidance?: string[];
  version: string;
};

/**
 * Synthesis advises the shared engine.
 * Live StrategicOption / RiskAssessment / StrategicExperiment / StrategicRecommendation
 * / NextThinkingMovePlan remain owned by the Phase 1–3 engine — not duplicated here.
 */
export type StrategySynthesisResult = {
  selection: StrategyDomainSelection;
  /** Integrated strategic question — not “Pricing asks…” / “Growth asks…”. */
  strategicQuestion?: string;
  /** Contribution to the next-thinking-move selector (one gap). */
  suggestedNextQuestion?: string;
  relevantEvidencePrompts: string[];
  assumptionsToSurface: string[];
  constraintsToRespect: string[];
  /** Pattern candidates only — generator remains authoritative (≤3). */
  optionPatternCandidates?: OptionPatternId[];
  tradeoffs?: string[];
  /** Calm integrated risk lines (not full RiskAssessment duplicates). */
  integratedRiskSummaries?: string[];
  /** Hint for designStrategicExperiment — engine still builds StrategicExperiment. */
  experimentHint?: string;
  /** Warm member-facing recommendation copy — not a confirmed decision. */
  memberFacingRecommendation?: string;
  recommendedDestination?: ContinueJourneyDestinationId;
  conflictNotes?: StrategySynthesisConflict[];
  contributions: StrategyDomainContribution[];
  confidence: SynthesisConfidence;
  /** Quiet internal note for Decision Record enrichment. */
  synthesisSummary?: string;
};

export const PRIMARY_CONTRIBUTION_BUDGET = 5;
export const SECONDARY_CONTRIBUTION_BUDGET = 3;
