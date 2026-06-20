/**
 * Create V2 — saved workspace drafts (Open, Rename, Duplicate, Delete).
 */

import { userFacingCreateTypeLabel } from "./createTypePickers";
import { workspaceV2DisplayTitle } from "./createWorkspaceV2";
import { newCreateSessionId } from "./createSharedSession";
import type { CreateWorkflowRecord } from "./createWorkflowRecord";
import { shouldPersistWorkflowRecord } from "./createWorkflowRecord";
import {
  loadSavedWorkflowRecord,
  loadWorkflowRecord,
} from "./createWorkflowRecordStore";

export const CREATE_DRAFT_LIBRARY_KEY = "companion-create-draft-library-v1";
export const CREATE_DRAFT_LIBRARY_UPDATED_EVENT = "create-draft-library-updated";

export type CreateDraftLibraryEntry = {
  id: string;
  title: string;
  itemType: string | null;
  record: CreateWorkflowRecord;
  savedAt: string;
  updatedAt: string;
};

function shouldKeepInDraftLibrary(record: CreateWorkflowRecord): boolean {
  if (shouldPersistWorkflowRecord(record)) return true;
  if (record.itemType?.trim() && record.workflowState?.workspaceFirst) return true;
  return false;
}

function nowIso(): string {
  return new Date().toISOString();
}

function emitLibraryUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CREATE_DRAFT_LIBRARY_UPDATED_EVENT));
}

function loadLibraryRaw(): CreateDraftLibraryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CREATE_DRAFT_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreateDraftLibraryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e?.id && e.record?.workflowId && shouldKeepInDraftLibrary(e.record),
    );
  } catch {
    return [];
  }
}

function saveLibrary(entries: CreateDraftLibraryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    if (entries.length === 0) {
      localStorage.removeItem(CREATE_DRAFT_LIBRARY_KEY);
    } else {
      localStorage.setItem(CREATE_DRAFT_LIBRARY_KEY, JSON.stringify(entries));
    }
  } catch {
    /* noop */
  }
  emitLibraryUpdated();
}

let migrated = false;

/** One-time import from legacy single-slot storage. */
export function migrateLegacyCreateDrafts(): void {
  if (migrated || typeof window === "undefined") return;
  migrated = true;

  const existing = loadLibraryRaw();
  const ids = new Set(existing.map((e) => e.id));
  const toAdd: CreateDraftLibraryEntry[] = [];

  for (const record of [loadSavedWorkflowRecord(), loadWorkflowRecord()]) {
    if (!record || !shouldKeepInDraftLibrary(record)) continue;
    if (ids.has(record.workflowId)) continue;
    ids.add(record.workflowId);
    const ts = record.lastUpdated || nowIso();
    toAdd.push({
      id: record.workflowId,
      title: defaultCreateDraftTitle(record),
      itemType: record.itemType,
      record,
      savedAt: ts,
      updatedAt: ts,
    });
  }

  if (toAdd.length > 0) {
    saveLibrary([...existing, ...toAdd]);
  }
}

export function defaultCreateDraftTitle(record: CreateWorkflowRecord): string {
  const wf = record.workflowState;
  if (wf?.workspaceFirst) {
    const title = workspaceV2DisplayTitle(wf);
    if (title && title !== "Create") return title;
  }
  return (
    record.collectedAnswers.topic?.trim() ||
    record.collectedAnswers.title?.trim() ||
    (record.itemType
      ? userFacingCreateTypeLabel(record.itemType) ?? record.itemType
      : "Create draft")
  );
}

export function listCreateDraftEntries(): CreateDraftLibraryEntry[] {
  migrateLegacyCreateDrafts();
  return loadLibraryRaw().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCreateDraftEntry(id: string): CreateDraftLibraryEntry | null {
  migrateLegacyCreateDrafts();
  return loadLibraryRaw().find((e) => e.id === id) ?? null;
}

export function upsertCreateDraftEntry(
  record: CreateWorkflowRecord,
  title?: string,
): CreateDraftLibraryEntry | null {
  if (!shouldKeepInDraftLibrary(record)) return null;
  migrateLegacyCreateDrafts();

  const ts = nowIso();
  const resolvedTitle = title?.trim() || defaultCreateDraftTitle(record);
  const library = loadLibraryRaw();
  const idx = library.findIndex((e) => e.id === record.workflowId);
  const entry: CreateDraftLibraryEntry = {
    id: record.workflowId,
    title: resolvedTitle,
    itemType: record.itemType,
    record,
    savedAt: idx >= 0 ? library[idx]!.savedAt : ts,
    updatedAt: ts,
  };

  if (idx >= 0) {
    library[idx] = entry;
  } else {
    library.push(entry);
  }
  saveLibrary(library);
  return entry;
}

export function renameCreateDraftEntry(id: string, title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) return false;
  migrateLegacyCreateDrafts();

  const library = loadLibraryRaw();
  const idx = library.findIndex((e) => e.id === id);
  if (idx < 0) return false;

  const prev = library[idx]!;
  library[idx] = {
    ...prev,
    title: trimmed,
    updatedAt: nowIso(),
  };
  saveLibrary(library);
  return true;
}

function cloneRecordForDuplicate(record: CreateWorkflowRecord): CreateWorkflowRecord {
  const newId = newCreateSessionId();
  const cloned = JSON.parse(JSON.stringify(record)) as CreateWorkflowRecord;
  cloned.workflowId = newId;
  cloned.lastUpdated = nowIso();
  cloned.workflowState = {
    ...cloned.workflowState,
    sessionId: newId,
  };
  return cloned;
}

export function duplicateCreateDraftEntry(id: string): CreateDraftLibraryEntry | null {
  migrateLegacyCreateDrafts();
  const source = getCreateDraftEntry(id);
  if (!source) return null;

  const record = cloneRecordForDuplicate(source.record);
  const title = `${source.title} (copy)`;
  return upsertCreateDraftEntry(record, title);
}

export function deleteCreateDraftEntry(id: string): boolean {
  migrateLegacyCreateDrafts();
  const library = loadLibraryRaw();
  if (!library.some((e) => e.id === id)) return false;

  saveLibrary(library.filter((e) => e.id !== id));

  const active = loadWorkflowRecord();
  if (active?.workflowId === id) {
    try {
      localStorage.removeItem("companion-create-workflow-record-v1");
    } catch {
      /* noop */
    }
  }

  const saved = loadSavedWorkflowRecord();
  if (saved?.workflowId === id) {
    try {
      localStorage.removeItem("companion-create-workflow-saved-v1");
    } catch {
      /* noop */
    }
  }

  return true;
}

/** Test helper — reset library state. */
export function clearCreateDraftLibraryForTests(): void {
  migrated = false;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CREATE_DRAFT_LIBRARY_KEY);
  } catch {
    /* noop */
  }
}
