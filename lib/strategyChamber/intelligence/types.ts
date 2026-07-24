/**
 * Strategy Chamber judgment intelligence — analysis shapes only.
 * Does not own storage. Distinct from catalog `lib/strategyIntelligence.ts`.
 *
 * Domain vocabulary lives in `../domainModel` — shared by every strategy type.
 */

import type {
  ContinueJourneyDestinationId,
  StrategyFamilyId,
  StrategyOption,
  StrategyWorkItem,
} from "../types";
import type {
  DecisionReadiness,
  EvidenceStrength,
  Reversibility,
  StrategicInputClassification,
  StrategicJudgmentStage,
} from "../domainModel";

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

export type DecisionConfidence =
  | "low"
  | "emerging"
  | "moderate"
  | "strong"
  | "confirmed";

export type QuestionPriority =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14;

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

/** Classified member input — strategic role only. Epistemic nature is separate. */
export type ClassifiedStrategicInput = {
  originalText: string;
  classifications: StrategicInputClassification[];
  evidenceStrength: EvidenceStrength;
  /** Never treat assumption as fact in user-facing copy. */
  safeToTreatAsFact: boolean;
};

/** Domain: StrategicQuestion — the decision being judged. */
export type StrategicQuestion = {
  stated: string;
  refined: string;
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
  judgmentStage: StrategicJudgmentStage;
  missing: string[];
  strategicQuestionClear: boolean;
  outcomeClearEnough: boolean;
  constraintsKnown: boolean;
  hasRealisticOption: boolean;
  tradeoffsVisible: boolean;
  assumptionsVisible: boolean;
  risksReviewed: boolean;
  userReadyHint: boolean;
};

/** Domain: StrategicDecision — direction chosen with judgment context. */
export type StrategicDecision = {
  direction: string;
  rationale: string;
  notChosen: string[];
  assumptionsToTest: string[];
  risksToWatch: string[];
  confidence: DecisionConfidence;
  readiness: DecisionReadiness;
  reversibility: Reversibility;
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
  reversibility: Reversibility;
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

/** Domain: HandoffContext — next place after a strategic decision. */
export type HandoffContext = {
  recommendation: HandoffRecommendation | null;
  fromStage: StrategicJudgmentStage;
  readiness: DecisionReadiness;
};

export type StrategyJudgmentTurn = {
  strategicQuestion: StrategicQuestion;
  judgmentStage: StrategicJudgmentStage;
  nextQuestion: NextQuestionPlan;
  readiness: DecisionReadinessAssessment;
  options: EnrichedStrategyOption[];
  showOptions: boolean;
  risks: RiskAssessment[];
  experiment: StrategicExperiment | null;
  handoff: HandoffContext;
  decision: StrategicDecision | null;
  workItemPatch: Partial<StrategyWorkItem>;
  /** Phase 2 — internal next thinking move (not member-facing). */
  nextMove?: import("./engine/selectNextThinkingMove").NextThinkingMovePlan;
  /** Phase 2 — internal option readiness (not member-facing). */
  optionReadiness?: import("./engine/assessOptionReadiness").OptionReadinessAssessment;
  /** Phase 2 — last answer epistemic analysis when provided. */
  lastStatementAnalysis?: import("./statementAnalysis").StrategicStatementAnalysis | null;
};
