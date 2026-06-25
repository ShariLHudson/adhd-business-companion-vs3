/**
 * My Thinking Space™ queries — permanent home for all captured thoughts.
 */

import {
  getBrainDumps,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";
import { getThoughtCollections } from "./collections";
import {
  getActiveCollectionForThought,
  getActiveCollectionId,
  migrateThoughtCollectionFields,
  thoughtBelongsToCollectionId,
} from "./thoughtCollectionAuthority";
import type { ThoughtCollection } from "./types";

export type ThinkingSpaceThought = BrainDumpEntry;

export function isArchivedThought(entry: BrainDumpEntry): boolean {
  return entry.archived === true;
}

export function isActiveThinkingSpaceThought(entry: BrainDumpEntry): boolean {
  return isVisibleInMentalLandscape(entry) && !isArchivedThought(entry);
}

/** All thoughts in My Thinking Space™ (active, not completed). */
export function getThinkingSpaceThoughts(): ThinkingSpaceThought[] {
  return getBrainDumps()
    .filter(isActiveThinkingSpaceThought)
    .map(migrateThoughtCollectionFields)
    .sort(compareThoughts);
}

/** Session-scoped active thoughts (Clear My Mind capture). */
export function getSessionThoughts(sessionId: string): ThinkingSpaceThought[] {
  return getBrainDumps()
    .filter(
      (e) =>
        e.captureSessionId === sessionId && isActiveThinkingSpaceThought(e),
    )
    .map(migrateThoughtCollectionFields)
    .sort(compareThoughts);
}

export function getArchivedThoughts(): ThinkingSpaceThought[] {
  return getBrainDumps()
    .filter((e) => isArchivedThought(e) && !e.done)
    .map(migrateThoughtCollectionFields)
    .sort(
      (a, b) =>
        new Date(b.archivedAt ?? b.createdAt).getTime() -
        new Date(a.archivedAt ?? a.createdAt).getTime(),
    );
}

export function getCompletedThoughts(): ThinkingSpaceThought[] {
  return getBrainDumps()
    .filter((e) => e.done === true)
    .map(migrateThoughtCollectionFields)
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    );
}

function compareThoughts(a: BrainDumpEntry, b: BrainDumpEntry): number {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

/** Active collection for a thought (0 or 1). */
export function getCollectionsForThought(
  entry: BrainDumpEntry,
  _collections = getThoughtCollections(),
): ThoughtCollection[] {
  const col = getActiveCollectionForThought(entry);
  return col ? [col] : [];
}

export function thoughtBelongsToCollection(
  entry: BrainDumpEntry,
  collectionId: string,
): boolean {
  return thoughtBelongsToCollectionId(entry, collectionId);
}

export function countThoughtsInCollection(
  collectionId: string,
  thoughts = getThinkingSpaceThoughts(),
): number {
  return thoughts.filter((t) => thoughtBelongsToCollection(t, collectionId))
    .length;
}

export { getActiveCollectionId };
