/**
 * companion-projects-v1 + companion-project-items-v1 — leaf store.
 * Project Homes / ProjectBreakdown must import from here, never fat companionStore
 * (Create catalog / registry graph → Vercel Turbopack circular init).
 */

import { safeLocalStorageSet } from "./companionStorageRecovery";
import { PROJECTS_UPDATED_EVENT } from "./companionProjectsEvents";

export type ProjectStatus =
  | "not-started"
  | "in-progress"
  | "active-focus"
  | "paused"
  | "completed";

export type ProjectHorizon = "now" | "soon" | "later";

export type Project = {
  id: string;
  name: string;
  goal: string;
  goals: string[];
  horizon: ProjectHorizon;
  status: ProjectStatus;
  nextAction: string;
  notes?: string;
  color: string;
  archived?: boolean;
  projectHomeRoomId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectItemKind = "section" | "task" | "subtask";

export type ProjectItem = {
  id: string;
  projectId: string;
  parentId?: string;
  kind: ProjectItemKind;
  title: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
};

export const PROJECT_PALETTE = [
  "#1e4f4f",
  "#9a6fb0",
  "#6b6b6b",
  "#2f4f7a",
  "#a85c4a",
  "#6b8e23",
  "#c08a3e",
];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "active-focus": "Active focus",
  paused: "Paused",
  completed: "Completed",
};

export const PROJECT_HORIZON_LABEL: Record<ProjectHorizon, string> = {
  now: "Now",
  soon: "Soon",
  later: "Parked",
};

const PROJECTS_KEY = "companion-projects-v1";
const PROJECT_ITEMS_KEY = "companion-project-items-v1";
const LAST_ACTIVITY_KEY = "companion-last-activity-v1";
const RECENT_WORK_KEY = "companion-recent-work-v1";
const RECENT_WORK_MAX = 12;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emitProjectsUpdated(detail?: {
  projectId?: string;
  reason?: string;
}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PROJECTS_UPDATED_EVENT, { detail: detail ?? {} }),
  );
}

function touchProjectActivity(project: Project): void {
  if (typeof window === "undefined") return;
  const ts = new Date().toISOString();
  try {
    localStorage.setItem(
      LAST_ACTIVITY_KEY,
      JSON.stringify({
        kind: "project",
        title: project.name,
        subtitle: "Project",
        projectId: project.id,
        ts,
      }),
    );
  } catch {
    /* noop */
  }
  try {
    const id = `project:${project.id}`;
    const raw = localStorage.getItem(RECENT_WORK_KEY);
    const prev = raw ? (JSON.parse(raw) as Array<{ id: string }>) : [];
    const list = Array.isArray(prev) ? prev : [];
    const item = {
      kind: "project" as const,
      title: project.name,
      subtitle: "Project",
      projectId: project.id,
      id,
      ts,
    };
    const next = [item, ...list.filter((x) => x.id !== id)].slice(
      0,
      RECENT_WORK_MAX,
    );
    localStorage.setItem(RECENT_WORK_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (p): p is Project =>
          p && typeof p.id === "string" && typeof p.name === "string",
      )
      .map((p) => ({
        ...p,
        goals: Array.isArray(p.goals)
          ? p.goals.filter((g): g is string => typeof g === "string")
          : [],
      }));
  } catch {
    return [];
  }
}

function writeProjects(list: Project[]): boolean {
  if (typeof window === "undefined") return false;
  return safeLocalStorageSet(PROJECTS_KEY, JSON.stringify(list));
}

export function getProjects(): Project[] {
  return readProjects();
}

export function getActiveProjects(): Project[] {
  return getProjects().filter((p) => !p.archived && p.status !== "completed");
}

export type SaveProjectResult = {
  projects: Project[];
  project: Project | null;
  persisted: boolean;
  created: boolean;
};

