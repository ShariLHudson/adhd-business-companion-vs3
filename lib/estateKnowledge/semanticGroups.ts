/**
 * Semantic place groups — Master World Bible intent buckets (Phase 1).
 * @see docs/estate/SPARK_ESTATE_MASTER_WORLD_BIBLE.md
 */

/** Places Spark should consider for “near water” / water-adjacent needs. */
export const ESTATE_KNOWLEDGE_WATER_PLACE_IDS = [
  "conservatory",
  "reflection-pond",
  "journal",
  "summer-terrace",
  "seat-at-pond",
  "lakeside-hammock",
  "lakeside-verandah",
  "peaceful-places",
  "fireside-deck",
  "personal-deck",
] as const;

/** Places Spark should consider for reading / quiet study. */
export const ESTATE_KNOWLEDGE_READING_PLACE_IDS = [
  "library",
  "personal-library",
  "reading-nook",
  "stairway-reading-nook",
  "window-seat",
  "conservatory",
  "greenhouse",
  "journal",
  "house-possibility-staircase",
  "house-possibility-window-nook",
] as const;

/** Treehouse / Possibility House wing — inside and outside. */
export const ESTATE_KNOWLEDGE_TREEHOUSE_PLACE_IDS = [
  "house-possibility-outside",
  "house-possibility-studio",
  "house-possibility-staircase",
  "house-possibility-window-nook",
  "house-possibility-reflection-desk",
  "house-possibility-observatory",
  "house-possibility-telescope-deck",
  "house-possibility-cabinet-of-chapters",
  "house-possibility-curiosity-cabinet",
  "house-possibility-discovery-chest",
  "house-possibility-legacy-room",
  "house-possibility-dream-wall",
  "legacy-room-main",
] as const;

export const ESTATE_KNOWLEDGE_SEMANTIC_GROUPS: Readonly<
  Record<string, readonly string[]>
> = {
  water: ESTATE_KNOWLEDGE_WATER_PLACE_IDS,
  reading: ESTATE_KNOWLEDGE_READING_PLACE_IDS,
  treehouse: ESTATE_KNOWLEDGE_TREEHOUSE_PLACE_IDS,
  think: [
    "observatory",
    "reflection-pond",
    "conservatory",
    "house-possibility-observatory",
    "coffee-house",
    "decision-compass",
  ],
};
