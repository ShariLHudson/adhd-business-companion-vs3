/**
 * Create Simplification & Category Evaluation — Part 2.
 * Splits saved drafts into Recent / Older Work without a new data model —
 * reuses `CreateDraftLibraryEntry.updatedAt` that already exists today.
 */

import type { CreateDraftLibraryEntry } from "@/lib/createDraftLibrary";

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isRecentDraft(
  entry: Pick<CreateDraftLibraryEntry, "updatedAt">,
  now: Date = new Date(),
): boolean {
  const updated = new Date(entry.updatedAt).getTime();
  if (Number.isNaN(updated)) return false;
  return now.getTime() - updated <= RECENT_WINDOW_MS;
}

export function isOlderDraft(
  entry: Pick<CreateDraftLibraryEntry, "updatedAt">,
  now: Date = new Date(),
): boolean {
  return !isRecentDraft(entry, now);
}
