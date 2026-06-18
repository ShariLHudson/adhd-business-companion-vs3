/**
 * Single source of truth for Create chat + Create panel workflow state.
 */

import type { AppSection } from "./companionUi";
import type { CreateBuilderPhase, CreateBuilderSession } from "./createBuilderChat";
import {
  panelWorkflowHasProgress,
  processCreateBuilderTurn,
  type CreateBuilderTurnResult,
} from "./createBuilderChat";
import { newCreateSessionId } from "./createSharedSession";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  advanceToDiscovery,
  buildBriefFromDiscovery,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryComplete,
  discoveryQuestionsForState,
  getDiscoveryQuestions,
  resolvedTypeLabel,
  skipDiscoveryQuestion,
  type CreateWorkflowState,
  type DraftStatus,
  EMPTY_CREATE_WORKFLOW,
} from "./createWorkflow";

export type WorkflowUpdateSource = "chat" | "panel";

export type CreateWorkflowRecordPhase =
  | CreateBuilderPhase
  | "category"
  | "type"
  | "confirm"
  | "template"
  | "add-detail"
  | "improve"
  | "export";

export type CreateWorkflowRecord = {
  workflowId: string;
  itemType: string | null;
  subtype: string | null;
  currentPhase: CreateWorkflowRecordPhase;
  currentQuestionId: string | null;
  collectedAnswers: Record<string, string>;
  skippedQuestions: string[];
  draftContent: string;
  draftStatus: DraftStatus;
  lastUpdated: string;
  sourceOfLastUpdate: WorkflowUpdateSource;
  activeWorkspace: AppSection;
  /** Full workflow round-trip for panel compatibility. */
  workflowState: CreateWorkflowState;
};

/** True when a workflow record is worth keeping in active auto-restore storage. */
export function shouldPersistWorkflowRecord(
  record: CreateWorkflowRecord | null | undefined,
): boolean {
  if (!record?.workflowId || !record.workflowState) return false;
  if (record.draftContent?.trim()) return true;
  if (
    record.itemType &&
    Object.keys(record.collectedAnswers).length > 0
  ) {
    return true;
  }
  if (panelWorkflowHasProgress(record.workflowState)) return true;
  return false;
}

/** Whether opening Create should silently resume this stored workflow. */
export function shouldAutoResumeWorkflowRecord(
  record: CreateWorkflowRecord | null | undefined,
  typeHint?: string | null,
): boolean {
  if (!shouldPersistWorkflowRecord(record) || !record?.itemType) return false;
  const type = typeHint?.trim() || null;
  if (type && record.itemType !== type) return false;
  return (
    Object.keys(record.collectedAnswers).length > 0 ||
    Boolean(record.draftContent?.trim()) ||
    panelWorkflowHasProgress(record.workflowState)
  );
}

const ACTIVE_WORKSPACE: AppSection = "content-generator";

function nowIso(): string {
  return new Date().toISOString();
}

function phaseFromWorkflow(
  wf: CreateWorkflowState,
  builderPhase?: CreateBuilderPhase | null,
): CreateWorkflowRecordPhase {
  if (builderPhase) return builderPhase;
  if (wf.step === "readiness") return "readiness";
  if (wf.step === "discovery") return "discovery";
  if (wf.draftStatus === "building") return "generating";
  if (wf.buildApproved && wf.draftContent) return "revise-offer";
  return wf.step as CreateWorkflowRecordPhase;
}

function builderPhaseFromRecord(
  record: CreateWorkflowRecord,
): CreateBuilderPhase {
  const p = record.currentPhase;
  if (
    p === "pick-type" ||
    p === "discovery" ||
    p === "readiness" ||
    p === "generating" ||
    p === "revise-offer" ||
    p === "done"
  ) {
    return p;
  }
  if (record.workflowState.step === "readiness") return "readiness";
  if (record.workflowState.step === "discovery") return "discovery";
  if (record.draftStatus === "building") return "generating";
  if (record.draftStatus === "ready" && record.draftContent) return "revise-offer";
  return "discovery";
}

export function currentQuestionForRecord(
  record: CreateWorkflowRecord,
): { id: string; prompt: string } | null {
  const type = record.itemType;
  if (!type) return null;
  const q = discoveryQuestionsForState(type, record.workflowState);
  if (!q) return null;
  if (record.collectedAnswers[q.id]?.trim()) return null;
  if (record.skippedQuestions.includes(q.id)) return null;
  return { id: q.id, prompt: q.prompt };
}

export function syncCurrentQuestionId(
  record: CreateWorkflowRecord,
): CreateWorkflowRecord {
  const q = currentQuestionForRecord(record);
  return {
    ...record,
    currentQuestionId: q?.id ?? null,
  };
}

export function emptyWorkflowRecord(workflowId?: string): CreateWorkflowRecord {
  const id = workflowId ?? newCreateSessionId();
  const wf: CreateWorkflowState = {
    ...EMPTY_CREATE_WORKFLOW,
    sessionId: id,
    questionMode: "split_screen",
  };
  return {
    workflowId: id,
    itemType: null,
    subtype: null,
    currentPhase: "pick-type",
    currentQuestionId: null,
    collectedAnswers: {},
    skippedQuestions: [],
    draftContent: "",
    draftStatus: "idle",
    lastUpdated: nowIso(),
    sourceOfLastUpdate: "panel",
    activeWorkspace: ACTIVE_WORKSPACE,
    workflowState: wf,
  };
}

