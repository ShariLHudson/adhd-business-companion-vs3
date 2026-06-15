import { loadCreateSession } from "./createSessionStore";
import {
  getProjects,
  getRecentWorkItems,
  type RecentWorkItem,
} from "./companionStore";

const HOME_RECENT_MAX = 8;

/** Items the user can pick from on calm home — hidden until they ask. */
export function collectHomeRecentWork(): RecentWorkItem[] {
  const seen = new Set<string>();
  const items: RecentWorkItem[] = [];

  function add(item: RecentWorkItem) {
    if (!item.title?.trim() || seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  }

  for (const x of getRecentWorkItems()) add(x);

  const session = loadCreateSession();
  if (session) {
    const title =
      session.creationContext.title?.trim() ||
      session.genSeed.topic?.trim() ||
      session.genSeed.type?.trim() ||
      "Draft";
    const contentType = session.genSeed.type;
    add({
      id: `draft:${(contentType ?? "content").toLowerCase()}:${title.toLowerCase()}`,
      kind: "draft",
      title,
      subtitle: contentType || "Create",
      contentType,
      content: session.genSeed.draft,
      ts: session.updatedAt,
    });
  }

  const activeProjects = getProjects()
    .filter((p) => p.status !== "completed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  for (const p of activeProjects) {
    add({
      id: `project:${p.id}`,
      kind: "project",
      title: p.name,
      subtitle: "Project",
      projectId: p.id,
      ts: p.updatedAt,
    });
  }

  return items
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, HOME_RECENT_MAX);
}

/** Display order for the resume list — most recently active first. */
export function sortHomeRecentWorkForDisplay(
  items: RecentWorkItem[],
): RecentWorkItem[] {
  return [...items].sort((a, b) => b.ts.localeCompare(a.ts));
}

export function recentWorkToLastActivity(
  item: RecentWorkItem,
): Omit<RecentWorkItem, "id"> {
  const { id: _id, ...rest } = item;
  return rest;
}
