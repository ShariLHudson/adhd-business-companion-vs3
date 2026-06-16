/** User-added file / link attachments for a project. */

export type ProjectLink = {
  id: string;
  projectId: string;
  label: string;
  url: string;
  createdAt: string;
};

const STORAGE_KEY = "companion-project-links-v1";

function newId(): string {
  return `plink-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): ProjectLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: ProjectLink[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listProjectLinks(projectId: string): ProjectLink[] {
  return readAll()
    .filter((l) => l.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function saveProjectLink(input: {
  projectId: string;
  label: string;
  url: string;
}): ProjectLink[] {
  const label = input.label.trim() || "Link";
  let url = input.url.trim();
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  const link: ProjectLink = {
    id: newId(),
    projectId: input.projectId,
    label,
    url,
    createdAt: new Date().toISOString(),
  };
  writeAll([link, ...readAll()]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("project-links-updated", { detail: { projectId: input.projectId } }),
    );
  }
  return listProjectLinks(input.projectId);
}

export function deleteProjectLink(id: string): void {
  const items = readAll();
  const target = items.find((l) => l.id === id);
  writeAll(items.filter((l) => l.id !== id));
  if (target && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("project-links-updated", {
        detail: { projectId: target.projectId },
      }),
    );
  }
}

export const PROJECT_LINKS_UPDATED = "project-links-updated";
