/**
 * Standard 071 — Canonical Active Workspace Registry (Create-heavy APIs).
 * List / archive / restore live in registryCore.ts so Project Homes never
 * loads creationRecord at module init.
 */

import {
  EMPTY_CREATE_WORKFLOW,
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "@/lib/createWorkflowState";
import {
  getAuthoritativeDurableVersion,
  isAuthoritativelyDurable,
} from "@/lib/creationDurable/verifiedRegistry";
import {
  ensureRuntimeCreationRecord,
  getRuntimeCreationRecord,
  removeRuntimeCreationRecord,
  upsertRuntimeCreationRecord,
  verifyRuntimeRecordDurable,
} from "@/lib/currentFocus/creationRecord";
import { clearOptionalCreationCache } from "@/lib/creationDurable/optionalCache";
import { clearAuthoritativeDurableMark } from "@/lib/creationDurable/verifiedRegistry";
import {
  clearWorkflowRecord,
  loadWorkflowRecord,
} from "@/lib/createWorkflowRecordStore";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace/applyWorkspaceToCreateWorkflow";
import {
  cancelEventRecord,
  listEventRecords,
} from "@/lib/eventsIntelligence/eventRecordStore";
import { resolveCanonicalWorkspaceStatus } from "./canonicalStatus";
import {
  extractTitleFromDraftContent,
  resolveHumanReadableTitle,
  sanitizeMemberFacingTitle,
} from "./humanReadableIdentity";
import { createTitleFromIntent } from "@/lib/createEstate/createTitleFromIntent";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import { traceWorkspacePersist } from "./workspacePersistTrace";
import type {
  ActiveWorkspaceDraftState,
  ActiveWorkspaceEntry,
} from "./types";
import {
  getActiveWorkspace,
  hasRegistryWorkspaceId,
  listActiveWorkspaces as listActiveWorkspacesCore,
  markRegistryWorkspacesDeleted,
  readLastActiveWorkspaceId,
  relatedWorkspaceIds,
  rememberLastActiveWorkspaceId,
  touchActiveWorkspace,
  upsertActiveWorkspace,
  wasLastRegistryPersistDurable,
} from "./registryCore";

export {
  archiveActiveWorkspace,
  clearActiveWorkspaceRegistryForTests,
  getActiveWorkspace,
  getMostRecentActiveWorkspace,
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  peekRegistryWorkspaceEntry,
  readLastActiveWorkspaceId,
  removeActiveWorkspaceFromContinue,
  restoreActiveWorkspace,
  setLastActiveWorkspaceId,
  touchActiveWorkspace,
  upsertActiveWorkspace,
  wasLastRegistryPersistDurable,
} from "./registryCore";

export {
  removeActiveWorkspaceFromContinueDurable,
  restoreActiveWorkspaceDurable,
} from "./registryDurable";

function draftStateFromWorkflow(
  workflow: CreateWorkflowState,
): ActiveWorkspaceDraftState {
  if (workflow.draftStatus === "building") return "building";
  if (workflow.draftStatus === "error") return "error";
  if (workflow.draftContent?.trim() || workflow.draftStatus === "ready") {
    return "ready";
  }
  return "none";
}

function progressLabelFromWorkflow(workflow: CreateWorkflowState): string {
  const sections = workspaceV2Sections(workflow);
  if (!sections.length) return "Getting started";
  const filled = sections.filter((s) => s.skipped || s.content.trim()).length;
  if (workflow.draftContent?.trim()) return "Draft ready for review";
  if (filled === 0) return "Getting started";
  if (filled >= sections.length) return "Ready to use";
  return `${filled} of ${sections.length} sections complete`;
}

/**
 * List active workspaces after healing runtime/Event into the registry.
 * Prefer listActiveWorkspaces() from registryCore on Project Homes.
 */
export function listActiveWorkspacesHealed(): ActiveWorkspaceEntry[] {
  if (typeof window !== "undefined") {
    hydrateActiveWorkspaceRegistryFromRuntimeRecords();
  }
  return listActiveWorkspacesCore();
}

/**
 * Permanently Delete — destroys runtime / cancels Event. Not recoverable.
 */
export function permanentlyDeleteActiveWorkspace(workspaceId: string): void {
  const id = workspaceId.trim();
  if (!id) return;

  const relatedIds = relatedWorkspaceIds(id);

  for (const rid of relatedIds) {
    removeRuntimeCreationRecord(rid);
    cancelEventRecord(rid);
    clearOptionalCreationCache(rid);
    clearAuthoritativeDurableMark(rid);
  }

  markRegistryWorkspacesDeleted(relatedIds);

  const workflow = loadWorkflowRecord();
  if (workflow) {
    const sessionId = workflow.workflowState?.sessionId?.trim();
    const eventId = workflow.workflowState?.eventRecordId?.trim();
    const workflowId = workflow.workflowId?.trim();
    if (
      (sessionId && relatedIds.has(sessionId)) ||
      (eventId && relatedIds.has(eventId)) ||
      (workflowId && relatedIds.has(workflowId))
    ) {
      clearWorkflowRecord();
    }
  }
}

/**
 * Register / refresh an active Creation Destination in the registry.
 * Call whenever Estate Working opens or Focus/draft advances.
 */
export function registerCreationDestinationWorkspace(
  workflow: CreateWorkflowState,
  opts?: { projectHomeId?: string | null },
): ActiveWorkspaceEntry {
  const runtime = ensureRuntimeCreationRecord(workflow);
  const focus = resolveFocusForCreationDestination({
    ...workflow,
    sessionId: workflow.sessionId || runtime.id,
  });
  const typeLabel =
    resolvedTypeLabel(workflow) || runtime.typeLabel || "Creation";
  const draftContent = runtime.draftContent ?? workflow.draftContent;
  const progressLabel = progressLabelFromWorkflow({
    ...workflow,
    sectionContent: runtime.sectionContent,
    skippedSectionIds: runtime.skippedSectionIds,
    draftContent,
  });
  const requestHint = [
    workflow.originalRequest,
    Object.values(workflow.discoveryAnswers ?? {})
      .filter((v) => v?.trim())
      .join(" "),
    Object.values(workflow.sectionContent ?? {})
      .filter((v) => v?.trim())
      .slice(0, 2)
      .join(" "),
  ]
    .filter((v) => typeof v === "string" && v.trim())
    .join(" ")
    .trim();
  // Spec 130 — prefer intent titles over template/schema display names.
  const intentTitle = createTitleFromIntent({
    requestText: workflow.originalRequest || requestHint || null,
    artifactType: typeLabel,
    templateName: workflow.selectedTemplateName,
  });
  const title = resolveHumanReadableTitle({
    memberTitle: intentTitle,
    existingTitle: runtime.title,
    draftTitle: extractTitleFromDraftContent(draftContent, typeLabel),
    requestText: workflow.originalRequest || requestHint || null,
    creationType: typeLabel,
  });

  if (title && title !== runtime.title) {
    upsertRuntimeCreationRecord({
      ...runtime,
      title,
      selectedTemplateName: title,
    });
  }

  const draftState = draftStateFromWorkflow({
    ...workflow,
    draftContent,
  });
  const status = resolveCanonicalWorkspaceStatus({
    draftState,
    progressLabel,
    hasDraft: Boolean(draftContent?.trim()),
    draftContent,
    workspacePhaseLabel: workflow.workspacePhaseLabel,
  });

  const entry = upsertActiveWorkspace({
    workspaceId: runtime.id,
    creationType: typeLabel,
    title,
    currentFocusTitle: focus.title,
    currentFocusId: focus.focusId,
    progressLabel:
      status === "Draft Ready" ? "Draft ready for review" : progressLabel,
    lastActivityAt: new Date().toISOString(),
    draftState,
    hasDraft: Boolean(draftContent?.trim()),
    resumeTarget: "estate-create",
    runtimeCreationRecordId: runtime.id,
    eventRecordId: workflow.eventRecordId ?? runtime.eventRecordId,
    projectHomeId: opts?.projectHomeId ?? null,
    sessionId: workflow.sessionId || runtime.id,
    status: "active",
    createdAt: runtime.createdAt,
  });

  rememberLastActiveWorkspaceId(runtime.id);
  const runtimeOk = verifyRuntimeRecordDurable(runtime.id);
  const registryOk = wasLastRegistryPersistDurable();
  traceWorkspacePersist("runtime_write", runtime.id, runtimeOk, runtime.title);
  traceWorkspacePersist(
    "registry_write",
    runtime.id,
    registryOk,
    entry.title,
  );
  traceWorkspacePersist(
    "readback",
    runtime.id,
    verifyCreationWorkspaceDurable(runtime.id),
    `runtime=${runtimeOk} registry=${registryOk}`,
  );
  return entry;
}

/**
 * 074+ — True only when authoritative DB write was verified (or hydrated from DB).
 */
export function verifyCreationWorkspaceDurable(workspaceId: string): boolean {
  const id = workspaceId.trim();
  if (!id) return false;
  return isAuthoritativelyDurable(id);
}

/** Sync registry entry from Runtime Creation Record alone (refresh hydration). */
export function syncRegistryFromRuntimeRecord(
  creationId: string,
): ActiveWorkspaceEntry | null {
  const runtime = getRuntimeCreationRecord(creationId);
  if (!runtime) return null;
  const existing = getActiveWorkspace(creationId);
  return upsertActiveWorkspace({
    workspaceId: runtime.id,
    creationType: runtime.typeLabel,
    title: sanitizeMemberFacingTitle(runtime.title, runtime.typeLabel),
    currentFocusTitle: existing?.currentFocusTitle ?? null,
    currentFocusId: existing?.currentFocusId ?? null,
    progressLabel: existing?.progressLabel ?? "In progress",
    lastActivityAt: runtime.updatedAt,
    draftState: runtime.draftContent?.trim()
      ? "ready"
      : (existing?.draftState ?? "none"),
    hasDraft: Boolean(runtime.draftContent?.trim()),
    resumeTarget: "estate-create",
    runtimeCreationRecordId: runtime.id,
    eventRecordId: runtime.eventRecordId,
    projectHomeId: existing?.projectHomeId ?? null,
    sessionId: existing?.sessionId ?? runtime.id,
    status: "active",
    createdAt: runtime.createdAt,
  });
}

/**
 * Refresh survival — rebuild Active Workspace from Runtime Records + Event Records.
 */
export function hydrateActiveWorkspaceRegistryFromRuntimeRecords(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  try {
    const raw = window.localStorage.getItem("spark.runtimeCreationRecords.v1");
    if (raw) {
      const parsed = JSON.parse(raw) as Record<
        string,
        {
          id: string;
          typeLabel: string;
          title: string;
          draftContent: string | null;
          eventRecordId: string | null;
          updatedAt: string;
          createdAt: string;
          currentFocusTitle?: string | null;
          focusSectionId?: string | null;
          sectionContent?: Record<string, string>;
        }
      >;
      for (const rec of Object.values(parsed)) {
        if (!rec?.id) continue;
        if (hasRegistryWorkspaceId(rec.id)) continue;
        if (rec.eventRecordId && hasRegistryWorkspaceId(rec.eventRecordId)) {
          continue;
        }
        const answered = Object.values(rec.sectionContent ?? {}).filter((v) =>
          Boolean(v?.trim()),
        ).length;
        upsertActiveWorkspace({
          workspaceId: rec.id,
          creationType: rec.typeLabel || "Creation",
          title: sanitizeMemberFacingTitle(
            rec.title,
            rec.typeLabel || "Creation",
          ),
          currentFocusTitle: rec.currentFocusTitle ?? null,
          currentFocusId: rec.focusSectionId ?? null,
          progressLabel: rec.draftContent?.trim()
            ? "Draft ready for review"
            : answered > 0
              ? `${answered} sections complete`
              : "Getting started",
          lastActivityAt: rec.updatedAt || new Date().toISOString(),
          draftState: rec.draftContent?.trim() ? "ready" : "none",
          hasDraft: Boolean(rec.draftContent?.trim()),
          resumeTarget: "estate-create",
          runtimeCreationRecordId: rec.id,
          eventRecordId: rec.eventRecordId,
          projectHomeId: null,
          sessionId: rec.id,
          status: "active",
          createdAt: rec.createdAt || rec.updatedAt || new Date().toISOString(),
        });
        count += 1;
      }
    }
  } catch {
    /* continue to Event hydrate */
  }

  try {
    for (const event of listEventRecords()) {
      if (!event?.id) continue;
      if (
        event.runtimeState === "COMPLETED" ||
        event.runtimeState === "CANCELED"
      ) {
        continue;
      }
      const typeLabel = event.eventTypeLabel?.trim() || "Event";
      const title = resolveHumanReadableTitle({
        memberTitle: event.title,
        requestText: event.purpose || event.title,
        creationType: typeLabel,
      });
      const linkedWorkId = event.canonicalWorkId || event.id;
      if (
        !hasRegistryWorkspaceId(event.id) &&
        !hasRegistryWorkspaceId(linkedWorkId)
      ) {
        upsertActiveWorkspace({
          workspaceId: event.id,
          creationType: typeLabel,
          title,
          currentFocusTitle: event.nextAction?.trim() || null,
          currentFocusId: null,
          progressLabel: "In Progress",
          lastActivityAt: event.updatedAt || new Date().toISOString(),
          draftState: "none",
          hasDraft: false,
          resumeTarget: "estate-create",
          runtimeCreationRecordId: linkedWorkId,
          eventRecordId: event.id,
          projectHomeId: event.projectHomeId ?? null,
          sessionId: event.id,
          status: "active",
          createdAt: event.createdAt || event.updatedAt || new Date().toISOString(),
        });
        count += 1;
      }
      if (!getRuntimeCreationRecord(event.id)) {
        try {
          const seeded = applyEventWorkspaceToCreateWorkflow(
            {
              ...EMPTY_CREATE_WORKFLOW,
              sessionId: event.id,
              eventRecordId: event.id,
              workspaceFirst: true,
              questionMode: "current_focus",
              selectedTypeLabel: "Event Plan",
              selectedTemplateName: title,
            },
            event,
          );
          ensureRuntimeCreationRecord(seeded);
          traceWorkspacePersist(
            "hydrate_event_fallback",
            event.id,
            verifyRuntimeRecordDurable(event.id),
            title,
          );
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }

  if (count > 0) {
    traceWorkspacePersist(
      "hydrate_registry",
      readLastActiveWorkspaceId() || "unknown",
      true,
      `healed=${count}`,
    );
  }

  return count;
}

/**
 * 073 — Rename human-readable title in memory/registry cache only.
 */
export function renameActiveWorkspaceTitle(
  workspaceId: string,
  nextTitle: string,
): ActiveWorkspaceEntry | null {
  const title = nextTitle.trim();
  if (!title || isTechnicalLike(title)) return getActiveWorkspace(workspaceId);

  const runtime = getRuntimeCreationRecord(workspaceId);
  if (runtime) {
    upsertRuntimeCreationRecord({
      ...runtime,
      title,
      selectedTemplateName: title,
      updatedAt: new Date().toISOString(),
    });
  }
  return touchActiveWorkspace(workspaceId, { title });
}

/**
 * 074+ — Persist rename to authoritative store before confirming success.
 */
export async function renameActiveWorkspaceTitleDurable(
  workspaceId: string,
  nextTitle: string,
  workflow?: CreateWorkflowState | null,
): Promise<
  | { ok: true; entry: ActiveWorkspaceEntry; version: number }
  | { ok: false; message: string; retryable: boolean }
> {
  const title = nextTitle.trim();
  if (!title || isTechnicalLike(title)) {
    const entry = getActiveWorkspace(workspaceId);
    return entry
      ? {
          ok: true,
          entry,
          version: getAuthoritativeDurableVersion(workspaceId) ?? 0,
        }
      : { ok: false, message: "Enter a name, then try again.", retryable: true };
  }

  const runtime = getRuntimeCreationRecord(workspaceId);
  const baseWorkflow: CreateWorkflowState = workflow ?? {
    ...EMPTY_CREATE_WORKFLOW,
    sessionId: workspaceId,
    eventRecordId: runtime?.eventRecordId ?? null,
    selectedTypeLabel: runtime?.typeLabel ?? "Creation",
    selectedTemplateName: title,
    sectionContent: runtime?.sectionContent ?? {},
    templateSections: runtime?.templateSections ?? null,
    draftContent: runtime?.draftContent ?? null,
    workspaceFirst: true,
    questionMode: "current_focus",
  };

  const { persistCreationRename } = await import("@/lib/creationDurable");
  const durable = await persistCreationRename({
    workflow: { ...baseWorkflow, selectedTemplateName: title },
    nextTitle: title,
  });
  if (!durable.ok) {
    return {
      ok: false,
      message: durable.message,
      retryable: durable.retryable,
    };
  }
  const entry =
    renameActiveWorkspaceTitle(workspaceId, durable.record.title) ??
    getActiveWorkspace(workspaceId);
  if (!entry) {
    return {
      ok: false,
      message: "Rename saved, but I couldn't refresh the card yet — Retry.",
      retryable: true,
    };
  }
  return { ok: true, entry, version: durable.version };
}

function isTechnicalLike(title: string): boolean {
  return /\bcreation workspace\b/i.test(title);
}
