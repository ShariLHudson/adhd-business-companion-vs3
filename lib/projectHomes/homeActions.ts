/**
 * Project Homes local-state helpers + careful companionStore linkage.
 * Does not change companion-projects-v1 / PROJECTS_KEY.
 */

import {
  deleteProject,
  getProjectItems,
  getProjects,
  saveProject,
  saveProjectItem,
  type ProjectItem,
} from "@/lib/companionStore";
import { isSampleProjectHome } from "./sampleProjects";
import type { ProjectHomeRecord } from "./types";

export function newProjectHomeId(): string {
  return `ph-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function renameProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  name: string,
): ProjectHomeRecord[] {
  const trimmed = name.trim();
  if (!trimmed) return homes;
  return homes.map((h) => (h.id === id ? { ...h, name: trimmed } : h));
}

export function duplicateProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
): { homes: ProjectHomeRecord[]; duplicate: ProjectHomeRecord | null } {
  const source = homes.find((h) => h.id === id);
  if (!source) return { homes, duplicate: null };
  const duplicate: ProjectHomeRecord = {
    ...source,
    id: newProjectHomeId(),
    name: `${source.name} (copy)`,
    isSample: false,
    archived: false,
    companionProjectId: undefined,
    lastWorkedAt: new Date().toISOString(),
    personalization: source.personalization ? { ...source.personalization } : {},
  };
  return { homes: [duplicate, ...homes], duplicate };
}

export function archiveProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
): ProjectHomeRecord[] {
  return homes.map((h) =>
    h.id === id ? { ...h, archived: true, status: "resting" } : h,
  );
}

export type DeleteProjectHomeResult = {
  homes: ProjectHomeRecord[];
  removed: ProjectHomeRecord | null;
  blockedAsSample: boolean;
  deletedCompanionProjectId?: string;
};

/**
 * Removes a member Project Home from local state.
 * Sample homes cannot be deleted.
 * If a linked companion project exists, deletes it via companionStore (items cascade).
 */
export function deleteProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  options?: { syncCompanionStore?: boolean },
): DeleteProjectHomeResult {
  const target = homes.find((h) => h.id === id);
  if (!target) {
    return { homes, removed: null, blockedAsSample: false };
  }
  if (isSampleProjectHome(target)) {
    return { homes, removed: null, blockedAsSample: true };
  }
  const next = homes.filter((h) => h.id !== id);
  let deletedCompanionProjectId: string | undefined;
  if (options?.syncCompanionStore !== false && target.companionProjectId) {
    deleteProject(target.companionProjectId);
    deletedCompanionProjectId = target.companionProjectId;
  }
  return {
    homes: next,
    removed: target,
    blockedAsSample: false,
    deletedCompanionProjectId,
  };
}

export function visibleGalleryHomes(
  homes: ProjectHomeRecord[],
): ProjectHomeRecord[] {
  return homes.filter((h) => !h.archived);
}

/**
 * Ensures a companion-projects-v1 record exists for store-backed actions.
 * Reuses companionProjectId when present; otherwise creates via saveProject.
 */
export function ensureCompanionProject(
  home: ProjectHomeRecord,
): { home: ProjectHomeRecord; companionProjectId: string } {
  if (home.companionProjectId) {
    const existing = getProjects().find((p) => p.id === home.companionProjectId);
    if (existing) {
      saveProject({
        id: existing.id,
        name: home.name,
        goal: home.purpose,
        nextAction: home.nextSuggestedStep || home.currentFocus,
      });
      return { home, companionProjectId: existing.id };
    }
  }
  const list = saveProject({
    name: home.name,
    goal: home.purpose,
    nextAction: home.nextSuggestedStep || home.currentFocus,
    horizon: "now",
    status: "in-progress",
  });
  const created = list[0];
  if (!created) {
    throw new Error("Failed to create companion project");
  }
  return {
    home: { ...home, companionProjectId: created.id },
    companionProjectId: created.id,
  };
}

export function addSectionToHome(
  home: ProjectHomeRecord,
  title: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  const trimmed = title.trim() || "New section";
  const { home: linked, companionProjectId } = ensureCompanionProject(home);
  const items = saveProjectItem({
    projectId: companionProjectId,
    kind: "section",
    title: trimmed,
  });
  return { home: linked, items };
}

export function addTaskToHome(
  home: ProjectHomeRecord,
  title: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  const trimmed = title.trim() || "New task";
  const { home: linked, companionProjectId } = ensureCompanionProject(home);
  const items = saveProjectItem({
    projectId: companionProjectId,
    kind: "task",
    title: trimmed,
  });
  return { home: linked, items };
}

export function addNoteToHome(
  home: ProjectHomeRecord,
  note: string,
): ProjectHomeRecord {
  const trimmed = note.trim();
  if (!trimmed) return home;
  const { home: linked, companionProjectId } = ensureCompanionProject(home);
  const existing = getProjects().find((p) => p.id === companionProjectId);
  const prior = existing?.notes?.trim();
  const notes = prior ? `${prior}\n\n${trimmed}` : trimmed;
  saveProject({ id: companionProjectId, notes });
  return linked;
}

export function listHomeProjectItems(home: ProjectHomeRecord): ProjectItem[] {
  if (!home.companionProjectId) return [];
  return getProjectItems(home.companionProjectId);
}
