/**
 * Universal tasks and milestones — shared engine ownership.
 * Event-specific suggestions stay in the Event package.
 */

import type { CanonicalWorkId, WorkMilestone, WorkTask } from "../types";

const tasksByWork = new Map<string, WorkTask[]>();
const milestonesByWork = new Map<string, WorkMilestone[]>();

function nowIso(): string {
  return new Date().toISOString();
}

function newEntityId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

export function resetWorkTasksForTests(): void {
  tasksByWork.clear();
  milestonesByWork.clear();
}

export function listWorkTasks(workId: CanonicalWorkId): WorkTask[] {
  return [...(tasksByWork.get(workId) ?? [])];
}

export function listWorkMilestones(workId: CanonicalWorkId): WorkMilestone[] {
  return [...(milestonesByWork.get(workId) ?? [])];
}

export function upsertWorkTask(
  input: Omit<WorkTask, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): WorkTask {
  const ts = nowIso();
  const list = tasksByWork.get(input.workId) ?? [];
  const existingIdx = list.findIndex((t) => t.id === input.id);
  const next: WorkTask = {
    ...input,
    createdAt: input.createdAt ?? list[existingIdx]?.createdAt ?? ts,
    updatedAt: ts,
    completedAt:
      input.status === "done"
        ? (input.completedAt ?? ts)
        : input.status === "cancelled"
          ? input.completedAt ?? null
          : null,
  };
  if (existingIdx >= 0) list[existingIdx] = next;
  else list.push(next);
  tasksByWork.set(input.workId, list);
  return next;
}

export function addWorkTask(input: {
  workId: CanonicalWorkId;
  title: string;
  owner?: string | null;
  dueDate?: string | null;
  parentTaskId?: string | null;
  dependsOnTaskIds?: readonly string[];
  sectionId?: string | null;
  projectId?: string | null;
  sourceContext?: string | null;
  status?: WorkTask["status"];
}): WorkTask {
  return upsertWorkTask({
    id: newEntityId("task"),
    workId: input.workId,
    title: input.title.trim(),
    status: input.status ?? "todo",
    owner: input.owner ?? null,
    dueDate: input.dueDate ?? null,
    parentTaskId: input.parentTaskId ?? null,
    dependsOnTaskIds: input.dependsOnTaskIds ?? [],
    sectionId: input.sectionId ?? null,
    projectId: input.projectId ?? null,
    sourceContext: input.sourceContext ?? null,
  });
}

export function upsertWorkMilestone(
  input: Omit<WorkMilestone, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): WorkMilestone {
  const ts = nowIso();
  const list = milestonesByWork.get(input.workId) ?? [];
  const existingIdx = list.findIndex((m) => m.id === input.id);
  const next: WorkMilestone = {
    ...input,
    createdAt: input.createdAt ?? list[existingIdx]?.createdAt ?? ts,
    updatedAt: ts,
    completedAt:
      input.status === "done" ? (input.completedAt ?? ts) : null,
  };
  if (existingIdx >= 0) list[existingIdx] = next;
  else list.push(next);
  milestonesByWork.set(input.workId, list);
  return next;
}

export function addWorkMilestone(input: {
  workId: CanonicalWorkId;
  title: string;
  dueDate?: string | null;
  sectionId?: string | null;
  projectId?: string | null;
  sourceContext?: string | null;
}): WorkMilestone {
  return upsertWorkMilestone({
    id: newEntityId("ms"),
    workId: input.workId,
    title: input.title.trim(),
    dueDate: input.dueDate ?? null,
    status: "pending",
    sectionId: input.sectionId ?? null,
    projectId: input.projectId ?? null,
    sourceContext: input.sourceContext ?? null,
  });
}

/** Sync Event-shaped tasks into the universal store (Event remains domain source for suggestions). */
export function syncEventTasksIntoUniversalWork(input: {
  workId: CanonicalWorkId;
  tasks: ReadonlyArray<{
    id: string;
    title: string;
    done: boolean;
    owner?: string;
    deadline?: string;
    dependsOn?: string[];
    sectionId?: string;
  }>;
  milestones: ReadonlyArray<{
    id: string;
    title: string;
    due?: string;
    done: boolean;
  }>;
}): void {
  for (const t of input.tasks) {
    upsertWorkTask({
      id: t.id,
      workId: input.workId,
      title: t.title,
      status: t.done ? "done" : "todo",
      owner: t.owner ?? null,
      dueDate: t.deadline ?? null,
      dependsOnTaskIds: t.dependsOn ?? [],
      sectionId: t.sectionId ?? null,
      sourceContext: "event_record",
    });
  }
  for (const m of input.milestones) {
    upsertWorkMilestone({
      id: m.id,
      workId: input.workId,
      title: m.title,
      dueDate: m.due ?? null,
      status: m.done ? "done" : "pending",
      sourceContext: "event_record",
    });
  }
}
