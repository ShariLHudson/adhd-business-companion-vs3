/**
 * Growth memory / journal storage — journal, capture moments, and related types.
 */

import type { EcosystemObjectKind } from "./intelligence/intelligenceReadyTypes";
import type { GrowthAttachment } from "./growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";

export type GrowthEntryType =
  | "journal"
  | "capture_moment"
  | "reflection"
  | "lesson"
  | "idea"
  | "memory"
  | "story_reflection"
  | "milestone"
  | "storybook_note";

export type JournalEntry = {
  id: string;
  type: GrowthEntryType;
  title?: string;
  body: string;
  attachments: GrowthAttachment[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  sourcePage?: string;
  tags: string[];
  isArchived: boolean;
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
};

const STORAGE_KEY = "companion-growth-journal-v1";

export const GROWTH_JOURNAL_UPDATED_EVENT = "companion-growth-journal-updated";

let growthJournalLocalStorageBlocked = false;
let memoryJournalEntries: JournalEntry[] | null = null;

function safeGrowthSetItem(payload: string): boolean {
  if (typeof window === "undefined") return false;
  if (!growthJournalLocalStorageBlocked) {
    try {
      localStorage.setItem(STORAGE_KEY, payload);
      return true;
    } catch {
      growthJournalLocalStorageBlocked = true;
    }
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, payload);
    return true;
  } catch {
    return false;
  }
}

