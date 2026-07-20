/**
 * Standard 071 — Canonical Active Workspace Registry.
 * Every resume surface reads from here. No independent lists.
 */

import {
  ACTIVE_WORKSPACE_REGISTRY_KEY,
  LAST_ACTIVE_WORKSPACE_KEY,
  getLastLocalStorageWriteDiagnostic,
  safeLocalStorageSet,
} from "@/lib/companionStorageRecovery";
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
  wasLastRuntimePersistDurable,
} from "@/lib/currentFocus/creationRecord";
import { clearOptionalCreationCache } from "@/lib/creationDurable/optionalCache";
import { clearAuthoritativeDurableMark } from "@/lib/creationDurable/verifiedRegistry";
import {
  clearWorkflowRecord,
  loadWorkflowRecord,
} from "@/lib/createWorkflowRecordStore";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace";
import {
  cancelEventRecord,
  listEventRecords,
  verifyEventRecordDurable,
} from "@/lib/eventsIntelligence/eventRecordStore";
import { resolveCanonicalWorkspaceStatus } from "./canonicalStatus";
import {
  extractTitleFromDraftContent,
  resolveHumanReadableTitle,
  sanitizeMemberFacingTitle,
} from "./humanReadableIdentity";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import { traceWorkspacePersist } from "./workspacePersistenceDiagnostics";
import type {
  ActiveWorkspaceDraftState,
  ActiveWorkspaceEntry,
} from "./types";

const STORAGE_KEY = ACTIVE_WORKSPACE_REGISTRY_KEY;

/** 074 — last registry durable write succeeded. */
let lastRegistryPersistDurable = true;

export function wasLastRegistryPersistDurable(): boolean {
  return lastRegistryPersistDurable;
}

type Store = {
  byId: Record<string, ActiveWorkspaceEntry>;
  mostRecentId: string | null;
};

const memory: Store = { byId: {}, mostRecentId: null };

function readStore(): Store {
  if (typeof window === "undefined") {
    return { byId: { ...memory.byId }, mostRecentId: memory.mostRecentId };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { byId: { ...memory.byId }, mostRecentId: memory.mostRecentId };
    }
    const parsed = JSON.parse(raw) as Store;
    if (!parsed?.byId || typeof parsed.byId !== "object") {
      return { byId: {}, mostRecentId: null };
    }
    return {
      byId: parsed.byId,
      mostRecentId: parsed.mostRecentId ?? null,
    };
  } catch {
    return { byId: { ...memory.byId }, mostRecentId: memory.mostRecentId };
  }
}

function writeStore(store: Store): boolean {
  memory.byId = { ...store.byId };
  memory.mostRecentId = store.mostRecentId;
  if (typeof window === "undefined") {
    lastRegistryPersistDurable = true;
    return true;
  }
  const payload = JSON.stringify(store);
  const ok = safeLocalStorageSet(STORAGE_KEY, payload);
  if (ok) {
    try {
      lastRegistryPersistDurable =
        window.localStorage.getItem(STORAGE_KEY) === payload;
    } catch {
      lastRegistryPersistDurable = false;
    }
  } else {
    lastRegistryPersistDurable = false;
  }
  const diag = getLastLocalStorageWriteDiagnostic();
  const id = store.mostRecentId || Object.keys(store.byId)[0] || "unknown";
  traceWorkspacePersist(
    "registry_write",
    id,
    lastRegistryPersistDurable,
    lastRegistryPersistDurable
      ? `bytes=${payload.length}`
      : `REJECTED stage=${diag?.stage} err=${diag?.errorName ?? "?"} bytes=${payload.length} storageChars≈${diag?.approxStorageChars ?? "?"}`,
  );
  return lastRegistryPersistDurable;
}

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

function rememberLastActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  safeLocalStorageSet(LAST_ACTIVE_WORKSPACE_KEY, workspaceId);
}

/** Optional cache pointer — not authoritative durability. */
export function setLastActiveWorkspaceId(workspaceId: string): void {
  rememberLastActiveWorkspaceId(workspaceId);
}

export function readLastActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_ACTIVE_WORKSPACE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function upsertActiveWorkspace(
  entry: ActiveWorkspaceEntry,
): ActiveWorkspaceEntry {
  const store = readStore();
  const next: ActiveWorkspaceEntry = {
    ...entry,
    lastActivityAt: entry.lastActivityAt || new Date().toISOString(),
    status: entry.status || "active",
  };
  store.byId[next.workspaceId] = next;
  if (next.status === "active") {
    store.mostRecentId = next.workspaceId;
  }
  writeStore(store);
  return next;
}

