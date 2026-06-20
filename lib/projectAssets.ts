/**
 * Project Assets — uploaded files and notes stored per project (local-first).
 */

export type ProjectAssetFileKind =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "txt"
  | "csv"
  | "image"
  | "other";

export type ProjectAssetFile = {
  id: string;
  projectId: string;
  name: string;
  mimeType: string;
  kind: ProjectAssetFileKind;
  sizeBytes: number;
  dataUrl: string;
  createdAt: string;
};

export type ProjectAssetNoteKind = "quick" | "meeting" | "brain-dump";

export type ProjectAssetNote = {
  id: string;
  projectId: string;
  title: string;
  body: string;
  kind: ProjectAssetNoteKind;
  createdAt: string;
  updatedAt: string;
};

export const PROJECT_ASSET_MAX_BYTES = 8 * 1024 * 1024;

const FILES_KEY = "companion-project-asset-files-v1";
const NOTES_KEY = "companion-project-asset-notes-v1";

export const PROJECT_ASSETS_UPDATED = "project-assets-updated";

const ACCEPTED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const EXT_KIND: Record<string, ProjectAssetFileKind> = {
  pdf: "pdf",
  docx: "docx",
  xlsx: "xlsx",
  pptx: "pptx",
  txt: "txt",
  csv: "csv",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
};

export function projectAssetFileKindLabel(kind: ProjectAssetFileKind): string {
  const labels: Record<ProjectAssetFileKind, string> = {
    pdf: "PDF",
    docx: "Word",
    xlsx: "Excel",
    pptx: "PowerPoint",
    txt: "Text",
    csv: "CSV",
    image: "Image",
    other: "File",
  };
  return labels[kind];
}

export function projectAssetNoteKindLabel(kind: ProjectAssetNoteKind): string {
  const labels: Record<ProjectAssetNoteKind, string> = {
    quick: "Quick note",
    meeting: "Meeting notes",
    "brain-dump": "Brain dump",
  };
  return labels[kind];
}

export function inferProjectAssetFileKind(
  fileName: string,
  mimeType: string,
): ProjectAssetFileKind {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (EXT_KIND[ext]) return EXT_KIND[ext]!;
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "other";
}

export function isAcceptedProjectAssetFile(file: File): boolean {
  if (file.size > PROJECT_ASSET_MAX_BYTES) return false;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (EXT_KIND[ext]) return true;
  return ACCEPTED_MIME.has(file.type);
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function dispatchUpdated(projectId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PROJECT_ASSETS_UPDATED, { detail: { projectId } }),
  );
}

function readFiles(): ProjectAssetFile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFiles(items: ProjectAssetFile[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(items));
  } catch {
    /* storage full */
  }
}

function readNotes(): ProjectAssetNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotes(items: ProjectAssetNote[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(items));
}

export function listProjectAssetFiles(projectId: string): ProjectAssetFile[] {
  return readFiles()
    .filter((f) => f.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function listProjectAssetNotes(projectId: string): ProjectAssetNote[] {
  return readNotes()
    .filter((n) => n.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function projectAssetCount(projectId: string): number {
  return (
    listProjectAssetFiles(projectId).length +
    listProjectAssetNotes(projectId).length +
    0
  );
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export async function saveProjectAssetFile(
  projectId: string,
  file: File,
): Promise<{ ok: true; asset: ProjectAssetFile } | { ok: false; error: string }> {
  if (!isAcceptedProjectAssetFile(file)) {
    if (file.size > PROJECT_ASSET_MAX_BYTES) {
      return {
        ok: false,
        error: `File is too large — max ${Math.round(PROJECT_ASSET_MAX_BYTES / (1024 * 1024))}MB.`,
      };
    }
    return {
      ok: false,
      error:
        "That file type isn't supported. Try PDF, Word, Excel, PowerPoint, text, CSV, or an image.",
    };
  }

  const dataUrl = await readFileAsDataUrl(file);
  const asset: ProjectAssetFile = {
    id: newId("pfile"),
    projectId,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    kind: inferProjectAssetFileKind(file.name, file.type),
    sizeBytes: file.size,
    dataUrl,
    createdAt: new Date().toISOString(),
  };
  writeFiles([asset, ...readFiles()]);
  dispatchUpdated(projectId);
  return { ok: true, asset };
}

export function deleteProjectAssetFile(id: string): void {
  const items = readFiles();
  const target = items.find((f) => f.id === id);
  writeFiles(items.filter((f) => f.id !== id));
  if (target) dispatchUpdated(target.projectId);
}

export function saveProjectAssetNote(input: {
  projectId: string;
  title: string;
  body: string;
  kind?: ProjectAssetNoteKind;
}): ProjectAssetNote {
  const now = new Date().toISOString();
  const note: ProjectAssetNote = {
    id: newId("pnote"),
    projectId: input.projectId,
    title: input.title.trim() || "Note",
    body: input.body.trim(),
    kind: input.kind ?? "quick",
    createdAt: now,
    updatedAt: now,
  };
  writeNotes([note, ...readNotes()]);
  dispatchUpdated(input.projectId);
  return note;
}

export function updateProjectAssetNote(
  id: string,
  patch: { title?: string; body?: string; kind?: ProjectAssetNoteKind },
): ProjectAssetNote | null {
  const items = readNotes();
  const idx = items.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  const prev = items[idx]!;
  const next: ProjectAssetNote = {
    ...prev,
    title: patch.title?.trim() || prev.title,
    body: patch.body !== undefined ? patch.body.trim() : prev.body,
    kind: patch.kind ?? prev.kind,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  writeNotes(items);
  dispatchUpdated(next.projectId);
  return next;
}

export function deleteProjectAssetNote(id: string): void {
  const items = readNotes();
  const target = items.find((n) => n.id === id);
  writeNotes(items.filter((n) => n.id !== id));
  if (target) dispatchUpdated(target.projectId);
}

export function formatProjectAssetFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
