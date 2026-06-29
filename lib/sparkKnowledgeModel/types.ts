/**
 * Spark Knowledge Model™ — canonical knowledge categories for Spark OS.
 * Common language for every intelligence system; not storage or retrieval logic.
 *
 * @see spark-intelligence-foundation/004-spark-knowledge-model.md
 */

/** Nine knowledge categories — each with distinct lifecycle and primary owner. */
export type SparkKnowledgeCategory =
  | "business"
  | "asset"
  | "member"
  | "historical"
  | "relationship"
  | "strategic"
  | "reflection"
  | "experience"
  | "system";

export const SPARK_KNOWLEDGE_CATEGORY_LABELS: Record<SparkKnowledgeCategory, string> = {
  business: "Business Knowledge",
  asset: "Asset Knowledge",
  member: "Member Knowledge",
  historical: "Historical Knowledge",
  relationship: "Relationship Knowledge",
  strategic: "Strategic Knowledge",
  reflection: "Reflection Knowledge",
  experience: "Experience Knowledge",
  system: "System Knowledge",
};

/** Confidence levels — influence clarification vs proceed-with-assumption. */
export type SparkKnowledgeConfidence =
  | "confirmed"
  | "observed"
  | "inferred"
  | "hypothesis";

export const SPARK_KNOWLEDGE_CONFIDENCE_LABELS: Record<SparkKnowledgeConfidence, string> = {
  confirmed: "Confirmed",
  observed: "Observed",
  inferred: "Inferred",
  hypothesis: "Hypothesis",
};

/** Primary owner per category — one owner, no duplication. */
export type SparkKnowledgeOwner =
  | "business-brain"
  | "business-asset"
  | "experience-engine"
  | "gallery"
  | "knowledge-graph"
  | "guidance-engine"
  | "growth"
  | "companion"
  | "internal-architecture"
  | "communication-intelligence";

export const SPARK_KNOWLEDGE_PRIMARY_OWNER: Record<
  SparkKnowledgeCategory,
  SparkKnowledgeOwner
> = {
  business: "business-brain",
  asset: "business-asset",
  member: "business-brain",
  historical: "gallery",
  relationship: "knowledge-graph",
  strategic: "business-brain",
  reflection: "growth",
  experience: "experience-engine",
  system: "internal-architecture",
};

/** Categories where secondary owners may also write (explicit co-ownership). */
export const SPARK_KNOWLEDGE_SECONDARY_OWNERS: Partial<
  Record<SparkKnowledgeCategory, SparkKnowledgeOwner[]>
> = {
  member: ["communication-intelligence"],
  historical: ["business-brain"],
  strategic: ["guidance-engine"],
  reflection: ["companion"],
};
