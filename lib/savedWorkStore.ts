// Saved Work — user-created documents (separate from reusable Templates).

export type SavedWorkStatus = "draft" | "saved" | "exported";

export type SavedWorkItem = {
  id: string;
  title: string;
  artifactType: string;
  body: string;
  status: SavedWorkStatus;
  /** e.g. "Saved Work > SOPs" */
  savedLocation: string;
  typeFolder: string;
  preview: string;
  tags: string[];
  sourceWorkspace: string;
  projectId?: string;
  projectName?: string;
  googleDocId?: string;
  googleDocUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "companion-saved-work-v1";

function newId(): string {
  return `sw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): SavedWorkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is SavedWorkItem =>
        w &&
        typeof w.id === "string" &&
        typeof w.title === "string" &&
        typeof w.body === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(list: SavedWorkItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

export function savedWorkTypeFolder(artifactType: string): string {
  const t = artifactType.trim().toLowerCase();
  if (t.includes("sop") || t.includes("procedure")) return "SOPs";
  if (t.includes("proposal")) return "Proposals";
  if (t.includes("avatar")) return "Client Avatars";
  if (t.includes("email")) return "Emails";
  if (t.includes("plan") || t.includes("calendar")) return "Plans";
  if (t.includes("post") || t.includes("blog") || t.includes("newsletter")) {
    return "Content";
  }
  if (t.includes("page") || t.includes("funnel") || t.includes("sales")) {
    return "Marketing";
  }
  return "Documents";
}

export function savedWorkLocationLabel(typeFolder: string): string {
  return `Saved Work > ${typeFolder}`;
}

export function getSavedWork(): SavedWorkItem[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getSavedWorkById(id: string): SavedWorkItem | undefined {
  return readAll().find((w) => w.id === id);
}

export function createSavedWork(input: {
  title: string;
  artifactType: string;
  body: string;
  status?: SavedWorkStatus;
  sourceWorkspace?: string;
  tags?: string[];
}): SavedWorkItem {
  const body = input.body.trim();
  const now = new Date().toISOString();
  const typeFolder = savedWorkTypeFolder(input.artifactType);
  const item: SavedWorkItem = {
    id: newId(),
    title: input.title.trim() || "Untitled",
    artifactType: input.artifactType,
    body,
    status: input.status ?? "saved",
    typeFolder,
    savedLocation: savedWorkLocationLabel(typeFolder),
    preview: body.slice(0, 240),
    tags: input.tags ?? [],
    sourceWorkspace: input.sourceWorkspace ?? "content-generator",
    createdAt: now,
    updatedAt: now,
  };
  writeAll([item, ...readAll()]);
  return item;
}

export function updateSavedWork(
  id: string,
  changes: Partial<
    Pick<
      SavedWorkItem,
      | "title"
      | "body"
      | "artifactType"
      | "status"
      | "projectId"
      | "projectName"
      | "googleDocId"
      | "googleDocUrl"
      | "tags"
    >
  >,
): SavedWorkItem | undefined {
  let updated: SavedWorkItem | undefined;
  const next = readAll().map((w) => {
    if (w.id !== id) return w;
    const typeFolder = changes.artifactType
      ? savedWorkTypeFolder(changes.artifactType)
      : w.typeFolder;
    const body = changes.body ?? w.body;
    updated = {
      ...w,
      ...changes,
      typeFolder,
      savedLocation: savedWorkLocationLabel(typeFolder),
      preview: (changes.body ?? w.body).slice(0, 240),
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) writeAll(next);
  return updated;
}

export function linkSavedWorkToProject(
  id: string,
  projectId: string,
  projectName: string,
): SavedWorkItem | undefined {
  return updateSavedWork(id, { projectId, projectName });
}

export function markSavedWorkExported(
  id: string,
  googleDocUrl: string,
  googleDocId?: string,
): SavedWorkItem | undefined {
  return updateSavedWork(id, {
    status: "exported",
    googleDocUrl,
    googleDocId,
  });
}

export function searchSavedWork(query: string): SavedWorkItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return getSavedWork();
  return getSavedWork().filter(
    (w) =>
      w.title.toLowerCase().includes(q) ||
      w.artifactType.toLowerCase().includes(q) ||
      w.preview.toLowerCase().includes(q) ||
      w.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
