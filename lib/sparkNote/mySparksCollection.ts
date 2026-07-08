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

/** My Sparks shelf buckets (routing spec). */
export type MySparksShelfBucket =
  | "favorites"
  | "ideas"
  | "reflections"
  | "business"
  | "growth"
  | "fun"
  | "learning";

export const MY_SPARKS_SHELF_BUCKETS: {
  id: MySparksShelfBucket;
  label: string;
  emoji: string;
}[] = [
  { id: "favorites", label: "Favorites", emoji: "🔥" },
  { id: "ideas", label: "Ideas", emoji: "💡" },
  { id: "reflections", label: "Reflections", emoji: "📓" },
  { id: "business", label: "Business", emoji: "🚀" },
  { id: "growth", label: "Growth", emoji: "🌱" },
  { id: "fun", label: "Fun", emoji: "😂" },
  { id: "learning", label: "Learning", emoji: "📚" },
];

export function mySparksShelfBucket(
  category: MySparkSavedItem["category"],
): MySparksShelfBucket {
  switch (category) {
    case "business":
    case "entrepreneur":
      return "business";
    case "personal_growth":
    case "gratitude":
    case "adhd_friendly":
    case "personal":
      return "growth";
    case "fun_fact":
    case "holiday":
      return "fun";
    case "invention":
    case "inventor":
    case "history":
      return "learning";
    case "creativity":
    case "quote":
      return "reflections";
    default:
      return "favorites";
  }
}

/** Saved Sparks for My Sparks collection — simple, not a full library. */
export function resolveMySparksCollection(): MySparkSavedItem[] {
  return getFavoriteSparkIds()
    .map((id) => catalogEntryToSavedCard(id))
    .filter((item): item is MySparkSavedItem => item != null);
}
