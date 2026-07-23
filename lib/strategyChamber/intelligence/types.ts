/**
 * Strategy Chamber judgment intelligence — analysis shapes only.
 * Does not own storage. Distinct from catalog `lib/strategyIntelligence.ts`.
 */

import type {
  ContinueJourneyDestinationId,
  StrategyFamilyId,
  StrategyOption,
  StrategyWorkItem,
} from "../types";

export type StrategicQuestionType =
  | "direction_decision"
  | "priority_decision"
  | "investment_decision"
  | "market_decision"
  | "offer_decision"
  | "pricing_decision"
  | "growth_decision"
  | "capacity_decision"
  | "hiring_decision"
  | "partnership_decision"
  | "timing_decision"
  | "continue_or_stop_decision"
  | "expansion_decision"
  | "simplification_decision"
  | "recovery_decision"
  | "pivot_decision"
  | "experiment_decision"
  | "resource_allocation_decision"
  | "personal_direction_decision"
  | "unknown";

export type EvidenceQuality =
  | "confirmed"
  | "strong_signal"
  | "limited_signal"
  | "anecdotal"
  | "assumed"
  | "unknown"
  | "conflicting";

export type StrategicInputKind =
  | "fact"
  | "observation"
  | "interpretation"
  | "assumption"
  | "feeling"
  | "unknown";

export type DecisionConfidence =
  | "low"
  | "emerging"
  | "moderate"
  | "strong"
  | "confirmed";

export type DecisionReadiness =
  | "ready_to_choose"
  | "ready_to_test"
  | "needs_more_evidence"
  | "needs_another_perspective"
  | "needs_reflection"
  | "needs_capacity_review"
  | "not_ready"
  | "current_direction_appropriate";

export type QuestionPriority =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

export type StrategyTypeId =
  | "business_direction"
  | "growth"
  | "pricing"
  | "offer"
  | "market_customer"
  | "capacity_focus"
  | "hiring_delegation"
  | "personal_direction"
  | "pivot_rethink"
  | "ninety_day";

export type OptionPatternId =
  | "continue"
  | "expand"
  | "narrow"
  | "simplify"
  | "delay"
  | "test"
  | "partner"
  | "stop"
  | "stabilize"
  | "reposition"
  | "raise_value"
  | "raise_price"
  | "different_market"
  | "protect_base"
  | "staged_transition";

export type StrategyTypeContract = {
  id: StrategyTypeId;
  name: string;
  family: StrategyFamilyId;
  plainLanguageDescription: string;
  useWhen: string[];
  doNotUseWhen: string[];
  entrySignals: RegExp[];
  clarifyingQuestions: string[];
  currentStateQuestions: string[];
  directionQuestions: string[];
  optionPatterns: OptionPatternId[];
  decisionCriteria: string[];
  commonTradeoffs: string[];
  commonRisks: string[];
  commonAssumptions: string[];
  evidencePrompts: string[];
  capacityChecks: string[];
  experimentPatterns: string[];
  successSignals: string[];
  reviewTriggers: string[];
  recommendedChamberMembers: string[];
  recommendedBoardRoles: string[];
  handoffDestinations: ContinueJourneyDestinationId[];
  adaptivePresentationNotes: string;
  qualityChecks: string[];
  version: 1;
};

export type ClassifiedStrategicInput = {
  originalText: string;
  kinds: StrategicInputKind[];
  evidenceQuality: EvidenceQuality;
  /** Never treat assumption as fact in user-facing copy. */
  safeToTreatAsFact: boolean;
};

export type StrategicQuestionAnalysis = {
  statedQuestion: string;
  refinedQuestion: string;
  questionType: StrategicQuestionType;
  strategyTypeId: StrategyTypeId | null;
  confidence: DecisionConfidence;
  alternateQuestions: string[];
  needsClarification: boolean;
};

export type NextQuestionPlan = {
  priority: QuestionPriority;
  question: string;
  reason: string;
  choices: Array<{ id: string; label: string; question: string }>;
  allowIDontKnow: true;
  reflectionInstead?: string;
};

export type DecisionReadinessAssessment = {
  readiness: DecisionReadiness;
  confidence: DecisionConfidence;
  missing: string[];
  strategicQuestionClear: boolean;
  outcomeClearEnough: boolean;
  constraintsKnown: boolean;
  hasRealisticOption: boolean;
  tradeoffsVisible: boolean;
  assumptionsVisible: boolean;
  userReadyHint: boolean;
};

export type EnrichedStrategyOption = StrategyOption & {
  patternId?: OptionPatternId;
  primaryBenefit?: string;
  mainTradeoff?: string;
  protects?: string;
  risks?: string;
  smallestUsefulTest?: string;
};

export type RiskAssessment = {
  whatCouldHappen: string;
  whyItMatters: string;
  likelihood: "low" | "medium" | "high" | "unknown";
  mitigation?: string;
  earlyWarning?: string;
  reversibility: "easily_reversible" | "reversible_with_effort" | "difficult" | "effectively_irreversible" | "unknown";
};

export type StrategicExperiment = {
  assumptionBeingTested: string;
  smallAction: string;
  duration: string;
  successSignal: string;
  stopSignal: string;
  evidenceToCollect: string;
  decisionThatFollows: string;
};

export type HandoffRecommendation = {
  destinationId: ContinueJourneyDestinationId;
  reason: string;
  title: string;
  benefit: string;
  actionLabel: string;
};

export type StrategyJudgmentTurn = {
  questionAnalysis: StrategicQuestionAnalysis;
  nextQuestion: NextQuestionPlan;
  readiness: DecisionReadinessAssessment;
  options: EnrichedStrategyOption[];
  showOptions: boolean;
  risks: RiskAssessment[];
  experiment: StrategicExperiment | null;
  handoff: HandoffRecommendation | null;
  workItemPatch: Partial<StrategyWorkItem>;
};
