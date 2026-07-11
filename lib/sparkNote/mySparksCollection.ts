import { SPARK_NOTE_CATALOG } from "./catalog";
import { getFavoriteSparkIds, readSparkNoteStore } from "./persistence";
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
> & {
  savedAtIso: string | null;
};

export type MySparkCollectionDateFilter = "all" | "this-month" | "this-year";
export type MySparkCollectionSort = "newest" | "oldest";

/** Saved Sparks for My Spark Collection — separate from the daily experience. */
export function resolveMySparksCollection(): MySparkSavedItem[] {
  const store = readSparkNoteStore();
  return getFavoriteSparkIds()
    .map((id) => {
      const item = catalogEntryToSavedCard(id);
      if (!item) return null;
      return {
        ...item,
        savedAtIso: store.favoriteSavedAt[id] ?? null,
      };
    })
    .filter((item): item is MySparkSavedItem => item != null);
}

export function filterMySparksCollection(input: {
  items: MySparkSavedItem[];
  query?: string;
  category?: string | null;
  dateFilter?: MySparkCollectionDateFilter;
  sort?: MySparkCollectionSort;
  now?: Date;
}): MySparkSavedItem[] {
  const {
    items,
    query = "",
    category = null,
    dateFilter = "all",
    sort = "newest",
    now = new Date(),
  } = input;

  const normalizedQuery = query.trim().toLowerCase();
  let filtered = items;

  if (normalizedQuery) {
    filtered = filtered.filter((item) => {
      const haystack = [item.title, item.teaser, item.categoryLabel]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  if (category) {
    filtered = filtered.filter((item) => item.categoryLabel === category);
  }

  if (dateFilter !== "all") {
    const year = now.getFullYear();
    const month = now.getMonth();
    filtered = filtered.filter((item) => {
      if (!item.savedAtIso) return false;
      const saved = new Date(item.savedAtIso);
      if (dateFilter === "this-year") return saved.getFullYear() === year;
      return saved.getFullYear() === year && saved.getMonth() === month;
    });
  }

  return [...filtered].sort((a, b) => {
    const aTime = a.savedAtIso ? Date.parse(a.savedAtIso) : 0;
    const bTime = b.savedAtIso ? Date.parse(b.savedAtIso) : 0;
    return sort === "newest" ? bTime - aTime : aTime - bTime;
  });
}

export function mySparkCollectionCategories(
  items: MySparkSavedItem[],
): string[] {
  return [...new Set(items.map((item) => item.categoryLabel))].sort();
}

export function formatMySparkSavedDate(iso: string | null): string {
  if (!iso) return "Saved";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Saved";
  }
}

/** Legacy shelf buckets — retained for delight analytics and tests. */
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
