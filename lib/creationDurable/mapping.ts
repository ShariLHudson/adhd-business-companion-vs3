/**
 * Map Create workflow / runtime record ↔ authoritative durable payload.
 */

import { deriveCreationIdentity } from "@/lib/creationIdentity";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceV2";
import type { RuntimeCreationRecord } from "@/lib/currentFocus/creationRecord";
import type {
  AuthoritativeCreationPayload,
  AuthoritativeCreationRecord,
  CreationDurableRow,
} from "./types";

function emptyPayload(): AuthoritativeCreationPayload {
  return {
    schemaId: null,
    schemaVersion: null,
    templateSections: [],
    currentFocusId: null,
    currentFocusIndex: 0,
    answers: {},
    knownFacts: {},
    draft: null,
    draftReady: false,
    progress: { answeredCount: 0, totalFocusCount: 0, percent: 0 },
    workflowSnapshot: null,
    registryMeta: {
      humanTitle: "",
      creationTypeLabel: "",
      lastActiveAt: new Date().toISOString(),
      projectLinked: false,
    },
  };
}

export function rowToAuthoritative(row: CreationDurableRow): AuthoritativeCreationRecord {
  const payload =
    row.payload && typeof row.payload === "object"
      ? ({ ...emptyPayload(), ...row.payload } as AuthoritativeCreationPayload)
      : emptyPayload();
  return {
    workspaceId: row.id,
    userId: row.user_id,
    creationType: row.creation_type ?? "",
    title: row.title ?? "",
    status: row.status ?? "active",
    originalRequest: row.original_request ?? "",
    kind: (row.kind as AuthoritativeCreationRecord["kind"]) || "creation",
    eventRecordId: row.event_record_id,
    projectHomeId: row.project_home_id,
    version: Number(row.persistence_version) || 1,
    payload,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function authoritativeToRow(
  record: AuthoritativeCreationRecord
): CreationDurableRow {
  return {
    id: record.workspaceId,
    user_id: record.userId,
    creation_type: record.creationType,
    title: record.title,
    status: record.status,
    original_request: record.originalRequest,
    kind: record.kind,
    event_record_id: record.eventRecordId,
    project_home_id: record.projectHomeId,
    persistence_version: record.version,
    payload: record.payload,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

export function buildPayloadFromWorkflow(
  workflow: CreateWorkflowState,
  runtime?: RuntimeCreationRecord | null,
  originalRequest?: string | null,
): AuthoritativeCreationPayload {
  const sections = workspaceV2Sections(workflow);
  const answers: Record<string, string> = {
    ...(runtime?.sectionContent ?? {}),
    ...(workflow.sectionContent ?? {}),
  };
  const answeredCount = Object.values(answers).filter((v) => v?.trim()).length;
  const totalFocusCount = Math.max(sections.length, 1);
  const focusId =
    workflow.workspaceCurrentFocus?.sectionId ??
    runtime?.focusSectionId ??
    sections.find((s) => !s.skipped && !s.content.trim())?.id ??
    null;
  const focusIndex = focusId
    ? Math.max(
        0,
        sections.findIndex((s) => s.id === focusId)
      )
    : 0;
  const typeLabel =
    resolvedTypeLabel(workflow) ||
    workflow.workingIntent?.replace(/^Create\s+/i, "") ||
    runtime?.typeLabel ||
    "Creation";
  const requestForTitle =
    originalRequest?.trim() ||
    workflow.originalRequest?.trim() ||
    runtime?.originalRequest?.trim() ||
    Object.values(workflow.discoveryAnswers ?? {}).find((v) => v?.trim()) ||
    "";
  // Permanent rule: title from Creation Identity — never raw chat truncation.
  // Prefer an already-confirmed title; never re-mash a good name.
  const identity = deriveCreationIdentity({
    originalRequest: requestForTitle,
    creationType: typeLabel,
    confirmedTitle:
      workflow.selectedTemplateName ||
      runtime?.selectedTemplateName ||
      runtime?.title ||
      null,
  });
  const title = identity.humanWorkspaceTitle;
  const draft =
    workflow.draftContent?.trim() || runtime?.draftContent?.trim() || null;
  const templateSections = (
    workflow.templateSections?.length
      ? workflow.templateSections
      : runtime?.templateSections ??
        sections.map((s) => ({ id: s.id, label: s.label }))
  ).map((s) => ({
    id: s.id,
    title: "label" in s ? String(s.label) : String((s as { title?: string }).title ?? s.id),
    prompt: undefined,
  }));

  const knownFacts: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(answers)) {
    if (v?.trim()) knownFacts[k] = v.trim();
  }

  return {
    schemaId: workflow.selectedTemplateId ?? runtime?.selectedTemplateId ?? null,
    schemaVersion: runtime?.schemaVersion ?? "1",
    templateSections,
    currentFocusId: focusId,
    currentFocusIndex: focusIndex,
    answers,
    knownFacts,
    draft,
    draftReady: Boolean(draft),
    progress: {
      answeredCount,
      totalFocusCount,
      percent: Math.round((answeredCount / totalFocusCount) * 100),
    },
    workflowSnapshot: {
      sessionId: workflow.sessionId,
      selectedTypeLabel: workflow.selectedTypeLabel,
      selectedTemplateName: title,
      workingIntent:
        workflow.workingIntent?.trim() ||
        runtime?.workingIntent?.trim() ||
        identity.workingIntent,
      originalRequest: requestForTitle || identity.originalRequest,
      skippedSectionIds: workflow.skippedSectionIds ?? runtime?.skippedSectionIds ?? [],
      discoveryAnswers: workflow.discoveryAnswers ?? {},
      draftStatus: workflow.draftStatus,
      workspacePhaseLabel: workflow.workspacePhaseLabel,
      questionMode: workflow.questionMode,
      creationWorkspaceKind: workflow.creationWorkspaceKind,
    },
    registryMeta: {
      humanTitle: title,
      creationTypeLabel: typeLabel,
      lastActiveAt: new Date().toISOString(),
      projectLinked: Boolean(workflow.projectHomeId),
    },
  };
}

export function buildAuthoritativeFromWorkflow(input: {
  workflow: CreateWorkflowState;
  runtime?: RuntimeCreationRecord | null;
  userId: string;
  previous?: AuthoritativeCreationRecord | null;
  originalRequest?: string;
}): AuthoritativeCreationRecord {
  const id =
    input.workflow.eventRecordId?.trim() ||
    input.workflow.sessionId?.trim() ||
    input.previous?.workspaceId ||
    `creation-${Date.now()}`;
  const now = new Date().toISOString();
  const originalRequest =
    input.originalRequest?.trim() ||
    input.workflow.originalRequest?.trim() ||
    input.previous?.originalRequest ||
    input.runtime?.originalRequest?.trim() ||
    Object.values(input.workflow.discoveryAnswers ?? {}).find((v) => v?.trim()) ||
    "";
  const payload = buildPayloadFromWorkflow(
    input.workflow,
    input.runtime,
    originalRequest,
  );
  const typeLabel = payload.registryMeta.creationTypeLabel;
  const title = payload.registryMeta.humanTitle;
  const nextVersion = (input.previous?.version ?? 0) + 1;
  return {
    workspaceId: id,
    userId: input.userId,
    creationType: typeLabel,
    title,
    status: input.previous?.status ?? "active",
    originalRequest,
    kind: input.workflow.eventRecordId ? "event" : "creation",
    eventRecordId: input.workflow.eventRecordId ?? input.previous?.eventRecordId ?? null,
    projectHomeId: input.previous?.projectHomeId ?? null,
    version: nextVersion,
    payload,
    createdAt: input.previous?.createdAt ?? now,
    updatedAt: now,
  };
}
