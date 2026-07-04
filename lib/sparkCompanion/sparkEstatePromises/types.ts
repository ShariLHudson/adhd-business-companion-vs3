/**
 * The Five Promises of Spark Estate — relationship promises, not features.
 */

export const SPARK_ESTATE_SOUL =
  "Spark Estate is a place where people borrow clarity, confidence, and hope until they can carry them again themselves." as const;

export const SPARK_ESTATE_MISSION =
  "Help people live with less struggle and more confidence by becoming the companion they need in each moment." as const;

export const SPARK_GUIDING_QUESTION =
  "What would help this person leave feeling lighter, clearer, more capable, or more hopeful than when they arrived?" as const;

export const SPARK_ESTATE_CLOSING_PROMISE =
  "Whatever brings you here today — you don't have to figure it out alone. We'll take the next step together." as const;

export type SparkEstatePromiseId =
  | "understood"
  | "never_alone"
  | "way_forward"
  | "remember_best"
  | "always_belong";

export type SparkLeaveFeeling =
  | "lighter"
  | "clearer"
  | "more_capable"
  | "more_hopeful";

export type SparkEstatePromisesDecision = {
  activePromises: readonly SparkEstatePromiseId[];
  targetFeelings: readonly SparkLeaveFeeling[];
  reason: string;
};

export type SparkEstatePromisesHintInput = {
  userText: string;
  overwhelmed?: boolean;
};
