/**
 * Spark Conversation State Machine™ (Spec 107).
 * Internal behavioral engine — invisible to members; governs turn logic.
 *
 * Member-facing flow: Spec 105 — lib/sparkConversationEngine/types.ts
 * Enforceable rules: Spec 106 — lib/sparkConversationGuardrails/types.ts
 * Runtime: lib/sparkCoreIntelligence/conversationEngine/stateMachine.ts
 *
 * @see docs/SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md (Spec 110 — State 9 Complete)
 */

export const SPARK_CONVERSATION_STATE_MACHINE_PHILOSOPHY =
  "A good guide first understands where someone is — only then helps determine where they want to go." as const;

export const SPARK_CONVERSATION_STATE_MACHINE_VISION =
  "Spark should always know what it is doing before deciding what to do next." as const;

export const SPARK_CONVERSATION_STATE_MACHINE_FINAL_PRINCIPLE =
  "Spark should think before it speaks, understand before it creates, and ask before it acts." as const;

/** Ten internal behavioral states — never shown to members */
export type SparkConversationStateMachineState =
  | "listening"
  | "understanding"
  | "clarifying"
  | "confirming"
  | "exploring"
  | "creating"
  | "permission"
  | "review"
  | "complete"
  | "continue";

export const SPARK_CONVERSATION_STATE_MACHINE_STATES: readonly {
  id: SparkConversationStateMachineState;
  order: number;
  title: string;
}[] = [
  { id: "listening", order: 1, title: "Listening" },
  { id: "understanding", order: 2, title: "Understanding" },
  { id: "clarifying", order: 3, title: "Clarifying" },
  { id: "confirming", order: 4, title: "Confirming" },
  { id: "exploring", order: 5, title: "Exploring" },
  { id: "creating", order: 6, title: "Creating" },
  { id: "permission", order: 7, title: "Permission" },
  { id: "review", order: 8, title: "Review" },
  { id: "complete", order: 9, title: "Complete" },
  { id: "continue", order: 10, title: "Continue" },
] as const;

/** Primary forward transitions */
export const SPARK_CONVERSATION_STATE_MACHINE_TRANSITIONS: readonly {
  from: SparkConversationStateMachineState;
  to: SparkConversationStateMachineState;
}[] = [
  { from: "listening", to: "understanding" },
  { from: "understanding", to: "clarifying" },
  { from: "clarifying", to: "confirming" },
  { from: "confirming", to: "exploring" },
  { from: "exploring", to: "creating" },
  { from: "creating", to: "permission" },
  { from: "permission", to: "review" },
  { from: "review", to: "complete" },
  { from: "complete", to: "continue" },
] as const;

/** Common backward transitions when direction changes */
export const SPARK_CONVERSATION_STATE_MACHINE_BACKWARD_TRANSITIONS: readonly {
  from: SparkConversationStateMachineState;
  to: SparkConversationStateMachineState;
  reason: string;
}[] = [
  { from: "review", to: "exploring", reason: "member changes direction" },
  { from: "creating", to: "exploring", reason: "insufficient information" },
  { from: "confirming", to: "clarifying", reason: "intent still unclear" },
  { from: "exploring", to: "understanding", reason: "topic shift" },
  { from: "permission", to: "exploring", reason: "keep talking" },
] as const;

/** Internal confidence assessment */
export type SparkConversationStateMachineConfidence =
  | "high"
  | "medium"
  | "low";

export const SPARK_CONVERSATION_STATE_MACHINE_CONFIDENCE_ACTIONS: Record<
  SparkConversationStateMachineConfidence,
  string
> = {
  high: "Proceed",
  medium: "Ask one clarification",
  low: "Stay in Listening",
};

/** Permission checkpoint — State 7; mandatory before Review */
export type SparkConversationStateMachinePermissionChoice =
  | "yes"
  | "keep_talking"
  | "save_ideas_later";

/** Complete checkpoint — State 9; member decides */
export type SparkConversationStateMachineCompleteChoice =
  | "save"
  | "export"
  | "continue_editing"
  | "keep_talking"
  | "start_something_new";

/** Forbidden behaviors — subordinate to Spec 106 on conflict */
export const SPARK_CONVERSATION_STATE_MACHINE_FORBIDDEN = [
  "Skip Clarifying when intent is unclear",
  "Jump directly into Creating",
  "Assume the final deliverable",
  "Ask multiple unrelated questions",
  "Generate documents without permission",
  "Recommend environments before understanding the request",
  "Overwhelm the member with options",
] as const;

/** Recovery when Spark misunderstands */
export const SPARK_CONVERSATION_STATE_MACHINE_RECOVERY = [
  "Immediately acknowledge",
  "Correct course",
  "Continue naturally",
  "Never argue",
  "Never defend",
] as const;

/** Success criteria — release review */
export const SPARK_CONVERSATION_STATE_MACHINE_SUCCESS_CRITERIA = [
  "Spark never jumps ahead",
  "Members feel understood before being helped",
  "Clarifying questions are rare but meaningful",
  "Every draft matches the member's actual intent",
  "The conversation feels natural",
  "The member remains in control at every step",
] as const;

/**
 * Maps Spec 107 internal states to Spec 105 member-facing flow stages.
 * @see lib/sparkConversationEngine/types.ts — SparkConversationFlowStage
 */
export const SPARK_STATE_MACHINE_TO_FLOW_STAGE: Partial<
  Record<SparkConversationStateMachineState, string>
> = {
  listening: "welcome",
  understanding: "understand",
  confirming: "confirm_direction",
  exploring: "conversation",
  creating: "quiet_work",
  permission: "permission",
  review: "review",
  continue: "continue",
};
