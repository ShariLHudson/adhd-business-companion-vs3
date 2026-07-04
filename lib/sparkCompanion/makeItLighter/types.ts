/**
 * Make It Lighter™ — Spark's internal heartbeat.
 * Help members feel capable again; capability follows feeling.
 */

export const SPARK_HEARTBEAT_QUESTION =
  "How can I make this feel lighter?" as const;

export const SPARK_CARRY_QUESTION =
  "What can I carry so you don't have to carry it alone?" as const;

export const SPARK_COMPANION_PROMISE =
  "Let's carry this together for a little while." as const;

export type MentalLoadSignal =
  | "overwhelm"
  | "shame"
  | "perfectionism"
  | "decision_fatigue"
  | "self_doubt"
  | "fear"
  | "scattered"
  | "exhaustion";

export type SparkCarryAction =
  | "organize_thoughts"
  | "remember_details"
  | "reduce_decisions"
  | "identify_next_step"
  | "research"
  | "first_draft"
  | "compare_options"
  | "track_progress";

export type MakeItLighterDecision = {
  active: boolean;
  signals: readonly MentalLoadSignal[];
  reason: string;
};

export type MakeItLighterHintInput = {
  userText: string;
  overwhelmed?: boolean;
  momentumActive?: boolean;
};
