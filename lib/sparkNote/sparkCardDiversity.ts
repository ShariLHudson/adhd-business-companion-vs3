/**
 * Spark Card Content Diversity Rule™ — approved categories, mapping, tone/length.
 * @see docs/platform/SPARK_CARD_CONTENT_DIVERSITY_RULE.md
 */

import type { SparkNoteCatalogEntry, SparkNoteCategory, SparkNoteDailyCard } from "./types";

/** Approved member-facing diversity catalog (rotation + ribbon). */
export type SparkCardDiversityCategoryId =
  | "fun_celebrations"
  | "innovation"
  | "remarkable_people"
  | "amazing_places"
  | "nature"
  | "history"
  | "fun_facts"
  | "kindness"
  | "curiosity"
  | "inspiration"
  | "books_ideas"
  | "creativity"
  | "science_technology";

export const SPARK_CARD_DIVERSITY_CATEGORY_IDS = [
  "fun_celebrations",
  "innovation",
  "remarkable_people",
  "amazing_places",
  "nature",
  "history",
  "fun_facts",
  "kindness",
  "curiosity",
  "inspiration",
  "books_ideas",
  "creativity",
  "science_technology",
] as const satisfies readonly SparkCardDiversityCategoryId[];

export const SPARK_CARD_DIVERSITY_CATEGORY_LABELS: Record<
  SparkCardDiversityCategoryId,
  string
> = {
  fun_celebrations: "Fun & Celebrations",
  innovation: "Innovation",
  remarkable_people: "Remarkable People",
  amazing_places: "Amazing Places",
  nature: "Nature",
  history: "History",
  fun_facts: "Fun Facts",
  kindness: "Kindness",
  curiosity: "Curiosity",
  inspiration: "Inspiration",
  books_ideas: "Books & Ideas",
  creativity: "Creativity",
  science_technology: "Science & Technology",
};

/** Tone constraints — authoring + soft validation helpers. */
export const SPARK_CARD_TONE = {
  required: [
    "warm",
    "positive",
    "interesting",
    "conversational",
    "encouraging",
    "memorable",
  ],
  forbidden: [
    "preachy",
    "overly educational",
    "overly technical",
    "overwhelming",
  ],
} as const;

/** Target reading time — delight, not a lesson. */
export const SPARK_CARD_LENGTH = {
  minMinutes: 1,
  maxMinutes: 2,
  /** Soft ceiling for default-view story words (~1–2 minutes). */
  maxStoryWords: 220,
  maxTakeawayWords: 40,
  maxActionWords: 28,
} as const;

export const SPARK_CARD_OUTCOME_FEELINGS = [
  "That was interesting.",
  "I never knew that.",
  "That made me smile.",
] as const;

type DiversitySource = {
  category: SparkNoteCategory;
  categoryLabel?: string;
  tags?: readonly string[];
  title?: string;
};

const TAG_TO_DIVERSITY: Array<{
  match: RegExp;
  id: SparkCardDiversityCategoryId;
}> = [
  {
    match: /place|city|travel|geography|landmark|world|country/,
    id: "amazing_places",
  },
  {
    match: /nature|animal|plant|wildlife|ocean|forest|bird|earth/,
    id: "nature",
  },
  {
    match: /kind|kindness|gratitude|thank|compassion|encourag/,
    id: "kindness",
  },
  {
    match: /curios|wonder|question|explore/,
    id: "curiosity",
  },
  {
    match: /book|reading|library|idea|philosophy|think/,
    id: "books_ideas",
  },
  {
    match: /science|tech|engineering|physics|chemistry|space|radar|computer/,
    id: "science_technology",
  },
  {
    match: /inspir|hope|courage|resilien/,
    id: "inspiration",
  },
  {
    match: /holiday|celebration|observance|national.?day|seasonal/,
    id: "fun_celebrations",
  },
];

const LEGACY_CATEGORY_TO_DIVERSITY: Record<
  SparkNoteCategory,
  SparkCardDiversityCategoryId
> = {
  invention: "innovation",
  inventor: "remarkable_people",
  entrepreneur: "remarkable_people",
  business: "inspiration",
  history: "history",
  holiday: "fun_celebrations",
  fun_fact: "fun_facts",
  quote: "inspiration",
  creativity: "creativity",
  personal_growth: "inspiration",
  gratitude: "kindness",
  adhd_friendly: "curiosity",
  personal: "fun_celebrations",
};

function haystack(source: DiversitySource): string {
  return [
    source.categoryLabel ?? "",
    source.title ?? "",
    ...(source.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Map a library / daily card into the approved diversity catalog.
 * Tags and labels refine legacy categories (e.g. invention → science when tagged).
 */
export function resolveSparkCardDiversityCategory(
  source: DiversitySource,
): SparkCardDiversityCategoryId {
  const text = haystack(source);
  for (const rule of TAG_TO_DIVERSITY) {
    if (rule.match.test(text)) return rule.id;
  }

  const label = (source.categoryLabel ?? "").toLowerCase();
  if (/innovation|invent/.test(label)) return "innovation";
  if (/history/.test(label)) return "history";
  if (/fun fact/.test(label)) return "fun_facts";
  if (/creativ/.test(label)) return "creativity";
  if (/holiday|celebration|seasonal/.test(label)) return "fun_celebrations";
  if (/people|inventor|entrepreneur|leader/.test(label)) {
    return "remarkable_people";
  }
  if (/science|technology/.test(label)) return "science_technology";
  if (/nature/.test(label)) return "nature";
  if (/place|travel/.test(label)) return "amazing_places";
  if (/kind|gratitude/.test(label)) return "kindness";
  if (/curios/.test(label)) return "curiosity";
  if (/inspir/.test(label)) return "inspiration";
  if (/book|idea/.test(label)) return "books_ideas";

  return LEGACY_CATEGORY_TO_DIVERSITY[source.category] ?? "curiosity";
}

export function diversityCategoryLabel(
  id: SparkCardDiversityCategoryId,
): string {
  return SPARK_CARD_DIVERSITY_CATEGORY_LABELS[id];
}

/** Ribbon label for expanded / collection display. */
export function resolveSparkCardCategoryRibbon(
  source: DiversitySource,
): string {
  return diversityCategoryLabel(resolveSparkCardDiversityCategory(source));
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Soft length check for default-view story (1–2 minute enjoy). */
export function sparkCardStoryWithinLength(story: string): boolean {
  const words = countWords(story);
  return words > 0 && words <= SPARK_CARD_LENGTH.maxStoryWords;
}

export function isFunCelebrationsDiversity(
  id: SparkCardDiversityCategoryId,
): boolean {
  return id === "fun_celebrations";
}

export function diversityCategoryForEntry(
  entry: SparkNoteCatalogEntry | SparkNoteDailyCard,
): SparkCardDiversityCategoryId {
  return resolveSparkCardDiversityCategory({
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    tags: entry.tags,
    title: entry.title,
  });
}
