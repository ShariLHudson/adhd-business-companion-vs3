/**
 * Spark Shared Capability Library — types (Estate 131–140).
 *
 * Capabilities are reusable skills, not GPTs.
 * Members experience one Spark companion via the facade.
 */

export const SHARED_CAPABILITY_CATEGORIES = [
  "thinking",
  "creative",
  "knowledge",
  "relational",
  "life_flow",
] as const;

export type SharedCapabilityCategory =
  (typeof SHARED_CAPABILITY_CATEGORIES)[number];

export const SHARED_CAPABILITY_IDS = [
  "decision_making",
  "planning",
  "problem_solving",
  "strategy",
  "brainstorming",
  "content_creation",
  "research",
  "learning",
  "reflection",
  "communication",
  "organization",
  "celebration",
] as const;

export type SharedCapabilityId = (typeof SHARED_CAPABILITY_IDS)[number];

export type SharedCapability = {
  id: SharedCapabilityId;
  officialName: string;
  category: SharedCapabilityCategory;
  purpose: string;
  coreQuestion: string;
  /** Architecture library doc number */
  specDoc: 133 | 134 | 135 | 136 | 137;
  inputs: readonly string[];
  outputs: readonly string[];
  composableWith: readonly SharedCapabilityId[];
  roomHints: readonly string[];
  /** Forbidden product / GPT names — never expose to members */
  neverExposeAs: readonly string[];
  /** Soft member-facing line (facade) */
  companionLine: string;
  /** Intent signal patterns */
  intentPatterns: readonly RegExp[];
};

export type CapabilityCompositionRecipeId =
  | "decide_and_plan"
  | "unstuck"
  | "create_with_intent"
  | "learn_and_apply"
  | "notice_and_honor"
  | "sort_the_pile";

export type CapabilityCompositionRecipe = {
  id: CapabilityCompositionRecipeId;
  primary: SharedCapabilityId;
  supports: readonly SharedCapabilityId[];
  when: string;
};

/** Soft adapter — never an identity / GPT */
export type CapabilityAdapterHint =
  | "decision_compass"
  | "create_workspace"
  | "clear_my_mind"
  | "plan_my_day"
  | "evidence_vault"
  | "celebration_garden"
  | "celebration_room"
  | "journal"
  | null;

export type SharedCapabilityComposition = {
  primaryId: SharedCapabilityId;
  supportIds: SharedCapabilityId[];
  recipeId: CapabilityCompositionRecipeId | null;
  reason: string;
  companionPromptHint: string;
  companionOfferLine: string;
  forbiddenExposures: string[];
  optionalAdapter: CapabilityAdapterHint;
  /** True when composition must not surface as a separate product */
  hiddenBehindCompanion: true;
};

export type ComposeSharedCapabilitiesInput = {
  userText: string;
  /** visual_room / place id when known */
  visualRoom?: string | null;
  /** Active recognition flow kind, if any */
  activeRecognitionFlowKind?: string | null;
  /** Explicit member-chosen capability */
  memberOverride?: SharedCapabilityId | null;
};
