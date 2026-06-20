/** User-added file / link attachments for a project. */

export type ProjectLinkKind =
  | "website"
  | "google-doc"
  | "youtube"
  | "loom"
  | "drive"
  | "other";

export type ProjectLink = {
  id: string;
  projectId: string;
  label: string;
  url: string;
  kind: ProjectLinkKind;
  createdAt: string;
};

const STORAGE_KEY = "companion-project-links-v1";

export function inferProjectLinkKind(url: string): ProjectLinkKind {
  const u = url.toLowerCase();
  if (/youtube\.com|youtu\.be/.test(u)) return "youtube";
  if (/loom\.com/.test(u)) return "loom";
  if (/docs\.google\.com\/document/.test(u)) return "google-doc";
  if (/drive\.google\.com|docs\.google\.com|sheets\.google\.com|slides\.google\.com/.test(u)) {
    return "drive";
  }
  return "website";
}

export function projectLinkKindLabel(kind: ProjectLinkKind): string {
  const labels: Record<ProjectLinkKind, string> = {
    website: "Website",
    "google-doc": "Google Doc",
    youtube: "YouTube",
    loom: "Loom",
    drive: "Google Drive",
    other: "Link",
  };
  return labels[kind];
}

export function defaultProjectLinkLabel(url: string, kind: ProjectLinkKind): string {
  if (kind === "youtube") return "YouTube video";
  if (kind === "loom") return "Loom recording";
  if (kind === "google-doc") return "Google Doc";
  if (kind === "drive") return "Google Drive file";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || "Link";
  } catch {
    return "Link";
  }
}

function newId(): string {
  return `plink-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): ProjectLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      kind: item.kind ?? inferProjectLinkKind(item.url ?? ""),
    }));
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
  let url = input.url.trim();
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  const kind = inferProjectLinkKind(url);
  const label =
    input.label.trim() || defaultProjectLinkLabel(url, kind);
  const link: ProjectLink = {
    id: newId(),
    projectId: input.projectId,
    label,
    url,
    kind,
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
