/**
 * Phase 7 — Strategic Pattern Recognition contracts.
 * Patterns are supported observations across several decisions — not labels,
 * diagnoses, predictions, or permanent truths.
 */

export type StrategicPatternStatus =
  | "candidate"
  | "ready_for_review"
  | "accepted"
  | "dismissed"
  | "paused"
  | "superseded"
  | "archived";

export type StrategicPatternConfidence = "low" | "moderate" | "high";

export type StrategicPatternCategory =
  | "recurring_assumption"
  | "recurring_constraint"
  | "capacity_estimation"
  | "decision_delay"
  | "decision_speed"
  | "option_preference"
  | "risk_tolerance"
  | "reversibility_preference"
  | "experiment_effectiveness"
  | "successful_decision_approach"
  | "repeated_tradeoff"
  | "customer_trust"
  | "delivery_sustainability"
  | "maintenance_burden"
  | "focus_and_scope"
  | "growth_readiness"
  | "pricing_behavior"
  | "offer_proliferation"
  | "follow_through"
  | "review_behavior"
  | "decision_revision"
  | "evidence_usage"
  | "prediction_accuracy"
  | "strategic_strength"
  | "other";

export type StrategicPatternEvidenceRelationship =
  | "supports"
  | "partially_supports"
  | "contradicts"
  | "context_only";

export type StrategicPatternEvidenceReference = {
  id: string;
  decisionMemoryId: string;
  memoryEntryId?: string;
  experimentId?: string;
  outcomeId?: string;
  revisionId?: string;
  relationship: StrategicPatternEvidenceRelationship;
  summary: string;
  occurredAt: string;
  relevance: "low" | "moderate" | "high";
};

export type StrategicPatternUserResponse = {
  response: "accepted" | "dismissed" | "paused" | "needs_more_examples";
  note?: string;
  respondedAt: string;
};

/**
 * A pattern candidate or reviewed pattern.
 * Links to Strategic Memory by ID — does not copy full decision histories.
 */
export type StrategicPatternCandidate = {
  id: string;
  /** Optional until cloud identity exists — local V1 may omit. */
  userId?: string;
  category: StrategicPatternCategory;
  title: string;
  /** Warm, tentative observation — never “This is who you are.” */
  tentativeObservation: string;
  status: StrategicPatternStatus;
  confidence: StrategicPatternConfidence;
  evidenceReferences: StrategicPatternEvidenceReference[];
  counterexampleReferences: StrategicPatternEvidenceReference[];
  relevantDecisionCount: number;
  supportingDecisionCount: number;
  contradictingDecisionCount: number;
  firstObservedAt: string;
  lastObservedAt: string;
  detectionWindowStart: string;
  detectionWindowEnd: string;
  possibleStrategicMeaning?: string;
  possibleFutureUse?: string;
  userResponse?: StrategicPatternUserResponse;
  /** Default false — never silent opt-in. */
  useInFutureReasoning: boolean;
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string;
  detectorVersion: string;
  version: string;
};

export const STRATEGIC_PATTERN_MODEL_VERSION = "1";
export const STRATEGIC_PATTERN_DETECTOR_VERSION = "1";

/** Minimum supporting decisions before a pattern is ready for review. */
export const STRATEGIC_PATTERN_MIN_SUPPORTING = 3;
/** Soft floor for a low-confidence candidate. */
export const STRATEGIC_PATTERN_MIN_CANDIDATE = 2;
