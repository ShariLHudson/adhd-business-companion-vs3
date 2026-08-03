/**
 * FutureSparkCard → canonical runtime record shape (Phase 4).
 *
 * The staged content volumes (Volumes 2–4 + Iowa seasonal) are authored as
 * `FutureSparkCard[]` — a shape with `story`/`spark`/`action` body fields, a
 * `categoryImage`, and the new scheduling fields. This module converts one
 * FutureSparkCard into a `SparkNoteCatalogEntry` (the runtime shape the manifest
 * generator and selector already understand).
 *
 * Body-field mapping (verified against the card renderer,
 * lib/sparkNote/sparkCardCollectibleDisplay.ts):
 *   story  → whatHappened   ("The Story")
 *   spark  → whyItMatters   ("Today's Spark")
 *   action → sparkApplication ("Spark In Action")
 * Volumes carry no `teaser`, so one is derived from the story's first sentence.
 *
 * Phase 4 adds NO card data: `INTEGRATED_VOLUME_ENTRIES` is intentionally empty
 * until Volume 2 is integrated in Phase 5, so the manifest export stays a no-op.
 */

import type {
  SparkCalculatedDateRule,
  SparkCollection,
  SparkDisplayRule,
  SparkNoteCategory,
  SparkNoteCatalogEntry,
  SparkSeason,
} from "./types";

/** Authored staging shape shared by every Volume / seasonal file. */
export type FutureSparkCard = {
  id: string;
  volume: number;
  collection: SparkCollection;
  season?: SparkSeason;
  region?: string;
  months?: number[];
  displayRule: SparkDisplayRule;
  month?: number;
  day?: number;
  dateRule?: SparkCalculatedDateRule;
  priority: number;
  category: SparkNoteCategory;
  categoryLabel: string;
  categoryImage: string;
  title: string;
  story: string;
  spark: string;
  action: string;
  sparkType: "story";
  tags: string[];
  status: "future-ready";
};

/** Map an authored region name/label to a structured region code. */
const REGION_CODES: Readonly<Record<string, string>> = {
  iowa: "US-IA",
  "us-ia": "US-IA",
};

export function normalizeRegionCode(
  region: string | undefined,
): string | undefined {
  if (!region) return undefined;
  const trimmed = region.trim();
  if (!trimmed) return undefined;
  const mapped = REGION_CODES[trimmed.toLowerCase()];
  if (mapped) return mapped;
  // Already a structured code (e.g. "US-XX") — pass through unchanged.
  if (/^[A-Za-z]{2}-[A-Za-z0-9]+$/.test(trimmed)) return trimmed;
  // Unknown label: keep it rather than silently drop the regional intent.
  return trimmed;
}

/** Derive a short teaser from the story's first sentence (volumes have none). */
export function deriveTeaser(story: string): string {
  const clean = story.trim().replace(/\s+/g, " ");
  if (!clean) return "";
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let teaser = sentences[0] ?? clean;
  // Ensure the teaser is substantial enough to open the card.
  if (teaser.length < 40 && sentences[1]) {
    teaser = `${teaser} ${sentences[1]}`;
  }
  return teaser.length > 200 ? `${teaser.slice(0, 197).trimEnd()}…` : teaser;
}

/** Convert one FutureSparkCard into the canonical runtime catalog entry. */
export function futureSparkCardToCatalogEntry(
  card: FutureSparkCard,
): SparkNoteCatalogEntry {
  const entry: SparkNoteCatalogEntry = {
    id: card.id,
    category: card.category,
    categoryLabel: card.categoryLabel,
    sparkType: card.sparkType,
    title: card.title,
    shortTitle: card.title,
    teaser: deriveTeaser(card.story),
    whatHappened: card.story,
    whyItMatters: card.spark,
    sparkApplication: card.action,
    // No explicit imageSrc: the full-card hero already renders the matching
    // category edition cover (by `category`), and the thumbnail/topic-photo
    // system stays reserved for real topic/diversity photos. Setting the
    // categoryImage here would duplicate the cover into the thumbnail slot and
    // break that separation. `card.categoryImage` is authoring documentation.
    tags: [...card.tags],
    priority: card.priority,
    displayRule: card.displayRule,
    volume: card.volume,
    collection: card.collection,
  };

  if (card.dateRule) entry.dateRule = card.dateRule;
  if (card.season) entry.season = card.season;
  if (typeof card.month === "number") entry.month = card.month;
  if (typeof card.day === "number") entry.day = card.day;
  if (card.months?.length) entry.months = [...card.months];
  const region = normalizeRegionCode(card.region);
  if (region) entry.region = region;

  return entry;
}

export function futureSparkCardsToCatalog(
  cards: readonly FutureSparkCard[],
): SparkNoteCatalogEntry[] {
  return cards.map(futureSparkCardToCatalogEntry);
}

// The aggregate of integrated volume/seasonal entries lives in
// `lib/sparkNote/volumes/index.ts` (`INTEGRATED_VOLUME_ENTRIES`) — kept there so
// this transform module never imports the volume data (avoids a cycle).
