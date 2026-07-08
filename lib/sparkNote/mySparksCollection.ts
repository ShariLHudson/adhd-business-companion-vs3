import { SPARK_NOTE_CATALOG } from "./catalog";
import { getFavoriteSparkIds } from "./persistence";
import type { SparkNoteDailyCard } from "./types";

function catalogEntryToSavedCard(
  id: string,
): Pick<
  SparkNoteDailyCard,
  "id" | "title" | "shortTitle" | "teaser" | "category" | "categoryLabel"
> | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  if (!entry) return null;
  return {
    id: entry.id,
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    title: entry.title,
    shortTitle: entry.shortTitle ?? entry.title,
    teaser: entry.teaser,
  };
}

export type MySparkSavedItem = NonNullable<
  ReturnType<typeof catalogEntryToSavedCard>
>;

/** Saved Sparks for My Sparks collection — simple, not a full library. */
export function resolveMySparksCollection(): MySparkSavedItem[] {
  return getFavoriteSparkIds()
    .map((id) => catalogEntryToSavedCard(id))
    .filter((item): item is MySparkSavedItem => item != null);
}
