import type { SparkNoteCatalogEntry, SparkNoteCategory } from "./types";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { getRecentSparkNoteIds, getYesterdaySparkId } from "./persistence";

/** Map spark id → catalog category for repeat-prevention. */
export function categoryForSparkId(id: string): SparkNoteCategory | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  return entry?.category ?? null;
}

/**
 * Filter library pool per repeat-prevention rules:
 * - never same card as yesterday (when alternatives exist)
 * - avoid categories from the last two selections (when alternatives exist)
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

  const recentCategories = new Set(
    getRecentSparkNoteIds()
      .slice(0, 2)
      .map((id) => categoryForSparkId(id))
      .filter((cat): cat is SparkNoteCategory => cat != null),
  );

  if (recentCategories.size > 0) {
    const withoutRecentCategories = filtered.filter(
      (entry) => !recentCategories.has(entry.category),
    );
    if (withoutRecentCategories.length > 0) filtered = withoutRecentCategories;
  }

  return filtered;
}
