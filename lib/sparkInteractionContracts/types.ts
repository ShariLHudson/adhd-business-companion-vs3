/**
 * Interaction Contracts — system boundaries for Spark OS runtime.
 * One primary responsibility per system; communicate via published contracts only.
 *
 * @see spark-intelligence-foundation/008-interaction-contracts.md
 */

export type SparkRuntimeSystemId =
  | "business-brain"
  | "business-assets"
  | "guidance-engine"
  | "experience-engine"
  | "knowledge-graph"
  | "memory-architecture"
  | "response-orchestrator"
  | "companion"
  | "signal-bus";

/** Published contract shape — required before new system implementation */
export type SparkInteractionContract = {
  systemId: SparkRuntimeSystemId;
  /** Exactly one primary responsibility */
  primaryResponsibility: string;
  owns: readonly string[];
  consumes: readonly SparkRuntimeSystemId[];
  publishes: readonly string[];
  neverOwns: readonly string[];
  /** May read published outputs only — never mutate peer internal state */
  communicationRule: "published_contracts_only";
};

export const SPARK_INTERACTION_CONTRACTS: Record<
  SparkRuntimeSystemId,
  SparkInteractionContract
> = {
  "business-brain": {
    systemId: "business-brain",
    primaryResponsibility: "Understanding the member's business",
    owns: [
      "business identity",
      "offers",
      "services",
      "products",
      "goals",
      "projects",
      "business history",
      "business concept relationships",
    ],
    consumes: ["business-assets", "signal-bus", "memory-architecture"],
    publishes: [
      "business_context",
      "business_relationships",
      "business_facts",
      "confidence_levels",
    ],
    neverOwns: [
      "conversation",
      "ui",
      "response_generation",
      "decision_making",
      "emotional_adaptation",
    ],
    communicationRule: "published_contracts_only",
  },
  "business-assets": {
    systemId: "business-assets",
    primaryResponsibility: "Structured collection of business creations",
    owns: [
      "marketing assets",
      "sops",
      "websites",
      "courses",
      "emails",
      "frameworks",
      "presentations",
      "documents",
      "media",
      "products",
    ],
    consumes: ["business-brain", "signal-bus"],
    publishes: ["current_assets", "relationships", "versions", "metadata"],
    neverOwns: ["reasoning", "guidance", "conversation"],
    communicationRule: "published_contracts_only",
  },
  "guidance-engine": {
    systemId: "guidance-engine",
    primaryResponsibility: "Strategic reasoning and decision support",
    owns: [
      "recommendations",
      "priorities",
      "trade_offs",
      "next_possibilities",
      "decision_support",
    ],
    consumes: [
      "business-brain",
      "business-assets",
      "experience-engine",
      "knowledge-graph",
      "memory-architecture",
    ],
    publishes: [
      "structured_guidance",
      "decision_options",
      "recommended_actions",
      "reasoning_metadata",
      "confidence",
    ],
    neverOwns: ["conversation", "business_memory_storage", "business_assets_storage", "ui"],
    communicationRule: "published_contracts_only",
  },
  "experience-engine": {
    systemId: "experience-engine",
    primaryResponsibility: "Experience adaptation and presentation rules",
    owns: [
      "information_density",
      "pace",
      "tone_adjustments",
      "executive_function_support",
      "emotional_adaptation",
      "progressive_disclosure",
    ],
    consumes: ["signal-bus", "memory-architecture", "guidance-engine"],
    publishes: [
      "experience_directives",
      "presentation_rules",
      "cognitive_load_adjustments",
      "accessibility_adaptations",
    ],
    neverOwns: ["business_reasoning", "asset_creation", "knowledge_storage"],
    communicationRule: "published_contracts_only",
  },
  "knowledge-graph": {
    systemId: "knowledge-graph",
    primaryResponsibility: "Relationships between ecosystem objects",
    owns: ["relationship_maps", "connection_queries", "context_links"],
    consumes: ["business-brain", "business-assets", "signal-bus"],
    publishes: ["relationship_maps", "connection_queries", "context_links"],
    neverOwns: ["business_facts", "responses", "conversation"],
    communicationRule: "published_contracts_only",
  },
  "memory-architecture": {
    systemId: "memory-architecture",
    primaryResponsibility: "Memory lifecycle and retrieval rules",
    owns: ["storage", "freshness", "archiving", "retrieval_rules", "versioning"],
    consumes: ["signal-bus", "business-brain"],
    publishes: ["recall_bundles", "freshness_state", "archive_transitions"],
    neverOwns: ["reasoning", "guidance", "conversation"],
    communicationRule: "published_contracts_only",
  },
  "response-orchestrator": {
    systemId: "response-orchestrator",
    primaryResponsibility: "Runtime pipeline execution",
    owns: [
      "system_activation",
      "context_retrieval_coordination",
      "pipeline_execution",
      "parallel_processing",
      "response_flow",
    ],
    consumes: [
      "business-brain",
      "guidance-engine",
      "experience-engine",
      "memory-architecture",
      "knowledge-graph",
    ],
    publishes: ["pipeline_state", "activation_map", "orchestration_complete"],
    neverOwns: [
      "business_knowledge",
      "guidance_reasoning",
      "experience_rules",
      "conversation_text",
    ],
    communicationRule: "published_contracts_only",
  },
  companion: {
    systemId: "companion",
    primaryResponsibility: "Member-facing communication",
    owns: [
      "voice",
      "clarity",
      "encouragement",
      "trust_experience",
      "natural_language",
    ],
    consumes: ["guidance-engine", "experience-engine", "business-brain"],
    publishes: ["member_facing_responses"],
    neverOwns: ["reasoning", "business_knowledge_storage", "memory_storage", "guidance_generation"],
    communicationRule: "published_contracts_only",
  },
  "signal-bus": {
    systemId: "signal-bus",
    primaryResponsibility: "Asynchronous inter-system events",
    owns: ["event_routing", "subscriber_delivery"],
    consumes: [
      "business-brain",
      "business-assets",
      "guidance-engine",
      "experience-engine",
      "memory-architecture",
      "response-orchestrator",
      "companion",
    ],
    publishes: ["routed_signals"],
    neverOwns: ["business_facts", "member_facing_copy"],
    communicationRule: "published_contracts_only",
  },
};

/** Canonical runtime flow — only Companion speaks to the member */
export const SPARK_RUNTIME_FLOW: readonly SparkRuntimeSystemId[] = [
  "business-brain",
  "knowledge-graph",
  "guidance-engine",
  "experience-engine",
  "companion",
] as const;

/** Forbidden interactions — hard architectural boundaries */
export const SPARK_FORBIDDEN_INTERACTIONS: readonly {
  system: SparkRuntimeSystemId;
  forbidden: string;
}[] = [
  { system: "business-brain", forbidden: "direct_ui_communication" },
  { system: "companion", forbidden: "mutate_business_brain_internal_state" },
  { system: "experience-engine", forbidden: "business_reasoning" },
  { system: "guidance-engine", forbidden: "generate_conversation_text" },
  { system: "business-assets", forbidden: "determine_recommendations" },
  { system: "knowledge-graph", forbidden: "own_business_facts" },
] as const;
