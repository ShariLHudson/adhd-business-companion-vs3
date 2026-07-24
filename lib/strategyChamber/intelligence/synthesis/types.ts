/**
 * Phase 5 — Cross-Domain Strategy Synthesis contracts.
 * Multiple domains may contribute; Shari still delivers one coherent experience.
 * Not a second judgment engine.
 */

import type { StrategyTypeId } from "../types";
import type { RiskAssessment, StrategicExperiment } from "../types";
import type { StrategicOption } from "../optionContract";
import type { StrategicRecommendation } from "../engine/recommendOption";
import type { NextThinkingMovePlan } from "../engine/selectNextThinkingMove";
import type { OptionPatternId } from "../types";

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

export type StrategyDomainSelection = {
  primaryDomainId: StrategyTypeId;
  secondaryDomainId?: StrategyTypeId;
  primaryReason: string;
  secondaryReason?: string;
  confidence: SynthesisConfidence;
  alternativesConsidered?: StrategyTypeId[];
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

export type StrategySynthesisConflict = {
  id: string;
  topic: string;
  primaryStance: string;
  secondaryStance: string;
  resolution: string;
  /** Prefer clarify before recommending when conflict is material. */
  preferClarify: boolean;
};

export type StrategySynthesisResult = {
  selection: StrategyDomainSelection;
  /** Integrated strategic question — not “Pricing asks…” / “Growth asks…”. */
  strategicQuestion?: string;
  nextThinkingMove?: NextThinkingMovePlan;
  relevantEvidencePrompts: string[];
  assumptionsToSurface: string[];
  constraintsToRespect: string[];
  /** Pattern candidates for the shared option generator (≤ pool; engine still caps at 3). */
  optionPatternCandidates?: OptionPatternId[];
  options?: StrategicOption[];
  tradeoffs?: string[];
  risks?: RiskAssessment[];
  experiment?: StrategicExperiment;
  recommendation?: StrategicRecommendation;
  recommendedDestination?: string;
  conflictNotes?: StrategySynthesisConflict[];
  contributions: StrategyDomainContribution[];
  confidence: SynthesisConfidence;
  /** Quiet note for Decision Record / internal — not a member report. */
  synthesisSummary?: string;
};
