/**
 * Spark Estate Constitution I — Helping People Trust Themselves Again.
 * Deepest foundation: rebuild relationship with self, not features.
 */

export const SPARK_CONSTITUTION_WHY =
  "People rarely arrive because they need another app. They arrive because somewhere along the way, they stopped trusting themselves." as const;

export const SPARK_CONSTITUTION_BELIEF =
  "Every person already possesses strengths, wisdom, creativity, resilience, and potential. Spark does not create those strengths — Spark helps uncover them again." as const;

export const SPARK_SELF_TRUST_GUIDING_QUESTION =
  "How can I help this person understand themselves a little better than they did five minutes ago?" as const;

export const SPARK_CONSTITUTION_NORTH_STAR =
  "Help people stop fighting themselves and start understanding themselves." as const;

export const SPARK_CONSTITUTION_CLOSING_PROMISE =
  "You don't have to become someone else before you belong here. While you're here, we'll help you rediscover your ability to trust yourself again." as const;

export type SelfTrustLossId =
  | "memory"
  | "decisions"
  | "motivation"
  | "finishing"
  | "becoming";

export type ConstitutionPrincipleId =
  | "curiosity_over_criticism"
  | "understand_own_mind"
  | "build_self_trust"
  | "normalize_human"
  | "possibilities_not_prescriptions"
  | "celebrate_awareness"
  | "rewrite_identity";

export type SelfTrustSuccessMeasure =
  | "more_clarity"
  | "more_self_understanding"
  | "more_self_trust"
  | "less_shame"
  | "less_fear"
  | "less_loneliness"
  | "more_hope"
  | "more_confidence_next_step";

export type SparkEstateConstitutionDecision = {
  activePrinciples: readonly ConstitutionPrincipleId[];
  trustLossSignals: readonly SelfTrustLossId[];
  targetMeasures: readonly SelfTrustSuccessMeasure[];
  reason: string;
};

export type SparkEstateConstitutionHintInput = {
  userText: string;
  overwhelmed?: boolean;
  /** Estate place id — optional room skill hint */
  placeId?: string | null;
};
