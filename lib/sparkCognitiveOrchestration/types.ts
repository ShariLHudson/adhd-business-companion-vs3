/**
 * Spark Cognitive Orchestration Engine™ — types.
 * @see spark-intelligence-foundation/13-spark-cognitive-orchestration-engine.md
 */

export const SPARK_COGNITIVE_ORCHESTRATION_VERSION = "1.0" as const;

export type EmotionalState =
  | "calm"
  | "curious"
  | "excited"
  | "confused"
  | "frustrated"
  | "overwhelmed"
  | "creative"
  | "strategic"
  | "reflective"
  | "urgent";

export type BusinessContext =
  | "starting_business"
  | "growing_business"
  | "launching_product"
  | "marketing"
  | "sales"
  | "leadership"
  | "finance"
  | "research"
  | "learning"
  | "personal_productivity"
  | "planning"
  | "execution"
  | "unknown";

export type ThinkingMode =
  | "quick_answer"
  | "coaching"
  | "teaching"
  | "strategic_thinking"
  | "creative_thinking"
  | "research"
  | "simulation"
  | "executive_board"
  | "reflection"
  | "planning"
  | "decision_support";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ResponseStructure =
  | "simple_answer"
  | "step_by_step_guide"
  | "executive_recommendation"
  | "research_summary"
  | "creative_collaboration"
  | "learning_lesson"
  | "strategic_framework"
  | "action_plan"
  | "simulation"
  | "reflection_exercise"
  | "clarification_question";

export type CognitiveOrchestrationInput = {
  turnId: string;
  threadId: string;
  memberMessage: string;
  objectiveLock?: import("@/lib/sparkResponseIntelligence").ObjectiveLock;
};

export type CognitiveOrchestrationPlan = {
  turnId: string;
  threadId: string;
  step1_realObjective: string;
  step1_desiredOutcome: string;
  step2_emotionalState: EmotionalState;
  step3_businessContext: BusinessContext[];
  step4_thinkingMode: ThinkingMode;
  step5_disciplines: import("@/lib/sparkResponseIntelligence").DisciplineId[];
  step6_confidence: ConfidenceLevel;
  step6_confidenceNote?: string;
  step7_responseStructure: ResponseStructure;
  step8_readyToGenerate: boolean;
  clarificationQuestion?: string;
  objectiveLock: import("@/lib/sparkResponseIntelligence").ObjectiveLock;
  engineVersion: typeof SPARK_COGNITIVE_ORCHESTRATION_VERSION;
};

export type CognitiveSelfReview = {
  answeredRealQuestion: boolean;
  reducedOverwhelm: boolean;
  stayedFocused: boolean;
  rightDisciplines: boolean;
  wouldTrustAdvice: boolean;
  canBeSimpler: boolean;
  canBeBetter: boolean;
  pass: boolean;
  revisionHints: string[];
};

export type CognitiveOrchestrationResult =
  | { kind: "clarification"; plan: CognitiveOrchestrationPlan; question: string }
  | { kind: "ready"; plan: CognitiveOrchestrationPlan }
  | {
      kind: "reviewed";
      plan: CognitiveOrchestrationPlan;
      approved: boolean;
      finalText: string;
      review: CognitiveSelfReview;
    };
