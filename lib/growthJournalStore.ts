/**
 * Growth Journal — private reflection. One primary home per entry.
 */

import type { EcosystemObjectKind } from "./intelligence/intelligenceReadyTypes";
import type { GrowthAttachment } from "./growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";

export type JournalEntry = {
  id: string;
  body: string;
  attachments: GrowthAttachment[];
  createdAt: string;
  updatedAt: string;
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
};

const STORAGE_KEY = "companion-growth-journal-v1";

export const GROWTH_JOURNAL_UPDATED_EVENT = "companion-growth-journal-updated";

function newId(): string {
  return `jr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is JournalEntry =>
        e && typeof e.id === "string" && typeof e.body === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(list: JournalEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(GROWTH_JOURNAL_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

export function getJournalEntries(): JournalEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export type JournalEntryInput = Omit<JournalEntry, "id" | "createdAt" | "updatedAt">;

export function createJournalEntry(input: JournalEntryInput): JournalEntry {
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: newId(),
    body: input.body.trim(),
    attachments: input.attachments ?? [],
    createdAt: now,
    updatedAt: now,
    originatedFromId: input.originatedFromId,
    originatedFromKind: input.originatedFromKind,
  };
  writeAll([entry, ...readAll()]);
  linkGrowthAttachmentsToRecord(entry.attachments, "journal", entry.id);
  return entry;
}

export function deleteJournalEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function getJournalEntryById(id: string): JournalEntry | null {
  return readAll().find((e) => e.id === id) ?? null;
}
