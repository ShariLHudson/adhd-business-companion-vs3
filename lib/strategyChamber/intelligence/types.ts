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
  | "partnership"
  | "personal_direction"
  | "pivot_rethink"
  | "ninety_day";

/** Phase 4 — problem distinctions within a domain (e.g. growth: awareness vs retention). */
export type DomainProblemDistinction = {
  id: string;
  label: string;
  description: string;
  whenToSuspect: string[];
  preferredPatterns?: OptionPatternId[];
};

/** Phase 4 — domain decision heuristics (advisor judgment, not member copy templates). */
export type DomainDecisionHeuristic = {
  id: string;
  rule: string;
  when: string;
};

/**
 * Internal option patterns — never expose these ids in member copy.
 * Legacy aliases (raise_price, raise_value, protect_base, different_market)
 * remain for existing StrategyTypeContract data; normalize before materializing.
 */
export type OptionPatternId =
  | "continue"
  | "maintain_current_direction"
  | "improve"
  | "narrow"
  | "simplify"
  | "reduce_scope"
  | "expand"
  | "reposition"
  | "increase_price"
  | "restructure_price"
  | "add_value"
  | "partner"
  | "delegate"
  | "automate"
  | "delay"
  | "pause"
  | "stop"
  | "stabilize"
  | "test"
  | "staged_transition"
  | "protect_current_base"
  | "serve_different_audience"
  /** @deprecated Prefer increase_price */
  | "raise_price"
  /** @deprecated Prefer add_value */
  | "raise_value"
  /** @deprecated Prefer protect_current_base */
  | "protect_base"
  /** @deprecated Prefer serve_different_audience */
  | "different_market";

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
  /**
   * Phase 4 Domain Intelligence — how this domain thinks.
   * Same judgment engine; different knowledge contribution.
   *
   * Contribution checklist (binding):
   * - entrySignals
   * - hiddenUnderlyingQuestions
   * - evidencePrompts (evidence needed)
   * - commonAssumptions (common false assumptions)
   * - optionPatterns
   * - commonTradeoffs (material trade-offs)
   * - commonRisks (risk patterns)
   * - capacityChecks
   * - experimentPatterns
   * - recommendationRules (+ decisionHeuristics)
   * - handoffBoundaries (+ handoffDestinations)
   */
  decisionHeuristics: DomainDecisionHeuristic[];
  /** Questions under the stated ask — what Spark listens for beneath the surface. */
  hiddenUnderlyingQuestions: string[];
  /** Domain rules that shape recommendations (never auto-decisions). */
  recommendationRules: string[];
  /** When not to leave Strategy / what must stay true before handoff. */
  handoffBoundaries: string[];
  commonMistakes: string[];
  warningSigns: string[];
  problemDistinctions: DomainProblemDistinction[];
  guidingPrinciples: string[];
  version: 2;
};

/**
 * Epistemic stance of a statement — separate from StrategicInputClassification
 * (strategic role). Does not expand or rename the primary role union.
 */
export type StrategicStatementStance =
  | "fact"
  | "observation"
  | "interpretation"
  | "assumption"
  | "feeling"
  | "unknown";

/** Classified member input — strategic role + epistemic stance. */
export type ClassifiedStrategicInput = {
  originalText: string;
  classifications: StrategicInputClassification[];
  evidenceStrength: EvidenceStrength;
  /** Epistemic standing — never conflated with strategic role. */
  stance: StrategicStatementStance;
  /** Never treat assumption/feeling/interpretation/observation as fact. */
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

/**
 * Conversation-facing risk summary (Phase 1/2).
 * Fuller Phase 3 contract: `StrategicRisk` in optionContract.ts.
 */
export type RiskAssessment = {
  whatCouldHappen: string;
  whyItMatters: string;
  likelihood: "low" | "medium" | "high" | "unknown";
  mitigation?: string;
  earlyWarning?: string;
  reversibility: Reversibility;
};

/**
 * Bounded strategic experiment — never silently creates a Project.
 * `smallAction` remains the primary action field for existing callers.
 */
export type StrategicExperiment = {
  id?: string;
  name?: string;
  assumptionBeingTested: string;
  questionToAnswer?: string;
  /** Primary action (canonical for existing callers). */
  smallAction: string;
  /** Spec alias for smallAction when present. */
  action?: string;
  scope?: string;
  duration: string;
  audience?: string;
  capacityLimit?: string;
  /** Plain-language summary for older callers. */
  evidenceToCollect: string;
  /** Structured evidence list when available. */
  evidenceItems?: string[];
  successSignal: string;
  successSignals?: string[];
  stopSignal: string;
  stopSignals?: string[];
  reviewPoint?: string;
  decisionThatFollows: string;
  recommendedDestination?: string;
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
  /** Phase 3 — full option contract (trade-offs, risk, reversibility, experiments). */
  fullOptions?: import("./optionContract").StrategicOption[];
  /** Phase 3 — comparison lines when options are offered or trade-offs are due. */
  optionComparison?: import("./engine/compareOptions").OptionComparisonResult | null;
  /** Phase 3 — recommendation only; never a confirmed decision. */
  recommendation?: import("./engine/recommendOption").StrategicRecommendation | null;
  /** Phase 3 — how deep analysis should go given reversibility. */
  reversibilityDepth?: import("./frameworks/reversibilityDepth").ReversibilityDepth;
  /** Phase 4 — active domain intelligence pack loaded for this turn. */
  activeDomain?: StrategyTypeContract | null;
  /** Phase 4 — matched problem distinction within the domain, when suspected. */
  matchedProblemDistinction?: DomainProblemDistinction | null;
};
