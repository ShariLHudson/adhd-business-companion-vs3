/**
 * Project Inbox — capture-first tasks without a named section (Prompt 137).
 * Capture Before Classification™: never require organization before capture.
 */

import {
  getProjectItems,
  saveProjectItem,
  type ProjectItem,
} from "@/lib/companionProjectsStore";

export const PROJECT_INBOX_LABEL = "Inbox" as const;

/** Root tasks with no parent — the capture bucket before sections exist. */
export function listInboxTasks(
  projectId: string,
  items?: readonly ProjectItem[],
): ProjectItem[] {
  const list = items ?? getProjectItems(projectId);
  return list.filter((i) => i.kind === "task" && !i.parentId);
}

export function listRootSections(
  projectId: string,
  items?: readonly ProjectItem[],
): ProjectItem[] {
  const list = items ?? getProjectItems(projectId);
  return list.filter((i) => i.kind === "section" && !i.parentId);
}

/** Add a task straight to Inbox — no section required. */
export function addInboxTask(
  projectId: string,
  title: string,
): ProjectItem[] {
  const trimmed = title.trim();
  if (!trimmed) return getProjectItems(projectId);
  return saveProjectItem({
    projectId,
    kind: "task",
    title: trimmed,
  });
}

export type InboxGroupingSuggestion = {
  label: string;
  taskIds: string[];
};

const GROUP_HINTS: { label: string; pattern: RegExp }[] = [
  { label: "Marketing", pattern: /\b(market|content|post|social|instagram|audience|brand|copy|campaign)\b/i },
  { label: "Writing", pattern: /\b(write|draft|chapter|outline|edit|blog|article)\b/i },
  { label: "Clients", pattern: /\b(client|customer|proposal|call|meeting|onboard)\b/i },
  { label: "Launch", pattern: /\b(launch|release|publish|announce|go.?live)\b/i },
  { label: "Operations", pattern: /\b(ops|admin|invoice|system|setup|process)\b/i },
];

/**
 * When Inbox has enough related tasks, gently suggest a section name.
 * Heuristic only — never invents work; member chooses Yes / Later / Keep as Inbox.
 */
export function suggestInboxGrouping(
  inboxTasks: readonly ProjectItem[],
): InboxGroupingSuggestion | null {
  const open = inboxTasks.filter((t) => !t.done && t.title.trim());
  if (open.length < 2) return null;

  for (const hint of GROUP_HINTS) {
    const matched = open.filter((t) => hint.pattern.test(t.title));
    if (matched.length >= 2) {
      return { label: hint.label, taskIds: matched.map((t) => t.id) };
    }
  }
  return null;
}

/**
 * Create a section and move Inbox tasks into it (member approved grouping).
 */
export function applyInboxGrouping(
  projectId: string,
  suggestion: InboxGroupingSuggestion,
): ProjectItem[] {
  const items = getProjectItems(projectId);
  const existing = items.find(
    (i) =>
      i.kind === "section" &&
      !i.parentId &&
      i.title.trim().toLowerCase() === suggestion.label.toLowerCase(),
  );
  let sectionId = existing?.id;
  let next = items;
  if (!sectionId) {
    next = saveProjectItem({
      projectId,
      kind: "section",
      title: suggestion.label,
    });
    const created = next.find(
      (i) =>
        i.kind === "section" &&
        !i.parentId &&
        i.title.trim().toLowerCase() === suggestion.label.toLowerCase(),
    );
    sectionId = created?.id;
  }
  if (!sectionId) return next;

  for (const taskId of suggestion.taskIds) {
    const task = next.find((i) => i.id === taskId && i.kind === "task");
    if (!task) continue;
    next = saveProjectItem({
      id: task.id,
      projectId,
      kind: "task",
      title: task.title,
      parentId: sectionId,
      done: task.done,
    });
  }
  return next;
}
