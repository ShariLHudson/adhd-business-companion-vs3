/**
 * 103 — Anywhere-Origin Universal Launch Contract.
 * One contract · one resolution sequence · one canonical Work ID.
 */

import type {
  AnywhereWorkOrigin,
  BlueprintDepthMode,
  CanonicalWorkId,
  WorkOrigin,
  WorkRelationshipKind,
} from "../types";

/** Talk-only never mutates Work. Work-on-this requires approval before apply. */
export type ShariWorkMode = "talk_only" | "work_on_this";

export type UniversalLaunchRequestedMode =
  | "structured_work"
  | "talk_only"
  | "research_only"
  | "support_only"
  | "body_doubling"
  | "review_only";

/**
 * Authoritative launch contract — every origin builds one of these.
 * Technical fields stay internal; member copy comes from resolution.reply.
 */
export type UniversalLaunchContract = {
  origin: AnywhereWorkOrigin;
  userIntent?: string | null;
  originalUserMessage?: string | null;
  candidateWorkTypeId?: string | null;
  candidateBlueprintId?: string | null;
  relatedWorkId?: CanonicalWorkId | string | null;
  projectId?: string | null;
  sectionId?: string | null;
  taskId?: string | null;
  cartographyNodeId?: string | null;
  conversationId?: string | null;
  chamberMemberId?: string | null;
  boardReviewId?: string | null;
  researchRecordId?: string | null;
  bodyDoublingSessionId?: string | null;
  clearMyMindThoughtId?: string | null;
  knownContext?: Readonly<Record<string, string>>;
  requestedMode?: UniversalLaunchRequestedMode | null;
  requestedDepth?: BlueprintDepthMode | null;
  /** Shari conversation mode — talk_only never mutates. */
  shariMode?: ShariWorkMode | null;
  /** Explicit new-copy intent — skips continue/connect auto-merge. */
  forceNew?: boolean;
  /** When true, clustered CMM thoughts may create multiple Work only with confirm. */
  confirmMultiCreate?: boolean;
  /** Board/Chamber/Research must not silently rewrite Work. */
  applyApproved?: boolean;
};

export type AnywhereOriginDecision =
  | "continue_existing"
  | "connect_existing"
  | "create_new"
  | "conversation_support_only"
  | "clarify"
  | "awaiting_approval";

export type DuplicateRiskSignal =
  | "same_work_type"
  | "similar_title_or_intent"
  | "related_project"
  | "related_blueprint"
  | "related_conversation"
  | "recent_creation"
  | "active_incomplete"
  | "matching_source_content"
  | "matching_cartography_node"
  | "matching_chamber_or_board"
  | "hinted_work_id";

export type DuplicateRiskAssessment = {
  riskLevel: "none" | "possible" | "likely";
  signals: readonly DuplicateRiskSignal[];
  candidateWorkId: CanonicalWorkId | null;
  candidateTitle: string | null;
};

export type AnywhereOriginAttachedRelationship = {
  kind: WorkRelationshipKind;
  targetType: string;
  targetId: string;
  note?: string | null;
};

export type AnywhereOriginResolution = {
  decision: AnywhereOriginDecision;
  workId: CanonicalWorkId | null;
  workTypeId: string | null;
  blueprintId: string | null;
  depthMode: BlueprintDepthMode | null;
  sectionId: string | null;
  origin: WorkOrigin;
  preventedDuplicate: boolean;
  duplicateRisk: DuplicateRiskAssessment;
  attachedRelationships: readonly AnywhereOriginAttachedRelationship[];
  /** True when Shari talk-only — no Work mutation occurred. */
  talkOnly: boolean;
  /** True when Board/Chamber/Research/Shari work awaits approval. */
  awaitingApproval: boolean;
  /** Member-facing reply — no architecture jargon. */
  reply: string;
  /** Internal note — never show to member. */
  routingNote: string;
  /** Open universal Blueprint interface / Create at this focus. */
  openUniversalInterface: boolean;
};

export type ResolveAnywhereOriginOptions = {
  /** Injected now for tests; defaults to Date.now(). */
  nowMs?: number;
};