export function startNewWorkflowRecord(
  itemType?: string | null,
  source: WorkflowUpdateSource = "panel",
): CreateWorkflowRecord {
  const base = emptyWorkflowRecord();
  if (!itemType?.trim()) return { ...base, sourceOfLastUpdate: source };
  const wf = {
    ...advanceToDiscovery(advanceAfterItemPick(itemType.trim()), {
      preserveAnswers: false,
    }),
    sessionId: base.workflowId,
    selectedTypeLabel: itemType.trim(),
    categoryId: categoryIdForType(itemType.trim()),
    questionMode: "split_screen" as const,
    skippedQuestionIds: [],
  };
  const record: CreateWorkflowRecord = {
    workflowId: base.workflowId,
    itemType: itemType.trim(),
    subtype: wf.selectedSubtype,
    currentPhase: "discovery",
    currentQuestionId: null,
    collectedAnswers: {},
    skippedQuestions: [],
    draftContent: "",
    draftStatus: "idle",
    lastUpdated: nowIso(),
    sourceOfLastUpdate: source,
    activeWorkspace: ACTIVE_WORKSPACE,
    workflowState: wf,
  };
  return syncCurrentQuestionId(record);
}

export function workflowRecordFromState(
  wf: CreateWorkflowState,
  opts?: {
    builderPhase?: CreateBuilderPhase | null;
    source?: WorkflowUpdateSource;
    itemType?: string | null;
  },
): CreateWorkflowRecord {
  const type =
    opts?.itemType?.trim() ||
    resolvedTypeLabel(wf) ||
    wf.selectedTypeLabel?.trim() ||
    null;
  const collectedAnswers = { ...wf.discoveryAnswers };
  const skippedQuestions = [...(wf.skippedQuestionIds ?? [])];
  const record: CreateWorkflowRecord = {
    workflowId: wf.sessionId ?? newCreateSessionId(),
    itemType: type,
    subtype: wf.selectedSubtype ?? wf.customSubtype ?? null,
    currentPhase: phaseFromWorkflow(wf, opts?.builderPhase),
    currentQuestionId: null,
    collectedAnswers,
    skippedQuestions,
    draftContent: wf.draftContent ?? "",
    draftStatus: wf.draftStatus,
    lastUpdated: nowIso(),
    sourceOfLastUpdate: opts?.source ?? "panel",
    activeWorkspace: ACTIVE_WORKSPACE,
    workflowState: {
      ...wf,
      sessionId: wf.sessionId ?? newCreateSessionId(),
      discoveryAnswers: collectedAnswers,
      skippedQuestionIds: skippedQuestions,
    },
  };
  return syncCurrentQuestionId(record);
}

export function workflowStateFromRecord(
  record: CreateWorkflowRecord,
): CreateWorkflowState {
  return {
    ...record.workflowState,
    sessionId: record.workflowId,
    discoveryAnswers: { ...record.collectedAnswers },
    skippedQuestionIds: [...record.skippedQuestions],
    draftContent: record.draftContent || record.workflowState.draftContent,
    draftStatus: record.draftStatus,
    selectedTypeLabel:
      record.itemType ?? record.workflowState.selectedTypeLabel,
    selectedSubtype: record.subtype ?? record.workflowState.selectedSubtype,
  };
}

export function builderSessionFromRecord(
  record: CreateWorkflowRecord,
): CreateBuilderSession {
  const wf = workflowStateFromRecord(record);
  return {
    typeLabel: record.itemType,
    workflow: wf,
    phase: builderPhaseFromRecord(record),
  };
}

export function recordDiscoveryComplete(record: CreateWorkflowRecord): boolean {
  const type = record.itemType;
  if (!type) return false;
  return discoveryComplete(type, workflowStateFromRecord(record));
}

export function applyAnswerToRecord(
  record: CreateWorkflowRecord,
  answer: string,
  source: WorkflowUpdateSource,
): CreateWorkflowRecord {
  const type = record.itemType;
  if (!type) return record;
  const trimmed = answer.trim();
  if (!trimmed) return record;

  const question =
    currentQuestionForRecord(record) ??
    (record.currentQuestionId
      ? getDiscoveryQuestions(type, record.collectedAnswers).find(
          (q) => q.id === record.currentQuestionId,
        )
      : null);
  if (!question) return record;

  const wf = advanceAfterDiscoveryAnswer(
    workflowStateFromRecord(record),
    type,
    question.id,
    trimmed,
  );
  const next: CreateWorkflowRecord = {
    ...record,
    collectedAnswers: { ...wf.discoveryAnswers },
    skippedQuestions: [...(wf.skippedQuestionIds ?? [])],
    currentPhase: wf.step === "readiness" ? "readiness" : "discovery",
    draftStatus: wf.draftStatus,
    lastUpdated: nowIso(),
    sourceOfLastUpdate: source,
    workflowState: wf,
  };
  return syncCurrentQuestionId(next);
}

