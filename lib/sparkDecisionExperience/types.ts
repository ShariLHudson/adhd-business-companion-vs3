/**
 * Decision Experience Framework™ — member-owned decision support.
 *
 * @see docs/DECISION_EXPERIENCE_FRAMEWORK.md
 */

export type SparkDecisionType =
  | "strategic"
  | "creative"
  | "operational"
  | "marketing"
  | "financial";

export const SPARK_DECISION_FLOW = [
  "clarify_decision",
  "clarify_goal",
  "gather_context",
  "generate_options",
  "explain_tradeoffs",
  "support_reflection",
  "member_chooses",
  "record_rationale",
] as const;

export type SparkDecisionFlowStep = (typeof SPARK_DECISION_FLOW)[number];

export type SparkDecisionConfidenceBand = "high" | "moderate" | "low";

/** Typical option count — align with Spec 103 / T-003 max 3 choices */
export const SPARK_DECISION_OPTION_TARGET = { min: 2, max: 3 } as const;

/** T-008 approval checklist */
export const SPARK_DECISION_APPROVAL_QUESTIONS = [
  "Have we clearly defined the decision?",
  "Have we clarified the desired outcome?",
  "Have we presented meaningful options?",
  "Have we explained trade-offs?",
  "Have we preserved member ownership?",
  "Will this strengthen future decision-making?",
  "Should this decision become part of the member's business history?",
] as const;

export type SparkDecisionTradeoffDimensions = {
  benefits?: string[];
  risks?: string[];
  costs?: string[];
  opportunities?: string[];
  complexity?: string;
  time?: string;
};

export type SparkDecisionOption = {
  id: string;
  label: string;
  summary: string;
  tradeoffs: SparkDecisionTradeoffDimensions;
};
