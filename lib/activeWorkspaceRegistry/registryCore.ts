/**
 * Light Active Workspace Registry — list / archive / restore / store.
 * No creationRecord, eventRecordStore, or Event Workspace imports.
 * Project Homes and Continue projections must import from here only.
 */

import {
  ACTIVE_WORKSPACE_REGISTRY_KEY,
  LAST_ACTIVE_WORKSPACE_KEY,
  safeLocalStorageSet,
} from "@/lib/companionStorageRecovery";
import type { ActiveWorkspaceEntry, ActiveWorkspaceStatus } from "./types";

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
  return lastRegistryPersistDurable;
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

/** Statuses only Restore (explicit member action) may clear. */
const RECOVERABLE_OR_DELETED_STATUSES: ReadonlySet<ActiveWorkspaceStatus> =
  new Set(["archived", "trashed", "deleted"]);

export function upsertActiveWorkspace(
  entry: ActiveWorkspaceEntry,
): ActiveWorkspaceEntry {
  const store = readStore();
  const existing = store.byId[entry.workspaceId];
  const incomingStatus = entry.status || "active";
  // Registration/autosave/hydrate writes default to "active" without knowing
  // whether the member already moved this work to Archive/Trash or deleted
  // it. Never let a background write silently resurrect it — only an
  // explicit restoreActiveWorkspace() call may bring it back to Continue.
  const status: ActiveWorkspaceStatus =
    existing &&
    RECOVERABLE_OR_DELETED_STATUSES.has(existing.status) &&
    incomingStatus === "active"
      ? existing.status
      : incomingStatus;
  const next: ActiveWorkspaceEntry = {
    ...entry,
    lastActivityAt: entry.lastActivityAt || new Date().toISOString(),
    status,
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

export function hasRegistryWorkspaceId(workspaceId: string): boolean {
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

/** Read-only list — does not hydrate runtime/Event (avoids Create graph on Project Homes). */
export function listActiveWorkspaces(): ActiveWorkspaceEntry[] {
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
export function restoreActiveWorkspace(
  workspaceId: string,
): ActiveWorkspaceEntry | null {
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

export function relatedWorkspaceIds(workspaceId: string): Set<string> {
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
 * @deprecated Prefer moveActiveWorkspaceToTrash — recoverable by default (084).
 */
export function removeActiveWorkspaceFromContinue(workspaceId: string): void {
  moveActiveWorkspaceToTrash(workspaceId);
}

/** Mark registry status deleted in-store (runtime/Event cleanup stays in registry.ts). */
export function markRegistryWorkspacesDeleted(relatedIds: Set<string>): void {
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

export { rememberLastActiveWorkspaceId };
