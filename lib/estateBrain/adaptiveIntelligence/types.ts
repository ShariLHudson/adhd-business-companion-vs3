/**
 * Estate Adaptive Intelligence — preference types.
 *
 * Learn only what changes future behavior.
 * @see docs/estate/ESTATE_ADAPTIVE_INTELLIGENCE.md
 */

export type AdaptivePreferenceDomain =
  | "working"
  | "communication"
  | "decision"
  | "creative"
  | "learning"
  | "productivity";

/** Decisions this preference can influence — worth remembering gate. */
export type AdaptiveBehaviorImpact =
  | "discovery_skip"
  | "discovery_prep"
  | "coaching_intro"
  | "coaching_order"
  | "environment_choice"
  | "create_prep"
  | "response_depth"
  | "anticipation"
  | "research_prep";

export type AdaptivePreferenceId =
  | "conversation_over_forms"
  | "step_by_step_guidance"
  | "brainstorm_before_writing"
  | "visual_thinking"
  | "templates_first"
  | "blank_page_first"
  | "detailed_plans"
  | "quick_summaries"
  | "learn_by_doing"
  | "talk_through_creation"
  | "compare_options"
  | "wants_recommendations"
  | "morning_focus"
  | "clear_mind_for_thoughts"
  | "sop_to_checklist"
  | "newsletter_to_social"
  | "research_to_library";

export type AdaptivePreferenceDefinition = {
  id: AdaptivePreferenceId;
  domain: AdaptivePreferenceDomain;
  /** Only stored if it helps Spark decide differently next time. */
  impacts: readonly AdaptiveBehaviorImpact[];
  /** Optional bridge to intelligence profile trait path. */
  profileTraitPath?: string;
  memberFacingLabel: string;
};

export type AdaptivePreferenceState = {
  id: AdaptivePreferenceId;
  score: number;
  confidence: number;
  observations: number;
  lastUpdated: string;
  memberConfirmed?: boolean;
  memberDeclined?: boolean;
};

export type AdaptiveConfidenceTier = "low" | "medium" | "high";

export type AdaptiveSignalKind =
  | "coaching_choice"
  | "discovery_answer"
  | "create_completion"
  | "environment_visit"
  | "member_confirmed"
  | "member_declined";

export type AdaptiveSignal = {
  kind: AdaptiveSignalKind;
  at: string;
  preferenceId: AdaptivePreferenceId;
  /** Positive reinforces; negative weakens. */
  valence: "positive" | "negative";
  weight?: number;
  source?: string;
};

export type AnticipationEvent =
  | "sop_completed"
  | "newsletter_completed"
  | "research_completed";

export type AnticipationSuggestion = {
  event: AnticipationEvent;
  preferenceId: AdaptivePreferenceId;
  line: string;
  tier: AdaptiveConfidenceTier;
};

export type AdaptiveEstateStore = {
  version: 1;
  preferences: Partial<Record<AdaptivePreferenceId, AdaptivePreferenceState>>;
  lastPreferenceCheckAt: string | null;
  updatedAt: string;
};
