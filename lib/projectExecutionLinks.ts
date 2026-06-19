/**
 * Project ↔ Google execution links — documents, sheets, forms stored on projects.
 */

export type ProjectExecutionLinkKind = "doc" | "sheet" | "form" | "export";

export type ProjectExecutionLink = {
  id: string;
  projectId: string;
  kind: ProjectExecutionLinkKind;
  label: string;
  url: string;
  fileId?: string;
  createdAt: string;
};

const STORAGE_KEY = "companion-project-execution-links-v1";

function newId(): string {
  return `pex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): ProjectExecutionLink[] {
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

function writeAll(items: ProjectExecutionLink[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent("project-execution-links-updated", {
        detail: { projectId: items[0]?.projectId },
      }),
    );
  } catch {
    /* noop */
  }
}

export function listProjectExecutionLinks(
  projectId: string,
): ProjectExecutionLink[] {
  return readAll()
    .filter((l) => l.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function listAllProjectExecutionLinks(): ProjectExecutionLink[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function saveProjectExecutionLink(input: {
  projectId: string;
  kind: ProjectExecutionLinkKind;
  label: string;
  url: string;
  fileId?: string;
}): ProjectExecutionLink {
  const link: ProjectExecutionLink = {
    id: newId(),
    projectId: input.projectId,
    kind: input.kind,
    label: input.label.trim() || "Document",
    url: input.url,
    fileId: input.fileId,
    createdAt: new Date().toISOString(),
  };
  writeAll([link, ...readAll()]);
  return link;
}

export const PROJECT_EXECUTION_LINKS_UPDATED = "project-execution-links-updated";
