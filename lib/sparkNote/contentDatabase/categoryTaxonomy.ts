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
  "001": "DISC", // Discovery
  "002": "PEOP", // People & Stories
  "003": "CREA", // Creativity & Inspiration
  "004": "NATP", // Nature & Places
  "005": "CURI", // Curiosity
  "006": "WORD", // Words & Origins
  "007": "STRA", // Strategy
  "008": "REFL", // Reflection
  "009": "ADVE", // Adventure
  "010": "BUSI", // Business
  "011": "INNO", // Innovation
  "012": "WOND", // Wonder
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