export function touchActiveWorkspace(
  workspaceId: string,
  patch: Partial<ActiveWorkspaceEntry>,
): ActiveWorkspaceEntry | null {
  const store = readStore();
  const prev = store.byId[workspaceId];
  if (!prev) return null;
  const next: ActiveWorkspaceEntry = {
    ...prev,
    ...patch,
    workspaceId: prev.workspaceId,
    lastActivityAt: new Date().toISOString(),
  };
  store.byId[workspaceId] = next;
  if (next.status === "active") {
    store.mostRecentId = workspaceId;
  }
  writeStore(store);
  return next;
}

export function getActiveWorkspace(
  workspaceId: string | null | undefined,
): ActiveWorkspaceEntry | null {
  const id = workspaceId?.trim();
  if (!id) return null;
  const entry = readStore().byId[id];
  if (!entry || entry.status !== "active") return null;
  return entry;
}

/** Any status — used so hydrate never resurrects archived work. */
export function peekRegistryWorkspaceEntry(
  workspaceId: string | null | undefined,
): ActiveWorkspaceEntry | null {
  const id = workspaceId?.trim();
  if (!id) return null;
  return readStore().byId[id] ?? null;
}

function hasRegistryWorkspaceId(workspaceId: string): boolean {
  return Boolean(readStore().byId[workspaceId]);
}

export function getMostRecentActiveWorkspace(): ActiveWorkspaceEntry | null {
  const store = readStore();
  if (store.mostRecentId) {
    const entry = store.byId[store.mostRecentId];
    if (entry?.status === "active") return entry;
  }
  const active = Object.values(store.byId)
    .filter((e) => e.status === "active")
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  return active[0] ?? null;
}

export function listActiveWorkspaces(): ActiveWorkspaceEntry[] {
  // Heal missing runtime/Event into registry. Never resurrect archived/trashed
  // (hydrate skips ids already present, including non-active).
  if (typeof window !== "undefined") {
    hydrateActiveWorkspaceRegistryFromRuntimeRecords();
  }
  return Object.values(readStore().byId)
    .filter((e) => e.status === "active")
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}

function clearMostRecentIfNeeded(workspaceId: string): void {
  const store = readStore();
  if (store.mostRecentId !== workspaceId) return;
  const next = Object.values(store.byId)
    .filter((e) => e.status === "active" && e.workspaceId !== workspaceId)
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))[0];
  store.mostRecentId = next?.workspaceId ?? null;
  writeStore(store);
}

/** Soft Archive — hidden from Continue; Work ID + runtime preserved for Restore. */
export function archiveActiveWorkspace(workspaceId: string): void {
  const id = workspaceId.trim();
  if (!id) return;
  touchActiveWorkspace(id, { status: "archived" });
  clearMostRecentIfNeeded(id);
}

/**
 * Move to Trash — recoverable. Preserves Work ID + runtime content.
 * Prefer this over permanent delete (084_001).
 */
export function moveActiveWorkspaceToTrash(workspaceId: string): void {
  const id = workspaceId.trim();
  if (!id) return;
  const entry = peekRegistryWorkspaceEntry(id);
  if (!entry) {
    // Ensure a trashed marker exists so hydrate cannot resurrect as active.
    const store = readStore();
    store.byId[id] = {
      workspaceId: id,
      creationType: "Creation",
      title: "Removed work",
      currentFocusTitle: null,
      currentFocusId: null,
      progressLabel: "",
      lastActivityAt: new Date().toISOString(),
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: id,
      eventRecordId: null,
      projectHomeId: null,
      sessionId: id,
      status: "trashed",
      createdAt: new Date().toISOString(),
    };
    writeStore(store);
  } else {
    touchActiveWorkspace(id, { status: "trashed" });
  }
  clearMostRecentIfNeeded(id);
}

/**
 * Restore from Archive or Trash — same Work ID, back on Continue Your Work.
 */
export function restoreActiveWorkspace(workspaceId: string): ActiveWorkspaceEntry | null {
  const id = workspaceId.trim();
  if (!id) return null;
  const entry = peekRegistryWorkspaceEntry(id);
  if (!entry || entry.status === "deleted") return null;
  return touchActiveWorkspace(id, {
    status: "active",
    lastActivityAt: new Date().toISOString(),
  });
}

export function listRecoverableWorkspaces(): ActiveWorkspaceEntry[] {
  return Object.values(readStore().byId)
    .filter((e) => e.status === "archived" || e.status === "trashed")
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}

