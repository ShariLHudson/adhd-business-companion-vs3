/**
 * Spark Frosted Conversation Workspace (Spec 109).
 * Universal conversation/work surface — frosted glass, one panel, room visible.
 *
 * Conversation stack: Spec 105–108
 * Layout implementation: lib/workspaceLayoutTokens.ts · lib/companionDesk/workspaceLayout.ts
 *
 * @see docs/SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md (Spec 110 — workspace State 6)
 */

export const SPARK_FROSTED_WORKSPACE_PRIMARY_RULE =
  "The user should always know what to do next." as const;

export const SPARK_FROSTED_WORKSPACE_FINAL_PRINCIPLE =
  "The conversation leads. The workspace supports. The room holds the experience." as const;

/** Six workspace UI states */
export type SparkFrostedWorkspaceState =
  | "conversation"
  | "help_options"
  | "research"
  | "draft_ready"
  | "review"
  | "completion";

export const SPARK_FROSTED_WORKSPACE_STATES: readonly {
  id: SparkFrostedWorkspaceState;
  order: number;
  title: string;
}[] = [
  { id: "conversation", order: 1, title: "Conversation" },
  { id: "help_options", order: 2, title: "Help Options" },
  { id: "research", order: 3, title: "Research" },
  { id: "draft_ready", order: 4, title: "Draft Ready" },
  { id: "review", order: 5, title: "Review" },
  { id: "completion", order: 6, title: "Completion" },
] as const;

/** What the single workspace supports */
export const SPARK_FROSTED_WORKSPACE_PURPOSES = [
  "normal conversation",
  "one question / one answer flow",
  "research help",
  "brainstorming",
  "journaling",
  "focus support",
  "Momentum Builder prompts",
  "Spark Card guidance",
  "draft review",
  "document creation",
  "saving / printing / exporting",
] as const;

/** Visual requirements — frosted glass */
export const SPARK_FROSTED_WORKSPACE_VISUAL_REQUIREMENTS = [
  "soft translucent glass",
  "strong enough contrast for readability",
  "warm blur behind panel",
  "rounded corners",
  "subtle shadow",
  "no harsh borders",
  "no busy UI",
  "no tiny text",
  "room visible around edges",
] as const;

/** Minimum desktop typography (px) */
export const SPARK_FROSTED_WORKSPACE_TYPOGRAPHY = {
  mainShariMessage: { min: 30, max: 36 },
  userMessage: { min: 26, max: 30 },
  buttonText: { min: 24, max: 26 },
  inputText: { min: 26, max: 30 },
  supportingText: { min: 22, max: 24 },
} as const;

/** Default layout elements — one centered panel */
export const SPARK_FROSTED_WORKSPACE_LAYOUT_ELEMENTS = [
  "current conversation area",
  "current question",
  "numbered response choices when helpful",
  "always-visible input box",
  "microphone button",
  "send button",
] as const;

/** Help options — State 2 */
export type SparkFrostedWorkspaceHelpChoice =
  | "ask_another_way"
  | "show_examples"
  | "research_this"
  | "brainstorm_together";

export const SPARK_FROSTED_WORKSPACE_HELP_CHOICES: readonly SparkFrostedWorkspaceHelpChoice[] =
  [
    "ask_another_way",
    "show_examples",
    "research_this",
    "brainstorm_together",
  ] as const;

/** Research follow-up — State 3 */
export type SparkFrostedWorkspaceResearchFollowUpChoice =
  | "use_this"
  | "keep_talking"
  | "research_more";

/** Draft ready — State 4 */
export type SparkFrostedWorkspaceDraftReadyChoice =
  | "yes_show_me"
  | "not_yet_keep_talking"
  | "save_ideas_later";

/** Review — State 5 */
export type SparkFrostedWorkspaceReviewChoice =
  | "make_changes"
  | "keep_talking"
  | "save"
  | "print_export"
  | "leave_for_later";

/** Completion — State 6 */
export type SparkFrostedWorkspaceCompletionChoice =
  | "review"
  | "save"
  | "ignore_for_now"
  | "keep_talking";

/** Actions that always require permission */
export const SPARK_FROSTED_WORKSPACE_PERMISSION_REQUIRED = [
  "save finalized documents",
  "overwrite existing work",
  "publish",
  "send",
  "delete",
  "export",
  "contact anyone",
  "launch anything",
] as const;

/** Mobile layout requirements */
export const SPARK_FROSTED_WORKSPACE_MOBILE_REQUIREMENTS = [
  "one column only",
  "large text",
  "input fixed at bottom",
  "microphone always available",
  "choices stacked vertically",
  "no tiny icons",
  "no hidden critical actions",
] as const;

/** Design failure signals */
export const SPARK_FROSTED_WORKSPACE_FAILURE_CONDITIONS = [
  "text is hard to read",
  "user has to scroll to continue",
  "input disappears",
  "too many options appear",
  "Shari jumps to the wrong deliverable",
  "old chat competes with draft view",
  "workspace feels like a dashboard",
  "user wonders what to do next",
] as const;

/** Success criteria */
export const SPARK_FROSTED_WORKSPACE_SUCCESS_CRITERIA = [
  "the user can simply talk",
  "Shari asks one clear question",
  "the next step is obvious",
  "the room still feels present",
  "the frosted glass feels calm and premium",
  "documents appear only when ready",
  "everything feels easier than expected",
] as const;

/**
 * Maps workspace UI states to Spec 107 internal states.
 * @see lib/sparkConversationStateMachine/types.ts
 */
export const SPARK_FROSTED_TO_STATE_MACHINE: Partial<
  Record<SparkFrostedWorkspaceState, string>
> = {
  conversation: "listening | understanding | clarifying | confirming | exploring",
  draft_ready: "permission",
  review: "review",
  completion: "complete | continue",
};

/** @see docs/SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md — Spec 110 full completion behavior */