export function skipQuestionOnRecord(
  record: CreateWorkflowRecord,
  questionId: string,
  source: WorkflowUpdateSource,
): CreateWorkflowRecord {
  const type = record.itemType;
  if (!type) return record;
  const wf = skipDiscoveryQuestion(
    workflowStateFromRecord(record),
    type,
    questionId,
  );
  const next: CreateWorkflowRecord = {
    ...record,
    collectedAnswers: { ...wf.discoveryAnswers },
    skippedQuestions: [...(wf.skippedQuestionIds ?? [])],
    currentPhase: wf.step === "readiness" ? "readiness" : "discovery",
    lastUpdated: nowIso(),
    sourceOfLastUpdate: source,
    workflowState: wf,
  };
  return syncCurrentQuestionId(next);
}

export function mergeRecordFromWorkflow(
  record: CreateWorkflowRecord | null,
  wf: CreateWorkflowState,
  source: WorkflowUpdateSource,
  builderPhase?: CreateBuilderPhase | null,
): CreateWorkflowRecord {
  const base = record ?? emptyWorkflowRecord(wf.sessionId ?? undefined);
  const mergedWf: CreateWorkflowState = {
    ...base.workflowState,
    ...wf,
    sessionId: base.workflowId,
    discoveryAnswers: {
      ...base.collectedAnswers,
      ...wf.discoveryAnswers,
    },
    skippedQuestionIds: [
      ...new Set([
        ...base.skippedQuestions,
        ...(wf.skippedQuestionIds ?? []),
      ]),
    ],
    sectionContent: {
      ...(base.workflowState.sectionContent ?? {}),
      ...(wf.sectionContent ?? {}),
    },
  };
  const type =
    resolvedTypeLabel(mergedWf) || base.itemType || mergedWf.selectedTypeLabel;
  return syncCurrentQuestionId({
    ...base,
    itemType: type,
    subtype: mergedWf.selectedSubtype ?? mergedWf.customSubtype ?? null,
    collectedAnswers: { ...mergedWf.discoveryAnswers },
    skippedQuestions: [...(mergedWf.skippedQuestionIds ?? [])],
    draftContent: mergedWf.draftContent ?? base.draftContent,
    draftStatus: mergedWf.draftStatus,
    currentPhase: phaseFromWorkflow(mergedWf, builderPhase),
    lastUpdated: nowIso(),
    sourceOfLastUpdate: source,
    workflowState: mergedWf,
  });
}

export function buildBriefFromRecord(record: CreateWorkflowRecord): string {
  const type = record.itemType;
  if (!type) return buildBriefFromWorkflow(workflowStateFromRecord(record));
  return buildBriefFromDiscovery(
    type,
    record.collectedAnswers,
    record.subtype,
  );
}

export function recordAfterDraftBuild(
  record: CreateWorkflowRecord,
  draft: string,
  wf: CreateWorkflowState,
  source: WorkflowUpdateSource,
): CreateWorkflowRecord {
  const merged = mergeRecordFromWorkflow(record, wf, source, "revise-offer");
  return {
    ...merged,
    draftContent: draft,
    draftStatus: "ready",
    currentPhase: "revise-offer",
    workflowState: {
      ...workflowStateFromRecord(merged),
      draftContent: draft,
      draftStatus: "ready",
      buildApproved: true,
      step: "improve",
    },
  };
}

export function recordToReadiness(
  record: CreateWorkflowRecord,
  source: WorkflowUpdateSource,
): CreateWorkflowRecord {
  const wf = {
    ...workflowStateFromRecord(record),
    step: "readiness" as const,
    readinessConfirmed: true,
  };
  return syncCurrentQuestionId({
    ...record,
    currentPhase: "readiness",
    workflowState: wf,
    lastUpdated: nowIso(),
    sourceOfLastUpdate: source,
  });
}

/** Next chat question text — null if already answered or skipped. */
export function nextQuestionPrompt(record: CreateWorkflowRecord): string | null {
  const q = currentQuestionForRecord(record);
  return q?.prompt ?? null;
}

export function questionAlreadyAnswered(
  record: CreateWorkflowRecord,
  questionId: string,
): boolean {
  return (
    Boolean(record.collectedAnswers[questionId]?.trim()) ||
    record.skippedQuestions.includes(questionId)
  );
}

export type RecordBuilderTurnResult = CreateBuilderTurnResult & {
  record: CreateWorkflowRecord;
};

/** Chat turn — merges result back into the shared workflow record. */
export function processCreateBuilderTurnWithRecord(
  record: CreateWorkflowRecord,
  userText: string,
  lastAssistantText = "",
): RecordBuilderTurnResult {
  const session = builderSessionFromRecord(record);
  const turn = processCreateBuilderTurn(session, userText, lastAssistantText);
  const nextRecord = mergeRecordFromWorkflow(
    record,
    turn.session.workflow,
    "chat",
    turn.session.phase,
  );
  return {
    ...turn,
    record: nextRecord,
    session: builderSessionFromRecord(nextRecord),
  };
}
