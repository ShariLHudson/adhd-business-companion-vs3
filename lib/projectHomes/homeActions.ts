/**
 * Project Homes local-state helpers + careful companionStore linkage.
 * Does not change companion-projects-v1 / PROJECTS_KEY.
 */

import {
  deleteProject,
  deleteProjectItem,
  getProjectItems,
  getProjects,
  saveProject,
  saveProjectItem,
  saveProjectWithResult,
  toggleProjectItemDone,
  type Project,
  type ProjectItem,
  type ProjectStatus,
} from "@/lib/companionProjectsStore";
import { seedProjectChunks } from "@/lib/projects/seedProjectChunks";
import { normalizeProjectPieces } from "@/lib/projects/projectPieces190";
import { isSampleProjectHome, SAMPLE_PROJECT_HOMES } from "./sampleProjects";
import type {
  ProjectHomeRecord,
  ProjectHomeRoomId,
  ProjectHomeStatus,
} from "./types";

/** Default room when a companionStore Project has no Project Home metadata. */
export const DEFAULT_PROJECT_HOME_ROOM: ProjectHomeRoomId = "study-hall";

export function newProjectHomeId(): string {
  return `ph-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function mapProjectStatusToHomeStatus(
  status: ProjectStatus,
): ProjectHomeStatus {
  switch (status) {
    case "not-started":
      return "dreaming";
    case "paused":
      return "resting";
    case "completed":
      return "nearly-ready";
    case "active-focus":
    case "in-progress":
    default:
      return "in-motion";
  }
}

/**
 * Maps a companion-projects-v1 Project into a gallery ProjectHomeRecord.
 * Uses sensible defaults for room/status fields the store does not carry.
 */
export function mapProjectToHomeRecord(
  project: Project,
  options?: { projectHomeId?: ProjectHomeRoomId },
): ProjectHomeRecord {
  const purpose =
    project.goal?.trim() ||
    project.notes?.trim() ||
    "A project you are building in Spark.";
  const focus =
    project.nextAction?.trim() ||
    "Open this Project Home when you are ready";
  const roomFromStore =
    (project.projectHomeRoomId as ProjectHomeRoomId | undefined) ?? undefined;
  return {
    id: project.id,
    name: project.name,
    purpose,
    projectHomeId:
      options?.projectHomeId ?? roomFromStore ?? DEFAULT_PROJECT_HOME_ROOM,
    status: mapProjectStatusToHomeStatus(project.status),
    currentFocus: focus,
    lastWorkedAt: project.updatedAt || project.createdAt,
    nextSuggestedStep: focus,
    atmosphereNote: undefined,
    personalization: {},
    isSample: false,
    archived: Boolean(project.archived),
    companionProjectId: project.id,
  };
}

/**
 * Loads member Project Homes from companion-projects-v1 via getProjects().
 * Samples are never included — they live only in Explore Examples.
 */
export function loadMemberProjectHomesFromStore(
  roomByCompanionId?: ReadonlyMap<string, ProjectHomeRoomId>,
): ProjectHomeRecord[] {
  return getProjects().map((project) =>
    mapProjectToHomeRecord(project, {
      projectHomeId: roomByCompanionId?.get(project.id),
    }),
  );
}

/**
 * Merges store-backed projects with in-memory Project Home records.
 * Prefer store identity (companionProjectId / id) — no duplicate cards.
 * Preserves room choice and archive flags from local homes when known.
 */
export function mergeMemberHomesWithStore(
  localHomes: ProjectHomeRecord[],
  storeHomes: ProjectHomeRecord[] = loadMemberProjectHomesFromStore(),
): ProjectHomeRecord[] {
  const localByCompanion = new Map<string, ProjectHomeRecord>();
  for (const home of localHomes) {
    if (home.isSample || isSampleProjectHome(home)) continue;
    const key = home.companionProjectId ?? home.id;
    localByCompanion.set(key, home);
  }

  const merged: ProjectHomeRecord[] = storeHomes.map((storeHome) => {
    const local = localByCompanion.get(storeHome.companionProjectId ?? storeHome.id);
    if (!local) return storeHome;
    localByCompanion.delete(storeHome.companionProjectId ?? storeHome.id);
    return {
      ...storeHome,
      projectHomeId: local.projectHomeId || storeHome.projectHomeId,
      atmosphereNote: local.atmosphereNote ?? storeHome.atmosphereNote,
      personalization: local.personalization ?? storeHome.personalization,
      archived: local.archived,
      // Prefer richer purpose/focus from Project Home when store goal is empty
      purpose: storeHome.purpose || local.purpose,
      currentFocus:
        storeHome.currentFocus !== "Open this Project Home when you are ready"
          ? storeHome.currentFocus
          : local.currentFocus,
      nextSuggestedStep:
        storeHome.nextSuggestedStep !==
        "Open this Project Home when you are ready"
          ? storeHome.nextSuggestedStep
          : local.nextSuggestedStep,
    };
  });

  // Local-only member homes not yet in store (should be rare after create persists)
  for (const leftover of localByCompanion.values()) {
    if (!leftover.archived) merged.unshift(leftover);
  }

  return merged;
}

export function exploreExampleHomes(): ProjectHomeRecord[] {
  return SAMPLE_PROJECT_HOMES;
}

export function renameProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  name: string,
  options?: { syncCompanionStore?: boolean },
): ProjectHomeRecord[] {
  const trimmed = name.trim();
  if (!trimmed) return homes;
  const next = homes.map((h) => (h.id === id ? { ...h, name: trimmed } : h));
  const target = next.find((h) => h.id === id);
  if (
    options?.syncCompanionStore !== false &&
    target?.companionProjectId &&
    !isSampleProjectHome(target)
  ) {
    saveProject({ id: target.companionProjectId, name: trimmed });
  }
  return next;
}

export function duplicateProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  options?: { syncCompanionStore?: boolean },
): { homes: ProjectHomeRecord[]; duplicate: ProjectHomeRecord | null } {
  const source = homes.find((h) => h.id === id);
  if (!source) return { homes, duplicate: null };
  let duplicate: ProjectHomeRecord = {
    ...source,
    id: newProjectHomeId(),
    name: `${source.name} (copy)`,
    isSample: false,
    archived: false,
    companionProjectId: undefined,
    lastWorkedAt: new Date().toISOString(),
    personalization: source.personalization ? { ...source.personalization } : {},
  };
  if (options?.syncCompanionStore !== false) {
    const linked = ensureCompanionProject(duplicate);
    duplicate = {
      ...linked.home,
      id: linked.companionProjectId,
      companionProjectId: linked.companionProjectId,
    };
  }
  return { homes: [duplicate, ...homes], duplicate };
}

export type CreatePersistedProjectHomeResult = {
  home: ProjectHomeRecord | null;
  persisted: boolean;
  error?: string;
};

/**
 * Creates a member Project Home and persists it to companion-projects-v1.
 * Optional main pieces become sections. Never reports success without persist.
 */
export function createPersistedProjectHome(input: {
  name: string;
  purpose: string;
  projectHomeId: ProjectHomeRoomId;
  currentFocus?: string;
  nextSuggestedStep?: string;
  atmosphereNote?: string;
  /** Flexible main pieces — seeded as sections after create. */
  pieces?: readonly string[];
}): ProjectHomeRecord {
  const result = createPersistedProjectHomeWithResult(input);
  if (!result.home) {
    throw new Error(result.error ?? "Failed to create project");
  }
  return result.home;
}

export function createPersistedProjectHomeWithResult(input: {
  name: string;
  purpose: string;
  projectHomeId: ProjectHomeRoomId;
  currentFocus?: string;
  nextSuggestedStep?: string;
  atmosphereNote?: string;
  pieces?: readonly string[];
}): CreatePersistedProjectHomeResult {
  const now = new Date().toISOString();
  const focus =
    input.currentFocus?.trim() ||
    normalizeProjectPieces(input.pieces ?? [])[0] ||
    "Settle into this Project Home";
  const saved = saveProjectWithResult({
    name: input.name.trim() || "Untitled project",
    goal: input.purpose.trim(),
    nextAction: focus,
    status: "in-progress",
    horizon: "now",
    archived: false,
    projectHomeRoomId: input.projectHomeId,
  });
  if (!saved.persisted || !saved.project) {
    return {
      home: null,
      persisted: false,
      error: "Could not save the project. Please try again.",
    };
  }
  const pieces = normalizeProjectPieces(input.pieces ?? []);
  if (pieces.length > 0) {
    const first = seedProjectChunks(saved.project.id, pieces);
    if (first && first !== focus) {
      saveProject({ id: saved.project.id, nextAction: first });
    }
  }
  const home = mapProjectToHomeRecord(saved.project, {
    projectHomeId: input.projectHomeId,
  });
  return {
    home: {
      ...home,
      atmosphereNote: input.atmosphereNote,
      currentFocus: focus,
      nextSuggestedStep:
        input.nextSuggestedStep ?? home.nextSuggestedStep,
      lastWorkedAt: now,
    },
    persisted: true,
  };
}

export function archiveProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  options?: { syncCompanionStore?: boolean },
): ProjectHomeRecord[] {
  const next = homes.map((h) =>
    h.id === id ? { ...h, archived: true, status: "resting" as const } : h,
  );
  const target = next.find((h) => h.id === id);
  if (
    options?.syncCompanionStore !== false &&
    target?.companionProjectId &&
    !isSampleProjectHome(target)
  ) {
    saveProject({
      id: target.companionProjectId,
      archived: true,
      status: "paused",
    });
  }
  return next;
}

export function restoreProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  options?: { syncCompanionStore?: boolean },
): ProjectHomeRecord[] {
  const next = homes.map((h) =>
    h.id === id
      ? { ...h, archived: false, status: "in-motion" as const }
      : h,
  );
  const target = next.find((h) => h.id === id);
  if (
    options?.syncCompanionStore !== false &&
    target?.companionProjectId &&
    !isSampleProjectHome(target)
  ) {
    saveProject({
      id: target.companionProjectId,
      archived: false,
      status: "in-progress",
    });
  }
  return next;
}

export function setProjectHomeCurrentFocus(
  home: ProjectHomeRecord,
  focus: string,
  options?: { syncCompanionStore?: boolean },
): ProjectHomeRecord {
  const trimmed = focus.trim();
  if (!trimmed) return home;
  const next: ProjectHomeRecord = {
    ...home,
    currentFocus: trimmed,
    nextSuggestedStep: trimmed,
    lastWorkedAt: new Date().toISOString(),
  };
  if (
    options?.syncCompanionStore !== false &&
    home.companionProjectId &&
    !isSampleProjectHome(home)
  ) {
    saveProject({ id: home.companionProjectId, nextAction: trimmed });
  }
  return next;
}

export function completeProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  options?: { syncCompanionStore?: boolean },
): ProjectHomeRecord[] {
  const next = homes.map((h) =>
    h.id === id ? { ...h, status: "nearly-ready" as const } : h,
  );
  const target = next.find((h) => h.id === id);
  if (
    options?.syncCompanionStore !== false &&
    target?.companionProjectId &&
    !isSampleProjectHome(target)
  ) {
    saveProject({ id: target.companionProjectId, status: "completed" });
  }
  return next;
}

export function reopenProjectHome(
  homes: ProjectHomeRecord[],
  id: string,
  options?: { syncCompanionStore?: boolean },
): ProjectHomeRecord[] {
  const next = homes.map((h) =>
    h.id === id ? { ...h, status: "in-motion" as const, archived: false } : h,
  );
  const target = next.find((h) => h.id === id);
  if (
    options?.syncCompanionStore !== false &&
    target?.companionProjectId &&
    !isSampleProjectHome(target)
  ) {
    saveProject({
      id: target.companionProjectId,
      status: "in-progress",
      archived: false,
    });
  }
  return next;
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
        projectHomeRoomId: home.projectHomeId,
        archived: home.archived,
      });
      return { home, companionProjectId: existing.id };
    }
  }
  const result = saveProjectWithResult({
    id: home.companionProjectId,
    name: home.name,
    goal: home.purpose,
    nextAction: home.nextSuggestedStep || home.currentFocus,
    horizon: "now",
    status: "in-progress",
    projectHomeRoomId: home.projectHomeId,
    archived: false,
  });
  if (!result.persisted || !result.project) {
    throw new Error("Failed to create companion project");
  }
  return {
    home: { ...home, companionProjectId: result.project.id },
    companionProjectId: result.project.id,
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
  sectionId?: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  const trimmed = title.trim() || "New task";
  const { home: linked, companionProjectId } = ensureCompanionProject(home);
  const items = saveProjectItem({
    projectId: companionProjectId,
    kind: "task",
    title: trimmed,
    parentId: sectionId,
  });
  return { home: linked, items };
}

export function addSubtaskToHome(
  home: ProjectHomeRecord,
  taskId: string,
  title: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  const trimmed = title.trim() || "New subtask";
  const { home: linked, companionProjectId } = ensureCompanionProject(home);
  const items = saveProjectItem({
    projectId: companionProjectId,
    kind: "subtask",
    title: trimmed,
    parentId: taskId,
  });
  return { home: linked, items };
}

export function renameHomeItem(
  home: ProjectHomeRecord,
  itemId: string,
  title: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  const trimmed = title.trim();
  if (!trimmed || !home.companionProjectId) {
    return { home, items: listHomeProjectItems(home) };
  }
  const existing = getProjectItems(home.companionProjectId).find(
    (i) => i.id === itemId,
  );
  if (!existing) return { home, items: listHomeProjectItems(home) };
  const items = saveProjectItem({
    id: existing.id,
    projectId: home.companionProjectId,
    kind: existing.kind,
    title: trimmed,
    parentId: existing.parentId,
  });
  return { home, items };
}

export function deleteHomeItem(
  home: ProjectHomeRecord,
  itemId: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  if (!home.companionProjectId) {
    return { home, items: [] };
  }
  const items = deleteProjectItem(itemId);
  return { home, items };
}

export function toggleHomeItemDone(
  home: ProjectHomeRecord,
  itemId: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  const items = toggleProjectItemDone(itemId);
  return { home, items };
}

/** Move a task under a different section (or to root when sectionId omitted). */
export function moveTaskToSection(
  home: ProjectHomeRecord,
  taskId: string,
  sectionId: string | undefined,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  if (!home.companionProjectId) {
    return { home, items: [] };
  }
  const existing = getProjectItems(home.companionProjectId).find(
    (i) => i.id === taskId && i.kind === "task",
  );
  if (!existing) return { home, items: listHomeProjectItems(home) };
  const items = saveProjectItem({
    id: existing.id,
    projectId: home.companionProjectId,
    kind: "task",
    title: existing.title,
    parentId: sectionId,
  });
  return { home, items };
}

/**
 * Apply an approved Shari structure suggestion (never call without member approval).
 */
export function applyApprovedShariTask(
  home: ProjectHomeRecord,
  title: string,
  sectionId?: string,
): { home: ProjectHomeRecord; items: ProjectItem[] } {
  return addTaskToHome(home, title, sectionId);
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