function safeGrowthGetItem(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(STORAGE_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    growthJournalLocalStorageBlocked = true;
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export const GROWTH_ENTRY_TYPE_LABELS: Record<GrowthEntryType, string> = {
  journal: "Journal",
  capture_moment: "Capture Moment",
  reflection: "Reflection",
  lesson: "Lesson",
  idea: "Idea",
  memory: "Memory",
  story_reflection: "Story Reflection",
  milestone: "Milestone",
  storybook_note: "Storybook Note",
};

function newId(prefix = "jr"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEntry(raw: unknown): JournalEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Partial<JournalEntry>;
  if (typeof e.id !== "string" || typeof e.body !== "string") return null;
  return {
    id: e.id,
    type: e.type ?? "journal",
    title: e.title,
    body: e.body,
    attachments: Array.isArray(e.attachments) ? e.attachments : [],
    createdAt: e.createdAt ?? new Date().toISOString(),
    updatedAt: e.updatedAt ?? e.createdAt ?? new Date().toISOString(),
    userId: e.userId,
    sourcePage: e.sourcePage,
    tags: Array.isArray(e.tags) ? e.tags : [],
    isArchived: e.isArchived ?? false,
    originatedFromId: e.originatedFromId,
    originatedFromKind: e.originatedFromKind,
  };
}

function readAll(): JournalEntry[] {
  if (typeof window === "undefined") return memoryJournalEntries ?? [];
  try {
    const raw = safeGrowthGetItem();
    if (!raw) return memoryJournalEntries ?? [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return memoryJournalEntries ?? [];
    const entries = parsed
      .map(normalizeEntry)
      .filter((e): e is JournalEntry => e != null && !e.isArchived);
    memoryJournalEntries = entries;
    return entries;
  } catch {
    return memoryJournalEntries ?? [];
  }
}

function writeAll(list: JournalEntry[]): boolean {
  if (typeof window === "undefined") return false;
  memoryJournalEntries = list;
  const ok = safeGrowthSetItem(JSON.stringify(list));
  try {
    window.dispatchEvent(new Event(GROWTH_JOURNAL_UPDATED_EVENT));
  } catch {
    /* listeners optional */
  }
  return ok;
}

export function generateEntryTitle(content: string): string {
  const firstLine = content.split(/\n/)[0]?.trim() ?? "";
  const words = firstLine.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Untitled moment";
  if (words.length <= 8) return firstLine.slice(0, 80);
  return `${words.slice(0, 8).join(" ")}…`;
}

export function getJournalEntries(): JournalEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getGrowthMemoryEntries(
  filter?: { types?: GrowthEntryType[] },
): JournalEntry[] {
  const all = getJournalEntries();
  if (!filter?.types?.length) return all;
  return all.filter((e) => filter.types!.includes(e.type));
}

export type JournalEntryInput = Omit<
  JournalEntry,
  "id" | "createdAt" | "updatedAt" | "type" | "tags" | "isArchived"
> & {
  type?: GrowthEntryType;
  tags?: string[];
  isArchived?: boolean;
};

export function createJournalEntry(
  input: JournalEntryInput,
): { entry: JournalEntry; ok: boolean } {
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: newId(),
    type: input.type ?? "journal",
    title: input.title,
    body: input.body.trim(),
    attachments: input.attachments ?? [],
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    sourcePage: input.sourcePage ?? "growth_journal",
    tags: input.tags ?? [],
    isArchived: input.isArchived ?? false,
    originatedFromId: input.originatedFromId,
    originatedFromKind: input.originatedFromKind,
  };
  const ok = writeAll([entry, ...readAll()]);
  if (ok && entry.attachments.length > 0) {
    linkGrowthAttachmentsToRecord(entry.attachments, "journal", entry.id);
  }
  return { entry, ok };
}

export function createCaptureMomentEntry(input: {
  content: string;
  userId?: string;
}): { entry?: JournalEntry; ok: boolean } {
  const content = input.content.trim();
  if (!content) return { ok: false };

  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: newId("cm"),
    type: "capture_moment",
    title: generateEntryTitle(content),
    body: content,
    attachments: [],
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    sourcePage: "capture_the_moment",
    tags: [],
    isArchived: false,
    originatedFromKind: "journal-entry",
  };

  const ok = writeAll([entry, ...readAll()]);
  return { entry: ok ? entry : undefined, ok };
}

export function createYourStoryEntry(input: {
  content: string;
  type?: Extract<
    GrowthEntryType,
    "story_reflection" | "milestone" | "storybook_note" | "reflection" | "lesson"
  >;
  userId?: string;
}): { entry?: JournalEntry; ok: boolean } {
  const content = input.content.trim();
  if (!content) return { ok: false };

  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: newId("ys"),
    type: input.type ?? "story_reflection",
    title: generateEntryTitle(content),
    body: content,
    attachments: [],
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    sourcePage: "your_story",
    tags: [],
    isArchived: false,
    originatedFromKind: "journal-entry",
  };

  const ok = writeAll([entry, ...readAll()]);
  return { entry: ok ? entry : undefined, ok };
}

export function deleteJournalEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function updateJournalEntry(
  id: string,
  patch: Partial<Pick<JournalEntry, "title" | "body" | "tags" | "attachments">>,
): boolean {
  const all = readAll();
  const index = all.findIndex((e) => e.id === id);
  if (index < 0) return false;
  const existing = all[index]!;
  const next: JournalEntry = {
    ...existing,
    ...patch,
    body: patch.body?.trim() ?? existing.body,
    updatedAt: new Date().toISOString(),
  };
  const updated = [...all];
  updated[index] = next;
  const ok = writeAll(updated);
  if (ok && patch.attachments?.length) {
    linkGrowthAttachmentsToRecord(patch.attachments, "journal", id);
  }
  return ok;
}

export function toggleJournalFavorite(id: string): boolean {
  const entry = getJournalEntryById(id);
  if (!entry) return false;
  const tags = new Set(entry.tags);
  if (tags.has("favorite")) tags.delete("favorite");
  else tags.add("favorite");
  return updateJournalEntry(id, { tags: [...tags] });
}

export function isJournalFavorite(entry: JournalEntry): boolean {
  return entry.tags.includes("favorite");
}

export function getJournalEntryById(id: string): JournalEntry | null {
  return readAll().find((e) => e.id === id) ?? null;
}
