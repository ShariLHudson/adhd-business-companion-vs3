/**
 * User-confirmed wins — meaningful moments saved from Suggested Wins review.
 */

import type { GrowthAttachment } from "./growthAttachments";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";
import type { GrowthMomentClassification } from "./suggestedGrowthMoments";
import { isInWeek } from "./weeklyWins";

export type SavedGrowthWin = {
  id: string;
  whatHappened: string;
  ts: string;
  icon: string;
  /** Celebration Garden moment kind (249) */
  category?: string;
  sourceId?: string;
  classification?: GrowthMomentClassification;
  attachments: GrowthAttachment[];
  createdAt: string;
};

const STORAGE_KEY = "companion-saved-growth-wins-v1";

export const SAVED_GROWTH_WINS_UPDATED_EVENT = "companion-saved-growth-wins-updated";

function newId(): string {
  return `gw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): SavedGrowthWin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (w): w is SavedGrowthWin =>
          w && typeof w.id === "string" && typeof w.whatHappened === "string",
      )
      .map((w) => ({
        ...w,
        attachments: Array.isArray(w.attachments) ? w.attachments : [],
      }));
  } catch {
    return [];
  }
}

function writeAll(list: SavedGrowthWin[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(SAVED_GROWTH_WINS_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

export function getSavedGrowthWins(): SavedGrowthWin[] {
  return readAll().sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  );
}

export function getSavedGrowthWinsForWeek(weekKey: string): SavedGrowthWin[] {
  return getSavedGrowthWins().filter((w) => isInWeek(w.ts, weekKey));
}

export type SavedGrowthWinInput = Omit<SavedGrowthWin, "id" | "createdAt">;

export function createSavedGrowthWin(
  input: SavedGrowthWinInput,
): SavedGrowthWin {
  const win: SavedGrowthWin = {
    id: newId(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  writeAll([win, ...readAll()]);
  if (win.attachments.length > 0) {
    linkGrowthAttachmentsToRecord(win.attachments, "win", win.id);
  }
  return win;
}

export function updateSavedGrowthWin(
  id: string,
  patch: Partial<SavedGrowthWinInput>,
): SavedGrowthWin | null {
  const list = readAll();
  const idx = list.findIndex((w) => w.id === id);
  if (idx < 0) return null;
  const updated = { ...list[idx], ...patch };
  list[idx] = updated;
  writeAll(list);
  if (patch.attachments?.length) {
    linkGrowthAttachmentsToRecord(patch.attachments, "win", id);
  }
  return updated;
}

export function deleteSavedGrowthWin(id: string): void {
  writeAll(readAll().filter((w) => w.id !== id));
}

export function hasSavedWinForSource(sourceId: string): boolean {
  return readAll().some((w) => w.sourceId === sourceId);
}
