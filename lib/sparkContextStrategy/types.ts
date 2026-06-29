/**
 * Context Strategy™ & Minimum Viable Context (MVC) types.
 * Intelligent context selection — not maximum retrieval.
 *
 * @see spark-intelligence-foundation/007-context-strategy.md
 * @see spark-intelligence-foundation/006-spark-response-architecture.md Stage 3
 */

/** Six context tiers — retrieval policy differs per tier. */
export type SparkContextTier =
  | "immediate" // Tier 1 — always available
  | "relationship" // Tier 2 — <50ms when personalization helps
  | "business" // Tier 3 — parallel when business reasoning required
  | "capability" // Tier 4 — on demand
  | "historical" // Tier 5 — deferred unless requested
  | "discovery"; // Tier 6 — post-response only

export const SPARK_CONTEXT_TIER_ORDER: readonly SparkContextTier[] = [
  "immediate",
  "relationship",
  "business",
  "capability",
  "historical",
  "discovery",
] as const;

export const SPARK_CONTEXT_TIER_RETRIEVAL: Record<
  SparkContextTier,
  "immediate" | "under_50ms" | "parallel" | "on_demand" | "deferred" | "post_response"
> = {
  immediate: "immediate",
  relationship: "under_50ms",
  business: "parallel",
  capability: "on_demand",
  historical: "deferred",
  discovery: "post_response",
};

/** Progressive Context Loading™ — only Phase 1 blocks generation */
export type SparkContextLoadPhase =
  | "required" // Phase 1
  | "helpful" // Phase 2 — async ok
  | "enrichment"; // Phase 3 — async ok

/** Context Priority Rules 1–6 */
export type SparkContextPriority =
  | 1 // current conversation
  | 2 // active business asset
  | 3 // current business goals
  | 4 // relationship preferences
  | 5 // relevant historical
  | 6; // everything else

/** Context Confidence™ — influences reasoning, not retrieval */
export type SparkContextConfidence =
  | "high"
  | "medium"
  | "low"
  | "unknown";

/** Context Freshness™ — affects priority, not availability */
export type SparkContextFreshness =
  | "current"
  | "aging"
  | "historical"
  | "archived"
  | "retired";

/** Context lifecycle — Brain retains; Response Engine prioritizes freshness */
export type SparkContextLifecycleState =
  | "current"
  | "active"
  | "historical"
  | "archived"
  | "retired";

/** Context Budget™ by response depth */
export type SparkContextBudgetProfile = "simple" | "moderate" | "complex_strategy";

export const SPARK_CONTEXT_BUDGET_LIMITS: Record<
  SparkContextBudgetProfile,
  { min: number; max: number }
> = {
  simple: { min: 2, max: 5 },
  moderate: { min: 5, max: 15 },
  complex_strategy: { min: 15, max: 30 },
};

/** MVC retrieval order — stop when sufficient confidence achieved */
export const SPARK_CONTEXT_RETRIEVAL_ORDER: readonly SparkContextTier[] =
  SPARK_CONTEXT_TIER_ORDER;

export type SparkMinimumViableContext = {
  /** Objects included in MVC for this turn */
  objectIds: string[];
  tiersLoaded: SparkContextTier[];
  phase: SparkContextLoadPhase;
  budgetProfile: SparkContextBudgetProfile;
  /** Stop further retrieval when true */
  sufficientConfidence: boolean;
};
