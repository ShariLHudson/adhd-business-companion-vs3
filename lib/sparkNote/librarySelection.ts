import type { SparkNoteCatalogEntry, SparkNoteCategory } from "./types";
import { SPARK_NOTE_CATALOG } from "./catalog";
import {
  diversityCategoryForEntry,
  isFunCelebrationsDiversity,
  type SparkCardDiversityCategoryId,
} from "./sparkCardDiversity";
import {
  getRecentDiversityCategories,
  getRecentSelectionSparkIds,
  getYesterdayDiversityCategory,
} from "./selectionIntelligence";
import { getRecentSparkNoteIds, getYesterdaySparkId } from "./persistence";

/** Map spark id → catalog category for repeat-prevention. */
export function categoryForSparkId(id: string): SparkNoteCategory | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  return entry?.category ?? null;
}

export function diversityCategoryForSparkId(
  id: string,
): SparkCardDiversityCategoryId | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  if (!entry) return null;
  return diversityCategoryForEntry(entry);
}

/**
 * Filter library pool per selection intelligence + Content Diversity Rule:
 * - never same card as yesterday (when alternatives exist)
 * - avoid sparks from the last few days (when alternatives exist)
 * - never same diversity ribbon as yesterday when alternatives exist
 * - avoid diversity categories from recent selections (when alternatives exist)
 * - holidays / fun celebrations must not dominate the evergreen pool
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
  const withoutRecentIds = filtered.filter(
    (entry) => !recentIds.includes(entry.id),
  );
  if (withoutRecentIds.length > 0) filtered = withoutRecentIds;

  const yesterdayDiversity = getYesterdayDiversityCategory();
  if (yesterdayDiversity) {
    const withoutYesterdayRibbon = filtered.filter(
      (entry) => diversityCategoryForEntry(entry) !== yesterdayDiversity,
    );
    if (withoutYesterdayRibbon.length > 0) filtered = withoutYesterdayRibbon;
  }

  const recentDiversity = new Set(getRecentDiversityCategories());
  if (recentDiversity.size > 0) {
    const withoutRecentDiversity = filtered.filter(
      (entry) => !recentDiversity.has(diversityCategoryForEntry(entry)),
    );
    if (withoutRecentDiversity.length > 0) {
      filtered = withoutRecentDiversity;
    }
  }

  // Soft anti-dominance: if the remaining pool is mostly celebrations, prefer others.
  const nonCelebration = filtered.filter(
    (entry) => !isFunCelebrationsDiversity(diversityCategoryForEntry(entry)),
  );
  if (nonCelebration.length > 0 && nonCelebration.length < filtered.length) {
    const celebrationShare = 1 - nonCelebration.length / filtered.length;
    if (celebrationShare >= 0.5) {
      filtered = nonCelebration;
    }
  }

  return filtered;
}

/**
 * Whether a calendar/holiday candidate should yield to library variety.
 * Holidays remain a delight category — not the only category.
 */
export function shouldYieldCalendarSparkForVariety(
  candidate: SparkNoteCatalogEntry,
): boolean {
  const diversity = diversityCategoryForEntry(candidate);
  if (!isFunCelebrationsDiversity(diversity)) return false;

  const yesterday = getYesterdayDiversityCategory();
  if (yesterday === diversity) return true;

  // Count recent picks (including repeats), not unique ribbons only.
  const recentIds = getRecentSparkNoteIds().slice(0, 6);
  const celebrationHits = recentIds.filter((id) => {
    const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
    return entry
      ? isFunCelebrationsDiversity(diversityCategoryForEntry(entry))
      : false;
  }).length;
  // If celebrations already appeared recently, prefer library variety.
  return celebrationHits >= 2;
}
