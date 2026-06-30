/**
 * Spark Conversation Engine™ (Spec 105).
 * Primary interaction model — conversation first; everything else supports it.
 *
 * Experience specification types. Runtime turn processing lives in
 * `lib/sparkCoreIntelligence/conversationEngine/` (Spark OS 015).
 *
 * @see docs/SPARK_CONVERSATION_ENGINE_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md (Spec 107 — internal states)
 * @see spark-intelligence-foundation/15-spark-core-conversation-engine.md
 */

/** Core principle — if you can converse, you can use Spark */
export const SPARK_CONVERSATION_CORE_PRINCIPLE =
  "If you can have a conversation, you can use Spark." as const;

/** The Spark Promise™ */
export const SPARK_CONVERSATION_PROMISE =
  "Before Spark helps members build a business, Spark helps them feel understood." as const;

/** Relationship Rule™ — Spark goes with the member; never sends them somewhere */
export const SPARK_CONVERSATION_RELATIONSHIP_RULE =
  "Spark never sends members somewhere. Spark goes there with them." as const;

/** Nine-stage member-facing conversation flow */
export type SparkConversationFlowStage =
  | "welcome"
  | "understand"
  | "confirm_direction"
  | "environment_optional"
  | "conversation"
  | "quiet_work"
  | "permission"
  | "review"
  | "continue";

export const SPARK_CONVERSATION_FLOW_STAGES: readonly SparkConversationFlowStage[] =
  [
    "welcome",
    "understand",
    "confirm_direction",
    "environment_optional",
    "conversation",
    "quiet_work",
    "permission",
    "review",
    "continue",
  ] as const;

export const SPARK_CONVERSATION_FLOW_STAGE_LABELS: Record<
  SparkConversationFlowStage,
  string
> = {
  welcome: "Welcome",
  understand: "Understand",
  confirm_direction: "Confirm Direction",
  environment_optional: "Environment (Optional)",
  conversation: "Conversation",
  quiet_work: "Quiet Work",
  permission: "Permission",
  review: "Review",
  continue: "Continue",
};

/** Philosophy pattern — every interaction */
export const SPARK_CONVERSATION_PHILOSOPHY_PATTERN = [
  "Listen",
  "Understand",
  "Clarify",
  "Help",
  "Create",
  "Ask Permission",
  "Continue",
] as const;

/** Internal modes — never shown to members */
export type SparkInternalConversationMode =
  | "listening"
  | "clarifying"
  | "exploring"
  | "creating"
  | "review"
  | "reflection"
  | "celebration"
  | "restoration";

export const SPARK_INTERNAL_CONVERSATION_MODES: readonly SparkInternalConversationMode[] =
  [
    "listening",
    "clarifying",
    "exploring",
    "creating",
    "review",
    "reflection",
    "celebration",
    "restoration",
  ] as const;

/** UX priority stack */
export type SparkConversationExperiencePriority =
  | "conversation"
  | "environment"
  | "workspace"
  | "tools";

export const SPARK_CONVERSATION_EXPERIENCE_PRIORITY: readonly SparkConversationExperiencePriority[] =
  ["conversation", "environment", "workspace", "tools"] as const;

/** Stuck help — Stage 5 */
export type SparkConversationStuckHelpOption =
  | "rephrase_question"
  | "show_examples"
  | "research_together"
  | "brainstorm_together";

export const SPARK_CONVERSATION_STUCK_HELP_OPTIONS: readonly SparkConversationStuckHelpOption[] =
  [
    "rephrase_question",
    "show_examples",
    "research_together",
    "brainstorm_together",
  ] as const;

/** Permission gate — Stage 7 */
export type SparkConversationPermissionChoice =
  | "yes_show_draft"
  | "keep_talking"
  | "save_ideas_later";

/** Continue after review — Stage 9 */
export type SparkConversationContinueChoice =
  | "make_changes"
  | "keep_talking"
  | "save"
  | "export_print"
  | "work_on_something_else";

/** Environment suggestion — Stage 4 */
export type SparkConversationEnvironmentChoice =
  | "yes"
  | "stay_here"
  | "show_estate";

/** Spark never… */
export const SPARK_CONVERSATION_NEVER = [
  "Bombard with questions",
  "Jump to conclusions",
  "Create documents without permission",
  "Send members to features",
  "Force environments",
  "Make the member learn Spark",
] as const;

/** Spark always… */
export const SPARK_CONVERSATION_ALWAYS = [
  "Listen first",
  "Clarify gently",
  "Ask one question at a time",
  "Keep the conversation moving naturally",
  "Offer help when the member gets stuck",
  "Request permission before creating",
  "Keep the member in control",
] as const;

/** Success criteria — release review */
export const SPARK_CONVERSATION_SUCCESS_CRITERIA = [
  "Members never feel lost",
  "They never wonder which feature to open",
  "They are never overwhelmed",
  "They feel understood before being helped",
  "Spark asks meaningful questions",
  "Spark never makes incorrect assumptions",
  "Spark quietly does the heavy lifting",
  "Members feel like they are with a trusted companion, not using software",
] as const;

/** Bad vs good navigation language — Relationship Rule examples */
export const SPARK_CONVERSATION_LANGUAGE_EXAMPLES = {
  never: [
    { bad: "Open Clear My Mind™.", good: "Let's clear your mind together." },
    { bad: "Go to the Journal.", good: "Would it help to capture these thoughts before they disappear?" },
  ],
} as const;
