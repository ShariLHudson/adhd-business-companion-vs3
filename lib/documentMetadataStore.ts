// Lightweight metadata for documents exported to Google — not full body storage.

import type { GoogleFileKind } from "./googleWorkspace";
import { googleWorkspaceTitle } from "./googleWorkspace";

export type DocumentMetadata = {
  id: string;
  title: string;
  type: string;
  googleUrl?: string;
  googleFileId?: string;
  googleKind?: GoogleFileKind;
  projectId?: string;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "companion-document-metadata";

const WHERE_IS_DOC_RE =
  /\bwhere is (?:my |the )?(?:document|draft|sop|proposal|recipe|sheet|form)\b/i;

const SHOW_MY_DOC_RE =
  /\bshow (?:my |the )?(?:sop|proposal|recipe|sheet|form|document|google doc)\b/i;

const OPEN_SAVED_WORK_RE =
  /\bopen (?:my )?saved work\b/i;

function readAll(): DocumentMetadata[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DocumentMetadata[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: DocumentMetadata[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listDocumentMetadata(): DocumentMetadata[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function upsertDocumentMetadata(
  input: Omit<DocumentMetadata, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
  },
): DocumentMetadata {
  const now = new Date().toISOString();
  const items = readAll();
  const existingIdx = input.googleFileId
    ? items.findIndex((i) => i.googleFileId === input.googleFileId)
    : items.findIndex(
        (i) =>
          i.title.toLowerCase() === input.title.toLowerCase() &&
          i.type.toLowerCase() === input.type.toLowerCase(),
      );

  if (existingIdx >= 0) {
    const prev = items[existingIdx]!;
    const next: DocumentMetadata = {
      ...prev,
      ...input,
      id: prev.id,
      createdAt: prev.createdAt,
      updatedAt: now,
    };
    items[existingIdx] = next;
    writeAll(items);
    return next;
  }

  const record: DocumentMetadata = {
    id: input.id ?? `doc-${Date.now()}`,
    title: input.title,
    type: input.type,
    googleUrl: input.googleUrl,
    googleFileId: input.googleFileId,
    googleKind: input.googleKind,
    projectId: input.projectId,
    projectName: input.projectName,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
  writeAll([record, ...items]);
  return record;
}

export function findDocumentsForRecovery(query: string): DocumentMetadata[] {
  const items = listDocumentMetadata();
  if (!items.length) return [];

  const q = query.toLowerCase();
  const filtered = items.filter((item) => {
    const hay = `${item.title} ${item.type} ${item.projectName ?? ""}`.toLowerCase();
    if (/\bsop\b/.test(q) && /\bsop\b/.test(hay)) return true;
    if (/\bproposal\b/.test(q) && /\bproposal\b/.test(hay)) return true;
    if (/\brecipe\b/.test(q) && /\brecipe\b/.test(hay)) return true;
    if (/\bsheet\b/.test(q) && item.googleKind === "sheet") return true;
    if (/\bform\b/.test(q) && item.googleKind === "form") return true;
    if (WHERE_IS_DOC_RE.test(q) || SHOW_MY_DOC_RE.test(q) || OPEN_SAVED_WORK_RE.test(q)) {
      return true;
    }
    return hay.split(/\s+/).some((w) => w.length > 3 && q.includes(w));
  });

  return filtered.length ? filtered : items;
}

export function isDocumentRecoveryRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    WHERE_IS_DOC_RE.test(t) ||
    SHOW_MY_DOC_RE.test(t) ||
    OPEN_SAVED_WORK_RE.test(t) ||
    /\bfind my (?:sop|proposal|document)\b/i.test(t)
  );
}

export function formatDocumentRecoveryReply(
  matches: DocumentMetadata[],
): string {
  if (!matches.length) {
    return (
      "I don't have a Google link saved for that yet. " +
      "Want to keep drafting in **Create**, connect Google in Settings, or start a new document?"
    );
  }

  if (matches.length > 1) {
    const list = matches
      .slice(0, 5)
      .map(
        (m, i) =>
          `${i + 1}. **${m.title}** (${m.type})${m.googleUrl ? " — in Google" : ""}`,
      )
      .join("\n");
    return (
      `I found more than one possible document:\n\n${list}\n\n` +
      "Which one do you mean? Reply with the number or title."
    );
  }

  const m = matches[0]!;
  const surface = m.googleKind ? googleWorkspaceTitle(m.googleKind) : "Google";
  const project = m.projectName ? ` It's linked to **${m.projectName}**.` : "";
  if (m.googleUrl) {
    return (
      `Your **${m.title}** (${m.type}) is in **${surface}**.${project}\n\n` +
      `[Open it](${m.googleUrl})`
    );
  }
  return (
    `I have **${m.title}** (${m.type}) on record${project}, but no Google link yet. ` +
    "Open **Create** to finish it, or connect Google and export when ready."
  );
}