function relatedWorkspaceIds(workspaceId: string): Set<string> {
  const id = workspaceId.trim();
  const relatedIds = new Set<string>([id]);
  const store = readStore();
  const seed = store.byId[id];
  if (seed?.eventRecordId) relatedIds.add(seed.eventRecordId);
  if (seed?.runtimeCreationRecordId) {
    relatedIds.add(seed.runtimeCreationRecordId);
  }
  for (const entry of Object.values(store.byId)) {
    if (
      entry.workspaceId === id ||
      entry.eventRecordId === id ||
      entry.runtimeCreationRecordId === id
    ) {
      relatedIds.add(entry.workspaceId);
      if (entry.eventRecordId) relatedIds.add(entry.eventRecordId);
      if (entry.runtimeCreationRecordId) {
        relatedIds.add(entry.runtimeCreationRecordId);
      }
    }
  }
  return relatedIds;
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

  const store = readStore();
  for (const rid of relatedIds) {
    if (store.byId[rid]) {
      store.byId[rid] = {
        ...store.byId[rid]!,
        status: "deleted",
        lastActivityAt: new Date().toISOString(),
      };
    }
  }
  if (store.mostRecentId && relatedIds.has(store.mostRecentId)) {
    store.mostRecentId = null;
  }
  writeStore(store);

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
 * @deprecated Prefer moveActiveWorkspaceToTrash — recoverable by default (084).
 * Kept as Trash alias so existing Continue "Delete" callers stay safe.
 */
export function removeActiveWorkspaceFromContinue(workspaceId: string): void {
  moveActiveWorkspaceToTrash(workspaceId);
}

/**
 * Local Trash + durable status when signed in.
 */
export async function removeActiveWorkspaceFromContinueDurable(
  workspaceId: string,
): Promise<{ ok: true } | { ok: false; message: string; retryable: boolean }> {
  const id = workspaceId.trim();
  if (!id) {
    return { ok: false, message: "I couldn't find that work to remove.", retryable: false };
  }

  moveActiveWorkspaceToTrash(id);

  try {
    const { persistCreationArchive } = await import("@/lib/creationDurable");
    const durable = await persistCreationArchive(id);
    if (!durable.ok) {
      return {
        ok: false,
        message: durable.message,
        retryable: durable.retryable,
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function restoreActiveWorkspaceDurable(
  workspaceId: string,
): Promise<
  | { ok: true; workspaceId: string }
  | { ok: false; message: string; retryable: boolean }
> {
  const id = workspaceId.trim();
  const entry = restoreActiveWorkspace(id);
  if (!entry) {
    return {
      ok: false,
      message: "I couldn't restore that work.",
      retryable: false,
    };
  }
  try {
    const { persistCreationMutation } = await import("@/lib/creationDurable");
    const { getRuntimeCreationRecord } = await import(
      "@/lib/currentFocus/creationRecord"
    );
    const runtime = getRuntimeCreationRecord(id);
    if (runtime) {
      const { EMPTY_CREATE_WORKFLOW } = await import(
        "@/lib/createWorkflowState"
      );
      const wf = {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: id,
        eventRecordId: entry.eventRecordId,
        selectedTypeLabel: entry.creationType,
        selectedTemplateName: entry.title,
        workspaceFirst: true,
        questionMode: "current_focus" as const,
      };
      const durable = await persistCreationMutation({ workflow: wf, runtime });
      if (!durable.ok) {
        return {
          ok: false,
          message: durable.message,
          retryable: durable.retryable,
        };
      }
    }
    return { ok: true, workspaceId: entry.workspaceId };
  } catch {
    return { ok: true, workspaceId: entry.workspaceId };
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
  // 073 — human-readable identity; never bare "Workshop" / Default * Template
  const requestHint = [
    Object.values(workflow.discoveryAnswers ?? {})
      .filter((v) => v?.trim())
      .join(" "),
    Object.values(workflow.sectionContent ?? {})
      .filter((v) => v?.trim())
      .slice(0, 2)
      .join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const title = resolveHumanReadableTitle({
    memberTitle: workflow.selectedTemplateName,
    existingTitle: runtime.title,
    draftTitle: extractTitleFromDraftContent(draftContent, typeLabel),
    requestText: requestHint || null,
    creationType: typeLabel,
  });

  // Keep runtime title in sync when we promote a better human title
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
  // Canonical status drives progressLabel for cards when draft-ready
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
 * Memory / localStorage / Event LS alone never satisfy durable verification.
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
 * Events alone must never leave Projects / Welcome empty after refresh.
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
        // Respect archived/completed — never resurrect removed Continue work
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

  // 074 — heal from Event Records when runtime index was wiped
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
      // Rebuild Runtime Creation Record from Event so exact hydrate / resume work
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
 * Prefer renameActiveWorkspaceTitleDurable for member-facing success.
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
      ? { ok: true, entry, version: getAuthoritativeDurableVersion(workspaceId) ?? 0 }
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

export function clearActiveWorkspaceRegistryForTests(): void {
  memory.byId = {};
  memory.mostRecentId = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
