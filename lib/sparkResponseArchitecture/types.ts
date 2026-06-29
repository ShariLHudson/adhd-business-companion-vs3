/**
 * Spark Response Architecture™ — runtime pipeline types.
 * Every member interaction flows through this lifecycle.
 *
 * @see spark-intelligence-foundation/006-spark-response-architecture.md
 */

/** Ten-stage Response Lifecycle™ */
export type SparkResponseLifecycleStage =
  | "intent_recognition"
  | "request_classification"
  | "minimum_viable_context"
  | "selective_system_activation"
  | "parallel_context_retrieval"
  | "guidance_and_reasoning"
  | "confidence_assessment"
  | "response_assembly"
  | "companion_delivery"
  | "background_learning";

export const SPARK_RESPONSE_LIFECYCLE_ORDER: readonly SparkResponseLifecycleStage[] = [
  "intent_recognition",
  "request_classification",
  "minimum_viable_context",
  "selective_system_activation",
  "parallel_context_retrieval",
  "guidance_and_reasoning",
  "confidence_assessment",
  "response_assembly",
  "companion_delivery",
  "background_learning",
] as const;

/** Request Classification™ response classes */
export type SparkResponseClass =
  | "A" // quick factual
  | "B" // business advice
  | "C" // creation
  | "D" // strategic reasoning
  | "E" // executive function support
  | "F"; // reflection

export const SPARK_RESPONSE_CLASS_LABELS: Record<SparkResponseClass, string> = {
  A: "Quick factual answer",
  B: "Business advice",
  C: "Creation",
  D: "Strategic reasoning",
  E: "Executive function support",
  F: "Reflection",
};

/** Response Modes™ — depth vs speed */
export type SparkResponseMode = "instant" | "guided" | "deep_strategy";

/** Principle 7 — confidence drives behavior */
export type SparkResponseConfidenceBand =
  | "high"
  | "medium"
  | "low"
  | "very_low";

export const SPARK_CONFIDENCE_BEHAVIOR: Record<
  SparkResponseConfidenceBand,
  "answer_directly" | "offer_alternatives" | "one_clarifying_question" | "state_uncertainty"
> = {
  high: "answer_directly",
  medium: "offer_alternatives",
  low: "one_clarifying_question",
  very_low: "state_uncertainty",
};

/** MVC retrieval slots (Stage 3) — see Spec 007 for six-tier context strategy */
export type SparkMvcRetrievalSlot =
  | "required"
  | "optional"
  | "deferred"
  | "predictive";

/** @deprecated Use SparkMvcRetrievalSlot or import from lib/sparkContextStrategy/types */
export type SparkContextTier = SparkMvcRetrievalSlot;

/** Selective System Activation™ states */
export type SparkSystemActivationState = "dormant" | "listening" | "active";

/** Performance Standards™ — latency budgets (ms) */
export const SPARK_RESPONSE_LATENCY_BUDGETS = {
  firstUiFeedback: 500,
  intentRecognition: 100,
  classification: 50,
  minimumViableContext: 150,
  firstMeaningfulResponse: 2000,
} as const;
