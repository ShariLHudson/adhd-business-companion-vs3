/**
 * Hidden Work Engine — The Iceberg (Spec 118).
 * Everything Spark quietly does while the member simply has a conversation.
 *
 * Philosophy: Spec 111 — SPARK_HOSPITALITY_ICEBERG_PRINCIPLE
 * Triggers: Spec 114 — lib/sparkConversationFlowEngine/types.ts
 * Memory class work: Spec 112 + 117
 * QA traces: Spec 116 — docs/conversation-gold-standards/
 *
 * @see docs/SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md
 */

export const HIDDEN_WORK_ENGINE_SPEC_ID = 118 as const;

export const HIDDEN_WORK_ICEBERG_PRINCIPLE =
  "Members see about 10% — conversation and clarity. Spark carries the submerged 90% in silence." as const;

export const HIDDEN_WORK_CORE_PRINCIPLE =
  "The member experiences clarity. Spark carries complexity — never busy, never blocking, never narrating bureaucracy." as const;

export const HIDDEN_WORK_FINAL_PRINCIPLE =
  "Looks incredibly simple. Works incredibly hard. The member talks; Spark carries the rest." as const;

/** Pipeline stages — response ships before async work */
export type HiddenWorkPipelineStage =
  | "member_message"
  | "sync_response"
  | "member_sees_response"
  | "async_enqueue"
  | "workers_execute"
  | "outcome_ready";

export const HIDDEN_WORK_PIPELINE: readonly HiddenWorkPipelineStage[] = [
  "member_message",
  "sync_response",
  "member_sees_response",
  "async_enqueue",
  "workers_execute",
  "outcome_ready",
] as const;

export type HiddenWorkItemStatus =
  | "detected"
  | "queued"
  | "running"
  | "completed"
  | "needs_permission"
  | "deferred"
  | "cancelled"
  | "failed_silent";

/** Complete hidden work taxonomy */
export type HiddenWorkCategory =
  | "brain_retrieve"
  | "brain_propose_write"
  | "brain_connect"
  | "win_capture"
  | "asset_organize"
  | "asset_create_prep"
  | "project_connect"
  | "autosave"
  | "research_prep"
  | "draft_prep"
  | "content_prep"
  | "gap_analysis"
  | "opportunity_scan"
  | "pattern_observe"
  | "anticipate_next";

export const HIDDEN_WORK_CATEGORIES: readonly {
  id: HiddenWorkCategory;
  title: string;
  domain: "memory" | "assets" | "creation" | "intelligence";
  defaultVisibility: HiddenWorkVisibility;
}[] = [
  { id: "brain_retrieve", title: "Retrieve Business Brain context", domain: "memory", defaultVisibility: "invisible" },
  { id: "brain_propose_write", title: "Propose Brain memory write", domain: "memory", defaultVisibility: "invisible" },
  { id: "brain_connect", title: "Connect via LIG / lineage", domain: "memory", defaultVisibility: "invisible" },
  { id: "win_capture", title: "Capture win / milestone", domain: "memory", defaultVisibility: "permission_gated" },
  { id: "asset_organize", title: "Organize Business Assets", domain: "assets", defaultVisibility: "invisible" },
  { id: "asset_create_prep", title: "Pre-stage asset template", domain: "assets", defaultVisibility: "permission_gated" },
  { id: "project_connect", title: "Connect to active project", domain: "assets", defaultVisibility: "invisible" },
  { id: "autosave", title: "Autosave conversation artifact", domain: "assets", defaultVisibility: "invisible" },
  { id: "research_prep", title: "Prepare research", domain: "creation", defaultVisibility: "invisible" },
  { id: "draft_prep", title: "Prepare draft", domain: "creation", defaultVisibility: "permission_gated" },
  { id: "content_prep", title: "Prepare social / content variants", domain: "creation", defaultVisibility: "permission_gated" },
  { id: "gap_analysis", title: "Identify missing information", domain: "intelligence", defaultVisibility: "invisible" },
  { id: "opportunity_scan", title: "Identify opportunity signal", domain: "intelligence", defaultVisibility: "deferred_surface" },
  { id: "pattern_observe", title: "Observe pattern candidate", domain: "intelligence", defaultVisibility: "invisible" },
  { id: "anticipate_next", title: "Anticipate next step / environment", domain: "intelligence", defaultVisibility: "invite_only" },
] as const;

export type HiddenWorkVisibility =
  | "invisible"
  | "permission_gated"
  | "invite_only"
  | "deferred_surface"
  | "frosted_reveal";

export type HiddenWorkItem = {
  id: string;
  turnId: string;
  userId: string;
  category: HiddenWorkCategory;
  status: HiddenWorkItemStatus;
  visibility: HiddenWorkVisibility;
  /** Why this work was enqueued — internal only */
  triggerReason: string;
  /** Flow mode that triggered work — Spec 114 */
  flowModeHint?: string;
  /** Outcome refs — asset id, draft id, proposal id */
  outcomeRef?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
};

export type HiddenWorkEnqueueRequest = {
  turnId: string;
  userId: string;
  memberMessage: string;
  flowMode?: string;
  confidence?: "low" | "medium" | "high";
  activeProjectId?: string;
  activeAssetId?: string;
  categories: HiddenWorkCategory[];
};

export type HiddenWorkTurnOutcome = {
  turnId: string;
  completed: HiddenWorkItem[];
  needsPermission: HiddenWorkItem[];
  deferred: HiddenWorkItem[];
  gapFindings?: string[];
};

export const HIDDEN_WORK_TRIGGER_QUESTIONS = [
  "Would this reduce repetition later?",
  "Did member choose research or create mode?",
  "Is there an active project or asset anchor?",
  "Did member share a win or milestone?",
  "Is confidence high enough to draft — but not show yet?",
  "Is critical info still missing?",
  "Would surfacing work add cognitive load now?",
] as const;

/** User-facing examples — what Spark may do while member talks */
export const HIDDEN_WORK_MEMBER_EXAMPLES = [
  "organize Business Assets",
  "prepare research",
  "connect related projects",
  "identify opportunities",
  "remember wins",
  "update Business Brain",
  "draft ideas",
  "prepare social posts",
  "identify missing information",
] as const;

/** Never show / never say */
export const HIDDEN_WORK_ANTI_PATTERNS = [
  "Spinner blocking conversation for background organization",
  "I'm organizing your assets / saving / processing",
  "To-do list of what Spark did behind the scenes",
  "Percent complete or progress bar for submerged work",
  "Failed job error surfaced in conversation",
  "Draft appears without permission",
  "Memory saved without Spec 112 consent",
] as const;

export const HIDDEN_WORK_SUCCESS_CRITERIA = [
  "Member never feels busy managing Spark",
  "Conversation never blocks on background work",
  "Prepared work surfaces only with permission",
  "Brain, assets, and projects stay organized without folders",
  "Research and drafts feel ready when you are",
  "Wins and connections accumulate quietly",
  "Gold-standard hidden-work traces match runtime behavior",
  "Competitive feel: Spark just handles things",
] as const;
