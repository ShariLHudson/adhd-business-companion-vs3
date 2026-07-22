/**
 * Spec 131 — Create Intelligence & Intent Constitution.
 *
 * Binding intent categories, confidence bands, and certification gate IDs.
 *
 * @see docs/constitution/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md
 */

/** Intent category before Work Type (Rule 4) */
export type SparkCreateIntentCategoryId =
  | "document"
  | "project"
  | "plan"
  | "strategy"
  | "campaign"
  | "communication"
  | "deliverable"
  | "business_asset"
  | "event";

export const SPARK_CREATE_INTENT_CATEGORIES: readonly SparkCreateIntentCategoryId[] =
  [
    "document",
    "project",
    "plan",
    "strategy",
    "campaign",
    "communication",
    "deliverable",
    "business_asset",
    "event",
  ] as const;

export const SPARK_CREATE_INTENT_CATEGORY_LABELS: Record<
  SparkCreateIntentCategoryId,
  string
> = {
  document: "Document",
  project: "Project",
  plan: "Plan",
  strategy: "Strategy",
  campaign: "Campaign",
  communication: "Communication",
  deliverable: "Deliverable",
  business_asset: "Business Asset",
  event: "Event",
};

/** Confidence bands that drive Begin behavior (Rule 12) */
export type SparkCreateIntentConfidenceBand =
  | "very_high"
  | "high"
  | "medium"
  | "low";

export const SPARK_CREATE_INTENT_CONFIDENCE_BANDS: readonly SparkCreateIntentConfidenceBand[] =
  ["very_high", "high", "medium", "low"] as const;

/** Approximate threshold for “offer alternatives” (Rule 2) */
export const SPARK_CREATE_INTENT_ALTERNATIVES_BELOW_CONFIDENCE = 0.95 as const;

/** Fifteen constitutional Create intent rules */
export type SparkCreateIntentRuleId =
  | "intent_before_artifact"
  | "offer_smart_alternatives"
  | "never_make_users_rewrite"
  | "intent_categories_first"
  | "recognize_relationships"
  | "suggest_before_asking_again"
  | "more_ways_calm_layers"
  | "one_search_many_results"
  | "context_beats_catalogs"
  | "navigation_confirms_location"
  | "empty_states_match_reality"
  | "confidence_drives_behavior"
  | "learn_from_corrections"
  | "measure_first_attempt_success"
  | "certification_gates";

export const SPARK_CREATE_INTENT_RULES: readonly SparkCreateIntentRuleId[] = [
  "intent_before_artifact",
  "offer_smart_alternatives",
  "never_make_users_rewrite",
  "intent_categories_first",
  "recognize_relationships",
  "suggest_before_asking_again",
  "more_ways_calm_layers",
  "one_search_many_results",
  "context_beats_catalogs",
  "navigation_confirms_location",
  "empty_states_match_reality",
  "confidence_drives_behavior",
  "learn_from_corrections",
  "measure_first_attempt_success",
  "certification_gates",
] as const;

export const SPARK_CREATE_INTENT_RULE_LABELS: Record<
  SparkCreateIntentRuleId,
  string
> = {
  intent_before_artifact: "Intent Before Artifact",
  offer_smart_alternatives: "Offer Smart Alternatives",
  never_make_users_rewrite: "Never Make Users Rewrite",
  intent_categories_first: "Intent Categories First",
  recognize_relationships: "Recognize Relationships",
  suggest_before_asking_again: "Suggest Before Asking Again",
  more_ways_calm_layers: "More Ways to Start — Calm",
  one_search_many_results: "One Search, Many Results",
  context_beats_catalogs: "Context Beats Catalogs",
  navigation_confirms_location: "Navigation Should Confirm Location",
  empty_states_match_reality: "Empty States Must Match Reality",
  confidence_drives_behavior: "Confidence Drives Behavior",
  learn_from_corrections: "Learn From Corrections",
  measure_first_attempt_success: "Measure Success — First Attempt",
  certification_gates: "Certification Gates",
};

/** Create Intent Certification — fifteen gates (Rule 15) */
export type SparkCreateIntentCertificationGateId =
  | "intent_before_artifact"
  | "alternatives_below_high_confidence"
  | "never_force_rewrite"
  | "intent_category_before_work_type"
  | "new_vs_supporting_existing"
  | "suggest_before_reask"
  | "more_ways_max_three_layers"
  | "one_nl_search_primary"
  | "context_over_catalog"
  | "location_confirmed_on_open"
  | "continue_hidden_when_empty"
  | "confidence_bands_no_silent_create"
  | "correction_hooks_present"
  | "first_attempt_success_metric"
  | "natural_speech_adaptation";

export const SPARK_CREATE_INTENT_CERTIFICATION_GATES: readonly SparkCreateIntentCertificationGateId[] =
  [
    "intent_before_artifact",
    "alternatives_below_high_confidence",
    "never_force_rewrite",
    "intent_category_before_work_type",
    "new_vs_supporting_existing",
    "suggest_before_reask",
    "more_ways_max_three_layers",
    "one_nl_search_primary",
    "context_over_catalog",
    "location_confirmed_on_open",
    "continue_hidden_when_empty",
    "confidence_bands_no_silent_create",
    "correction_hooks_present",
    "first_attempt_success_metric",
    "natural_speech_adaptation",
  ] as const;

/** Rule 7 — More Ways visible decision-layer cap */
export const SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS = 3 as const;

/** Future Intent Memory™ — V1 documents hooks only */
export const SPARK_CREATE_INTENT_MEMORY_STATUS = "future_capability" as const;
