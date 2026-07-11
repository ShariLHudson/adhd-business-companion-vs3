/**
 * Spark Conversation Completion (Spec 110).
 * STATE 9 — Complete: member decides what happens next; no forced closure.
 *
 * State machine: Spec 107 State 9 (complete) · State 10 (continue)
 * Workspace UX: Spec 109 State 6 (completion)
 *
 * @see docs/SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md
 */

export const SPARK_CONVERSATION_COMPLETION_PHILOSOPHY =
  "Completion belongs to the member. Not Spark." as const;

export const SPARK_CONVERSATION_COMPLETION_FINAL_TEST =
  "Have I made it easier for the member to move forward, return later, or simply feel good about the progress they've made?" as const;

export const SPARK_CONVERSATION_COMPLETION_NO_FINISH_LINE =
  "There is no finish line. Only the next meaningful step." as const;

/** What Spark does at a natural pause */
export const SPARK_CONVERSATION_COMPLETION_ACTIONS = [
  "acknowledge the progress",
  "briefly summarize what was accomplished",
  "quietly organize everything behind the scenes",
  "present only the next actions that make sense",
] as const;

/** Warm recognition — not exaggerated */
export const SPARK_CONVERSATION_COMPLETION_CELEBRATION_EXAMPLES = [
  "That feels much clearer.",
  "We've made some really good progress.",
  "I think this captures your idea well.",
  "You've turned a rough idea into something much more complete.",
] as const;

export const SPARK_CONVERSATION_COMPLETION_CELEBRATION_AVOID = [
  "Amazing!",
  "Fantastic!",
  "Incredible!",
] as const;

/** Auto-allowed behind the scenes — member does not manage */
export const SPARK_CONVERSATION_COMPLETION_AUTO_ALLOWED = [
  "autosave",
  "organize Business Assets",
  "link related conversations",
  "remember project context",
  "update connected work",
  "prepare future suggestions",
] as const;

/** Next actions — only show what genuinely applies */
export type SparkConversationCompletionNextAction =
  | "continue_refining"
  | "create_polished_document"
  | "export_or_print"
  | "save_for_later"
  | "keep_talking"
  | "start_something_new";

export const SPARK_CONVERSATION_COMPLETION_NEXT_ACTIONS: readonly SparkConversationCompletionNextAction[] =
  [
    "continue_refining",
    "create_polished_document",
    "export_or_print",
    "save_for_later",
    "keep_talking",
    "start_something_new",
  ] as const;

/** Export formats — show only what makes sense */
export type SparkConversationCompletionExportFormat =
  | "pdf"
  | "word"
  | "google_docs"
  | "markdown"
  | "presentation"
  | "email_draft"
  | "website_copy";

export const SPARK_CONVERSATION_COMPLETION_EXPORT_FORMATS: readonly SparkConversationCompletionExportFormat[] =
  [
    "pdf",
    "word",
    "google_docs",
    "markdown",
    "presentation",
    "email_draft",
    "website_copy",
  ] as const;

/** Share options — never automatic */
export type SparkConversationCompletionShareOption =
  | "share_with_someone"
  | "copy_to_clipboard"
  | "create_presentation";

/** Keep talking — always available */
export const SPARK_CONVERSATION_COMPLETION_KEEP_TALKING_EXAMPLE =
  "We can absolutely keep working on this if you'd like." as const;

/** Polished document — permission only */
export const SPARK_CONVERSATION_COMPLETION_POLISHED_OFFER =
  "I can turn everything we've worked on into a polished document." as const;

/** Member walks away — no pressure */
export const SPARK_CONVERSATION_COMPLETION_RETURN_GREETING =
  "Welcome back. We can continue whenever you're ready." as const;

/** Missing something — ask once only */
export const SPARK_CONVERSATION_COMPLETION_WRAP_UP_QUESTION =
  "Before we wrap up… would you like to add anything else?" as const;

/** Never force closure */
export const SPARK_CONVERSATION_COMPLETION_FORBIDDEN_CLOSURE = [
  "This task is complete.",
  "Conversation finished.",
  "Done.",
] as const;

export const SPARK_CONVERSATION_COMPLETION_PREFERRED_CLOSURE = [
  "I think we're in a good place.",
  "This feels like a natural stopping point.",
] as const;

/** Emotional goals */
export const SPARK_CONVERSATION_COMPLETION_EMOTIONAL_GOALS = [
  "Accomplished",
  "Supported",
  "Organized",
  "In control",
] as const;

export const SPARK_CONVERSATION_COMPLETION_EMOTIONAL_NEVER = [
  "rushed",
  "abandoned",
  "overwhelmed",
] as const;

/** Start something new */
export const SPARK_CONVERSATION_COMPLETION_START_NEW_PROMPT =
  "What would you like to work on next?" as const;

/** @see lib/sparkConversationStateMachine/types.ts — SparkConversationStateMachineCompleteChoice */
/** @see lib/sparkFrostedConversationWorkspace/types.ts — SparkFrostedWorkspaceCompletionChoice */
