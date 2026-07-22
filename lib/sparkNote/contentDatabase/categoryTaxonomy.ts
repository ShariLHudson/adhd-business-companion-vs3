import type { SparkNoteCategory } from "../types";
import { SPARK_CARD_DIVERSITY_CATEGORY_LABELS } from "../sparkCardDiversity";

/**
 * Category taxonomy per SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md
 * Member-facing ribbons follow Content Diversity Rule approved catalog.
 * @see docs/platform/SPARK_CARD_CONTENT_DIVERSITY_RULE.md
 */
export const SPARK_MASTER_CATEGORY_LABELS = [
  "Inventions",
  "Inspiring People",
  "Entrepreneurs",
  "Business Lessons",
  "History",
  "Holidays",
  "Creativity",
  "Fun Facts",
  "Personal Growth",
  "Seasonal Sparks",
] as const;

/** Approved diversity ribbons for rotation + display. */
export const SPARK_APPROVED_DIVERSITY_LABELS = Object.values(
  SPARK_CARD_DIVERSITY_CATEGORY_LABELS,
);

/** Suggested personalization tags from the master standard. */
export const SPARK_MASTER_RECOMMENDED_TAGS = [
  "innovation",
  "creativity",
  "business",
  "leadership",
  "humor",
  "history",
  "technology",
  "entrepreneurship",
  "resilience",
  "curiosity",
] as const;

/**
 * Spark ID prefix hints — SPARK-[CATEGORY]-[NUMBER] per master standard.
 * Examples: SPARK-INV-001, SPARK-BIZ-001, SPARK-HOL-001
 */
export const SPARK_ID_PREFIX_BY_CATEGORY: Partial<
  Record<SparkNoteCategory, string>
> = {
  invention: "INV",
  inventor: "INV",
  entrepreneur: "ENT",
  business: "BIZ",
  history: "HIS",
  holiday: "HOL",
  fun_fact: "FUN",
  quote: "QTE",
  creativity: "CRE",
  personal_growth: "GRO",
  gratitude: "MEAN",
  adhd_friendly: "ADHD",
  personal: "PER",
};

export const SPARK_MASTER_SUBCATEGORY_HINTS: Record<string, string[]> = {
  Inventions: [
    "accidental discoveries",
    "technology",
    "household products",
  ],
  "Business Lessons": [
    "customer experience",
    "leadership",
    "marketing",
    "strategy",
    "creativity",
  ],
  History: ["discoveries", "milestones", "firsts", "cultural events"],
  Holidays: ["unusual holidays", "traditions", "celebrations"],
};

export function suggestIdPrefix(category: SparkNoteCategory): string | undefined {
  return SPARK_ID_PREFIX_BY_CATEGORY[category];
}
