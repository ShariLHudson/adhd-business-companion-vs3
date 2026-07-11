/**
 * Universal Experience Standards Framework (Spec 103).
 * Design principles and experiential qualities for every member-facing experience.
 *
 * @see docs/UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md
 * @see docs/UNIVERSAL_EXPERIENCE_STANDARDS.md (T-003 — flow arc, max 3 choices, supplementary)
 */

/** The Spark Feeling — every experience should evoke these */
export type SparkFeeling =
  | "calm"
  | "clarity"
  | "confidence"
  | "curiosity"
  | "momentum"
  | "belonging"
  | "hope"
  | "ownership";

export const SPARK_FEELINGS: readonly SparkFeeling[] = [
  "calm",
  "clarity",
  "confidence",
  "curiosity",
  "momentum",
  "belonging",
  "hope",
  "ownership",
] as const;

export const SPARK_FEELING_LABELS: Record<SparkFeeling, string> = {
  calm: "Calm",
  clarity: "Clarity",
  confidence: "Confidence",
  curiosity: "Curiosity",
  momentum: "Momentum",
  belonging: "Belonging",
  hope: "Hope",
  ownership: "Ownership",
};

/** Universal Design Principles — eight governing principles */
export type UniversalDesignPrinciple =
  | "one_relationship"
  | "orientation_before_action"
  | "calm_before_complexity"
  | "executive_function_first"
  | "confidence_before_completion"
  | "guidance_before_automation"
  | "ownership_always"
  | "connection_everywhere";

export const UNIVERSAL_DESIGN_PRINCIPLES: readonly UniversalDesignPrinciple[] = [
  "one_relationship",
  "orientation_before_action",
  "calm_before_complexity",
  "executive_function_first",
  "confidence_before_completion",
  "guidance_before_automation",
  "ownership_always",
  "connection_everywhere",
] as const;

export const UNIVERSAL_DESIGN_PRINCIPLE_LABELS: Record<
  UniversalDesignPrinciple,
  string
> = {
  one_relationship: "One Relationship",
  orientation_before_action: "Orientation Before Action",
  calm_before_complexity: "Calm Before Complexity",
  executive_function_first: "Executive Function First",
  confidence_before_completion: "Confidence Before Completion",
  guidance_before_automation: "Guidance Before Automation",
  ownership_always: "Ownership Always",
  connection_everywhere: "Connection Everywhere",
};

/** Cognitive Load Standards — minimize */
export type CognitiveLoadMinimize =
  | "decision_fatigue"
  | "context_switching"
  | "repetition"
  | "information_overload"
  | "navigation_complexity"
  | "memory_burden";

export const COGNITIVE_LOAD_MINIMIZE: readonly CognitiveLoadMinimize[] = [
  "decision_fatigue",
  "context_switching",
  "repetition",
  "information_overload",
  "navigation_complexity",
  "memory_burden",
] as const;

/** Cognitive Load Standards — maximize */
export type CognitiveLoadMaximize =
  | "recognition_over_recall"
  | "visual_clarity"
  | "progressive_learning"
  | "immediate_orientation"
  | "obvious_next_actions";

export const COGNITIVE_LOAD_MAXIMIZE: readonly CognitiveLoadMaximize[] = [
  "recognition_over_recall",
  "visual_clarity",
  "progressive_learning",
  "immediate_orientation",
  "obvious_next_actions",
] as const;

/** Interaction Standards — every interaction must answer */
export const INTERACTION_STANDARD_QUESTIONS = [
  "What am I doing?",
  "Why does it matter?",
  "What happens next?",
  "What should I do now?",
] as const;

/** Visual Standards — Estate environments should feel */
export type VisualStandardPositive =
  | "premium"
  | "warm"
  | "elegant"
  | "architectural"
  | "intentional"
  | "timeless"
  | "natural";

export const VISUAL_STANDARD_POSITIVE: readonly VisualStandardPositive[] = [
  "premium",
  "warm",
  "elegant",
  "architectural",
  "intentional",
  "timeless",
  "natural",
] as const;

/** Visual Standards — never */
export type VisualStandardAvoid =
  | "gamified"
  | "busy"
  | "dashboard_heavy"
  | "toy_like"
  | "overstimulating";

export const VISUAL_STANDARD_AVOID: readonly VisualStandardAvoid[] = [
  "gamified",
  "busy",
  "dashboard_heavy",
  "toy_like",
  "overstimulating",
] as const;

/** Emotional Standards — reduce */
export type EmotionalStandardReduce =
  | "overwhelm"
  | "isolation"
  | "self_doubt"
  | "decision_paralysis"
  | "shame";

export const EMOTIONAL_STANDARD_REDUCE: readonly EmotionalStandardReduce[] = [
  "overwhelm",
  "isolation",
  "self_doubt",
  "decision_paralysis",
  "shame",
] as const;

/** Emotional Standards — increase */
export type EmotionalStandardIncrease =
  | "hope"
  | "clarity"
  | "courage"
  | "confidence"
  | "momentum"
  | "belonging";

export const EMOTIONAL_STANDARD_INCREASE: readonly EmotionalStandardIncrease[] = [
  "hope",
  "clarity",
  "courage",
  "confidence",
  "momentum",
  "belonging",
] as const;

/** Estate Standards — every room should answer */
export const ESTATE_ROOM_DESIGN_QUESTIONS = [
  "Why does this place exist?",
  "What capability does it strengthen?",
  "What emotion should members experience here?",
  "How does it connect to the entrepreneurial journey?",
] as const;

/** Experience Review Checklist — gate before implementation */
export const SPARK_UNIVERSAL_EXPERIENCE_REVIEW_CHECKLIST = [
  "Does it reduce cognitive load?",
  "Does it strengthen an entrepreneurial capability?",
  "Does it improve decision quality?",
  "Does it preserve member ownership?",
  "Does it strengthen trust?",
  "Does it connect to the rest of Spark?",
  "Does it support transformation?",
  "Does it feel like Spark?",
] as const;

/** Success Metrics */
export type SparkUniversalExperienceSuccessMetric =
  | "feels_easy_to_use"
  | "feels_calm"
  | "understands_me"
  | "remembers_what_matters"
  | "know_what_to_do_next"
  | "feel_more_capable"
  | "every_part_connected"
  | "business_less_overwhelming";

export const SPARK_UNIVERSAL_EXPERIENCE_SUCCESS_METRICS: readonly SparkUniversalExperienceSuccessMetric[] =
  [
    "feels_easy_to_use",
    "feels_calm",
    "understands_me",
    "remembers_what_matters",
    "know_what_to_do_next",
    "feel_more_capable",
    "every_part_connected",
    "business_less_overwhelming",
  ] as const;

/** T-003 operational rules — align with Spec 103 */
export const UNIVERSAL_EXPERIENCE_MAX_VISIBLE_CHOICES = 3 as const;

export const UNIVERSAL_EXPERIENCE_PRIMARY_ACTION_RULE =
  "One obvious primary action per screen — secondaries must not compete." as const;
