/**
 * Spark Core Intelligence v1.0 — Reasoning Engine types.
 * @see spark-intelligence-foundation/16-spark-core-reasoning-engine.md
 */

import type { DisciplineId } from "@/lib/sparkResponseIntelligence/types";

export const SPARK_REASONING_ENGINE_VERSION = "1.0" as const;

export type ReasoningMode =
  | "quick_answer"
  | "coaching"
  | "planning"
  | "creative_reasoning"
  | "strategic_reasoning"
  | "decision_support"
  | "research_reasoning"
  | "executive_board_reasoning"
  | "reflective_reasoning"
  | "teaching_reasoning";

export type ProblemNature =
  | "fact_based"
  | "creative"
  | "emotional"
  | "strategic"
  | "operational";

export type ConfidenceLevel = "high" | "medium" | "low";

export type CertaintyKind = "fact" | "assumption" | "opinion" | "recommendation";

export type KnownFact = {
  statement: string;
  source: "member" | "memory" | "knowledge";
  weight: number;
};

export type Assumption = {
  field: string;
  value: string;
  confidence: ConfidenceLevel;
  shouldStateToMember: boolean;
};

export type MissingInfo = {
  field: string;
  severity: "blocking" | "helpful" | "optional";
};

export type DisciplinePosition = {
  disciplineId: DisciplineId;
  recommendation: string;
  confidence: ConfidenceLevel;
  certaintyKind: CertaintyKind;
};

export type Tradeoff = {
  dimension: string;
  optionA: string;
  optionB: string;
  note: string;
};

export type Risk = {
  description: string;
  severity: "low" | "medium" | "high";
};

export type RankedRecommendation = {
  rank: 1 | 2;
  text: string;
  rationale: string;
  certaintyKind: CertaintyKind;
};

export type AskVsAnswerDecision = "answer" | "ask" | "answer_with_stated_assumptions";

export type ReasoningInput = {
  turnId: string;
  memberMessage: string;
  knownFacts?: KnownFact[];
  objectiveSummary?: string;
};

export type ReasoningPlan = {
  turnId: string;
  mode: ReasoningMode;
  userAccomplishing: string;
  successLooksLike: string;
  known: KnownFact[];
  missing: MissingInfo[];
  problemNature: ProblemNature;
  researchRequired: boolean;
  researchReason?: string;
  disciplines: DisciplineId[];
  disciplinePositions: DisciplinePosition[];
  conflictResolved?: string;
  confidence: ConfidenceLevel;
  confidenceNote?: string;
  bestNextStep: string;
  askVsAnswer: AskVsAnswerDecision;
  clarificationQuestion?: string;
  assumptions: Assumption[];
  rankedRecommendations: RankedRecommendation[];
  tradeoffs: Tradeoff[];
  risks: Risk[];
  overthinkGuard: boolean;
  engineVersion: typeof SPARK_REASONING_ENGINE_VERSION;
};

export type ReasoningResult = {
  plan: ReasoningPlan;
  readyToCompose: boolean;
};
