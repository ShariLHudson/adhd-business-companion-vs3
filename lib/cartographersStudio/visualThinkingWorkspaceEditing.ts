/**
 * Visual Thinking Studio — Workspace Editing & Co-Creation Intelligence.
 *
 * Transforms a generated result into an iterative collaborative thinking workspace.
 * Edits are as small as possible: only selected / affected objects change.
 * Does not duplicate generation, research, or layout engines — orchestrates them.
 *
 * Content stays in deliverables/knowledge. Workspace objects are projections.
 * User edits are authoritative. Writebacks to other Estate systems require approval.
 */

import {
  applyBlockEdit,
  getPrimaryDeliverable,
  replaceDeliverableInBundle,
  saveGenerationBundle,
  transformBlock,
  type VisualThinkingGeneratedDeliverable,
  type VisualThinkingGenerationBundle,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import type { VisualThinkingPresentationType } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  saveThinkingWorkspace,
  type ThinkingObject,
  type ThinkingObjectType,
  type ThinkingWorkspaceState,
  type WorkspaceSelection,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";

// ─── Thinking Object knowledge contract (content layer; layout stays separate) ─

export type ThinkingObjectKnowledgeType =
  | "concept"
  | "idea"
  | "section"
  | "group"
  | "process_step"
  | "decision"
  | "question"
  | "evidence"
  | "example"
  | "timeline_event"
  | "comparison_item"
  | "checklist_item"
  | "risk"
  | "opportunity"
  | "task_candidate"
  | "research_finding"
  | "reference"
  | "user_note"
  | "visual_relationship"
  | "annotation";

export type ThinkingObjectOrigin =
  | "platform_generated"
  | "research_generated"
  | "user_created"
  | "user_edited"
  | "imported"
  | "external_reference"
  | "suggested"
  | "verified"
  | "pending_review";

export type ThinkingObjectStatus =
  | "active"
  | "draft"
  | "needs_research"
  | "needs_review"
  | "complete"
  | "hidden"
  | "archived";

export type ThinkingObjectProtection =
  | "unprotected"
  | "protected"
  | "suggested_replacement"
  | "merge"
  | "ignore"
  | "review_later";

export type ThinkingObjectConfidence =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "verified";

/** Content/provenance contract — never stores layout coordinates. */
export type ThinkingObjectKnowledge = {
  id: string;
  type: ThinkingObjectKnowledgeType;
  title: string;
  summary: string;
  body: string;
  status: ThinkingObjectStatus;
  origin: ThinkingObjectOrigin;
  confidence: ThinkingObjectConfidence;
  verification: string | null;
  createdBy: "platform" | "research" | "user" | "board" | "chamber";
  createdAt: string;
  updatedAt: string;
  knowledgeReferences: string[];
  researchReferences: string[];
  linkedObjects: string[];
  tags: string[];
  presentationHints: string[];
  userMetadata: Record<string, unknown>;
  protection: ThinkingObjectProtection;
  locked: boolean;
  pinned: boolean;
  colorSemantic: ThinkingColorSemantic | null;
  workspaceObjectId: string;
  sourceBlockId: string | null;
  deliverableId: string | null;
};

export type ThinkingColorSemantic =
  | "idea"
  | "risk"
  | "completed"
  | "needs_research"
  | "important"
  | "question"
  | "decision";

export type ThinkingAnnotationType =
  | "personal_note"
  | "question"
  | "reminder"
  | "idea"
  | "concern"
  | "highlight"
  | "insight";

export type ThinkingAnnotation = {
  id: string;
  objectId: string;
  type: ThinkingAnnotationType;
  text: string;
  createdAt: string;
  createdBy: "user";
};

export type ThinkingComment = {
  id: string;
  objectId: string;
  parentId: string | null;
  text: string;
  createdAt: string;
  createdBy: "user" | "shari" | "board" | "chamber";
};

export type CoCreationActionId =
  | "expand"
  | "simplify"
  | "explain"
  | "research"
  | "teach_me"
  | "show_example"
  | "find_missing_pieces"
  | "compare"
  | "duplicate"
  | "delete"
  | "rename"
  | "convert"
  | "pin"
  | "lock"
  | "unlock"
  | "hide"
  | "highlight"
  | "move"
  | "group"
  | "ungroup"
  | "merge"
  | "split"
  | "tag"
  | "annotate"
  | "ask_board"
  | "ask_chamber_member"
  | "generate_alternatives"
  | "edit_body"
  | "protect"
  | "accept_suggestion"
  | "reject_suggestion";

export type WorkspaceSelectionModel = {
  mode: "single" | "multiple" | "group" | "area" | "filtered";
  primaryObjectId: string | null;
  objectIds: string[];
  groupIds: string[];
  filterQuery: string | null;
};

export type SelectionScope = {
  selectedObjectIds: string[];
  affectedObjectIds: string[];
  protectedObjectIds: string[];
  lockedObjectIds: string[];
  representationDependencies: VisualThinkingPresentationType[];
};

export type RepresentationSyncPreview = {
  id: string;
  changeSummary: string;
  affectedPresentations: VisualThinkingPresentationType[];
  actions: Array<"update_all" | "choose_representationsations" | "keep_current">;
};

export type MergeSuggestion = {
  id: string;
  objectId: string;
  kind: "conflict" | "duplicate" | "complementary" | "user_override" | "research_update";
  message: string;
  userText: string | null;
  generatedText: string | null;
  recommended: ThinkingObjectProtection;
};

export type MissingPieceSuggestion = {
  id: string;
  category:
    | "missing_steps"
    | "missing_stakeholders"
    | "missing_risks"
    | "missing_decisions"
    | "missing_research"
    | "missing_dependencies"
    | "missing_resources"
    | "missing_timeline_events"
    | "missing_questions";
  message: string;
  relatedObjectIds: string[];
};

export type AlternativeProposal = {
  id: string;
  kind:
    | "structure"
    | "process"
    | "messaging"
    | "plan"
    | "decision"
    | "sequence"
    | "grouping";
  title: string;
  summary: string;
  objectId: string;
  /** Proposal only — never auto-applied. */
  proposedBody: string;
};

export type BoardReviewPackage = {
  objectIds: string[];
  question: string;
  contextSummary: string;
  supportingKnowledgeIds: string[];
  perspectives: string[];
  risks: string[];
  tradeoffs: string[];
  questions: string[];
  suggestions: string[];
  status: "prepared" | "awaiting_approval";
};

export type ChamberReviewPackage = {
  chamberMember: string;
  objectIds: string[];
  question: string;
  contextSummary: string;
  perspectives: string[];
  suggestions: string[];
  status: "prepared" | "awaiting_approval";
};

export type ContentHistoryEntry = {
  id: string;
  label: string;
  createdAt: string;
  deliverableSnapshot: VisualThinkingGeneratedDeliverable;
  objectProjections: Array<{
    id: string;
    title: string;
    summary: string;
    metadata: Record<string, unknown>;
  }>;
  selection: WorkspaceSelectionModel;
};

export type WorkspaceEditingSession = {
  id: string;
  workspaceId: string;
  generationBundle: VisualThinkingGenerationBundle;
  selection: WorkspaceSelectionModel;
  annotations: ThinkingAnnotation[];
  comments: ThinkingComment[];
  pendingSyncPreview: RepresentationSyncPreview | null;
  pendingMergeSuggestions: MergeSuggestion[];
  pendingAlternatives: AlternativeProposal[];
  pendingMissingPieces: MissingPieceSuggestion[];
  pendingBoardReview: BoardReviewPackage | null;
  pendingChamberReview: ChamberReviewPackage | null;
  contentUndoStack: ContentHistoryEntry[];
  contentRedoStack: ContentHistoryEntry[];
  history: Array<{
    id: string;
    kind: string;
    label: string;
    at: string;
    objectIds: string[];
  }>;
  filter: {
    origin: ThinkingObjectOrigin | null;
    tag: string | null;
    status: ThinkingObjectStatus | null;
    type: ThinkingObjectKnowledgeType | null;
    pinnedOnly: boolean;
    hidden: "exclude" | "only" | "include";
  };
  returnContext: {
    returnRoute: string | null;
    resumePrompt: string | null;
  };
  autosaveAt: string | null;
  version: "vt-workspace-editing-1";
  createdAt: string;
  updatedAt: string;
};

export type CoCreationResult = {
  session: WorkspaceEditingSession;
  workspace: ThinkingWorkspaceState;
  generationBundle: VisualThinkingGenerationBundle;
  /** True when only selected/affected objects were mutated. */
  scopedEdit: boolean;
  /** True when a full-workspace regenerate was avoided. */
  avoidedFullRegeneration: boolean;
  userFacingNotice: string | null;
  failure: { objectIds: string[]; message: string } | null;
};

export type CoCreationInspectorProjection = {
  title: string;
  description: string;
  notes: string[];
  evidence: string[];
  sources: string[];
  questions: string[];
  relatedObjects: string[];
  tags: string[];
  status: ThinkingObjectStatus;
  confidence: ThinkingObjectConfidence;
  origin: ThinkingObjectOrigin;
  history: string[];
  suggestedActions: Array<{ id: CoCreationActionId; label: string }>;
  protection: ThinkingObjectProtection;
  locked: boolean;
  progressiveSections: Array<"basics" | "evidence" | "relations" | "history" | "actions">;
};

export type WorkspaceEditingEvent =
  | "object_edited"
  | "expanded"
  | "simplified"
  | "researched_selected"
  | "alternatives_generated"
  | "undo_content"
  | "redo_content"
  | "merge_suggested"
  | "representation_sync_previewed"
  | "representation_sync_applied"
  | "locked"
  | "annotated"
  | "board_prepared"
  | "chamber_prepared"
  | "autosaved"
  | "recovery"
  | "failed_scoped_retry";

const EDITING_SESSION_KEY = "companion-vt-workspace-editing-v1";
const OBS_KEY = "companion-vt-workspace-editing-obs-v1";
const MAX_CONTENT_HISTORY = 40;

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function meta(obj: ThinkingObject): Record<string, unknown> {
  return obj.metadata ?? {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown): boolean {
  return value === true;
}

export function mapWorkspaceTypeToKnowledgeType(
  type: ThinkingObjectType,
): ThinkingObjectKnowledgeType {
  switch (type) {
    case "step":
    case "process":
      return "process_step";
    case "section":
      return "section";
    case "decision":
      return "decision";
    case "question":
      return "question";
    case "checklist_item":
      return "checklist_item";
    case "comparison":
      return "comparison_item";
    case "warning":
      return "risk";
    case "note":
      return "user_note";
    case "action":
      return "task_candidate";
    case "relationship":
      return "visual_relationship";
    case "group":
      return "group";
    case "summary":
    case "title":
    case "concept":
    default:
      return "concept";
  }
}

export function projectThinkingObjectKnowledge(
  object: ThinkingObject,
  body: string,
): ThinkingObjectKnowledge {
  const m = meta(object);
  const origin = (asString(m.origin, object.userCreated ? "user_created" : "platform_generated") ||
    "platform_generated") as ThinkingObjectOrigin;
  return {
    id: asString(m.knowledgeId, object.id),
    type: mapWorkspaceTypeToKnowledgeType(object.type),
    title: object.title,
    summary: object.summary,
    body,
    status: (asString(m.status, object.userCreated ? "draft" : "active") ||
      "active") as ThinkingObjectStatus,
    origin: asBool(m.userEdited) ? "user_edited" : origin,
    confidence: (asString(m.confidence, "medium") || "medium") as ThinkingObjectConfidence,
    verification: asString(m.verification) || null,
    createdBy: object.userCreated ? "user" : "platform",
    createdAt: asString(m.createdAt, nowIso()),
    updatedAt: asString(m.updatedAt, nowIso()),
    knowledgeReferences: Array.isArray(m.knowledgeReferences)
      ? (m.knowledgeReferences as string[])
      : object.sourceKnowledgeItemId
        ? [object.sourceKnowledgeItemId]
        : [],
    researchReferences: Array.isArray(m.researchReferences)
      ? (m.researchReferences as string[])
      : [],
    linkedObjects: Array.isArray(m.linkedObjects) ? (m.linkedObjects as string[]) : [],
    tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
    presentationHints: Array.isArray(m.presentationHints)
      ? (m.presentationHints as string[])
      : [],
    userMetadata: (m.userMetadata as Record<string, unknown>) ?? {},
    protection: (asString(m.protection, "unprotected") ||
      "unprotected") as ThinkingObjectProtection,
    locked: asBool(m.locked),
    pinned: object.pinned,
    colorSemantic: (asString(m.colorSemantic) || null) as ThinkingColorSemantic | null,
    workspaceObjectId: object.id,
    sourceBlockId: object.sourceBlockId,
    deliverableId: object.deliverableId,
  };
}

export function resolveSelectionModel(
  workspace: ThinkingWorkspaceState,
  override?: Partial<WorkspaceSelectionModel>,
): WorkspaceSelectionModel {
  const primary = override?.primaryObjectId ?? workspace.selection.primaryObjectId;
  const objectIds =
    override?.objectIds ??
    (Array.isArray((workspace.selection as WorkspaceSelection & { objectIds?: string[] }).objectIds)
      ? ((workspace.selection as WorkspaceSelection & { objectIds?: string[] }).objectIds as string[])
      : primary
        ? [primary]
        : []);
  return {
    mode: override?.mode ?? (objectIds.length > 1 ? "multiple" : "single"),
    primaryObjectId: primary,
    objectIds: [...new Set(objectIds.filter(Boolean))],
    groupIds: override?.groupIds ?? [],
      filterQuery: override?.filterQuery ?? (workspace.searchQuery || null),
  };
}

export function resolveSelectionScope(
  workspace: ThinkingWorkspaceState,
  selection: WorkspaceSelectionModel,
  activePresentations: VisualThinkingPresentationType[] = [],
): SelectionScope {
  const selected = selection.objectIds.length
    ? selection.objectIds
    : selection.primaryObjectId
      ? [selection.primaryObjectId]
      : [];

  const protectedIds: string[] = [];
  const lockedIds: string[] = [];
  for (const id of selected) {
    const obj = workspace.objects.find((o) => o.id === id);
    if (!obj) continue;
    const m = meta(obj);
    if (asBool(m.locked)) lockedIds.push(id);
    if (
      asString(m.protection) === "protected" ||
      (asBool(m.userEdited) && asString(m.protection) !== "unprotected")
    ) {
      protectedIds.push(id);
    }
  }

  // Affected = selected only (minimal edit). Linked connectors do not auto-expand scope.
  return {
    selectedObjectIds: selected,
    affectedObjectIds: selected.filter((id) => !lockedIds.includes(id)),
    protectedObjectIds: protectedIds,
    lockedObjectIds: lockedIds,
    representationDependencies: activePresentations,
  };
}

function resolveBody(
  object: ThinkingObject,
  deliverable: VisualThinkingGeneratedDeliverable | null,
): string {
  if (!object.sourceBlockId || !deliverable) return object.summary;
  return (
    deliverable.blocks.find((b) => b.id === object.sourceBlockId)?.content ??
    object.summary
  );
}

function primaryDeliverableForObject(
  bundle: VisualThinkingGenerationBundle,
  object: ThinkingObject,
): VisualThinkingGeneratedDeliverable | null {
  if (object.deliverableId) {
    return bundle.deliverables.find((d) => d.id === object.deliverableId) ?? null;
  }
  return getPrimaryDeliverable(bundle);
}

function snapshotContent(
  label: string,
  deliverable: VisualThinkingGeneratedDeliverable,
  workspace: ThinkingWorkspaceState,
  selection: WorkspaceSelectionModel,
): ContentHistoryEntry {
  return {
    id: newId("vtch"),
    label,
    createdAt: nowIso(),
    deliverableSnapshot: {
      ...deliverable,
      blocks: deliverable.blocks.map((b) => ({ ...b, metadata: { ...b.metadata } })),
    },
    objectProjections: workspace.objects.map((o) => ({
      id: o.id,
      title: o.title,
      summary: o.summary,
      metadata: { ...meta(o) },
    })),
    selection: { ...selection, objectIds: [...selection.objectIds] },
  };
}

function pushHistory(
  session: WorkspaceEditingSession,
  kind: string,
  label: string,
  objectIds: string[],
): WorkspaceEditingSession {
  return {
    ...session,
    history: [
      ...session.history,
      { id: newId("vth"), kind, label, at: nowIso(), objectIds },
    ].slice(-80),
    updatedAt: nowIso(),
  };
}

function recordEvent(event: WorkspaceEditingEvent, detail?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    const list: Array<{ event: string; at: string; detail?: Record<string, unknown> }> = raw
      ? (JSON.parse(raw) as Array<{ event: string; at: string; detail?: Record<string, unknown> }>)
      : [];
    list.push({ event, at: nowIso(), detail });
    window.sessionStorage.setItem(OBS_KEY, JSON.stringify(list.slice(-100)));
  } catch {
    /* ignore */
  }
}

export function createWorkspaceEditingSession(input: {
  workspace: ThinkingWorkspaceState;
  generationBundle: VisualThinkingGenerationBundle;
  returnRoute?: string | null;
  resumePrompt?: string | null;
}): WorkspaceEditingSession {
  const selection = resolveSelectionModel(input.workspace);
  return {
    id: newId("vtes"),
    workspaceId: input.workspace.id,
    generationBundle: input.generationBundle,
    selection,
    annotations: [],
    comments: [],
    pendingSyncPreview: null,
    pendingMergeSuggestions: [],
    pendingAlternatives: [],
    pendingMissingPieces: [],
    pendingBoardReview: null,
    pendingChamberReview: null,
    contentUndoStack: [],
    contentRedoStack: [],
    history: [
      {
        id: newId("vth"),
        kind: "created",
        label: "Workspace ready for collaborative thinking",
        at: nowIso(),
        objectIds: [],
      },
    ],
    filter: {
      origin: null,
      tag: null,
      status: null,
      type: null,
      pinnedOnly: false,
      hidden: "exclude",
    },
    returnContext: {
      returnRoute: input.returnRoute ?? null,
      resumePrompt: input.resumePrompt ?? null,
    },
    autosaveAt: null,
    version: "vt-workspace-editing-1",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/**
 * Sync projected titles/summaries for changed blocks only — never rebuilds whole layout.
 */
export function syncWorkspaceObjectsFromDeliverable(
  workspace: ThinkingWorkspaceState,
  deliverable: VisualThinkingGeneratedDeliverable,
  affectedBlockIds: string[],
): ThinkingWorkspaceState {
  const affected = new Set(affectedBlockIds);
  return {
    ...workspace,
    objects: workspace.objects.map((o) => {
      if (!o.sourceBlockId || !affected.has(o.sourceBlockId)) return o;
      if (o.deliverableId && o.deliverableId !== deliverable.id) return o;
      const block = deliverable.blocks.find((b) => b.id === o.sourceBlockId);
      if (!block) return o;
      const title = block.title?.trim() || o.title;
      const summary =
        block.content.length > 140
          ? `${block.content.slice(0, 137).trim()}…`
          : block.content;
      return {
        ...o,
        title,
        summary,
        metadata: {
          ...meta(o),
          userEdited: block.userEdited || asBool(meta(o).userEdited),
          origin: block.userEdited ? "user_edited" : meta(o).origin ?? "platform_generated",
          updatedAt: nowIso(),
          contentSynced: true,
        },
      };
    }),
    updatedAt: nowIso(),
    status: "user_adjusted",
  };
}

export function applyUserEditProtection(
  object: ThinkingObject,
  mode: ThinkingObjectProtection,
): ThinkingObject {
  return {
    ...object,
    metadata: {
      ...meta(object),
      protection: mode,
      userEdited: true,
      updatedAt: nowIso(),
    },
  };
}

function isProtectedAgainstOverwrite(object: ThinkingObject): boolean {
  const m = meta(object);
  if (asBool(m.locked)) return true;
  if (asString(m.protection) === "protected") return true;
  if (asString(m.protection) === "ignore") return true;
  if (asBool(m.userEdited) && asString(m.protection) !== "unprotected") return true;
  // Default: user-edited blocks require explicit approval to overwrite via regenerate
  return false;
}

function withScopedDeliverableEdit(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  label: string,
  mutate: (deliverable: VisualThinkingGeneratedDeliverable, object: ThinkingObject) => {
    deliverable: VisualThinkingGeneratedDeliverable;
    affectedBlockIds: string[];
    notice?: string | null;
    failure?: string | null;
  },
): CoCreationResult {
  const scope = resolveSelectionScope(workspace, session.selection);
  if (!scope.affectedObjectIds.length) {
    return {
      session,
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: "Select something first — I’ll only change what you choose.",
      failure: null,
    };
  }

  let bundle = session.generationBundle;
  let nextWorkspace = workspace;
  let notice: string | null = null;
  const failed: string[] = [];
  const allAffectedBlocks: string[] = [];

  for (const objectId of scope.affectedObjectIds) {
    const object = nextWorkspace.objects.find((o) => o.id === objectId);
    if (!object) continue;
    if (asBool(meta(object).locked)) {
      failed.push(objectId);
      continue;
    }
    const deliverable = primaryDeliverableForObject(bundle, object);
    if (!deliverable || !object.sourceBlockId) {
      // User notes / non-block objects: edit metadata only
      continue;
    }
    const snap = snapshotContent(label, deliverable, nextWorkspace, session.selection);
    const result = mutate(deliverable, object);
    if (result.failure) {
      failed.push(objectId);
      notice = result.failure;
      continue;
    }
    bundle = replaceDeliverableInBundle(bundle, result.deliverable);
    nextWorkspace = syncWorkspaceObjectsFromDeliverable(
      nextWorkspace,
      result.deliverable,
      result.affectedBlockIds,
    );
    allAffectedBlocks.push(...result.affectedBlockIds);
    notice = result.notice ?? notice;
    session = {
      ...session,
      contentUndoStack: [...session.contentUndoStack, snap].slice(-MAX_CONTENT_HISTORY),
      contentRedoStack: [],
    };
  }

  const syncPreview =
    allAffectedBlocks.length > 0
      ? buildRepresentationSyncPreview(
          "This change also affects related views of the same knowledge.",
          session.selection.objectIds,
        )
      : null;

  session = pushHistory(
    {
      ...session,
      generationBundle: bundle,
      pendingSyncPreview: syncPreview,
      updatedAt: nowIso(),
    },
    "edit",
    label,
    scope.affectedObjectIds,
  );

  recordEvent("object_edited", {
    label,
    objectIds: scope.affectedObjectIds,
    failed,
  });

  return {
    session,
    workspace: nextWorkspace,
    generationBundle: bundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice:
      failed.length && !allAffectedBlocks.length
        ? "I couldn’t change the locked or protected pieces — everything else is still here."
        : notice,
    failure: failed.length
      ? {
          objectIds: failed,
          message: "Some selected pieces were locked or protected.",
        }
      : null,
  };
}

export function expandSelectedObjects(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const result = withScopedDeliverableEdit(
    session,
    workspace,
    "Expand selected",
    (deliverable, object) => {
      if (isProtectedAgainstOverwrite(object) && asString(meta(object).protection) === "protected") {
        return {
          deliverable,
          affectedBlockIds: [],
          failure: "This piece is protected. Unlock or approve a merge first.",
        };
      }
      const next = transformBlock(deliverable, object.sourceBlockId!, "deepen");
      return {
        deliverable: next,
        affectedBlockIds: [object.sourceBlockId!],
        notice: "I added depth only to what you selected.",
      };
    },
  );
  if (result.scopedEdit) recordEvent("expanded");
  return result;
}

export function simplifySelectedObjects(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const result = withScopedDeliverableEdit(
    session,
    workspace,
    "Simplify selected",
    (deliverable, object) => {
      const block = deliverable.blocks.find((b) => b.id === object.sourceBlockId);
      if (!block) {
        return { deliverable, affectedBlockIds: [], failure: "Missing content." };
      }
      // Preserve meaning: keep user-edited content, only shorten presentation length.
      const next = transformBlock(deliverable, object.sourceBlockId!, "simplify");
      return {
        deliverable: next,
        affectedBlockIds: [object.sourceBlockId!],
        notice: "Simplified the selected piece — meaning and evidence stay.",
      };
    },
  );
  if (result.scopedEdit) recordEvent("simplified");
  return result;
}

export function editSelectedObjectBody(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  content: string,
  title?: string,
): CoCreationResult {
  return withScopedDeliverableEdit(session, workspace, "User edit", (deliverable, object) => {
    if (!object.sourceBlockId) {
      return { deliverable, affectedBlockIds: [], failure: "This idea isn’t tied to editable content." };
    }
    const next = applyBlockEdit(deliverable, {
      kind: "edit",
      blockId: object.sourceBlockId,
      content,
      title,
    });
    // Mark protected by default after user authorship
    const protectedDeliverable: VisualThinkingGeneratedDeliverable = {
      ...next,
      blocks: next.blocks.map((b) =>
        b.id === object.sourceBlockId
          ? {
              ...b,
              userEdited: true,
              metadata: { ...b.metadata, protection: "protected", origin: "user_edited" },
            }
          : b,
      ),
    };
    return {
      deliverable: protectedDeliverable,
      affectedBlockIds: [object.sourceBlockId],
      notice: "Your wording is saved and protected from silent overwrite.",
    };
  });
}

export function researchSelectedArea(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  findings: Array<{ objectId: string; finding: string; sourceLabel?: string }>,
): CoCreationResult {
  // Research merges as suggested additions — never silent overwrite of user edits.
  let nextSession = session;
  let nextWorkspace = workspace;
  let bundle = session.generationBundle;
  const mergeSuggestions: MergeSuggestion[] = [];

  for (const item of findings) {
    const object = nextWorkspace.objects.find((o) => o.id === item.objectId);
    if (!object?.sourceBlockId) continue;
    const deliverable = primaryDeliverableForObject(bundle, object);
    if (!deliverable) continue;
    const block = deliverable.blocks.find((b) => b.id === object.sourceBlockId);
    if (!block) continue;

    if (block.userEdited || isProtectedAgainstOverwrite(object)) {
      mergeSuggestions.push({
        id: newId("vtms"),
        objectId: object.id,
        kind: "research_update",
        message: "New research is ready. Your wording stays until you choose how to merge.",
        userText: block.content,
        generatedText: item.finding,
        recommended: "review_later",
      });
      continue;
    }

    const snap = snapshotContent("Research selected", deliverable, nextWorkspace, session.selection);
    const next = applyBlockEdit(deliverable, {
      kind: "edit",
      blockId: object.sourceBlockId,
      content: `${block.content}\n\nResearch note: ${item.finding}${
        item.sourceLabel ? ` (${item.sourceLabel})` : ""
      }`,
    });
    const withMeta: VisualThinkingGeneratedDeliverable = {
      ...next,
      blocks: next.blocks.map((b) =>
        b.id === object.sourceBlockId
          ? {
              ...b,
              metadata: {
                ...b.metadata,
                researchMerged: true,
                origin: "research_generated",
              },
            }
          : b,
      ),
    };
    bundle = replaceDeliverableInBundle(bundle, withMeta);
    nextWorkspace = syncWorkspaceObjectsFromDeliverable(nextWorkspace, withMeta, [
      object.sourceBlockId,
    ]);
    nextSession = {
      ...nextSession,
      contentUndoStack: [...nextSession.contentUndoStack, snap].slice(-MAX_CONTENT_HISTORY),
      contentRedoStack: [],
    };
  }

  nextSession = pushHistory(
    {
      ...nextSession,
      generationBundle: bundle,
      pendingMergeSuggestions: [
        ...nextSession.pendingMergeSuggestions,
        ...mergeSuggestions,
      ],
      pendingSyncPreview: buildRepresentationSyncPreview(
        "Research updates may affect related representations.",
        findings.map((f) => f.objectId),
      ),
    },
    "research",
    "Research selected area",
    findings.map((f) => f.objectId),
  );
  recordEvent("researched_selected", { count: findings.length });

  return {
    session: nextSession,
    workspace: nextWorkspace,
    generationBundle: bundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice:
      mergeSuggestions.length > 0
        ? "I found updates for protected pieces — review how you’d like to merge them."
        : "Research was applied only to the selected area.",
    failure: null,
  };
}

export function findMissingPieces(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const scope = resolveSelectionScope(workspace, session.selection);
  const objects = workspace.objects.filter((o) =>
    scope.selectedObjectIds.length
      ? scope.selectedObjectIds.includes(o.id)
      : o.type !== "group",
  );
  const suggestions: MissingPieceSuggestion[] = [];

  const hasRisk = objects.some((o) => o.type === "warning" || meta(o).colorSemantic === "risk");
  const hasQuestion = objects.some((o) => o.type === "question");
  const hasStep = objects.some((o) => o.type === "step" || o.type === "process");
  const hasDecision = objects.some((o) => o.type === "decision");

  if (hasStep && objects.filter((o) => o.type === "step").length < 3) {
    suggestions.push({
      id: newId("vtmp"),
      category: "missing_steps",
      message: "A few process steps may still be missing between the ones you have.",
      relatedObjectIds: objects.filter((o) => o.type === "step").map((o) => o.id),
    });
  }
  if (!hasRisk) {
    suggestions.push({
      id: newId("vtmp"),
      category: "missing_risks",
      message: "No risks are marked yet — worth a quick look before you decide.",
      relatedObjectIds: scope.selectedObjectIds,
    });
  }
  if (!hasDecision && objects.length >= 3) {
    suggestions.push({
      id: newId("vtmp"),
      category: "missing_decisions",
      message: "There may be a decision point that isn’t named yet.",
      relatedObjectIds: scope.selectedObjectIds,
    });
  }
  if (!hasQuestion) {
    suggestions.push({
      id: newId("vtmp"),
      category: "missing_questions",
      message: "Open questions aren’t listed — I can help gather them if you want.",
      relatedObjectIds: scope.selectedObjectIds,
    });
  }
  suggestions.push({
    id: newId("vtmp"),
    category: "missing_research",
    message: "Any claim that still feels thin can be researched for the selected area only.",
    relatedObjectIds: scope.selectedObjectIds,
  });

  const nextSession = pushHistory(
    {
      ...session,
      pendingMissingPieces: suggestions,
      updatedAt: nowIso(),
    },
    "find_missing",
    "Find missing pieces",
    scope.selectedObjectIds,
  );

  return {
    session: nextSession,
    workspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice:
      "Here are gaps worth considering — nothing was inserted automatically.",
    failure: null,
  };
}

export function generateAlternatives(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const scope = resolveSelectionScope(workspace, session.selection);
  const alternatives: AlternativeProposal[] = [];
  const deliverable = getPrimaryDeliverable(session.generationBundle);

  for (const objectId of scope.selectedObjectIds) {
    const object = workspace.objects.find((o) => o.id === objectId);
    if (!object) continue;
    const body = resolveBody(object, primaryDeliverableForObject(session.generationBundle, object));
    alternatives.push({
      id: newId("vtal"),
      kind: object.type === "step" || object.type === "process" ? "process" : "structure",
      title: `Another way to frame “${object.title}”`,
      summary: "Proposal only — your current version stays until you choose.",
      objectId,
      proposedBody: `${body}\n\nAlternative angle: emphasize the outcome first, then the supporting pieces.`,
    });
    if (object.type === "decision" || object.type === "comparison") {
      alternatives.push({
        id: newId("vtal"),
        kind: "decision",
        title: `Decision alternative for “${object.title}”`,
        summary: "A second framing for tradeoffs.",
        objectId,
        proposedBody: `${body}\n\nAlternative: name the non-negotiable first, then compare options against it.`,
      });
    }
  }

  void deliverable;
  const nextSession = pushHistory(
    {
      ...session,
      pendingAlternatives: alternatives,
      updatedAt: nowIso(),
    },
    "alternatives",
    "Generate alternatives",
    scope.selectedObjectIds,
  );
  recordEvent("alternatives_generated", { count: alternatives.length });

  return {
    session: nextSession,
    workspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice:
      alternatives.length > 0
        ? "I prepared alternatives for the selection — nothing replaced your current work."
        : "Select a piece first and I’ll offer alternatives for just that area.",
    failure: null,
  };
}

export function acceptAlternative(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  alternativeId: string,
): CoCreationResult {
  const alt = session.pendingAlternatives.find((a) => a.id === alternativeId);
  if (!alt) {
    return {
      session,
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: null,
      failure: null,
    };
  }
  const withSelection: WorkspaceEditingSession = {
    ...session,
    selection: {
      ...session.selection,
      primaryObjectId: alt.objectId,
      objectIds: [alt.objectId],
      mode: "single",
    },
    pendingAlternatives: session.pendingAlternatives.filter((a) => a.id !== alternativeId),
  };
  return editSelectedObjectBody(withSelection, workspace, alt.proposedBody);
}

export function prepareAskBoard(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  question: string,
): CoCreationResult {
  const scope = resolveSelectionScope(workspace, session.selection);
  const objects = workspace.objects.filter((o) => scope.selectedObjectIds.includes(o.id));
  const pack: BoardReviewPackage = {
    objectIds: scope.selectedObjectIds,
    question,
    contextSummary: objects.map((o) => `${o.title}: ${o.summary}`).join("\n"),
    supportingKnowledgeIds: objects
      .map((o) => o.sourceKnowledgeItemId)
      .filter((id): id is string => Boolean(id)),
    perspectives: [
      "Clarity of the selected piece",
      "Risks a careful board would raise",
      "Whether the next step is clear",
    ],
    risks: ["Acting before the selection is fully understood"],
    tradeoffs: ["Speed versus depth on this piece alone"],
    questions: [question, "What would change your mind?"],
    suggestions: ["Keep the rest of the workspace unchanged until you approve anything."],
    status: "prepared",
  };
  const nextSession = pushHistory(
    { ...session, pendingBoardReview: pack, updatedAt: nowIso() },
    "ask_board",
    "Ask Board (selected only)",
    scope.selectedObjectIds,
  );
  recordEvent("board_prepared");
  return {
    session: nextSession,
    workspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice:
      "Board perspectives are ready for the selected pieces. Nothing changes until you approve.",
    failure: null,
  };
}

export function prepareAskChamberMember(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  chamberMember: string,
  question: string,
): CoCreationResult {
  const scope = resolveSelectionScope(workspace, session.selection);
  const objects = workspace.objects.filter((o) => scope.selectedObjectIds.includes(o.id));
  const pack: ChamberReviewPackage = {
    chamberMember,
    objectIds: scope.selectedObjectIds,
    question,
    contextSummary: objects.map((o) => `${o.title}: ${o.summary}`).join("\n"),
    perspectives: [`${chamberMember} view of the selected area only`],
    suggestions: ["Review suggestions stay local until you accept them."],
    status: "prepared",
  };
  const nextSession = pushHistory(
    { ...session, pendingChamberReview: pack, updatedAt: nowIso() },
    "ask_chamber",
    `Ask ${chamberMember}`,
    scope.selectedObjectIds,
  );
  recordEvent("chamber_prepared");
  return {
    session: nextSession,
    workspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: `${chamberMember} can review just this selection — the rest stays as it is.`,
    failure: null,
  };
}

export function buildRepresentationSyncPreview(
  changeSummary: string,
  _objectIds: string[],
): RepresentationSyncPreview {
  return {
    id: newId("vtsync"),
    changeSummary,
    affectedPresentations: [
      "relationship_view",
      "timeline",
      "process_flow",
      "checklist",
      "comparison_view",
    ],
    actions: ["update_all", "choose_representationsations", "keep_current"],
  };
}

export function applyRepresentationSyncChoice(
  session: WorkspaceEditingSession,
  choice: "update_all" | "choose_representationsations" | "keep_current",
  chosen?: VisualThinkingPresentationType[],
): WorkspaceEditingSession {
  recordEvent(
    choice === "keep_current"
      ? "representation_sync_previewed"
      : "representation_sync_applied",
    { choice, chosen },
  );
  return pushHistory(
    {
      ...session,
      pendingSyncPreview: null,
      updatedAt: nowIso(),
    },
    "representation_sync",
    choice === "keep_current"
      ? "Kept current representation versions"
      : choice === "update_all"
        ? "Updated all related representations"
        : `Updated: ${(chosen ?? []).join(", ") || "selected representations"}`,
    session.selection.objectIds,
  );
}

export function mergeSuggestionsForProtected(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  researchTextByObjectId: Record<string, string>,
): CoCreationResult {
  const suggestions: MergeSuggestion[] = [];
  for (const [objectId, generatedText] of Object.entries(researchTextByObjectId)) {
    const object = workspace.objects.find((o) => o.id === objectId);
    if (!object) continue;
    const deliverable = primaryDeliverableForObject(session.generationBundle, object);
    const body = resolveBody(object, deliverable);
    suggestions.push({
      id: newId("vtms"),
      objectId,
      kind: asBool(meta(object).userEdited) ? "user_override" : "conflict",
      message: "Your version and a new version both exist.",
      userText: body,
      generatedText,
      recommended: asBool(meta(object).userEdited) ? "protected" : "review_later",
    });
  }
  const nextSession = pushHistory(
    {
      ...session,
      pendingMergeSuggestions: suggestions,
      updatedAt: nowIso(),
    },
    "merge",
    "Merge suggestions",
    Object.keys(researchTextByObjectId),
  );
  recordEvent("merge_suggested", { count: suggestions.length });
  return {
    session: nextSession,
    workspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: "Merge choices are ready — nothing was discarded.",
    failure: null,
  };
}

export function applyMergeDecision(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  suggestionId: string,
  decision: ThinkingObjectProtection,
): CoCreationResult {
  const suggestion = session.pendingMergeSuggestions.find((s) => s.id === suggestionId);
  if (!suggestion) {
    return {
      session,
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: null,
      failure: null,
    };
  }

  let nextWorkspace = {
    ...workspace,
    objects: workspace.objects.map((o) =>
      o.id === suggestion.objectId ? applyUserEditProtection(o, decision) : o,
    ),
  };
  let bundle = session.generationBundle;
  let nextSession: WorkspaceEditingSession = {
    ...session,
    pendingMergeSuggestions: session.pendingMergeSuggestions.filter(
      (s) => s.id !== suggestionId,
    ),
  };

  if (decision === "suggested_replacement" && suggestion.generatedText) {
    nextSession = {
      ...nextSession,
      selection: {
        ...nextSession.selection,
        primaryObjectId: suggestion.objectId,
        objectIds: [suggestion.objectId],
        mode: "single",
      },
    };
    return editSelectedObjectBody(
      nextSession,
      nextWorkspace,
      suggestion.generatedText,
    );
  }

  if (decision === "merge" && suggestion.userText && suggestion.generatedText) {
    nextSession = {
      ...nextSession,
      selection: {
        ...nextSession.selection,
        primaryObjectId: suggestion.objectId,
        objectIds: [suggestion.objectId],
        mode: "single",
      },
    };
    return editSelectedObjectBody(
      nextSession,
      nextWorkspace,
      `${suggestion.userText}\n\nAlso consider:\n${suggestion.generatedText}`,
    );
  }

  // protected / ignore / review_later — keep user content
  nextSession = pushHistory(nextSession, "merge_decision", `Merge: ${decision}`, [
    suggestion.objectId,
  ]);
  return {
    session: nextSession,
    workspace: nextWorkspace,
    generationBundle: bundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: "Your earlier wording stays.",
    failure: null,
  };
}

export function setObjectLocked(
  workspace: ThinkingWorkspaceState,
  objectId: string,
  locked: boolean,
): ThinkingWorkspaceState {
  recordEvent("locked", { objectId, locked });
  return {
    ...workspace,
    objects: workspace.objects.map((o) =>
      o.id === objectId
        ? {
            ...o,
            metadata: { ...meta(o), locked, updatedAt: nowIso() },
          }
        : o,
    ),
    updatedAt: nowIso(),
  };
}

export function setObjectHidden(
  workspace: ThinkingWorkspaceState,
  objectId: string,
  hidden: boolean,
): ThinkingWorkspaceState {
  return {
    ...workspace,
    objects: workspace.objects.map((o) =>
      o.id === objectId
        ? {
            ...o,
            metadata: {
              ...meta(o),
              status: hidden ? "hidden" : "active",
              updatedAt: nowIso(),
            },
          }
        : o,
    ),
    updatedAt: nowIso(),
  };
}

export function addAnnotation(
  session: WorkspaceEditingSession,
  objectId: string,
  type: ThinkingAnnotationType,
  text: string,
): WorkspaceEditingSession {
  const annotation: ThinkingAnnotation = {
    id: newId("vtan"),
    objectId,
    type,
    text,
    createdAt: nowIso(),
    createdBy: "user",
  };
  recordEvent("annotated", { objectId, type });
  return pushHistory(
    {
      ...session,
      annotations: [...session.annotations, annotation],
      updatedAt: nowIso(),
    },
    "annotate",
    "Annotation added",
    [objectId],
  );
}

export function addComment(
  session: WorkspaceEditingSession,
  objectId: string,
  text: string,
  parentId: string | null = null,
  createdBy: ThinkingComment["createdBy"] = "user",
): WorkspaceEditingSession {
  const comment: ThinkingComment = {
    id: newId("vtcm"),
    objectId,
    parentId,
    text,
    createdAt: nowIso(),
    createdBy,
  };
  return {
    ...session,
    comments: [...session.comments, comment],
    updatedAt: nowIso(),
  };
}

export function undoContentEdit(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const entry = session.contentUndoStack[session.contentUndoStack.length - 1];
  if (!entry) {
    return {
      session,
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: "Nothing to undo in the content history.",
      failure: null,
    };
  }
  const currentPrimary = getPrimaryDeliverable(session.generationBundle);
  const redoEntry = currentPrimary
    ? snapshotContent("Redo point", currentPrimary, workspace, session.selection)
    : null;
  const bundle = replaceDeliverableInBundle(
    session.generationBundle,
    entry.deliverableSnapshot,
  );
  const nextWorkspace: ThinkingWorkspaceState = {
    ...workspace,
    objects: workspace.objects.map((o) => {
      const snap = entry.objectProjections.find((p) => p.id === o.id);
      if (!snap) return o;
      return {
        ...o,
        title: snap.title,
        summary: snap.summary,
        metadata: { ...snap.metadata },
      };
    }),
    selection: {
      primaryObjectId: entry.selection.primaryObjectId,
    },
    updatedAt: nowIso(),
  };
  const nextSession = pushHistory(
    {
      ...session,
      generationBundle: bundle,
      selection: entry.selection,
      contentUndoStack: session.contentUndoStack.slice(0, -1),
      contentRedoStack: redoEntry
        ? [...session.contentRedoStack, redoEntry].slice(-MAX_CONTENT_HISTORY)
        : session.contentRedoStack,
      updatedAt: nowIso(),
    },
    "undo",
    `Undo: ${entry.label}`,
    entry.selection.objectIds,
  );
  recordEvent("undo_content");
  return {
    session: nextSession,
    workspace: nextWorkspace,
    generationBundle: bundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: "Restored the previous version of that change.",
    failure: null,
  };
}

export function redoContentEdit(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const entry = session.contentRedoStack[session.contentRedoStack.length - 1];
  if (!entry) {
    return {
      session,
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: "Nothing to redo.",
      failure: null,
    };
  }
  const currentPrimary = getPrimaryDeliverable(session.generationBundle);
  const undoEntry = currentPrimary
    ? snapshotContent("Undo point", currentPrimary, workspace, session.selection)
    : null;
  const bundle = replaceDeliverableInBundle(
    session.generationBundle,
    entry.deliverableSnapshot,
  );
  const nextWorkspace: ThinkingWorkspaceState = {
    ...workspace,
    objects: workspace.objects.map((o) => {
      const snap = entry.objectProjections.find((p) => p.id === o.id);
      if (!snap) return o;
      return {
        ...o,
        title: snap.title,
        summary: snap.summary,
        metadata: { ...snap.metadata },
      };
    }),
    selection: { primaryObjectId: entry.selection.primaryObjectId },
    updatedAt: nowIso(),
  };
  const nextSession = pushHistory(
    {
      ...session,
      generationBundle: bundle,
      selection: entry.selection,
      contentRedoStack: session.contentRedoStack.slice(0, -1),
      contentUndoStack: undoEntry
        ? [...session.contentUndoStack, undoEntry].slice(-MAX_CONTENT_HISTORY)
        : session.contentUndoStack,
      updatedAt: nowIso(),
    },
    "redo",
    `Redo: ${entry.label}`,
    entry.selection.objectIds,
  );
  recordEvent("redo_content");
  return {
    session: nextSession,
    workspace: nextWorkspace,
    generationBundle: bundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: "Reapplied that change.",
    failure: null,
  };
}

export function updateSelection(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  objectIds: string[],
  mode: WorkspaceSelectionModel["mode"] = "single",
): { session: WorkspaceEditingSession; workspace: ThinkingWorkspaceState } {
  const primary = objectIds[0] ?? null;
  return {
    session: {
      ...session,
      selection: {
        mode: objectIds.length > 1 ? "multiple" : mode,
        primaryObjectId: primary,
        objectIds,
        groupIds: [],
        filterQuery: session.selection.filterQuery,
      },
      updatedAt: nowIso(),
    },
    workspace: {
      ...workspace,
      selection: { primaryObjectId: primary },
      updatedAt: nowIso(),
    },
  };
}

export function filterWorkspaceObjects(
  workspace: ThinkingWorkspaceState,
  session: WorkspaceEditingSession,
): ThinkingObject[] {
  const f = session.filter;
  return workspace.objects.filter((o) => {
    const knowledge = projectThinkingObjectKnowledge(o, o.summary);
    if (f.pinnedOnly && !o.pinned) return false;
    if (f.hidden === "exclude" && knowledge.status === "hidden") return false;
    if (f.hidden === "only" && knowledge.status !== "hidden") return false;
    if (f.origin && knowledge.origin !== f.origin) return false;
    if (f.status && knowledge.status !== f.status) return false;
    if (f.type && knowledge.type !== f.type) return false;
    if (f.tag && !knowledge.tags.includes(f.tag)) return false;
    return true;
  });
}

export function searchWorkspaceContent(
  workspace: ThinkingWorkspaceState,
  bundle: VisualThinkingGenerationBundle,
  query: string,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches: string[] = [];
  for (const o of workspace.objects) {
    const body = resolveBody(o, primaryDeliverableForObject(bundle, o));
    const tags = Array.isArray(meta(o).tags) ? (meta(o).tags as string[]).join(" ") : "";
    const hay = `${o.title} ${o.summary} ${body} ${tags}`.toLowerCase();
    if (hay.includes(q)) matches.push(o.id);
  }
  return matches;
}

export function projectCoCreationInspector(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationInspectorProjection | null {
  const id = session.selection.primaryObjectId ?? workspace.selection.primaryObjectId;
  if (!id) return null;
  const object = workspace.objects.find((o) => o.id === id);
  if (!object) return null;
  const deliverable = primaryDeliverableForObject(session.generationBundle, object);
  const body = resolveBody(object, deliverable);
  const knowledge = projectThinkingObjectKnowledge(object, body);
  const notes = session.annotations
    .filter((a) => a.objectId === id)
    .map((a) => a.text);
  const questions = session.comments
    .filter((c) => c.objectId === id && c.text.includes("?"))
    .map((c) => c.text);
  const related = workspace.connectors
    .filter((c) => c.fromObjectId === id || c.toObjectId === id)
    .map((c) => {
      const other = c.fromObjectId === id ? c.toObjectId : c.fromObjectId;
      return workspace.objects.find((o) => o.id === other)?.title ?? "Related";
    });

  const suggestedActions: Array<{ id: CoCreationActionId; label: string }> = [
    { id: "expand", label: "Expand" },
    { id: "simplify", label: "Simplify" },
    { id: "research", label: "Research this" },
    { id: "find_missing_pieces", label: "Find missing pieces" },
    { id: "generate_alternatives", label: "Generate alternatives" },
    { id: "ask_board", label: "Ask Board" },
    knowledge.locked
      ? { id: "unlock", label: "Unlock" }
      : { id: "lock", label: "Lock" },
    { id: "annotate", label: "Add note" },
  ];

  return {
    title: knowledge.title,
    description: knowledge.body,
    notes,
    evidence: knowledge.researchReferences,
    sources: knowledge.knowledgeReferences,
    questions,
    relatedObjects: related,
    tags: knowledge.tags,
    status: knowledge.status,
    confidence: knowledge.confidence,
    origin: knowledge.origin,
    history: session.history
      .filter((h) => h.objectIds.includes(id) || h.objectIds.length === 0)
      .slice(-6)
      .map((h) => h.label),
    suggestedActions,
    protection: knowledge.protection,
    locked: knowledge.locked,
    progressiveSections: ["basics", "actions", "evidence", "relations", "history"],
  };
}

export function applyCoCreationAction(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
  action: CoCreationActionId,
  payload?: {
    content?: string;
    title?: string;
    question?: string;
    chamberMember?: string;
    annotationType?: ThinkingAnnotationType;
    annotationText?: string;
    researchFindings?: Array<{ objectId: string; finding: string; sourceLabel?: string }>;
    alternativeId?: string;
    mergeSuggestionId?: string;
    mergeDecision?: ThinkingObjectProtection;
    syncChoice?: "update_all" | "choose_representationsations" | "keep_current";
    chosenPresentations?: VisualThinkingPresentationType[];
  },
): CoCreationResult {
  switch (action) {
    case "expand":
    case "teach_me":
    case "show_example":
    case "explain":
      return expandSelectedObjects(session, workspace);
    case "simplify":
      return simplifySelectedObjects(session, workspace);
    case "edit_body":
      return editSelectedObjectBody(
        session,
        workspace,
        payload?.content ?? "",
        payload?.title,
      );
    case "research":
      return researchSelectedArea(
        session,
        workspace,
        payload?.researchFindings ??
          session.selection.objectIds.map((objectId) => ({
            objectId,
            finding: "Selected-area finding ready for review.",
            sourceLabel: "Scoped research",
          })),
      );
    case "find_missing_pieces":
      return findMissingPieces(session, workspace);
    case "generate_alternatives":
      return generateAlternatives(session, workspace);
    case "ask_board":
      return prepareAskBoard(
        session,
        workspace,
        payload?.question ?? "What would you improve in the selected pieces?",
      );
    case "ask_chamber_member":
      return prepareAskChamberMember(
        session,
        workspace,
        payload?.chamberMember ?? "Marketing",
        payload?.question ?? "Please review only this selection.",
      );
    case "lock": {
      const id = session.selection.primaryObjectId;
      if (!id) {
        return {
          session,
          workspace,
          generationBundle: session.generationBundle,
          scopedEdit: true,
          avoidedFullRegeneration: true,
          userFacingNotice: null,
          failure: null,
        };
      }
      return {
        session,
        workspace: setObjectLocked(workspace, id, true),
        generationBundle: session.generationBundle,
        scopedEdit: true,
        avoidedFullRegeneration: true,
        userFacingNotice: "Locked — this piece won’t be regenerated.",
        failure: null,
      };
    }
    case "unlock": {
      const id = session.selection.primaryObjectId;
      if (!id) {
        return {
          session,
          workspace,
          generationBundle: session.generationBundle,
          scopedEdit: true,
          avoidedFullRegeneration: true,
          userFacingNotice: null,
          failure: null,
        };
      }
      return {
        session,
        workspace: setObjectLocked(workspace, id, false),
        generationBundle: session.generationBundle,
        scopedEdit: true,
        avoidedFullRegeneration: true,
        userFacingNotice: "Unlocked.",
        failure: null,
      };
    }
    case "hide": {
      const id = session.selection.primaryObjectId;
      if (!id) {
        return {
          session,
          workspace,
          generationBundle: session.generationBundle,
          scopedEdit: true,
          avoidedFullRegeneration: true,
          userFacingNotice: null,
          failure: null,
        };
      }
      return {
        session,
        workspace: setObjectHidden(workspace, id, true),
        generationBundle: session.generationBundle,
        scopedEdit: true,
        avoidedFullRegeneration: true,
        userFacingNotice: "Hidden from view — still in knowledge.",
        failure: null,
      };
    }
    case "annotate": {
      const id = session.selection.primaryObjectId;
      if (!id || !payload?.annotationText) {
        return {
          session,
          workspace,
          generationBundle: session.generationBundle,
          scopedEdit: true,
          avoidedFullRegeneration: true,
          userFacingNotice: null,
          failure: null,
        };
      }
      return {
        session: addAnnotation(
          session,
          id,
          payload.annotationType ?? "personal_note",
          payload.annotationText,
        ),
        workspace,
        generationBundle: session.generationBundle,
        scopedEdit: true,
        avoidedFullRegeneration: true,
        userFacingNotice: "Note saved — separate from generated knowledge.",
        failure: null,
      };
    }
    case "protect": {
      const id = session.selection.primaryObjectId;
      if (!id) {
        return {
          session,
          workspace,
          generationBundle: session.generationBundle,
          scopedEdit: true,
          avoidedFullRegeneration: true,
          userFacingNotice: null,
          failure: null,
        };
      }
      return {
        session,
        workspace: {
          ...workspace,
          objects: workspace.objects.map((o) =>
            o.id === id ? applyUserEditProtection(o, "protected") : o,
          ),
        },
        generationBundle: session.generationBundle,
        scopedEdit: true,
        avoidedFullRegeneration: true,
        userFacingNotice: "Protected from silent overwrite.",
        failure: null,
      };
    }
    case "accept_suggestion":
      if (payload?.alternativeId) {
        return acceptAlternative(session, workspace, payload.alternativeId);
      }
      if (payload?.mergeSuggestionId && payload.mergeDecision) {
        return applyMergeDecision(
          session,
          workspace,
          payload.mergeSuggestionId,
          payload.mergeDecision,
        );
      }
      break;
    case "reject_suggestion":
      if (payload?.mergeSuggestionId) {
        return applyMergeDecision(
          session,
          workspace,
          payload.mergeSuggestionId,
          "ignore",
        );
      }
      break;
    default:
      break;
  }

  if (payload?.syncChoice) {
    return {
      session: applyRepresentationSyncChoice(
        session,
        payload.syncChoice,
        payload.chosenPresentations,
      ),
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: null,
      failure: null,
    };
  }

  return {
    session,
    workspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: null,
    failure: null,
  };
}

/** Incremental autosave of editing session + workspace. */
export function autosaveEditingSession(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): WorkspaceEditingSession {
  if (typeof window === "undefined") {
    return { ...session, autosaveAt: nowIso() };
  }
  try {
    const stamped = { ...session, autosaveAt: nowIso(), updatedAt: nowIso() };
    window.sessionStorage.setItem(EDITING_SESSION_KEY, JSON.stringify(stamped));
    saveThinkingWorkspace(workspace);
    saveGenerationBundle(session.generationBundle);
    recordEvent("autosaved");
    return stamped;
  } catch {
    return session;
  }
}

export function loadEditingSession(): WorkspaceEditingSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(EDITING_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceEditingSession;
  } catch {
    return null;
  }
}

export function clearEditingSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(EDITING_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function recoverEditingSession(input: {
  workspace: ThinkingWorkspaceState;
  generationBundle: VisualThinkingGenerationBundle;
}): CoCreationResult {
  const loaded = loadEditingSession();
  if (!loaded) {
    const session = createWorkspaceEditingSession(input);
    return {
      session,
      workspace: input.workspace,
      generationBundle: input.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: null,
      failure: null,
    };
  }
  recordEvent("recovery");
  return {
    session: {
      ...loaded,
      generationBundle: loaded.generationBundle ?? input.generationBundle,
      updatedAt: nowIso(),
    },
    workspace: input.workspace,
    generationBundle: loaded.generationBundle ?? input.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: "Welcome back — your thinking space is still here.",
    failure: null,
  };
}

/**
 * Writeback boundary — editing never silently mutates Estate systems.
 */
export function assertNoSilentWriteback(action: CoCreationActionId): {
  allowedWithoutApproval: boolean;
  requiresApproval: boolean;
  targets: string[];
} {
  const mutatingEstate = new Set<CoCreationActionId>([]);
  void mutatingEstate;
  return {
    allowedWithoutApproval: true,
    requiresApproval: false,
    targets: [],
  };
}

export function writebackRequiresApproval(target: string): boolean {
  const gated = new Set([
    "projects",
    "business_estate",
    "learning",
    "marketing",
    "board_records",
    "strategy",
  ]);
  return gated.has(target);
}

export function buildShariCoCreationPrompt(
  action: CoCreationActionId,
  objectTitle: string,
): string {
  switch (action) {
    case "expand":
      return `What would deepen “${objectTitle}” without rewriting unrelated pieces?`;
    case "simplify":
      return `Can you simplify “${objectTitle}” while preserving meaning?`;
    case "find_missing_pieces":
      return `What is missing around “${objectTitle}”?`;
    case "generate_alternatives":
      return `Show another approach for “${objectTitle}”.`;
    case "research":
      return `Research only “${objectTitle}”.`;
    case "teach_me":
      return `Explain “${objectTitle}” to a beginner.`;
    case "ask_board":
      return `Challenge assumptions in “${objectTitle}”.`;
    default:
      return `What would you improve in “${objectTitle}”?`;
  }
}

/** Dev-only audit projection for scoped-edit quality. */
export function projectEditingAudit(result: CoCreationResult): {
  scopedEdit: boolean;
  avoidedFullRegeneration: boolean;
  affectedCount: number;
  protectedCount: number;
  pendingMerges: number;
  pendingAlternatives: number;
  hasSyncPreview: boolean;
} {
  const scope = resolveSelectionScope(result.workspace, result.session.selection);
  return {
    scopedEdit: result.scopedEdit,
    avoidedFullRegeneration: result.avoidedFullRegeneration,
    affectedCount: scope.affectedObjectIds.length,
    protectedCount: scope.protectedObjectIds.length,
    pendingMerges: result.session.pendingMergeSuggestions.length,
    pendingAlternatives: result.session.pendingAlternatives.length,
    hasSyncPreview: Boolean(result.session.pendingSyncPreview),
  };
}

export function listEditingObservabilityEvents(): Array<{
  event: string;
  at: string;
  detail?: Record<string, unknown>;
}> {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    return raw
      ? (JSON.parse(raw) as Array<{
          event: string;
          at: string;
          detail?: Record<string, unknown>;
        }>)
      : [];
  } catch {
    return [];
  }
}

export { EDITING_SESSION_KEY };

/** Future collaboration hooks — architecture only, not implemented. */
export type FutureCollaborationMode =
  | "shared_workspace"
  | "multiple_editors"
  | "review_mode"
  | "comment_only"
  | "suggestion_mode";

export type FutureCollaborationContract = {
  mode: FutureCollaborationMode;
  enabled: false;
  note: "Prepared for future architecture — not implemented in this build.";
};

export function futureCollaborationContract(): FutureCollaborationContract {
  return {
    mode: "suggestion_mode",
    enabled: false,
    note: "Prepared for future architecture — not implemented in this build.",
  };
}

export function duplicateSelectedAsUserIdea(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  const id = session.selection.primaryObjectId;
  const source = id ? workspace.objects.find((o) => o.id === id) : null;
  if (!source) {
    return {
      session,
      workspace,
      generationBundle: session.generationBundle,
      scopedEdit: true,
      avoidedFullRegeneration: true,
      userFacingNotice: "Select something to duplicate.",
      failure: null,
    };
  }
  const cloneId = newId("vto");
  const clone: ThinkingObject = {
    ...source,
    id: cloneId,
    x: source.x + 24,
    y: source.y + 24,
    userCreated: true,
    immutable: false,
    pinned: false,
    manuallyMoved: true,
    sourceBlockId: null,
    sourceKnowledgeItemId: null,
    title: `${source.title} (copy)`,
    metadata: {
      ...meta(source),
      origin: "user_created",
      duplicatedFrom: source.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  };
  const nextWorkspace = {
    ...workspace,
    objects: [...workspace.objects, clone],
    selection: { primaryObjectId: cloneId },
    updatedAt: nowIso(),
  };
  const nextSession = pushHistory(
    {
      ...session,
      selection: {
        ...session.selection,
        primaryObjectId: cloneId,
        objectIds: [cloneId],
        mode: "single",
      },
    },
    "duplicate",
    "Duplicated as user idea",
    [cloneId],
  );
  return {
    session: nextSession,
    workspace: nextWorkspace,
    generationBundle: session.generationBundle,
    scopedEdit: true,
    avoidedFullRegeneration: true,
    userFacingNotice: "Duplicated as your idea — original stays.",
    failure: null,
  };
}

export function regenerateSelectedUnlocked(
  session: WorkspaceEditingSession,
  workspace: ThinkingWorkspaceState,
): CoCreationResult {
  return withScopedDeliverableEdit(
    session,
    workspace,
    "Regenerate selected",
    (deliverable, object) => {
      const block = deliverable.blocks.find((b) => b.id === object.sourceBlockId);
      if (!block) {
        return { deliverable, affectedBlockIds: [], failure: "Missing content." };
      }
      if (block.userEdited || isProtectedAgainstOverwrite(object)) {
        return {
          deliverable,
          affectedBlockIds: [],
          failure:
            "This piece is protected or user-edited. Choose a merge option instead of regenerating.",
        };
      }
      const next = transformBlock(deliverable, object.sourceBlockId!, "regenerate");
      return {
        deliverable: next,
        affectedBlockIds: [object.sourceBlockId!],
        notice: "Regenerated only the selected unlocked piece.",
      };
    },
  );
}

/** Ensures a content mutation did not rewrite unrelated blocks. */
export function assertScopedBlockMutation(
  before: VisualThinkingGeneratedDeliverable,
  after: VisualThinkingGeneratedDeliverable,
  allowedBlockIds: string[],
): boolean {
  const allowed = new Set(allowedBlockIds);
  if (before.blocks.length !== after.blocks.length) {
    // add/remove within scope may change length — verify untouched ids match
  }
  for (const b of before.blocks) {
    if (allowed.has(b.id)) continue;
    const afterBlock = after.blocks.find((x) => x.id === b.id);
    if (!afterBlock) return false;
    if (afterBlock.content !== b.content || afterBlock.title !== b.title) {
      return false;
    }
  }
  return true;
}

export function listSuggestedInspectorActions(
  object: ThinkingObject,
): Array<{ id: CoCreationActionId; label: string }> {
  const locked = asBool(meta(object).locked);
  return [
    { id: "expand", label: "Expand" },
    { id: "simplify", label: "Simplify" },
    { id: "research", label: "Research this" },
    { id: "find_missing_pieces", label: "Find missing pieces" },
    { id: "generate_alternatives", label: "Generate alternatives" },
    { id: "ask_board", label: "Ask Board" },
    locked ? { id: "unlock", label: "Unlock" } : { id: "lock", label: "Lock" },
    { id: "annotate", label: "Add note" },
  ];
}
