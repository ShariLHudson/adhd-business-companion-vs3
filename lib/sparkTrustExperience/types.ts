/**
 * Trust Experience Framework (Spec 102).
 * How members experience trust — Spark OS defines whether Spark can be trusted.
 * Distinct from lib/sparkTrustPerformance (runtime engineering gates).
 *
 * @see docs/TRUST_EXPERIENCE_FRAMEWORK.md
 * @see docs/TRUST_EXPERIENCE.md (T-006 — Trust Pyramid, supplementary)
 */

/** The Trust Promise — dimensions every interaction should strengthen */
export type SparkTrustPromiseQuality =
  | "honest"
  | "competent"
  | "transparent"
  | "respectful"
  | "predictable"
  | "reliable"
  | "calm"
  | "helpful"
  | "humble";

export const SPARK_TRUST_PROMISE_QUALITIES: readonly SparkTrustPromiseQuality[] = [
  "honest",
  "competent",
  "transparent",
  "respectful",
  "predictable",
  "reliable",
  "calm",
  "helpful",
  "humble",
] as const;

export const SPARK_TRUST_PROMISE_LABELS: Record<SparkTrustPromiseQuality, string> = {
  honest: "Honest",
  competent: "Competent",
  transparent: "Transparent",
  respectful: "Respectful",
  predictable: "Predictable",
  reliable: "Reliable",
  calm: "Calm",
  helpful: "Helpful",
  humble: "Humble",
};

/** Trust Principles — six governing principles */
export type SparkTrustPrinciple =
  | "honesty"
  | "transparency"
  | "consistency"
  | "respect"
  | "humility"
  | "reliability";

export const SPARK_TRUST_PRINCIPLES: readonly SparkTrustPrinciple[] = [
  "honesty",
  "transparency",
  "consistency",
  "respect",
  "humility",
  "reliability",
] as const;

export const SPARK_TRUST_PRINCIPLE_LABELS: Record<SparkTrustPrinciple, string> = {
  honesty: "Honesty",
  transparency: "Transparency",
  consistency: "Consistency",
  respect: "Respect",
  humility: "Humility",
  reliability: "Reliability",
};

/** Confidence-appropriate trust behaviors */
export type SparkTrustConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | "very_low";

export const SPARK_TRUST_CONFIDENCE_LEVELS: readonly SparkTrustConfidenceLevel[] = [
  "high",
  "medium",
  "low",
  "very_low",
] as const;

export type SparkTrustConfidenceBehavior =
  | "answer_confidently"
  | "explain_only_if_helpful"
  | "avoid_unnecessary_qualifiers"
  | "offer_recommendation"
  | "briefly_explain_why"
  | "mention_alternatives"
  | "ask_one_focused_question"
  | "avoid_multiple_questions"
  | "continue_with_available_info"
  | "communicate_uncertainty"
  | "never_fabricate_certainty";

export const SPARK_TRUST_CONFIDENCE_BEHAVIORS: Record<
  SparkTrustConfidenceLevel,
  readonly SparkTrustConfidenceBehavior[]
> = {
  high: [
    "answer_confidently",
    "explain_only_if_helpful",
    "avoid_unnecessary_qualifiers",
  ],
  medium: [
    "offer_recommendation",
    "briefly_explain_why",
    "mention_alternatives",
  ],
  low: [
    "ask_one_focused_question",
    "avoid_multiple_questions",
    "continue_with_available_info",
  ],
  very_low: ["communicate_uncertainty", "never_fabricate_certainty"],
};

/** Trust During Uncertainty — distinguish what Spark knows */
export type SparkTrustUncertaintyCategory =
  | "fact"
  | "reasonable_assumption"
  | "opinion"
  | "speculation";

export const SPARK_TRUST_UNCERTAINTY_CATEGORIES: readonly SparkTrustUncertaintyCategory[] =
  ["fact", "reasonable_assumption", "opinion", "speculation"] as const;

/** The Trust Bank — deposits and withdrawals */
export type SparkTrustBankEntry =
  | "remember_important_info"
  | "explain_reasoning_appropriately"
  | "admit_uncertainty_honestly"
  | "notice_progress"
  | "catch_contradictions"
  | "protect_executive_function"
  | "save_member_time"
  | "follow_through_consistently"
  | "confidently_incorrect_answer"
  | "repeated_questions"
  | "contradictory_guidance"
  | "ignore_business_context"
  | "overwhelming_responses"
  | "pretend_certainty"
  | "forget_important_info"
  | "excessive_questioning";

export const SPARK_TRUST_BANK_DEPOSITS: readonly SparkTrustBankEntry[] = [
  "remember_important_info",
  "explain_reasoning_appropriately",
  "admit_uncertainty_honestly",
  "notice_progress",
  "catch_contradictions",
  "protect_executive_function",
  "save_member_time",
  "follow_through_consistently",
] as const;

export const SPARK_TRUST_BANK_WITHDRAWALS: readonly SparkTrustBankEntry[] = [
  "confidently_incorrect_answer",
  "repeated_questions",
  "contradictory_guidance",
  "ignore_business_context",
  "overwhelming_responses",
  "pretend_certainty",
  "forget_important_info",
  "excessive_questioning",
] as const;

/** Measuring Trust — observable behavioral signals */
export type SparkTrustBehavioralSignal =
  | "repeat_less_information"
  | "ask_more_strategic_questions"
  | "delegate_thinking_retain_ownership"
  | "return_for_important_decisions"
  | "express_confidence"
  | "complete_more_work"
  | "move_forward_consistently";

export const SPARK_TRUST_BEHAVIORAL_SIGNALS: readonly SparkTrustBehavioralSignal[] = [
  "repeat_less_information",
  "ask_more_strategic_questions",
  "delegate_thinking_retain_ownership",
  "return_for_important_decisions",
  "express_confidence",
  "complete_more_work",
  "move_forward_consistently",
] as const;

/** Experience Standards — every interaction gate */
export const SPARK_TRUST_EXPERIENCE_STANDARDS = [
  "Did Spark respect the member?",
  "Did Spark reduce uncertainty?",
  "Did Spark improve understanding?",
  "Did Spark strengthen confidence?",
  "Did Spark preserve ownership?",
  "Did Spark increase trust?",
] as const;

/** Trust Pyramid (T-006) — five layers of earned trust */
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

/** Core trust behaviors (T-006 + Spec 102 overlap) */
export const SPARK_TRUST_BEHAVIORS = [
  "honesty",
  "transparency",
  "humility",
  "respect",
] as const;

export type SparkTrustBehavior = (typeof SPARK_TRUST_BEHAVIORS)[number];

/** T-006 / Spec 102 approval checklist — all must be yes before ship */
export const SPARK_TRUST_APPROVAL_QUESTIONS = [
  "Does this increase trust?",
  "Does it explain its reasoning when appropriate?",
  "Does it preserve the member's dignity?",
  "Does it reduce cognitive effort?",
  "Does it strengthen the long-term relationship?",
  "Would this interaction make the member more likely to trust Spark again tomorrow?",
] as const;
