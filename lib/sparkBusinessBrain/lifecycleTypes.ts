/**
 * Business Brain™ Lifecycle Architecture — knowledge lifecycle, versioning, retrieval.
 * Brain stores and evolves; Context Strategy selects MVC for responses.
 *
 * @see spark-intelligence-foundation/009-business-brain-lifecycle.md
 * @see spark-intelligence-foundation/003-business-brain.md
 * @see docs/SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md (Spec 117)
 */

/** Business Knowledge Lifecycle™ — eight stages */
export type BusinessKnowledgeLifecycleStage =
  | "observed"
  | "candidate"
  | "verified"
  | "active"
  | "mature"
  | "historical"
  | "archived"
  | "retired";

export const BUSINESS_KNOWLEDGE_LIFECYCLE_ORDER: readonly BusinessKnowledgeLifecycleStage[] = [
  "observed",
  "candidate",
  "verified",
  "active",
  "mature",
  "historical",
  "archived",
  "retired",
] as const;

/** Default confidence band per lifecycle stage */
export const BUSINESS_KNOWLEDGE_STAGE_CONFIDENCE: Record<
  BusinessKnowledgeLifecycleStage,
  "very_low" | "low" | "high" | "foundational" | "reference" | "inactive" | "member_retired"
> = {
  observed: "very_low",
  candidate: "low",
  verified: "high",
  active: "high",
  mature: "foundational",
  historical: "reference",
  archived: "inactive",
  retired: "member_retired",
};

/** Freshness Model™ — retrieval priority, not storage */
export type BusinessKnowledgeFreshness =
  | "current"
  | "recent"
  | "aging"
  | "historical"
  | "archived";

/** Knowledge categories — each maintains its own lifecycle */
export type BusinessKnowledgeCategory =
  | "business_identity"
  | "business_model"
  | "offers"
  | "products"
  | "services"
  | "audience"
  | "messaging"
  | "pricing"
  | "goals"
  | "projects"
  | "processes"
  | "partnerships"
  | "marketing"
  | "sales"
  | "operations"
  | "vision"
  | "strategic_decisions"
  | "lessons_learned"
  | "business_preferences";

/** Business Versioning™ — phase snapshot (e.g. 2026 Coach → 2028 Software) */
export type BusinessPhaseVersion = {
  id: string;
  label: string;
  effectiveFrom: string;
  effectiveTo?: string;
  summary?: string;
  supersededById?: string;
};

/** Learning Rules™ — requires one or more signals unless explicit confirmation */
export type BusinessKnowledgeLearningSignal =
  | "member_confirmation"
  | "repeated_behavior"
  | "business_asset_created"
  | "project_completed"
  | "reinforcing_signals";

export const BUSINESS_KNOWLEDGE_MIN_LEARNING_SIGNALS = 1 as const;

/** Retrieval priority by lifecycle — retired never auto-retrieved */
export const BUSINESS_KNOWLEDGE_RETRIEVAL_PRIORITY: Record<
  BusinessKnowledgeLifecycleStage,
  "highest" | "high" | "medium" | "low" | "on_request" | "never_auto"
> = {
  observed: "low",
  candidate: "low",
  verified: "high",
  active: "highest",
  mature: "highest",
  historical: "medium",
  archived: "on_request",
  retired: "never_auto",
};

/** Conflict Resolution™ — do not overwrite; hold hypotheses */
export type BusinessKnowledgeConflict = {
  existingObjectId: string;
  competingHypothesisId: string;
  requiresConfirmation: boolean;
  preservedVersionIds: string[];
};

export type BusinessKnowledgeRecord = {
  id: string;
  category: BusinessKnowledgeCategory;
  lifecycleStage: BusinessKnowledgeLifecycleStage;
  freshness: BusinessKnowledgeFreshness;
  confidence: number;
  phaseVersionId?: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
  retiredAt?: string;
};
