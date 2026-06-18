import { categoriesForGroup, strategiesFor } from "./strategySystem";

/** When categories exceed this count, show dropdowns instead of chip walls. */
export const COACHING_LIBRARY_CATEGORY_THRESHOLD = 8;

export function coachingLibraryCategoryCount(): number {
  return categoriesForGroup("business").filter(
    (c) => strategiesFor(c.id).length > 0,
  ).length;
}

export function shouldUseCoachingLibraryDropdowns(): boolean {
  return coachingLibraryCategoryCount() > COACHING_LIBRARY_CATEGORY_THRESHOLD;
}
