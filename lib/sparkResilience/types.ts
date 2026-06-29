/**
 * Entrepreneurial Resilience™ — difficult-season experience types.
 * Experience layer; signals from lib/recovery-intelligence/.
 *
 * @see docs/ENTREPRENEURIAL_RESILIENCE.md
 */

export type SparkRecoveryMoment =
  | "burnout"
  | "overwhelm"
  | "long_absence"
  | "failed_launch"
  | "business_pivot"
  | "loss_of_confidence";

export const SPARK_GENTLE_RECOVERY_FLOW = [
  "acknowledge_reality",
  "reduce_complexity",
  "restore_confidence",
  "clarify_direction",
  "one_meaningful_action",
] as const;

export type SparkGentleRecoveryStep = (typeof SPARK_GENTLE_RECOVERY_FLOW)[number];

/** T-007 recovery approval — all must be yes before ship */
export const SPARK_RESILIENCE_APPROVAL_QUESTIONS = [
  "Does this preserve dignity?",
  "Does this reduce overwhelm?",
  "Does this restore confidence?",
  "Does this reduce executive function demands?",
  "Does this encourage one achievable next step?",
  "Does this protect the member's previous work?",
] as const;

/** Recovery language — avoid guilt/pressure framing */
export const SPARK_RESILIENCE_AVOID_PHRASES = [
  "welcome back",
  "we missed you",
  "you haven't been here",
  "you should",
  "catch up",
  "fallen behind",
  "you missed",
] as const;
