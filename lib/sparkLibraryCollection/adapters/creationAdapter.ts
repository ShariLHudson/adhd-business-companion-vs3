/**
 * Creation / Continue Working adapter for the shared library.
 */

import {
  continueCardFromRegistryEntry,
} from "@/lib/activeWorkspaceRegistry/continueCardProjection";
import {
  listActiveContinueProjection,
  listArchivedContinueProjection,
  listResumableContinueProjection,
} from "@/lib/activeWorkspaceRegistry/projections";
import type { ActiveWorkspaceEntry } from "@/lib/activeWorkspaceRegistry/types";
import { findCanonicalWorkByCreateWorkflow } from "@/lib/createProjects/canonicalWorkRecord";
import { getProjectHomeName } from "../relationships";
import { isLibraryFavorite } from "../favorites";
import type { LibraryItem, LibraryItemCapabilities } from "../types";

function statusBucket(entry: ActiveWorkspaceEntry): {
  statusId: string;
  statusLabel: string;
} {
  if (entry.status === "archived") {
    return { statusId: "archived", statusLabel: "Archived" };
  }
  if (entry.status === "trashed") {
    return { statusId: "trashed", statusLabel: "Trash" };
  }
  if (entry.status === "completed") {
    return { statusId: "completed", statusLabel: "Completed" };
  }
  if (entry.draftState === "building" || entry.draftState === "none") {
    const card = continueCardFromRegistryEntry(entry);
    if (/draft|discovery/i.test(card.statusLabel)) {
      return { statusId: "draft", statusLabel: card.statusLabel || "Draft" };
    }
  }
  const card = continueCardFromRegistryEntry(entry);
  return {
    statusId: "active",
    statusLabel: card.statusLabel || "In Progress",
  };
}

function capabilitiesFor(
  entry: ActiveWorkspaceEntry,
  linkedProjectId: string | null,
): LibraryItemCapabilities {
  const archived = entry.status === "archived" || entry.status === "trashed";
  return {
    canRename: true,
    canEditDetails: true,
    canDuplicate: true,
    canArchive: !archived && entry.status === "active",
    canRestore: archived,
    canTrash: entry.status !== "trashed" && entry.status !== "deleted",
    canFavorite: true,
    canCreateProject: !linkedProjectId && !archived,
    canViewLinkedProject: Boolean(linkedProjectId),
    canViewSourceCreation: false,
    canChangeStatus: false,
    canContinue: entry.status === "active" || entry.status === "completed",
    canOpen: false,
  };
}

export function creationEntryToLibraryItem(
  entry: ActiveWorkspaceEntry,
): LibraryItem {
  const card = continueCardFromRegistryEntry(entry);
  const { statusId, statusLabel } = statusBucket(entry);
  const linkedProjectId = entry.projectHomeId;
  const linkedName = linkedProjectId
    ? getProjectHomeName(linkedProjectId)
    : null;
  const canonical = findCanonicalWorkByCreateWorkflow(entry.workspaceId);
  const audience =
    canonical?.audience?.trim() ||
    canonical?.purpose?.trim() ||
    null;

  return {
    id: entry.workspaceId,
    kind: "creation",
    title: card.title || entry.title || "Untitled work",
    description: entry.currentFocusTitle,
    typeLabel: card.creationType || entry.creationType,
    statusId,
    statusLabel,
    tags: [],
    clientOrAudience: audience,
    favorite: isLibraryFavorite("creation", entry.workspaceId),
    archived: entry.status === "archived" || entry.status === "trashed",
    createdAt: entry.createdAt,
    updatedAt: entry.lastActivityAt,
    relationship:
      linkedProjectId && linkedName
        ? {
            kind: "linked_project",
            id: linkedProjectId,
            label: linkedName,
          }
        : linkedProjectId
          ? {
              kind: "linked_project",
              id: linkedProjectId,
              label: "Linked project",
            }
          : null,
    capabilities: capabilitiesFor(entry, linkedProjectId),
    primaryAction: "continue",
    sourceRef: entry,
  };
}

export function listCreationLibraryItems(options?: {
  includeArchived?: boolean;
}): LibraryItem[] {
  const includeArchived = options?.includeArchived !== false;
  const entries = includeArchived
    ? listResumableContinueProjection().filter(
        (e) => e.status !== "trashed" && e.status !== "deleted",
      )
    : listActiveContinueProjection();
  // Prefer active + archived (not trash) for library; trash stays Manage My Work.
  return entries.map(creationEntryToLibraryItem);
}

export function listArchivedCreationLibraryItems(): LibraryItem[] {
  return listArchivedContinueProjection().map(creationEntryToLibraryItem);
}
