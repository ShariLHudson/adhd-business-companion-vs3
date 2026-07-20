/**
 * Sole Continue projection API — all resume surfaces read from the registry.
 * Event / runtime heal into the registry; they do not form parallel lists.
 */

import {
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  getMostRecentActiveWorkspace,
} from "./registry";
import type { ActiveWorkspaceEntry } from "./types";

export type ContinueProjectionKind =
  | "active"
  | "recent"
  | "archived"
  | "trashed"
  | "resumable";

function newestFirst(a: ActiveWorkspaceEntry, b: ActiveWorkspaceEntry): number {
  return b.lastActivityAt.localeCompare(a.lastActivityAt);
}

/** Active Continue Your Work — registry status === active only. */
export function listActiveContinueProjection(): ActiveWorkspaceEntry[] {
  return listActiveWorkspaces().slice().sort(newestFirst);
}

/** Most recent active entries (Welcome / tip surfaces). */
export function listRecentContinueProjection(limit = 5): ActiveWorkspaceEntry[] {
  return listActiveContinueProjection().slice(0, Math.max(0, limit));
}

export function listArchivedContinueProjection(): ActiveWorkspaceEntry[] {
  return listRecoverableWorkspaces()
    .filter((e) => e.status === "archived")
    .sort(newestFirst);
}

export function listTrashedContinueProjection(): ActiveWorkspaceEntry[] {
  return listRecoverableWorkspaces()
    .filter((e) => e.status === "trashed")
    .sort(newestFirst);
}

/** Active + recoverable (archive/trash) — never permanently deleted. */
export function listResumableContinueProjection(): ActiveWorkspaceEntry[] {
  return [
    ...listActiveContinueProjection(),
    ...listRecoverableWorkspaces().sort(newestFirst),
  ];
}

export function getContinueProjection(
  kind: ContinueProjectionKind,
  limit?: number,
): ActiveWorkspaceEntry[] {
  switch (kind) {
    case "active":
      return listActiveContinueProjection();
    case "recent":
      return listRecentContinueProjection(limit ?? 5);
    case "archived":
      return listArchivedContinueProjection();
    case "trashed":
      return listTrashedContinueProjection();
    case "resumable":
      return listResumableContinueProjection();
    default:
      return [];
  }
}

export function getMostRecentContinueWorkspace(): ActiveWorkspaceEntry | null {
  return getMostRecentActiveWorkspace();
}
