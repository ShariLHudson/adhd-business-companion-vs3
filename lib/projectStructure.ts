/**
 * Project structure helpers — milestones as sections, tasks nested underneath.
 */

import { getProjectItems, saveProjectItem } from "./companionStore";

export type DocumentMilestone = {
  title: string;
  tasks: string[];
  /** Rendered as task rows under the section (e.g. notes, alternatives). */
  notes?: string[];
};

export const STARTER_MILESTONES: DocumentMilestone[] = [
  {
    title: "Getting Started",
    tasks: [
      "Review the plan",
      "Choose first priority",
      "Set target date",
      "Identify next action",
    ],
  },
];

const TASK_LINE_RE =
  /^(?:[-*•]|\d+[.)])\s+(.+)$|^(?:step\s*)?\d+[.)]\s+(.+)$/i;

/** Parse ## headings as milestone sections with bullet tasks underneath. */
export function extractMilestonesFromDocument(body: string): DocumentMilestone[] {
  const milestones: DocumentMilestone[] = [];
  let current: DocumentMilestone | null = null;

  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current) milestones.push(current);
      current = {
        title: heading[1]!.replace(/\*\*/g, "").trim(),
        tasks: [],
      };
      continue;
    }
    if (!current) continue;
    const bullet = trimmed.match(TASK_LINE_RE);
    const captured = bullet?.[1] ?? bullet?.[2];
    if (captured) {
      const t = captured.replace(/\*\*/g, "").trim();
      if (t.length >= 3) current.tasks.push(t);
    }
  }
  if (current) milestones.push(current);

  return milestones.filter((m) => m.title.trim());
}

export function extractTasksFromDocument(body: string): string[] {
  const tasks: string[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || /^#{1,3}\s/.test(trimmed)) continue;
    const bullet = trimmed.match(TASK_LINE_RE);
    const captured = bullet?.[1] ?? bullet?.[2];
    if (captured) {
      const t = captured.replace(/\*\*/g, "").trim();
      if (t.length >= 4 && t.length < 120) tasks.push(t);
      continue;
    }
    if (
      /^[A-Z]/.test(trimmed) &&
      trimmed.length < 80 &&
      /\b(finalize|create|build|send|schedule|draft|review|test|prepare|launch|write)\b/i.test(
        trimmed,
      )
    ) {
      tasks.push(trimmed);
    }
  }
  return [...new Set(tasks)].slice(0, 24);
}

export function suggestMilestones(artifactType: string, _body: string): string[] {
  const type = artifactType.toLowerCase();
  if (type.includes("launch")) {
    return ["Prepare assets", "Soft launch", "Full launch", "Review results"];
  }
  if (type.includes("workshop")) {
    return ["Finalize content", "Build materials", "Promote", "Deliver"];
  }
  if (type.includes("marketing")) {
    return ["Plan", "Create assets", "Launch", "Measure"];
  }
  return ["Plan", "Build", "Review", "Ship"];
}

export function buildMilestonePlan(
  artifactType: string,
  body: string,
): DocumentMilestone[] {
  const fromHeadings = extractMilestonesFromDocument(body);
  const withTasks = fromHeadings.filter((m) => m.tasks.length > 0);
  if (withTasks.length > 0) return withTasks;

  const flatTasks = extractTasksFromDocument(body);
  const titles = suggestMilestones(artifactType, body);

  if (flatTasks.length >= 2) {
    const plan: DocumentMilestone[] = titles.map((title) => ({
      title,
      tasks: [] as string[],
    }));
    flatTasks.forEach((task, i) => {
      plan[i % plan.length]!.tasks.push(task);
    });
    return plan.filter((m) => m.tasks.length > 0);
  }

  if (flatTasks.length === 1) {
    return [{ title: titles[0] ?? "Getting Started", tasks: flatTasks }];
  }

  return STARTER_MILESTONES;
}

export function saveProjectSection(
  projectId: string,
  milestone: DocumentMilestone,
): { sectionId: string; taskCount: number } {
  const beforeIds = new Set(getProjectItems(projectId).map((i) => i.id));
  saveProjectItem({ projectId, kind: "section", title: milestone.title });
  const section = getProjectItems(projectId).find(
    (i) => i.kind === "section" && !beforeIds.has(i.id),
  );
  if (!section) {
    throw new Error(`Failed to create section: ${milestone.title}`);
  }

  let taskCount = 0;
  const rows = [...milestone.tasks, ...(milestone.notes ?? [])];
  if (!rows.length) {
    saveProjectItem({
      projectId,
      kind: "task",
      title: "Review this section",
      parentId: section.id,
    });
    taskCount = 1;
  } else {
    for (const row of rows) {
      saveProjectItem({
        projectId,
        kind: "task",
        title: row,
        parentId: section.id,
      });
      taskCount += 1;
    }
  }

  return { sectionId: section.id, taskCount };
}

export function saveProjectStructure(
  projectId: string,
  milestones: DocumentMilestone[],
): { milestoneCount: number; taskCount: number } {
  const plan = milestones.length ? milestones : STARTER_MILESTONES;
  let milestoneCount = 0;
  let taskCount = 0;
  for (const m of plan) {
    const r = saveProjectSection(projectId, m);
    milestoneCount += 1;
    taskCount += r.taskCount;
  }
  return { milestoneCount, taskCount };
}
