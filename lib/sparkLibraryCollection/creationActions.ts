/**
 * Creation library actions — thin wrappers over existing durable seams.
 */

import {
  archiveActiveWorkspace,
  moveActiveWorkspaceToTrash,
  peekRegistryWorkspaceEntry,
  renameActiveWorkspaceTitleDurable,
  restoreActiveWorkspace,
  upsertActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import {
  findCanonicalWorkByCreateWorkflow,
  upsertCanonicalWorkRecord,
} from "@/lib/createProjects/canonicalWorkRecord";
import { connectCanonicalWorkToProjectHome } from "@/lib/createProjects/connectCanonicalWorkToProjectHome";
import { allocateCanonicalWorkId } from "@/lib/universalWorkEngine";
import { setLibraryFavorite, toggleLibraryFavorite } from "./favorites";

export async function libraryRenameCreation(
  workspaceId: string,
  title: string,
): Promise<{ ok: boolean; message?: string }> {
  return renameActiveWorkspaceTitleDurable(workspaceId, title);
}

export function libraryArchiveCreation(workspaceId: string): void {
  archiveActiveWorkspace(workspaceId);
}

export function libraryRestoreCreation(workspaceId: string): void {
  restoreActiveWorkspace(workspaceId);
}

export function libraryTrashCreation(workspaceId: string): void {
  moveActiveWorkspaceToTrash(workspaceId);
}

export function libraryToggleCreationFavorite(workspaceId: string): boolean {
  return toggleLibraryFavorite("creation", workspaceId);
}

export function librarySetCreationFavorite(
  workspaceId: string,
  favorite: boolean,
): void {
  setLibraryFavorite("creation", workspaceId, favorite);
}

/**
 * Shallow duplicate — new Work ID, copied title/type/focus.
 * Does not clone full section bodies (safe Phase 1 seam).
 */
export function libraryDuplicateCreation(workspaceId: string): {
  ok: boolean;
  message?: string;
  newId?: string;
} {
  const entry = peekRegistryWorkspaceEntry(workspaceId);
  if (!entry) {
    return { ok: false, message: "I couldn’t find that work just now." };
  }
  const newId = allocateCanonicalWorkId({ origin: "duplicate" });
  const now = new Date().toISOString();
  const titleBase = entry.title?.trim() || "Creation";
  upsertActiveWorkspace({
    ...entry,
    workspaceId: newId,
    title: `${titleBase} (copy)`,
    runtimeCreationRecordId: newId,
    sessionId: newId,
    projectHomeId: null,
    status: "active",
    createdAt: now,
    lastActivityAt: now,
  });
  return { ok: true, newId };
}

export function libraryEditCreationDetails(
  workspaceId: string,
  details: { title?: string; purpose?: string; audience?: string },
): { ok: boolean; message?: string } {
  const entry = peekRegistryWorkspaceEntry(workspaceId);
  if (!entry) {
    return { ok: false, message: "I couldn’t find that work just now." };
  }
  if (details.title?.trim()) {
    upsertActiveWorkspace({
      ...entry,
      title: details.title.trim(),
      lastActivityAt: new Date().toISOString(),
    });
  }
  const existing =
    findCanonicalWorkByCreateWorkflow(workspaceId) ??
    upsertCanonicalWorkRecord({
      title: details.title?.trim() || entry.title,
      workType: entry.creationType || "Creation",
      createWorkflowId: workspaceId,
      purpose: details.purpose ?? "",
      audience: details.audience ?? "",
    });
  upsertCanonicalWorkRecord({
    ...existing,
    title: details.title?.trim() || existing.title,
    purpose:
      details.purpose !== undefined ? details.purpose : existing.purpose,
    audience:
      details.audience !== undefined ? details.audience : existing.audience,
    createWorkflowId: workspaceId,
  });
  return { ok: true };
}

export function libraryTurnCreationIntoProject(workspaceId: string): {
  ok: boolean;
  projectHomeId?: string | null;
  message?: string;
} {
  const entry = peekRegistryWorkspaceEntry(workspaceId);
  if (!entry) {
    return { ok: false, message: "I couldn’t find that work just now." };
  }
  if (entry.projectHomeId) {
    return {
      ok: true,
      projectHomeId: entry.projectHomeId,
      message: "This already has a linked project.",
    };
  }
  let work = findCanonicalWorkByCreateWorkflow(workspaceId);
  if (!work) {
    work = upsertCanonicalWorkRecord({
      title: entry.title,
      workType: entry.creationType || "Creation",
      createWorkflowId: workspaceId,
      purpose: entry.currentFocusTitle || "",
    });
  }
  const linked = connectCanonicalWorkToProjectHome({ work });
  if (!linked.projectHomeId) {
    return {
      ok: false,
      message: linked.error || "I couldn’t create a project for this yet.",
    };
  }
  upsertActiveWorkspace({
    ...entry,
    projectHomeId: linked.projectHomeId,
    lastActivityAt: new Date().toISOString(),
  });
  return { ok: true, projectHomeId: linked.projectHomeId };
}
