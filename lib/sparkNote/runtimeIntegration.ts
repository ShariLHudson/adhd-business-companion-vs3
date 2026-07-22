import { SPARK_NOTE_CATALOG } from "./catalog";
import type { SparkNoteDailyCard } from "./types";

/** Friendly evergreen Spark when selection or content lookup fails. */
export const SPARK_NOTE_FALLBACK_ID = "SPARK-GROW-001";

const FALLBACK_COPY: SparkNoteDailyCard = {
  id: "spark-note-fallback",
  category: "personal_growth",
  categoryLabel: "Personal Growth",
  sparkType: "story",
  title: "A Little Spark for Today",
  shortTitle: "Today's Spark",
  teaser: "Small steps still count — even on quiet days.",
  whatHappened:
    "Some days do not need a big headline. They need a gentle reminder that showing up, noticing, and taking one small step still matters.",
  whyItMatters:
    "Progress is rarely dramatic. Consistency and curiosity compound over time.",
  sparkApplication: "What is one small step you can take today?",
  tags: ["encouragement", "progress"],
  source: "library",
};

function catalogEntryToFallbackCard(
  id: string,
): SparkNoteDailyCard | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  if (!entry) return null;
  return {
    id: entry.id,
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    sparkType: entry.sparkType ?? "story",
    title: entry.title,
    shortTitle: entry.shortTitle ?? entry.title,
    teaser: entry.teaser,
    whatHappened: entry.whatHappened,
    whyInteresting: entry.whyInteresting,
    whyItMatters: entry.whyItMatters,
    sparkApplication: entry.sparkApplication,
    imageSrc: entry.imageSrc,
    thumbnailSrc: entry.thumbnailSrc,
    thumbnailAlt: entry.thumbnailAlt,
    tags: entry.tags,
    source: "library",
    expanded: entry.expanded,
  };
}

/** Never return null to the UI — protocol requires a friendly card. */
export function resolveFallbackSparkCard(): SparkNoteDailyCard {
  return (
    catalogEntryToFallbackCard(SPARK_NOTE_FALLBACK_ID) ??
    catalogEntryToFallbackCard(SPARK_NOTE_CATALOG[0]?.id ?? "") ??
    FALLBACK_COPY
  );
}