export function saveProjectWithResult(
  input: Partial<Project> & { id?: string },
): SaveProjectResult {
  const now = new Date().toISOString();
  const list = readProjects();
  if (input.id) {
    const existing = list.find((p) => p.id === input.id);
    if (existing) {
      const updated: Project = {
        ...existing,
        ...input,
        id: existing.id,
        updatedAt: now,
      };
      const next = list.map((p) => (p.id === input.id ? updated : p));
      const persisted = writeProjects(next);
      if (persisted) {
        touchProjectActivity(updated);
        emitProjectsUpdated({ projectId: updated.id, reason: "update" });
      }
      return {
        projects: persisted ? next : list,
        project: updated,
        persisted,
        created: false,
      };
    }
    const project: Project = {
      id: input.id,
      name: input.name?.trim() || "Untitled project",
      goal: input.goal ?? "",
      goals: input.goals ?? [],
      horizon: input.horizon ?? "now",
      status: input.status ?? "in-progress",
      nextAction: input.nextAction ?? "",
      notes: input.notes,
      archived: input.archived ?? false,
      projectHomeRoomId: input.projectHomeRoomId,
      color:
        input.color ?? PROJECT_PALETTE[list.length % PROJECT_PALETTE.length]!,
      createdAt: now,
      updatedAt: now,
    };
    const next = [project, ...list];
    const persisted = writeProjects(next);
    if (persisted) {
      touchProjectActivity(project);
      emitProjectsUpdated({ projectId: project.id, reason: "create" });
    }
    return {
      projects: persisted ? next : list,
      project: persisted ? project : null,
      persisted,
      created: persisted,
    };
  }
  const project: Project = {
    id: newId(),
    name: input.name?.trim() || "Untitled project",
    goal: input.goal ?? "",
    goals: input.goals ?? [],
    horizon: input.horizon ?? "now",
    status: input.status ?? "in-progress",
    nextAction: input.nextAction ?? "",
    notes: input.notes,
    archived: input.archived ?? false,
    projectHomeRoomId: input.projectHomeRoomId,
    color:
      input.color ?? PROJECT_PALETTE[list.length % PROJECT_PALETTE.length]!,
    createdAt: now,
    updatedAt: now,
  };
  const next = [project, ...list];
  const persisted = writeProjects(next);
  if (persisted) {
    touchProjectActivity(project);
    emitProjectsUpdated({ projectId: project.id, reason: "create" });
  }
  return {
    projects: persisted ? next : list,
    project: persisted ? project : null,
    persisted,
    created: persisted,
  };
}

export function saveProject(
  input: Partial<Project> & { id?: string },
): Project[] {
  return saveProjectWithResult(input).projects;
}

export function deleteProject(id: string): Project[] {
  const next = readProjects().filter((p) => p.id !== id);
  const persisted = writeProjects(next);
  if (persisted) {
    deleteProjectItemsForProject(id);
    emitProjectsUpdated({ projectId: id, reason: "delete" });
  }
  return persisted ? next : readProjects();
}

function readProjectItems(): ProjectItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECT_ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is ProjectItem =>
        i &&
        typeof i.id === "string" &&
        typeof i.projectId === "string" &&
        typeof i.title === "string",
    );
  } catch {
    return [];
  }
}

function writeProjectItems(list: ProjectItem[]): boolean {
  if (typeof window === "undefined") return false;
  const ok = safeLocalStorageSet(PROJECT_ITEMS_KEY, JSON.stringify(list));
  if (ok) emitProjectsUpdated({ reason: "items" });
  return ok;
}

export function getProjectItems(projectId?: string): ProjectItem[] {
  const list = readProjectItems();
  const filtered = projectId
    ? list.filter((i) => i.projectId === projectId)
    : list;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function saveProjectItem(
  input: Partial<ProjectItem> & {
    projectId: string;
    kind: ProjectItemKind;
    title: string;
    parentId?: string;
  },
): ProjectItem[] {
  const list = readProjectItems();
  const now = new Date().toISOString();
  if (input.id) {
    const next = list.map((i) =>
      i.id === input.id
        ? { ...i, ...input, title: input.title.trim() || i.title }
        : i,
    );
    writeProjectItems(next);
    return next.filter((i) => i.projectId === input.projectId);
  }
  const siblings = list.filter(
    (i) =>
      i.projectId === input.projectId && i.parentId === input.parentId,
  );
  const item: ProjectItem = {
    id: newId(),
    projectId: input.projectId,
    parentId: input.parentId,
    kind: input.kind,
    title: input.title.trim() || "Untitled",
    done: false,
    sortOrder: siblings.length,
    createdAt: now,
  };
  const next = [...list, item];
  writeProjectItems(next);
  return next.filter((i) => i.projectId === input.projectId);
}

export function toggleProjectItemDone(id: string): ProjectItem[] {
  const list = readProjectItems();
  const target = list.find((i) => i.id === id);
  if (!target) return list;
  const next = list.map((i) =>
    i.id === id ? { ...i, done: !i.done } : i,
  );
  writeProjectItems(next);
  return next.filter((i) => i.projectId === target.projectId);
}

export function deleteProjectItem(id: string): ProjectItem[] {
  const list = readProjectItems();
  const target = list.find((i) => i.id === id);
  if (!target) return list;
  const removeIds = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const i of list) {
      if (i.parentId && removeIds.has(i.parentId) && !removeIds.has(i.id)) {
        removeIds.add(i.id);
        changed = true;
      }
    }
  }
  const next = list.filter((i) => !removeIds.has(i.id));
  writeProjectItems(next);
  return next.filter((i) => i.projectId === target.projectId);
}

function deleteProjectItemsForProject(projectId: string) {
  const next = readProjectItems().filter((i) => i.projectId !== projectId);
  writeProjectItems(next);
}

export function getOpenProjectTasks(limit = 12): ProjectItem[] {
  return readProjectItems()
    .filter((i) => (i.kind === "task" || i.kind === "subtask") && !i.done)
    .slice(0, limit);
}
