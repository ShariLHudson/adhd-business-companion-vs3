/**
 * Spark Response Intelligence Engine — types.
 * @see spark-intelligence-foundation/12-spark-response-intelligence-engine.md
 * Not wired to production companion routes in v1 scaffold.
 */

export const SPARK_RESPONSE_INTELLIGENCE_VERSION = "1.0" as const;
export const SPARK_CONSTITUTION_VERSION = "1.0-draft" as const;

export type InteractionClass =
  | "emotional_support"
  | "business_strategy"
  | "creative_work"
  | "research"
  | "learning"
  | "planning"
  | "decision_making"
  | "reflection"
  | "execution";

export type MemberNeed =
  | "direct_answer"
  | "coaching"
  | "clarification"
  | "plan"
  | "research"
  | "creative_deliverable";

export type DisciplineId =
  | "business-strategy"
  | "marketing"
  | "sales"
  | "wordsmith"
  | "creative-direction"
  | "research"
  | "finance"
  | "operations"
  | "leadership"
  | "customer-experience"
  | "learning-coach"
  | "ai-automation"
  | "brand-strategy"
  | "technology-advisor"
  | "product-development"
  | "project-management"
  | "productivity"
  | "legal-awareness";

export type EstateRoomId =
  | "creative-studio"
  | "strategy-room"
  | "observatory"
  | "research-lab"
  | "white-gazebo"
  | "celebration-garden"
  | "memory-conservatory"
  | "library"
  | "operations-office";

export type CertaintyClass =
  | "known_fact"
  | "reasonable_assumption"
  | "opinion"
  | "recommendation"
  | "unknown";

export type ObjectiveLockStatus =
  | "active"
  | "completed"
  | "parked"
  | "superseded"
  | "pending_change";

export type ObjectiveLock = {
  lockId: string;
  threadId: string;
  primaryObjective: string;
  desiredOutcome: string;
  status: ObjectiveLockStatus;
  lockedAt: string;
};

export type SparkResponseIntelligenceInput = {
  turnId: string;
  threadId: string;
  memberMessage: string;
  objectiveLock?: ObjectiveLock;
  conversationHistory?: Array<{ role: "member" | "spark"; content: string }>;
};

export type PreComposeAnalysis = {
  turnId: string;
  literalAsk: string;
  desiredOutcome: string;
  interactionClass: InteractionClass;
  disciplines: DisciplineId[];
  estateSuggestion?: EstateRoomId;
  memberNeed: MemberNeed;
  readyToCompose: boolean;
  clarificationQuestion?: string;
  clarificationReason?: string;
  responseDepth: "simple" | "moderate" | "deep" | "executive" | "evidence" | "creative" | "empathy_first";
  objectiveLock: ObjectiveLock;
  engineVersion: typeof SPARK_RESPONSE_INTELLIGENCE_VERSION;
};

export type ResponseDraft = {
  text: string;
  certaintyNotes?: CertaintyClass[];
};

export type SelfEvaluationResult = {
  answeredRealQuestion: boolean;
  stayedOnObjective: boolean;
  helpful: boolean;
  clear: boolean;
  reducedOverwhelm: boolean;
  soundedLikeSpark: boolean;
  canImprove: boolean;
  pass: boolean;
  revisionHints: string[];
};

export type SendDecision = {
  approved: boolean;
  evaluation: SelfEvaluationResult;
  finalText: string;
  revisionRound: number;
};

export type SparkResponseIntelligenceResult =
  | {
      kind: "clarification";
      analysis: PreComposeAnalysis;
      clarificationQuestion: string;
    }
  | {
      kind: "ready_to_compose";
      analysis: PreComposeAnalysis;
    }
  | {
      kind: "evaluated";
      analysis: PreComposeAnalysis;
      send: SendDecision;
    };
