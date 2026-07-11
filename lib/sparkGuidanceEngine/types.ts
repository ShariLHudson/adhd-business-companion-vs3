/**
 * Guidance Engine — recommendation framework types.
 * Reasons with Brain/Assets/Knowledge; does not own memory or speak to members.
 *
 * @see spark-intelligence-foundation/005-guidance-engine.md
 */

/** Progressive Guidance — adapts depth to member experience. */
export type SparkProgressiveGuidanceLevel =
  | "new"
  | "experienced"
  | "advanced";

/**
 * Structured recommendation payload — Companion composes member-facing language.
 * Goal: understanding, not persuasion.
 */
export type SparkGuidanceRecommendation = {
  id: string;
  /** Primary possibility — member chooses */
  primary: string;
  whyThisMayHelp?: string;
  expectedBenefits?: string[];
  tradeOffs?: string[];
  estimatedEffort?: "light" | "moderate" | "substantial";
  relatedAssetIds?: string[];
  relatedMomentumBuilderIds?: string[];
  relatedSparkCardIds?: string[];
  relevantPastExperience?: string[];
  alternatives?: string[];
  /** Spark Knowledge Model confidence for underlying claims */
  confidence?: "confirmed" | "observed" | "inferred" | "hypothesis";
  createdAt: string;
};

/** Invariants — Guidance Engine must never violate these. */
export const SPARK_GUIDANCE_INVARIANTS = [
  "offers_possibilities_not_commands",
  "member_owns_every_decision",
  "no_pressure_urgency_guilt_or_fomo",
  "no_auto_execute_major_decisions",
  "narrow_choices_unless_explicitly_requested",
  "never_owns_memory_or_conversations",
  "never_the_smartest_voice_in_the_room",
] as const;

export type SparkGuidanceInvariant = (typeof SPARK_GUIDANCE_INVARIANTS)[number];
