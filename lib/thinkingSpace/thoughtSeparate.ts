/**
 * Companion-guided thought separation — undo + acknowledgment.
 * Not a "split" tool; Shari helps untangle ideas that landed together.
 */

import { deleteBrainDump, getBrainDumps, updateBrainDump } from "@/lib/companionStore";
import { splitThoughtIntoParts } from "./thoughtOperations";

const UNDO_STORAGE_KEY = "companion-thought-separate-undo-v1";
const UNDO_TTL_MS = 5 * 60 * 1000;

const AFTER_SEPARATE_LINES = [
  "They each have their own place now.",
  "That feels a little easier to look at.",
  "There we go. Now we can work with them one at a time.",
] as const;

export type ThoughtSeparateUndo = {
  primaryId: string;
  createdIds: string[];
  combinedText: string;
  acknowledgment: string;
  expiresAt: number;
};

function pickLine(lines: readonly string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return lines[Math.abs(hash) % lines.length]!;
}

export function shariAfterSeparateAcknowledgment(seed: string): string {
  return pickLine(AFTER_SEPARATE_LINES, seed);
}

function readUndo(): ThoughtSeparateUndo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UNDO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ThoughtSeparateUndo;
    if (!parsed?.primaryId || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(UNDO_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeUndo(undo: ThoughtSeparateUndo): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(undo));
  } catch {
    /* non-fatal */
  }
}

export function clearThoughtSeparationUndo(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(UNDO_STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
}

export function getPendingThoughtSeparationUndo(): ThoughtSeparateUndo | null {
  return readUndo();
}

/** Separate one thought into many; stores undo window for companion acknowledgment. */
export function separateThoughtWithUndo(
  id: string,
  segments: string[],
): ThoughtSeparateUndo | null {
  const entry = getBrainDumps().find((e) => e.id === id);
  if (!entry || segments.length < 2) return null;

  const combinedText = entry.text;
  const idsBefore = new Set(getBrainDumps().map((e) => e.id));

  const results = splitThoughtIntoParts(id, segments);
  if (results.length <= 1) return null;

  const createdIds = getBrainDumps()
    .filter((e) => !idsBefore.has(e.id))
    .map((e) => e.id);

  const undo: ThoughtSeparateUndo = {
    primaryId: id,
    createdIds,
    combinedText,
    acknowledgment: shariAfterSeparateAcknowledgment(`${id}:${combinedText}`),
    expiresAt: Date.now() + UNDO_TTL_MS,
  };
  writeUndo(undo);
  return undo;
}

/** Restore the combined thought and remove separated copies. */
export function undoThoughtSeparation(): boolean {
  const undo = readUndo();
  if (!undo) return false;

  if (!getBrainDumps().some((e) => e.id === undo.primaryId)) {
    clearThoughtSeparationUndo();
    return false;
  }

  for (const createdId of undo.createdIds) {
    deleteBrainDump(createdId);
  }
  updateBrainDump(undo.primaryId, { text: undo.combinedText });
  clearThoughtSeparationUndo();
  return true;
}
