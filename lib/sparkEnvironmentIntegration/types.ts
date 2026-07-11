/**
 * Environment Integration (Spec 108).
 * How the Spark Estate participates in conversations — supportive, never interrupting.
 *
 * Room design: T-017 — lib/sparkEstateRooms/types.ts
 * Conversation flow: Spec 105 · Guardrails: Spec 106 · State timing: Spec 107 · Workspace: Spec 109
 *
 * @see docs/SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md
 * @see docs/SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md
 */

export const SPARK_ENVIRONMENT_INTEGRATION_PHILOSOPHY = {
  conversationPrimary: true,
  environmentSupportive: true,
  memberInControl: true,
  sparkMayInvite: true,
  sparkNeverMovesWithoutPermission: true,
} as const;

export const SPARK_ENVIRONMENT_INTEGRATION_DESIGN_PRINCIPLE =
  "The Estate should feel like changing rooms, not changing software." as const;

export const SPARK_ENVIRONMENT_INTEGRATION_FINAL_TEST =
  "Will changing the setting genuinely help this person think, feel, or work better right now?" as const;

/** Fourteen integration rules */
export type SparkEnvironmentIntegrationRuleId =
  | "begin_where_member_is"
  | "conversation_comes_first"
  | "suggest_only_when_helpful"
  | "recommendations_are_invitations"
  | "staying_is_valid"
  | "estate_is_optional"
  | "capability_never_changes"
  | "restoration_places"
  | "map_always_available"
  | "never_feels_like_navigation"
  | "observe_without_assuming"
  | "conversation_travels"
  | "never_a_distraction"
  | "discovery_natural";

export const SPARK_ENVIRONMENT_INTEGRATION_RULES: readonly {
  id: SparkEnvironmentIntegrationRuleId;
  rule: number;
  title: string;
}[] = [
  { id: "begin_where_member_is", rule: 1, title: "Begin Where the Member Is" },
  { id: "conversation_comes_first", rule: 2, title: "The Conversation Comes First" },
  { id: "suggest_only_when_helpful", rule: 3, title: "Suggest Only When Helpful" },
  { id: "recommendations_are_invitations", rule: 4, title: "Recommendations Are Invitations" },
  { id: "staying_is_valid", rule: 5, title: "Staying Is Always Valid" },
  { id: "estate_is_optional", rule: 6, title: "The Estate Is Optional" },
  { id: "capability_never_changes", rule: 7, title: "Environment Never Changes Capability" },
  { id: "restoration_places", rule: 8, title: "Some Places Exist Only for Restoration" },
  { id: "map_always_available", rule: 9, title: "The Map Is Always Available" },
  { id: "never_feels_like_navigation", rule: 10, title: "The Estate Never Feels Like Navigation" },
  { id: "observe_without_assuming", rule: 11, title: "Spark Observes Without Assuming" },
  { id: "conversation_travels", rule: 12, title: "The Conversation Travels" },
  { id: "never_a_distraction", rule: 13, title: "The Estate Should Never Become a Distraction" },
  { id: "discovery_natural", rule: 14, title: "Discovery Happens Naturally" },
] as const;

/** Contexts where environment suggestion may genuinely help — Rule 3 */
export const SPARK_ENVIRONMENT_SUGGESTION_CONTEXTS = [
  "planning",
  "writing",
  "reflecting",
  "deep_thinking",
  "creative_brainstorming",
  "mental_fatigue",
  "decision_making",
] as const;

/** Invitation choices — Rule 4 */
export type SparkEnvironmentIntegrationInvitationChoice =
  | "yes"
  | "stay_here"
  | "show_estate_map";

/** Restoration-only places — no Spark Workspace; Rule 8 */
export const SPARK_ENVIRONMENT_RESTORATION_PLACES = [
  "reflection_garden",
  "walking_trail",
  "butterfly_garden",
  "pond",
  "stable_meadow",
  "fire_circle",
] as const;

export type SparkEnvironmentRestorationPlace =
  (typeof SPARK_ENVIRONMENT_RESTORATION_PLACES)[number];

/** What differs between work-capable environments — Rule 7 */
export const SPARK_ENVIRONMENT_ATMOSPHERE_DIMENSIONS = [
  "atmosphere",
  "lighting",
  "soundscape",
  "architecture",
  "scenery",
  "mood",
] as const;

/** Forbidden vs preferred language */
export const SPARK_ENVIRONMENT_INTEGRATION_FORBIDDEN = [
  "Opening the Conservatory...",
  "Choose a room",
  "Choose an environment",
  "Choose a workspace",
  "Navigate to...",
  "Where would you like to work today?",
] as const;

export const SPARK_ENVIRONMENT_INTEGRATION_PREFERRED = [
  "Would you like to go to the Conservatory?",
  "What would you like help with today?",
  "I'm going to the Library.",
  "Show me the Estate.",
] as const;

/** Session openers Spark should use — Rule 2 */
export const SPARK_ENVIRONMENT_SESSION_OPENERS = [
  "What would you like help with today?",
] as const;

/** Pattern observation copy — thoughtful, never surveillance — Rule 11 */
export const SPARK_ENVIRONMENT_PATTERN_OBSERVATION_EXAMPLE =
  "You've done some wonderful thinking in the Conservatory lately. Would you like to stay here today?" as const;
