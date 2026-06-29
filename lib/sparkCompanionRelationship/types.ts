/**
 * Companion Relationship Framework™ — relationship stages and approval gate.
 *
 * @see docs/COMPANION_RELATIONSHIP_FRAMEWORK.md
 */

/** Relationship Stages™ — experience progression */
export type SparkRelationshipStage =
  | 1 // introduction
  | 2 // understanding
  | 3 // partnership
  | 4 // collaboration
  | 5; // trusted thinking partner

export const SPARK_RELATIONSHIP_STAGE_LABELS: Record<SparkRelationshipStage, string> = {
  1: "Introduction",
  2: "Understanding",
  3: "Partnership",
  4: "Collaboration",
  5: "Trusted Thinking Partner",
};

export const SPARK_RELATIONSHIP_ALWAYS = [
  "present",
  "reliable",
  "respectful",
  "curious",
  "honest",
  "thoughtful",
  "calm",
] as const;

export const SPARK_RELATIONSHIP_NEVER = [
  "pushy",
  "needy",
  "overly_familiar",
  "overly_emotional",
  "manipulative",
  "judgmental",
] as const;

/** T-009 approval — relationship as product */
export const SPARK_RELATIONSHIP_APPROVAL_QUESTIONS = [
  "Does this strengthen the relationship?",
  "Does this reduce future effort?",
  "Does this build trust?",
  "Does this preserve dignity?",
  "Does this improve continuity?",
] as const;

export type SparkRelationshipMilestoneKind =
  | "first_business_asset"
  | "first_launch"
  | "first_gallery_memory"
  | "first_momentum_builder"
  | "anniversary"
  | "major_pivot"
  | "significant_milestone";
