/**
 * PLACE_ID_ALIASES — additive canonical place id resolution (Phase 1).
 *
 * Maps legacy route ids, collection room ids, and colloquial slugs to canonical
 * `placeId` values. **Additive only** — never delete legacy keys without a
 * sunset period.
 *
 * @see docs/estate/SPARK_ESTATE_MASTER_PLAN.md
 */

/** @deprecated Import PLACE_ID_ALIASES — subset retained for backward compatibility. */
export const CANONICAL_PLACE_LEGACY_IDS: Readonly<Record<string, string>> = {
  "celebration-garden": "gardens",
  "exercise-room": "game-room",
};

/**
 * Legacy id → canonical placeId.
 * Chain-safe: each value may itself alias again (max 8 hops).
 */
export const PLACE_ID_ALIASES: Readonly<Record<string, string>> = {
  ...CANONICAL_PLACE_LEGACY_IDS,

  // Route / AppSection vocabulary
  "growth-journal": "journal",
  "journal-gazebo": "journal",
  "gazebo-journal": "journal",

  // Collection & intelligence ids — redirects only; never navigable surface labels
  "evidence-bank": "evidence-vault",
  "achievement-library": "library",
  "celebration-hall": "celebration-room",
  "knowledge-cards": "seeds-planted",
  "growth-portfolio": "portfolio",
  "growth-library": "library",
  "growth-greenhouse": "greenhouse",
  "growth-reports": "celebration-room",
  "wins-this-week": "gardens",
  /** Hall of Accomplishments ≠ Gallery; Portfolio slot is Hall member-facing name */
  "hall-of-accomplishments": "portfolio",
  "hall-of-achievements": "portfolio",
  /** Gallery of Firsts — member-facing Gallery */
  "gallery": "gallery-of-firsts",
  "the-gallery": "gallery-of-firsts",
  /** Writing Room is its own place (not Decision Compass) */
  "writing-room": "writing-room",
  /** Observatory view variants */
  "observatory-day-inside": "observatory-day-inside",
  "observatory-day-outside": "observatory-day-outside",
  "observatory-night-outside": "observatory-night-outside",
  /** Swing — oak swing plate (SW loves RH) is The Swing Beneath the Oak */
  swing: "the-swing-beneath-the-oak",
  "the-swing": "the-swing-beneath-the-oak",
  "tree-swing": "the-swing-beneath-the-oak",
  /** Swimming Pool (legacy summer-terrace id) */
  "swimming-pool": "summer-terrace",
  pool: "summer-terrace",
  /** Estate Library */
  "estate-library": "library",

  // Removed navigable rooms — legacy ids redirect to canonical destination
  "reflection-pond": "seat-at-pond",
  "back-deck": "fireside-deck",

  // Registry / menu bridges
  "estate-registry-journal": "journal",
  kitchen: "estate-kitchen",
  "board-room": "round-table",
  pond: "seat-at-pond",
};

const MAX_ALIAS_HOPS = 8;

/** Resolve any legacy or alias id to canonical placeId. */
export function resolvePlaceId(id: string): string {
  const normalized = id.trim().toLowerCase();
  if (!normalized) return id;

  const seen = new Set<string>();
  let current = normalized;

  for (let hop = 0; hop < MAX_ALIAS_HOPS; hop++) {
    const next = PLACE_ID_ALIASES[current];
    if (!next) break;
    const resolved = next.trim().toLowerCase();
    if (seen.has(current)) break;
    seen.add(current);
    current = resolved;
  }

  return current;
}

/** All alias keys that resolve to a given canonical placeId. */
export function listPlaceIdAliasesFor(canonicalPlaceId: string): string[] {
  const target = canonicalPlaceId.trim().toLowerCase();
  return Object.entries(PLACE_ID_ALIASES)
    .filter(([, value]) => resolvePlaceId(value) === target)
    .map(([key]) => key);
}
