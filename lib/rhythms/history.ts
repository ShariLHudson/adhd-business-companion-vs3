/**
 * Adaptive Rhythms — history (no failure/streak language).
 */

import type { RhythmHistoryAction, RhythmHistoryEntry } from "./types";

const HISTORY_KEY = "companion-rhythm-history-v1";
const MAX_ENTRIES = 200;

function uid(): string {
  return `rh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): RhythmHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RhythmHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: RhythmHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES)),
    );
  } catch {
    /* ignore */
  }
}

export function listRhythmHistory(limit = 50): RhythmHistoryEntry[] {
  return readAll().slice(0, limit);
}

export function appendRhythmHistory(input: {
  rhythmId?: string;
  reminderId?: string;
  action: RhythmHistoryAction;
  note?: string;
}): RhythmHistoryEntry {
  const entry: RhythmHistoryEntry = {
    id: uid(),
    rhythmId: input.rhythmId,
    reminderId: input.reminderId,
    action: input.action,
    at: new Date().toISOString(),
    note: input.note,
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function historyForRhythm(
  rhythmId: string,
  limit = 30,
): RhythmHistoryEntry[] {
  return readAll()
    .filter((e) => e.rhythmId === rhythmId)
    .slice(0, limit);
}
