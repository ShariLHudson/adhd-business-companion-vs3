/**
 * PLACE_ID_ALIASES™ — additive canonical place id resolution (Phase 1).
 *
 * Maps legacy route ids, collection room ids, and colloquial slugs to canonical
 * `placeId` values. **Additive only** — never delete legacy keys without a
 * sunset period.
 *
 * @see docs/estate/SPARK_ESTATE_MASTER_PLAN.md
 */

/** @deprecated Import PLACE_ID_ALIASES — subset retained for backward compatibility. */
export const CANONICAL_PLACE_LEGACY_IDS: Readonly<Record<string, string>> = {
  "celebration-garden": "celebration-room",
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

  // Collection & intelligence ids
  "evidence-bank": "evidence-vault",
  "achievement-library": "library",
  "celebration-hall": "celebration-room",
  "knowledge-cards": "seeds-planted",
  "growth-portfolio": "portfolio",
  "growth-library": "library",
  "growth-greenhouse": "greenhouse",
  "growth-reports": "celebration-room",
  "wins-this-week": "gardens",

  // Registry / menu bridges
  "estate-registry-journal": "journal",

  // Play — interim until `swimming-pool` canonical place registers
  "swimming-pool": "game-room",
  pool: "game-room",
  swim: "game-room",
  swimming: "game-room",
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
