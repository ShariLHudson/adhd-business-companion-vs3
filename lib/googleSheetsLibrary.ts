/**
 * P0.18.1 — In-app Google Sheets library (chat-created sheets).
 */

import type { GoogleSheetTypeId } from "./googleSheetsIntelligence";

export type GoogleSheetLibrarySource = "chat" | "export" | "create";

export type GoogleSheetLibraryItem = {
  id: string;
  type: "google_sheet";
  title: string;
  googleDocId: string;
  googleDocUrl: string;
  createdAt: string;
  source: GoogleSheetLibrarySource;
  sheetType: GoogleSheetTypeId | string;
  savedWorkId?: string;
};

const STORAGE_KEY = "companion-google-sheets-library-v1";
export const GOOGLE_SHEETS_LIBRARY_UPDATED = "companion-google-sheets-library-updated";

function newId(): string {
  return `gs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): GoogleSheetLibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is GoogleSheetLibraryItem =>
        item &&
        item.type === "google_sheet" &&
        typeof item.title === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(items: GoogleSheetLibraryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(GOOGLE_SHEETS_LIBRARY_UPDATED));
  } catch {
    /* ignore */
  }
}

export function getGoogleSheetsLibrary(): GoogleSheetLibraryItem[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getGoogleSheetLibraryItem(
  id: string,
): GoogleSheetLibraryItem | undefined {
  return readAll().find((item) => item.id === id);
}

export function getGoogleSheetBySavedWorkId(
  savedWorkId: string,
): GoogleSheetLibraryItem | undefined {
  return readAll().find((item) => item.savedWorkId === savedWorkId);
}

export function addGoogleSheetToLibrary(input: {
  title: string;
  googleDocId: string;
  googleDocUrl: string;
  sheetType: GoogleSheetTypeId | string;
  source?: GoogleSheetLibrarySource;
  savedWorkId?: string;
}): GoogleSheetLibraryItem {
  const now = new Date().toISOString();
  const item: GoogleSheetLibraryItem = {
    id: newId(),
    type: "google_sheet",
    title: input.title.trim() || "Google Sheet",
    googleDocId: input.googleDocId,
    googleDocUrl: input.googleDocUrl,
    createdAt: now,
    source: input.source ?? "chat",
    sheetType: input.sheetType,
    savedWorkId: input.savedWorkId,
  };
  writeAll([item, ...readAll()]);
  return item;
}

export function isGoogleSheetSavedWorkTags(tags: string[]): boolean {
  return tags.includes("google-sheet");
}

export const GOOGLE_SHEETS_SAVED_LOCATION_LABEL = "Saved → Google Sheets";

export function googleSheetSavedLocationLabel(title?: string): string {
  const name = title?.trim();
  return name
    ? `${GOOGLE_SHEETS_SAVED_LOCATION_LABEL} → ${name}`
    : GOOGLE_SHEETS_SAVED_LOCATION_LABEL;
}
