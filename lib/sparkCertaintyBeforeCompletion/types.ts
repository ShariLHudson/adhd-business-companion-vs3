/**
 * Certainty Before Completion (Spec 113).
 * Conversation architecture for how Spark ends meaningful interactions.
 * Overrides traditional Save/Export/Print/Share/file-management endings.
 *
 * @see docs/SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md (Spec 110)
 * @see docs/SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md (Spec 112)
 */

export const SPARK_CERTAINTY_BEFORE_COMPLETION_PHILOSOPHY = {
  sparkRemembers: "Spark remembers so the member doesn't have to.",
  organization: "Organization is Spark's responsibility.",
  thinking: "Thinking is the member's responsibility.",
} as const;

export const SPARK_CERTAINTY_PROMISE =
  "Nothing important gets lost, and you never have to remember where you put it." as const;

export const SPARK_CERTAINTY_BEFORE_COMPLETION_FINAL_TEST = {
  whatHappened: "What happened?",
  whereLives: "Where it lives?",
  findAgain: "How they'll find it again?",
} as const;

/** Three pillars before any meaningful ending */
export type SparkCertaintyBeforeCompletionPillar =
  | "what_happened"
  | "where_is_it"
  | "can_find_later";

export const SPARK_CERTAINTY_BEFORE_COMPLETION_PILLARS: readonly {
  id: SparkCertaintyBeforeCompletionPillar;
  order: number;
  title: string;
}[] = [
  { id: "what_happened", order: 1, title: "What happened?" },
  { id: "where_is_it", order: 2, title: "Where is it?" },
  { id: "can_find_later", order: 3, title: "Can I find it later?" },
] as const;

/** Questions members should never have to ask */
export const SPARK_CERTAINTY_NEVER_WONDER = [
  "Did it save?",
  "Where did it go?",
  "What was it called?",
  "How do I find it again?",
] as const;

export const SPARK_CERTAINTY_WHAT_HAPPENED_EXAMPLES = [
  "I've safely saved your marketing plan.",
  "I've added today's journal entry.",
  "I've stored your workshop outline.",
  "I've saved your brainstorming session.",
] as const;

export const SPARK_CERTAINTY_WHAT_HAPPENED_NEVER = [
  "File created",
  "Save successful",
  "Document written",
] as const;

export const SPARK_CERTAINTY_WHERE_EXAMPLES = [
  "It's now part of your Business Brain under Marketing Plans.",
  "I've added it to your Workshop Launch project.",
  "It's safely stored with your Business Assets.",
] as const;

export const SPARK_CERTAINTY_FIND_LATER_EXAMPLES = [
  "Just ask me for your marketing plan anytime.",
  "You never need to remember what you called it.",
  "Even if you only remember part of today's conversation, I'll find it for you.",
] as const;

/** Avoid toolbar endings */
export const SPARK_CERTAINTY_AVOID_TOOLBAR_ACTIONS = [
  "Save",
  "Export",
  "Print",
  "Share",
  "Publish",
] as const;

export const SPARK_CERTAINTY_NEXT_QUESTION =
  "What would you like to do next?" as const;

/** Conversation Drives Navigation */
export const SPARK_CERTAINTY_CONVERSATION_NAVIGATION_EXAMPLES = [
  { member: "Print this.", spark: "Opens the print experience" },
  { member: "Email this to my client.", spark: "Prepares the email" },
  {
    member: "Create a Facebook post from this.",
    spark: "Begins that workflow",
  },
] as const;

/** Quiet behind-the-scenes organization */
export const SPARK_CERTAINTY_QUIET_ORGANIZATION = [
  "Autosaving",
  "Version management",
  "Project linking",
  "Business Brain organization",
  "Business Assets",
  "Related conversations",
  "Search indexing",
  "Duplicate prevention",
] as const;

/** Conversational retrieval */
export const SPARK_CERTAINTY_CONVERSATIONAL_RETRIEVAL_EXAMPLES = [
  "Show me my marketing plan.",
  "Find the pricing ideas.",
  "Remember that launch strategy.",
  "Show me yesterday's journal.",
] as const;

/** No file-management mental load */
export const SPARK_CERTAINTY_NO_MENTAL_LOAD = [
  "folders",
  "document names",
  "versions",
  "dates",
  "projects",
  "locations",
] as const;

export const SPARK_CERTAINTY_INFORMATION_VS_IDEAS =
  "Spark manages information. Members manage ideas." as const;

/** Honest when cannot save */
export const SPARK_CERTAINTY_CANNOT_SAVE_EXAMPLES = [
  "I haven't saved this because you asked me not to.",
  "This is only a temporary draft until you tell me you'd like to keep it.",
] as const;

/** Emotional goals at ending */
export const SPARK_CERTAINTY_EMOTIONAL_GOALS = [
  "Safe",
  "Organized",
  "Supported",
  "Confident",
] as const;

/** Natural member next-step utterances */
export const SPARK_CERTAINTY_MEMBER_NEXT_STEP_EXAMPLES = [
  "Print it.",
  "Email it.",
  "Keep working.",
  "Turn this into a Facebook post.",
  "Make a PDF.",
  "Let's work on something else.",
] as const;
