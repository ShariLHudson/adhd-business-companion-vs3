/**
 * Spark Alpha™ — Relationship Prototype types.
 *
 * @see docs/SPARK_ALPHA_FRAMEWORK.md
 */

export const SPARK_ALPHA_MISSION_QUESTION =
  "Would Shari choose to use this instead of ChatGPT for her own business every day?" as const;

export const SPARK_ALPHA_CLOSING_SENTENCE =
  "Build the smallest amount of software necessary to create the largest possible feeling of partnership." as const;

export const SPARK_ALPHA_ICEBERG_SENTENCE =
  "Spark is a frosted-glass conversation that stays continuous while the world around it shifts and the system quietly does all the work underneath." as const;

export const SPARK_ALPHA_ENVIRONMENT_ID = "conservatory" as const;

/** Primary conversation intent — may evolve within one session */
export type SparkAlphaConversationIntent =
  | "general"
  | "marketing"
  | "pricing"
  | "overwhelmed"
  | "idea"
  | "research"
  | "celebration"
  | "planning"
  | "draft_review";

/** Context modules Workspace Context Manager may load — invisible to member */
export type SparkAlphaContextModule =
  | "marketing_planner"
  | "brand_voice"
  | "client_avatar"
  | "business_brain"
  | "previous_marketing_work"
  | "spark_cards"
  | "research"
  | "templates"
  | "pricing_strategy"
  | "offers"
  | "positioning"
  | "financial_planning"
  | "emotional_support"
  | "journaling"
  | "idea_capture"
  | "decision_support"
  | "gallery_wins"
  | "related_conversations";

export type SparkAlphaContextSnapshot = {
  intent: SparkAlphaConversationIntent;
  loadedModules: SparkAlphaContextModule[];
  unloadedModules: SparkAlphaContextModule[];
  turnId: string;
  reason: string;
};

export type SparkAlphaFlowConfidence = "low" | "medium" | "high";

export type SparkAlphaHiddenWorkEntry = {
  id: string;
  turnId: string;
  at: string;
  category: string;
  status: "completed" | "prepared" | "withheld" | "deferred";
  summary: string;
  reason?: string;
};

export type SparkAlphaHiddenWorkLog = {
  conversationId: string;
  entries: SparkAlphaHiddenWorkEntry[];
};

export type SparkAlphaDevPanelState = {
  conversationId: string;
  intent: SparkAlphaConversationIntent;
  confidence: SparkAlphaFlowConfidence;
  brainLoaded: string[];
  modulesLoaded: SparkAlphaContextModule[];
  researchPrepared: boolean;
  hiddenWorkCompleted: SparkAlphaHiddenWorkEntry[];
  hiddenWorkPrepared: SparkAlphaHiddenWorkEntry[];
  suggestionsWithheld: SparkAlphaHiddenWorkEntry[];
  permissionRequired: string[];
  environmentScore: number;
  environmentId: typeof SPARK_ALPHA_ENVIRONMENT_ID;
  hiddenIntentSummary: string | null;
  memberNeedPrimary: string | null;
  wisdomLoopSummaries: string[];
  outcomeSummary: string | null;
};

/** Member-visible surfaces only */
export const SPARK_ALPHA_ALLOWED_VISIBLE = [
  "conversation_frosted_glass",
  "environment_background",
  "folded_estate_map",
  "suggestion_bubbles",
] as const;

/** Explicitly forbidden in Alpha */
export const SPARK_ALPHA_FORBIDDEN_UI = [
  "dashboards",
  "tool_menus",
  "feature_selection_screens",
  "sidebar_navigation_trees",
  "forced_step_workflows",
  "auto_environment_switch",
  "action_pop_up_modals",
  "multi_panel_layouts",
  "dense_controls_competing_with_conversation",
] as const;
