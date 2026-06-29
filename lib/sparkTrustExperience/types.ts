/**
 * Trust Experience™ — how trust feels across member-facing Spark.
 * Distinct from lib/sparkTrustPerformance (runtime engineering gates).
 *
 * @see docs/TRUST_EXPERIENCE.md
 */

/** Trust Pyramid™ — five layers of earned trust */
export type SparkTrustPyramidLevel =
  | 1 // reliability
  | 2 // accuracy
  | 3 // understanding
  | 4 // partnership
  | 5; // transformation

export const SPARK_TRUST_PYRAMID_LABELS: Record<SparkTrustPyramidLevel, string> = {
  1: "Reliability",
  2: "Accuracy",
  3: "Understanding",
  4: "Partnership",
  5: "Transformation",
};

export const SPARK_TRUST_BEHAVIORS = [
  "honesty",
  "transparency",
  "humility",
  "respect",
] as const;

export type SparkTrustBehavior = (typeof SPARK_TRUST_BEHAVIORS)[number];

/** T-006 approval checklist — all must be yes before ship */
export const SPARK_TRUST_APPROVAL_QUESTIONS = [
  "Does this increase trust?",
  "Does it explain its reasoning when appropriate?",
  "Does it preserve the member's dignity?",
  "Does it reduce cognitive effort?",
  "Does it strengthen the long-term relationship?",
  "Would this interaction make the member more likely to trust Spark again tomorrow?",
] as const;
