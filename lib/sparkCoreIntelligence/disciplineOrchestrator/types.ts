/**
 * Spark Core Intelligence v1.0 — Executive Discipline Orchestrator types.
 * @see spark-intelligence-foundation/19-spark-core-executive-discipline-orchestrator.md
 */

import type { DisciplineId, EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

export const SPARK_CORE_DISCIPLINE_ORCHESTRATOR_VERSION = "1.0" as const;

/** v1.0 executive discipline roster — maps to DisciplineId in production routing. */
export type ExecutiveDisciplineId =
  | "marketing"
  | "sales"
  | "business-strategy"
  | "wordsmith"
  | "research"
  | "finance"
  | "operations"
  | "leadership"
  | "creative-direction"
  | "customer-experience"
  | "ai-automation"
  | "product-development"
  | "learning-coach";

export type OrchestrationScenario =
  | "marketing_campaign"
  | "pricing_decision"
  | "sales_call"
  | "overwhelm_support"
  | "launch"
  | "research"
  | "general_business"
  | "simple_question";

export type SupportMode = "conversation" | "focus_support";

export type ConfidenceWeight = "low" | "medium" | "high";

export type DisciplineConstraint = {
  maxSentences: number;
  mustAvoid: string[];
  tone: "analytical" | "creative" | "empathetic" | "direct";
};

export type DisciplineContribution = {
  disciplineId: ExecutiveDisciplineId;
  internalRecommendation: string;
  confidence: ConfidenceWeight;
  weight: number;
  durationMs: number;
  constraints: DisciplineConstraint;
};

export type DebateRound = {
  round: number;
  positions: Array<{
    disciplineId: ExecutiveDisciplineId;
    stance: string;
    confidence: ConfidenceWeight;
  }>;
  tension?: string;
};

export type ResolvedConflict = {
  disciplines: ExecutiveDisciplineId[];
  tension: string;
  resolution: string;
  tradeoffExplanation?: string;
};

export type ActivationLogEntry = {
  turnId: string;
  scenario: OrchestrationScenario;
  activated: ExecutiveDisciplineId[];
  skipped: ExecutiveDisciplineId[];
  supportModes: SupportMode[];
  reason: string;
  timestamp: string;
};

export type DisciplinePerformanceScore = {
  disciplineId: ExecutiveDisciplineId;
  relevanceScore: number;
  latencyMs: number;
  withinBudget: boolean;
  contributionWeight: number;
};

export type UnifiedRecommendation = {
  text: string;
  tradeoffNote?: string;
  certaintyKind: "fact" | "recommendation" | "opinion";
  exposeDisciplines: boolean;
};

export type CoreOrchestratorInput = {
  turnId: string;
  threadId: string;
  memberMessage: string;
  emotionalState?: "calm" | "overwhelmed" | "urgent" | "frustrated" | "confused";
  activeRoom?: EstateRoomId;
  /** Member explicitly asked to see discipline breakdown */
  exposeDisciplines?: boolean;
  /** Business context emerged during support conversation */
  businessContextEmerging?: boolean;
};

export type CoreOrchestratorIngress = {
  scenario: OrchestrationScenario;
  selectedDisciplines: ExecutiveDisciplineId[];
  supportModes: SupportMode[];
  estateSupport?: EstateRoomId;
  maxDisciplines: number;
  debateRequired: boolean;
};

export type CoreOrchestratorInternal = {
  contributions: DisciplineContribution[];
  debateRounds?: DebateRound[];
  conflicts: ResolvedConflict[];
  performanceScores: DisciplinePerformanceScore[];
  activationLog: ActivationLogEntry;
};

export type CoreOrchestratorEgress = {
  unified: UnifiedRecommendation;
  /** Internal only — never surface unless exposeDisciplines */
  rawContributions?: DisciplineContribution[];
};

export type CoreOrchestratorResult = {
  ingress: CoreOrchestratorIngress;
  internal: CoreOrchestratorInternal;
  egress: CoreOrchestratorEgress;
  readyToCompose: boolean;
  engineVersion: typeof SPARK_CORE_DISCIPLINE_ORCHESTRATOR_VERSION;
};

/** Bridge to shared routing types */
export type RoutedDisciplineId = DisciplineId;
