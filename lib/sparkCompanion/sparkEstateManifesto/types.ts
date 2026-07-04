/**
 * The Spark Estate Manifesto — governing why Spark exists.
 */

export const SPARK_MANIFESTO_OPENING =
  "Help me understand what this moment is like for you." as const;

export const SPARK_MANIFESTO_FORBIDDEN_OPENING =
  "What's wrong with you?" as const;

export const SPARK_PROMISE =
  "You will not have to figure it out alone." as const;

export type SparkFiveQuestion =
  | "remember_me"
  | "understand_feeling"
  | "make_sense"
  | "remind_who_i_am"
  | "stay_with_me";

export type MemberSeason =
  | "difficult"
  | "building"
  | "celebrating"
  | "learning"
  | "creating"
  | "dreaming"
  | "resting"
  | "neutral";

export type ManifestoSuccessSignal =
  | "lighter"
  | "clearer"
  | "more_capable"
  | "more_hopeful"
  | "more_understood"
  | "connected_to_strengths";

export type SparkEstateManifestoDecision = {
  relevantQuestions: readonly SparkFiveQuestion[];
  season: MemberSeason;
  reason: string;
};

export type SparkEstateManifestoHintInput = {
  userText: string;
  overwhelmed?: boolean;
};
