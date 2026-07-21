/**
 * Work archive / restore — lifecycle only; never mints a new Work ID.
 */

import type { CanonicalWorkId } from "../types";
import { getWorkIdentity, listWorkIdentities } from "../identity/workIdentityStore";
import { getWorkBlueprintState, putWorkBlueprintState } from "../blueprints/workBlueprintStateStore";

export type WorkLifecycleStatus = "active" | "archived";

type ArchiveRecord = {
  workId: CanonicalWorkId;
  status: WorkLifecycleStatus;
  archivedAt: string | null;
  restoredAt: string | null;
};

const byWorkId = new Map<string, ArchiveRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

export function resetWorkArchiveForTests(): void {
  byWorkId.clear();
}

export function getWorkLifecycleStatus(
  workId: string,
): WorkLifecycleStatus {
  return byWorkId.get(workId)?.status ?? "active";
}

/** Archive Work — same Work ID; content preserved. */
export function archiveWork(workId: string): ArchiveRecord {
  const id = workId.trim();
  if (!getWorkIdentity(id) && !getWorkBlueprintState(id)) {
    throw new Error(`Cannot archive unknown Work "${id}"`);
  }
  const record: ArchiveRecord = {
    workId: id as CanonicalWorkId,
    status: "archived",
    archivedAt: nowIso(),
    restoredAt: byWorkId.get(id)?.restoredAt ?? null,
  };
  byWorkId.set(id, record);
  const state = getWorkBlueprintState(id);
  if (state) {
    putWorkBlueprintState({
      ...state,
      knownContext: { ...state.knownContext, lifecycle_status: "archived" },
      updatedAt: nowIso(),
    });
  }
  return record;
}

/** Restore archived Work — same Work ID; ready to reopen. */
export function restoreWork(workId: string): ArchiveRecord {
  const id = workId.trim();
  const current = byWorkId.get(id);
  if (!current || current.status !== "archived") {
    throw new Error(`Work "${id}" is not archived`);
  }
  const record: ArchiveRecord = {
    workId: id as CanonicalWorkId,
    status: "active",
    archivedAt: current.archivedAt,
    restoredAt: nowIso(),
  };
  byWorkId.set(id, record);
  const state = getWorkBlueprintState(id);
  if (state) {
    putWorkBlueprintState({
      ...state,
      knownContext: { ...state.knownContext, lifecycle_status: "active" },
      updatedAt: nowIso(),
    });
  }
  return record;
}

export function listArchivedWorkIds(): CanonicalWorkId[] {
  return [...byWorkId.values()]
    .filter((r) => r.status === "archived")
    .map((r) => r.workId);
}

/** Sanity: archived works still have identity records. */
export function assertNoOrphanArchivedWorks(): void {
  const identities = new Set(listWorkIdentities().map((i) => i.workId));
  for (const id of listArchivedWorkIds()) {
    if (!identities.has(id) && !getWorkBlueprintState(id)) {
      throw new Error(`Orphan archived Work "${id}"`);
    }
  }
}
