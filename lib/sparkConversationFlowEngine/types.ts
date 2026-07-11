/**
 * Spark Conversation Flow Engine (Spec 114).
 * Turn-by-turn reasoning — what the member needs most right now.
 *
 * States: Spec 107 · Guardrails: Spec 106 · Examples: Spec 115
 * Runtime: lib/sparkCoreIntelligence/conversationEngine/
 *
 * @see docs/SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md
 */

export const SPARK_CONVERSATION_FLOW_INTERNAL_QUESTION =
  "What does this person need most right now?" as const;

export const SPARK_CONVERSATION_FLOW_FINAL_PRINCIPLE =
  "Teach Cursor how to think like Spark — one turn at a time." as const;

/** Primary flow mode per turn */
export type SparkConversationFlowMode =
  | "answer"
  | "clarify"
  | "research"
  | "teach"
  | "coach"
  | "decide"
  | "explore"
  | "create"
  | "support";

export const SPARK_CONVERSATION_FLOW_MODES: readonly {
  id: SparkConversationFlowMode;
  title: string;
}[] = [
  { id: "answer", title: "Answer" },
  { id: "clarify", title: "Clarify" },
  { id: "research", title: "Research" },
  { id: "teach", title: "Teach" },
  { id: "coach", title: "Coach" },
  { id: "decide", title: "Decide" },
  { id: "explore", title: "Explore" },
  { id: "create", title: "Create" },
  { id: "support", title: "Support" },
] as const;

/** Confidence before draft, strategy, phase change */
export type SparkConversationFlowConfidence = "high" | "medium" | "low";

export const SPARK_CONVERSATION_FLOW_CONFIDENCE_THRESHOLDS = {
  high: {
    draft: "May prepare quietly; permission still required to show",
    strategy: "May suggest direction",
    phase: "May proceed",
  },
  medium: {
    draft: "One clarification first",
    strategy: "Explore options; do not conclude",
    phase: "Stay",
  },
  low: {
    draft: "Never create",
    strategy: "Never recommend",
    phase: "Stay in understand",
  },
} as const;

/** Stuck / I don't know — matches Spec 109 Help Options */
export type SparkConversationFlowStuckChoice =
  | "ask_another_way"
  | "show_examples"
  | "research_this"
  | "brainstorm_together";

export const SPARK_CONVERSATION_FLOW_STUCK_CHOICES: readonly SparkConversationFlowStuckChoice[] =
  [
    "ask_another_way",
    "show_examples",
    "research_this",
    "brainstorm_together",
  ] as const;

/** Progress without asking every sentence */
export const SPARK_CONVERSATION_FLOW_PROGRESS_SIGNALS = [
  "Member answers decisively",
  "Member confirms direction",
  "Member requests next step",
  "Objective locked in Confirming state",
  "Repeated alignment on same goal",
] as const;

/** Turn algorithm steps */
export const SPARK_CONVERSATION_FLOW_TURN_STEPS = [
  'Internal question: "What does this person need most right now?"',
  "Assess emotional state (overwhelmed → support first)",
  "Assess confidence (low → clarify or listen)",
  "Select primary flow mode",
  "Verify against Spec 106 guardrails",
  "Verify state transition valid (Spec 107)",
  "Respond — one question OR one clear action path",
] as const;

/** Mode selection hints */
export const SPARK_CONVERSATION_FLOW_MODE_HINTS: readonly {
  signal: string;
  mode: SparkConversationFlowMode;
}[] = [
  { signal: "Talk this through with me", mode: "coach" },
  { signal: "I don't know how X works", mode: "teach" },
  { signal: "Which should I choose", mode: "decide" },
  { signal: "I'm overwhelmed", mode: "support" },
  { signal: "I don't know", mode: "clarify" },
  { signal: "Simple factual question", mode: "answer" },
] as const;

/**
 * Maps runtime ConversationIntent to Spec 114 flow mode (partial).
 * @see lib/sparkCoreIntelligence/conversationEngine/types.ts
 */
export const SPARK_RUNTIME_INTENT_TO_FLOW_MODE: Partial<
  Record<string, SparkConversationFlowMode>
> = {
  simple_question: "answer",
  business_guidance: "explore",
  creative: "create",
  research: "research",
  planning: "explore",
  emotional_support: "support",
  execution: "create",
  misunderstanding_recovery: "clarify",
};
