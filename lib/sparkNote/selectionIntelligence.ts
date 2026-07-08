import type { SparkNoteCategory } from "./types";
import { categoryForSparkId } from "./librarySelection";
import { getRecentSparkNoteIds } from "./persistence";

/**
 * Daily selection priority per SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md
 *
 * 1. Personal meaningful moments (today)
 * 2. Personal upcoming events (within 7 days)
 * 3. Calendar / seasonal sparks
 * 4. User interest signals (affinity-weighted library)
 * 5. General discovery (evergreen library rotation)
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

/** Recent selections to scan when avoiding category repetition. */
export const VARIETY_RECENT_CATEGORY_LOOKBACK = 3;

/** Recent spark ids to deprioritize before category variety. */
export const VARIETY_RECENT_SPARK_LOOKBACK = 3;

/** Cap affinity influence so discovery remains possible. */
export const MAX_CATEGORY_AFFINITY_BOOST = 8;

/** Weak signal — opening a spark once. */
export const VIEWED_CATEGORY_AFFINITY_BOOST = 0.5;

/** Strong signal — saved spark in same category. */
export const SAVED_CATEGORY_AFFINITY_BOOST = 2;

export function getRecentSelectionCategories(
  lookback = VARIETY_RECENT_CATEGORY_LOOKBACK,
): SparkNoteCategory[] {
  const categories: SparkNoteCategory[] = [];
  for (const id of getRecentSparkNoteIds().slice(0, lookback)) {
    const category = categoryForSparkId(id);
    if (category && !categories.includes(category)) {
      categories.push(category);
    }
  }
  return categories;
}

export function getRecentSelectionSparkIds(
  lookback = VARIETY_RECENT_SPARK_LOOKBACK,
): string[] {
  return getRecentSparkNoteIds().slice(0, lookback);
}
