import type { SparkNoteCatalogEntry, SparkNoteCategory } from "./types";
import { SPARK_NOTE_CATALOG } from "./catalog";
import {
  getRecentSelectionCategories,
  getRecentSelectionSparkIds,
} from "./selectionIntelligence";
import { getYesterdaySparkId } from "./persistence";

/** Map spark id → catalog category for repeat-prevention. */
export function categoryForSparkId(id: string): SparkNoteCategory | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  return entry?.category ?? null;
}

/**
 * Filter library pool per selection intelligence variety rules:
 * - never same card as yesterday (when alternatives exist)
 * - avoid sparks from the last few days (when alternatives exist)
 * - avoid categories from recent selections (when alternatives exist)
 */
export function filterLibraryCandidatePool(
  pool: readonly SparkNoteCatalogEntry[],
  now = new Date(),
): SparkNoteCatalogEntry[] {
  if (pool.length === 0) return [];

  const yesterdayId = getYesterdaySparkId(now);
  let filtered = yesterdayId
    ? pool.filter((entry) => entry.id !== yesterdayId)
    : [...pool];
  if (filtered.length === 0) filtered = [...pool];

  const recentIds = getRecentSelectionSparkIds();
  const withoutRecentIds = filtered.filter((entry) => !recentIds.includes(entry.id));
  if (withoutRecentIds.length > 0) filtered = withoutRecentIds;

  const recentCategories = new Set(getRecentSelectionCategories());

  if (recentCategories.size > 0) {
    const withoutRecentCategories = filtered.filter(
      (entry) => !recentCategories.has(entry.category),
    );
    if (withoutRecentCategories.length > 0) filtered = withoutRecentCategories;
  }

  return filtered;
}
