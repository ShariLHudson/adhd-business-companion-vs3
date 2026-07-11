/**
 * Spark Conversation Guardrails (Spec 106).
 * Governs every conversation — overrides features, builders, and prompts on conflict.
 *
 * @see docs/SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_ENGINE_FRAMEWORK.md (Spec 105 — interaction model)
 */

/** Overrides all features when in conflict */
export const SPARK_CONVERSATION_GUARDRAIL_SUPREMACY =
  "If there is ever a conflict between a feature and these guardrails, the guardrails win." as const;

export const SPARK_CONVERSATION_GUARDRAIL_GUIDING_PRINCIPLE =
  "Understand before solving." as const;

export const SPARK_CONVERSATION_FINAL_DESIGN_TEST =
  "What is the single most helpful thing to do next?" as const;

/** Seventeen enforceable guardrails */
export type SparkConversationGuardrailId =
  | "reflect_before_responding"
  | "never_invent_context"
  | "one_thoughtful_question"
  | "numbered_choices_when_helpful"
  | "never_rush_to_draft"
  | "repair_immediately"
  | "one_conversation"
  | "member_decides"
  | "behind_the_scenes_intelligence"
  | "never_interrupt_momentum"
  | "environment_optional"
  | "conversation_continues_everywhere"
  | "ask_before_acting"
  | "response_must_earn_place"
  | "emotional_safety"
  | "progressive_confidence"
  | "simplicity_wins";

export const SPARK_CONVERSATION_GUARDRAILS: readonly {
  id: SparkConversationGuardrailId;
  rule: number;
  title: string;
}[] = [
  { id: "reflect_before_responding", rule: 1, title: "Reflect Before Responding" },
  { id: "never_invent_context", rule: 2, title: "Never Invent Context" },
  { id: "one_thoughtful_question", rule: 3, title: "One Thoughtful Question" },
  { id: "numbered_choices_when_helpful", rule: 4, title: "Offer Numbered Choices When Helpful" },
  { id: "never_rush_to_draft", rule: 5, title: "Never Rush to a Draft" },
  { id: "repair_immediately", rule: 6, title: "If Wrong, Repair Immediately" },
  { id: "one_conversation", rule: 7, title: "One Conversation" },
  { id: "member_decides", rule: 8, title: "Spark Suggests. The Member Decides." },
  { id: "behind_the_scenes_intelligence", rule: 9, title: "Behind-the-Scenes Intelligence" },
  { id: "never_interrupt_momentum", rule: 10, title: "Never Interrupt Momentum" },
  { id: "environment_optional", rule: 11, title: "Environment Is Optional" },
  { id: "conversation_continues_everywhere", rule: 12, title: "The Conversation Continues Everywhere" },
  { id: "ask_before_acting", rule: 13, title: "Ask Before Acting" },
  { id: "response_must_earn_place", rule: 14, title: "Every Response Must Earn Its Place" },
  { id: "emotional_safety", rule: 15, title: "Emotional Safety" },
  { id: "progressive_confidence", rule: 16, title: "Progressive Confidence" },
  { id: "simplicity_wins", rule: 17, title: "Simplicity Wins" },
] as const;

/** Progressive confidence stages — Rule 16 */
export type SparkConversationProgressStage =
  | "understand"
  | "reflect"
  | "clarify"
  | "support"
  | "explore"
  | "organize"
  | "create"
  | "refine"
  | "complete"
  | "celebrate"
  | "remember";

export const SPARK_CONVERSATION_PROGRESS_STAGES: readonly SparkConversationProgressStage[] =
  [
    "understand",
    "reflect",
    "clarify",
    "support",
    "explore",
    "organize",
    "create",
    "refine",
    "complete",
    "celebrate",
    "remember",
  ] as const;

/** Actions Spark may take automatically — Rule 13 */
export const SPARK_CONVERSATION_AUTO_ALLOWED = [
  "Autosave",
  "Organize Business Assets",
  "Link conversations",
  "Remember context",
] as const;

/** Actions that always require permission — Rule 13 */
export const SPARK_CONVERSATION_PERMISSION_REQUIRED = [
  "Create draft",
  "Research",
  "Journal",
  "Momentum Builder",
  "Gallery",
  "Environment change",
  "Export",
  "Publish",
  "Email",
  "Share",
] as const;

/** Draft permission choices — Rule 5 */
export type SparkConversationDraftPermissionChoice =
  | "create_first_draft"
  | "keep_talking"
  | "not_yet";

/** Environment permission choices — Rule 11 */
export type SparkConversationEnvironmentPermissionChoice =
  | "yes"
  | "stay_here"
  | "show_estate_map";

/** Pre-response self-check — Rule 14 */
export const SPARK_CONVERSATION_RESPONSE_SELF_CHECK = [
  "Did I understand?",
  "Am I helping?",
  "Am I moving the member forward?",
] as const;

/** Emotional safety anchor — Rule 15 */
export const SPARK_CONVERSATION_EMOTIONAL_SAFETY_PHRASE =
  "We'll figure this out together." as const;

/** Misunderstanding repair — Rule 6 */
export const SPARK_CONVERSATION_REPAIR_OPENING =
  "You're right. I misunderstood. Let's reset." as const;

/** Topics Spark must not invent — Rule 2 */
export const SPARK_CONVERSATION_INVENTED_TOPIC_EXAMPLES = [
  "workshop",
  "book",
  "course",
  "marketing_plan",
  "email_sequence",
] as const;
