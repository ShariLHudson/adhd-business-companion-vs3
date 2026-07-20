/**
 * Standard 072 — Exact workspace hydrate.
 * Resume reopens the persisted object — never re-bootstraps a template.
 */

import type { CreateBuilderSession } from "@/lib/createBuilderChat";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { EMPTY_CREATE_WORKFLOW, resolvedTypeLabel } from "@/lib/createWorkflow";
import { coerceCreationDestinationQuestionMode } from "@/lib/currentFocus/questionMode";
import {
  ensureRuntimeCreationRecord,
  getRuntimeCreationRecord,
  mergeRuntimeRecordIntoWorkflow,
} from "@/lib/currentFocus/creationRecord";
import { loadWorkflowRecord } from "@/lib/createWorkflowRecordStore";
import { workflowStateFromRecord } from "@/lib/createWorkflowRecord";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace";
import { getEventRecord } from "@/lib/eventsIntelligence/eventRecordStore";
import { traceWorkspacePersist } from "@/lib/activeWorkspaceRegistry/workspacePersistenceDiagnostics";

/**
 * Hydrate exact Create workflow from persistence — NO bootstrap / NO new template.
 * Returns null if no durable schema exists.
 * 074 — Event Record fallback rebuilds runtime so hard refresh restores the same ID.
 */
export function hydrateExactWorkflowFromPersistence(
  workspaceId: string,
): CreateWorkflowState | null {
  const id = workspaceId.trim();
  if (!id) return null;

  let runtime = getRuntimeCreationRecord(id);
  const event = getEventRecord(id);
  const workflowRecord = loadWorkflowRecord();
  const fromBookmark =
    workflowRecord &&
    (workflowRecord.workflowId === id ||
      workflowRecord.workflowState?.sessionId === id ||
      workflowRecord.workflowState?.eventRecordId === id)
      ? workflowStateFromRecord(workflowRecord)
      : null;

  // Event-only survival: rebuild runtime schema from Event Record once
  if (!runtime?.templateSections?.length && event) {
    const seeded = applyEventWorkspaceToCreateWorkflow(
      {
        ...(fromBookmark ?? EMPTY_CREATE_WORKFLOW),
        sessionId: id,
        eventRecordId: event.id,
        workspaceFirst: true,
        questionMode: "current_focus",
        selectedTypeLabel:
          fromBookmark?.selectedTypeLabel ||
          event.eventTypeLabel ||
          "Event Plan",
        selectedTemplateName: event.title,
      },
      event,
    );
    runtime = ensureRuntimeCreationRecord(seeded);
    traceWorkspacePersist(
      "hydrate_event_fallback",
      id,
      Boolean(runtime?.templateSections?.length),
      event.title,
    );
  }

  if (!runtime && !fromBookmark) return null;

  const templateSections =
    runtime?.templateSections?.length
      ? runtime.templateSections
      : fromBookmark?.templateSections?.length
        ? fromBookmark.templateSections
        : null;

  // Exact hydrate requires a preserved schema
  if (!templateSections?.length && !fromBookmark?.templateSections?.length) {
    return null;
  }

  const base: CreateWorkflowState = {
    ...(fromBookmark ?? {
      ...EMPTY_CREATE_WORKFLOW,
      selectedTypeLabel: runtime?.typeLabel ?? null,
      customTypeLabel: null,
      selectedSubtype: null,
      categoryId: null,
      step: "discovery",
      discoveryAnswers: {},
      discoveryIndex: 0,
      readinessConfirmed: false,
      buildApproved: false,
      selectedTemplateId: runtime?.selectedTemplateId ?? null,
      selectedTemplateName:
        runtime?.selectedTemplateName ?? runtime?.title ?? null,
      templateSections,
      useTemplate: true,
      draftStatus: runtime?.draftContent ? "ready" : "idle",
      draftContent: runtime?.draftContent ?? null,
      sessionId: id,
      skippedQuestionIds: [],
      skippedSectionIds: runtime?.skippedSectionIds ?? [],
      questionMode: "current_focus",
      workspaceFirst: true,
      creationWorkspaceKind: runtime?.creationWorkspaceKind ?? null,
      eventRecordId: runtime?.eventRecordId ?? event?.id ?? null,
      sectionContent: runtime?.sectionContent ?? {},
    }),
    sessionId: id,
    questionMode: coerceCreationDestinationQuestionMode("current_focus"),
    workspaceFirst: true,
  };

  if (templateSections?.length) {
    base.templateSections = templateSections;
  }

  if (runtime) {
    return mergeRuntimeRecordIntoWorkflow(base, runtime);
  }
  return base;
}

export function hydrateExactBuilderSession(
  workspaceId: string,
): CreateBuilderSession | null {
  const workflow = hydrateExactWorkflowFromPersistence(workspaceId);
  if (!workflow) return null;
  const typeLabel = resolvedTypeLabel(workflow) || "Creation";
  traceWorkspacePersist(
    "restore_builder_session",
    workspaceId,
    true,
    typeLabel,
  );
  return {
    typeLabel,
    workflow,
    phase: "workspace",
  };
}

/**
 * 074+ — Prefer authoritative DB row, then exact local hydrate.
 */
export async function hydrateExactBuilderSessionFromDurable(
  workspaceId: string,
): Promise<CreateBuilderSession | null> {
  const id = workspaceId.trim();
  if (!id) return null;
  try {
    const {
      fetchAuthoritativeCreation,
      applyVerifiedCreationToCaches,
      markWorkspaceAuthoritativelyDurable,
    } = await import("@/lib/creationDurable");
    const record = await fetchAuthoritativeCreation(id);
    if (record) {
      markWorkspaceAuthoritativelyDurable(
        record.workspaceId,
        record.version,
        record.updatedAt,
      );
      applyVerifiedCreationToCaches(record, null);
    }
  } catch {
    /* fall through to local exact hydrate */
  }
  return hydrateExactBuilderSession(id);
}

/**
 * 074 — True only when resume restored the same identity + schema + progress.
 * ID-only match after bootstrap reconstruction must fail.
 */
export function verifyHydratedWorkspaceIdentity(
  workflow: CreateWorkflowState,
  expectedWorkspaceId: string,
): boolean {
  const id = expectedWorkspaceId.trim();
  if (!id) return false;
  const idMatch = workflow.sessionId === id || workflow.eventRecordId === id;
  if (!idMatch) return false;

  const exact = hydrateExactWorkflowFromPersistence(id);
  if (!exact) return false;

  const sections = workflow.templateSections ?? [];
  if (!sections.length) return false;

  const exactSections = exact.templateSections ?? [];
  if (exactSections.length) {
    const exactIds = exactSections.map((s) => s.id).join("|");
    const wfIds = sections.map((s) => s.id).join("|");
    if (exactIds !== wfIds) return false;
  }

  const exactContent = exact.sectionContent ?? {};
  const wfContent = workflow.sectionContent ?? {};
  const answered = Object.keys(exactContent).filter((k) =>
    Boolean(exactContent[k]?.trim()),
  );
  for (const key of answered) {
    if ((wfContent[key] || "").trim() !== (exactContent[key] || "").trim()) {
      return false;
    }
  }

  if (exact.draftContent?.trim()) {
    if ((workflow.draftContent || "").trim() !== exact.draftContent.trim()) {
      return false;
    }
  }

  return true;
}
