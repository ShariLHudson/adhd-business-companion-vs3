export type BookCategory =
  | "adhd"
  | "business"
  | "creativity"
  | "encouragement"
  | "planning"
  | "mindset"
  | "joy"
  | "reflection"
  | "progress"
  | "ordinary";

export type FeaturedBook = {
  title: string;
  category: BookCategory;
};

/** Starter ADHD / business titles — rotate slowly, not every render. */
export const FEATURED_BOOK_LIBRARY: FeaturedBook[] = [
  { title: "Tiny Wins", category: "adhd" },
  { title: "One Thing at a Time", category: "adhd" },
  { title: "Permission to Begin", category: "encouragement" },
  { title: "Progress Over Perfect", category: "progress" },
  { title: "The Next Small Step", category: "planning" },
  { title: "Gentle Momentum", category: "mindset" },
  { title: "Building a Business That Fits Your Brain", category: "business" },
  { title: "Finished Is Beautiful", category: "joy" },
  { title: "Ideas Worth Keeping", category: "creativity" },
  { title: "Today Counts Too", category: "ordinary" },
];

function stablePick<T>(items: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length]!;
}

function weekKey(now: Date): string {
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor(
    (now.getTime() - start.getTime()) / (7 * 86_400_000),
  );
  return `${now.getFullYear()}-w${week}`;
}

/** Books change weekly — slow rotation, not every visit. */
export function featuredBookForDay(seed: string, now = new Date()): FeaturedBook {
  return stablePick(FEATURED_BOOK_LIBRARY, `${weekKey(now)}:${seed}`);
}
