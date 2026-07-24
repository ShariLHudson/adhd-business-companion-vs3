/**
 * Strategy Domain Model — canonical vocabulary for every strategy conversation.
 *
 * StrategicQuestion
 *   → StrategicJudgmentStage
 *   → StrategicInputClassification
 *   → EvidenceStrength
 *   → DecisionReadiness
 *   → StrategicDecision
 *   → HandoffContext
 *
 * All strategy types (Business, Pricing, Growth, Personal, etc.) share this model.
 * No aliases of retired vocabulary — migrate callers instead.
 */

/** Backbone stages for every Strategy conversation, regardless of type. */
export type StrategicJudgmentStage =
  | "clarify_question"
  | "understand_reality"
  | "gather_evidence"
  | "surface_assumptions"
  | "explore_options"
  | "evaluate_tradeoffs"
  | "choose_direction"
  | "test_confidence"
  | "prepare_handoff"
  | "review_results";

export const STRATEGIC_JUDGMENT_STAGE_ORDER: readonly StrategicJudgmentStage[] = [
  "clarify_question",
  "understand_reality",
  "gather_evidence",
  "surface_assumptions",
  "explore_options",
  "evaluate_tradeoffs",
  "choose_direction",
  "test_confidence",
  "prepare_handoff",
  "review_results",
] as const;

export const STRATEGIC_JUDGMENT_STAGE_LABEL: Record<
  StrategicJudgmentStage,
  string
> = {
  clarify_question: "Clarify Question",
  understand_reality: "Understand Reality",
  gather_evidence: "Gather Evidence",
  surface_assumptions: "Surface Assumptions",
  explore_options: "Explore Options",
  evaluate_tradeoffs: "Evaluate Tradeoffs",
  choose_direction: "Choose Direction",
  test_confidence: "Test Confidence",
  prepare_handoff: "Prepare Handoff",
  review_results: "Review Results",
};

/** Quiet classification of member input — never ask them to label. */
export type StrategicInputClassification =
  | "question"
  | "goal"
  | "constraint"
  | "assumption"
  | "fact"
  | "evidence"
  | "preference"
  | "value"
  | "risk"
  | "opportunity"
  | "idea"
  | "option"
  | "concern"
  | "decision"
  | "unknown";

/** How strong the supporting signal is for a claim. */
export type EvidenceStrength =
  | "confirmed"
  | "strong_signal"
  | "limited_signal"
  | "anecdotal"
  | "assumed"
  | "conflicting"
  | "unknown";

export const EVIDENCE_STRENGTH_LABEL: Record<EvidenceStrength, string> = {
  confirmed: "We know this",
  strong_signal: "This appears likely",
  limited_signal: "We have some indication",
  anecdotal: "This is based on a limited signal",
  assumed: "This is still an assumption",
  conflicting: "The evidence is mixed",
  unknown: "We do not know this yet",
};

/** One canonical reversibility scale for risk across Chamber members. */
export type Reversibility =
  | "easily_reversible"
  | "moderately_reversible"
  | "difficult_to_reverse"
  | "effectively_irreversible"
  | "unknown";

export const REVERSIBILITY_LABEL: Record<Reversibility, string> = {
  easily_reversible: "Easily Reversible",
  moderately_reversible: "Moderately Reversible",
  difficult_to_reverse: "Difficult to Reverse",
  effectively_irreversible: "Effectively Irreversible",
  unknown: "Reversibility unclear",
};

/**
 * What is preventing a good decision — or that judgment is complete.
 * Prefer blockers over vague “not ready.”
 */
export type DecisionReadiness =
  | "problem_not_yet_clear"
  | "reality_not_yet_understood"
  | "more_options_needed"
  | "tradeoffs_not_evaluated"
  | "risks_not_reviewed"
  | "ready_for_decision"
  | "ready_for_handoff"
  | "decision_complete";

export const DECISION_READINESS_LABEL: Record<DecisionReadiness, string> = {
  problem_not_yet_clear: "Problem Not Yet Clear",
  reality_not_yet_understood: "Reality Not Yet Understood",
  more_options_needed: "More Options Needed",
  tradeoffs_not_evaluated: "Tradeoffs Not Evaluated",
  risks_not_reviewed: "Risks Not Reviewed",
  ready_for_decision: "Ready for Decision",
  ready_for_handoff: "Ready for Handoff",
  decision_complete: "Decision Complete",
};
