import type { SparkNoteCategory } from "./types";
import {
  diversityCategoryForEntry,
  type SparkCardDiversityCategoryId,
} from "./sparkCardDiversity";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { getRecentSparkNoteIds } from "./persistence";

function legacyCategoryForSparkId(id: string): SparkNoteCategory | null {
  return SPARK_NOTE_CATALOG.find((e) => e.id === id)?.category ?? null;
}

/**
 * Daily selection priority per SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md
 *
 * 1. Personal meaningful moments (today)
 * 2. Personal upcoming events (within 7 days)
 * 3. Calendar / seasonal sparks
 * 4. User interest signals (affinity-weighted library)
 * 5. General discovery (evergreen library rotation)
 *
 * Diversity: docs/platform/SPARK_CARD_CONTENT_DIVERSITY_RULE.md
 */
export type SparkSelectionPriority =
  | "personal_meaningful"
  | "personal_upcoming"
  | "calendar_event"
  | "user_interests"
  | "general_discovery";

export const SELECTION_PRIORITY_ORDER: readonly SparkSelectionPriority[] = [
  "personal_meaningful",
  "personal_upcoming",
  "calendar_event",
  "user_interests",
  "general_discovery",
] as const;

/** Recent legacy categories to scan when avoiding repetition. */
export const VARIETY_RECENT_CATEGORY_LOOKBACK = 3;

/**
 * Diversity-catalog lookback — wider than legacy so one ribbon cannot dominate.
 * Weekly schedules are illustrative only; this is intelligent variety pressure.
 */
export const VARIETY_DIVERSITY_CATEGORY_LOOKBACK = 6;

/** Recent spark ids to deprioritize before category variety. */
export const VARIETY_RECENT_SPARK_LOOKBACK = 3;

/** Cap affinity influence so discovery remains possible. */
export const MAX_CATEGORY_AFFINITY_BOOST = 8;

/** Weak signal — opening a spark once. */
export const VIEWED_CATEGORY_AFFINITY_BOOST = 0.5;

/** Strong signal — saved spark in same category. */
export const SAVED_CATEGORY_AFFINITY_BOOST = 2;

function diversityForSparkId(id: string): SparkCardDiversityCategoryId | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  if (!entry) return null;
  return diversityCategoryForEntry(entry);
}

export function getRecentSelectionCategories(
  lookback = VARIETY_RECENT_CATEGORY_LOOKBACK,
): SparkNoteCategory[] {
  const categories: SparkNoteCategory[] = [];
  for (const id of getRecentSparkNoteIds().slice(0, lookback)) {
    const category = legacyCategoryForSparkId(id);
    if (category && !categories.includes(category)) {
      categories.push(category);
    }
  }
  return categories;
}

/** Approved diversity ribbons from recent daily picks (variety pressure). */
export function getRecentDiversityCategories(
  lookback = VARIETY_DIVERSITY_CATEGORY_LOOKBACK,
): SparkCardDiversityCategoryId[] {
  const categories: SparkCardDiversityCategoryId[] = [];
  for (const id of getRecentSparkNoteIds().slice(0, lookback)) {
    const diversity = diversityForSparkId(id);
    if (diversity && !categories.includes(diversity)) {
      categories.push(diversity);
    }
  }
  return categories;
}

/** Yesterday's diversity ribbon — never predictably repeat when alternatives exist. */
export function getYesterdayDiversityCategory(
  recentIds: readonly string[] = getRecentSparkNoteIds(),
): SparkCardDiversityCategoryId | null {
  const yesterdayId = recentIds[0];
  if (!yesterdayId) return null;
  return diversityForSparkId(yesterdayId);
}

export function getRecentSelectionSparkIds(
  lookback = VARIETY_RECENT_SPARK_LOOKBACK,
): string[] {
  return getRecentSparkNoteIds().slice(0, lookback);
}
