/**
 * Business Brain Memory & Retrieval (Spec 117).
 * Knowledge architecture — remember, connect, organize, retrieve, dedupe, pattern, forget.
 *
 * OS layer: spark-intelligence-foundation/003-business-brain.md
 * Lifecycle: lib/sparkBusinessBrain/lifecycleTypes.ts
 * Trust & permission: Spec 112 — lib/sparkCompanionMemory/types.ts
 * MVC retrieval: spark-intelligence-foundation/007-context-strategy.md
 *
 * @see docs/SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md
 */

import type { BusinessKnowledgeFreshness, BusinessKnowledgeLifecycleStage } from "./lifecycleTypes";

export const BUSINESS_BRAIN_MEMORY_RETRIEVAL_SPEC_ID = 117 as const;

export const BUSINESS_BRAIN_MEMORY_CORE_PRINCIPLE =
  "The Business Brain is not a database. It is a living map of how this business thinks, builds, decides, and evolves." as const;

export const BUSINESS_BRAIN_NATURAL_RETRIEVAL_PRINCIPLE =
  "Retrieval should feel like a partner who already did the homework — not like search results." as const;

export const BUSINESS_BRAIN_PATTERN_ETHICS =
  "Patterns are observations — never conclusions about the member." as const;

/** Five gates before durable memory */
export type BusinessBrainRememberingPipelineStage =
  | "signal_detected"
  | "trust_gate"
  | "classification"
  | "lifecycle_assignment"
  | "connection"
  | "permission";

export const BUSINESS_BRAIN_REMEMBERING_PIPELINE: readonly BusinessBrainRememberingPipelineStage[] =
  [
    "signal_detected",
    "trust_gate",
    "classification",
    "lifecycle_assignment",
    "connection",
    "permission",
  ] as const;

export type BusinessBrainMemoryProvenance =
  | "member_stated"
  | "member_confirmed"
  | "observed"
  | "imported";

export type BusinessBrainMemoryWriteKind =
  | "proposal"
  | "confirmation"
  | "direct"
  | "archive"
  | "retire";

/** Three connection layers — not folders */
export type BusinessBrainConnectionLayer = "lineage" | "lig" | "asset_anchor";

export type BusinessBrainKnowledgeEdgeType =
  | "evolved_from"
  | "supports"
  | "decided_in"
  | "references"
  | "same_topic"
  | "supersedes"
  | "pattern_of";

/** Internal clustering — invisible to member */
export type BusinessBrainOrganizationDimension =
  | "category"
  | "lifecycle_stage"
  | "freshness"
  | "asset_anchor"
  | "project_scope"
  | "semantic_proximity"
  | "temporal_season";

/** Visible organization metaphors */
export type BusinessBrainOrganizationMetaphor =
  | "companion_box"
  | "business_asset"
  | "project"
  | "memory_center"
  | "living_intelligence_graph";

export const BUSINESS_BRAIN_ORGANIZATION_METAPHORS: readonly {
  id: BusinessBrainOrganizationMetaphor;
  memberVisible: boolean;
  title: string;
}[] = [
  { id: "companion_box", memberVisible: true, title: "Companion Boxes" },
  { id: "business_asset", memberVisible: true, title: "Business Assets" },
  { id: "project", memberVisible: true, title: "Projects" },
  { id: "memory_center", memberVisible: true, title: "Memory Center" },
  { id: "living_intelligence_graph", memberVisible: false, title: "Living Intelligence Graph" },
] as const;

export type BusinessBrainRetrievalScope =
  | "conversation_turn"
  | "active_project"
  | "active_asset"
  | "business_profile"
  | "historical_context"
  | "pattern_hint";

export type BusinessBrainRetrievalQuery = {
  userId: string;
  turnId: string;
  scopes: BusinessBrainRetrievalScope[];
  activeAssetId?: string;
  activeProjectId?: string;
  activeRoomId?: string;
  intentHint?: string;
  maxRecords: number;
};

export type BusinessBrainRetrievedRecord = {
  id: string;
  key: string;
  displaySummary: string;
  lifecycleStage: BusinessKnowledgeLifecycleStage;
  freshness: BusinessKnowledgeFreshness;
  confidence: number;
  provenance: BusinessBrainMemoryProvenance;
  connectionIds: string[];
  assetAnchorId?: string;
};

export type BusinessBrainRetrievalBundle = {
  query: BusinessBrainRetrievalQuery;
  records: BusinessBrainRetrievedRecord[];
  staleRecordIds: string[];
  missingCanonicalKeys: string[];
  generatedAt: string;
};

export type BusinessBrainDuplicateCheckResult =
  | { outcome: "new" }
  | { outcome: "strengthen"; existingId: string }
  | { outcome: "version"; supersededId: string; newPhaseId: string }
  | { outcome: "conflict"; existingId: string; competingId: string }
  | { outcome: "merge_proposal"; targetId: string; sourceId: string };

export type BusinessBrainPatternKind =
  | "recurring_challenge"
  | "emerging_strength"
  | "seasonal_rhythm"
  | "strategy_signal"
  | "knowledge_gap";

export type BusinessBrainPatternConfidence = "tentative" | "emerging" | "consistent";

export type BusinessBrainPatternObservation = {
  id: string;
  patternKind: BusinessBrainPatternKind;
  confidence: BusinessBrainPatternConfidence;
  evidenceObjectIds: string[];
  lifecycleStage: "observed" | "candidate";
  memberConfirmed: boolean;
  lastSurfacedAt?: string;
  summary: string;
};

export type BusinessBrainForgettingAction =
  | "ignore"
  | "decay"
  | "archive"
  | "historical"
  | "retire";

export const BUSINESS_BRAIN_FORGETTING_SPECTRUM: readonly {
  action: BusinessBrainForgettingAction;
  when: string;
}[] = [
  { action: "ignore", when: "Session chatter, transient emotion" },
  { action: "decay", when: "Candidate never reinforced" },
  { action: "archive", when: "Completed project, old launch" },
  { action: "historical", when: "Superseded but valuable" },
  { action: "retire", when: "Member deleted or ended" },
] as const;

/** Natural vs robotic recall examples */
export const BUSINESS_BRAIN_RECALL_LANGUAGE = {
  natural: [
    "Last time we decided your workshop audience is nonprofit leaders.",
    "I thought this might save us a little time.",
  ],
  robotic: [
    "According to my records...",
    "I remembered that you...",
    "I remember everything you've ever said.",
  ],
} as const;

export const BUSINESS_BRAIN_MEMORY_SUCCESS_CRITERIA = [
  "Members rarely repeat business facts",
  "Related ideas stay connected without manual filing",
  "No folder-management burden",
  "Recall feels natural — not robotic or surveillance-like",
  "Duplicates merge or version — not multiply",
  "Patterns support gently — never label or shame",
  "Brain grows in wisdom, not noise",
  "Every engine reads consistent knowledge shape",
] as const;

/** Seven questions this spec answers */
export const BUSINESS_BRAIN_MEMORY_SEVEN_QUESTIONS = [
  "How does Spark remember?",
  "How does it connect ideas?",
  "How does it organize without folders?",
  "How does it retrieve naturally?",
  "How does it avoid duplicates?",
  "How does it recognize patterns?",
  "How does it remember what matters while forgetting what doesn't?",
] as const;
