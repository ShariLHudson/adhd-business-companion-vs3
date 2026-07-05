/**
 * Spark Estate Canonical Registry™ — **runtime authority** for every Estate place.
 *
 * Source document: docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md (Phase A).
 * Phase B: code is subordinate to canon — legacy registries are adapters only.
 *
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import { CANONICAL_ESTATE_PLACES } from "./canonicalEstatePlaces";
import { CANONICAL_ESTATE_SUBPLACES } from "./canonicalEstateSubplaces";
import {
  resolvePlaceId,
} from "./placeIdAliases";
import type {
  CanonicalArrivalBehavior,
  CanonicalConversationStyle,
  CanonicalEstateCategory,
  CanonicalEstatePlace,
  CanonicalEstatePlaceId,
  CanonicalEstateStatus,
  EstateRouteType,
} from "./canonicalEstateRegistryTypes";

export type {
  CanonicalArrivalBehavior,
  CanonicalConversationStyle,
  CanonicalEstateCategory,
  CanonicalEstatePlace,
  CanonicalEstatePlaceId,
  CanonicalEstateStatus,
  EstateRouteType,
} from "./canonicalEstateRegistryTypes";

export {
  CANONICAL_ESTATE_REGISTRY_DOC,
  CANONICAL_ESTATE_REGISTRY_VERSION,
} from "./canonicalEstateRegistryTypes";

/** All canonical Estate places — single runtime source of truth. */
export const CANONICAL_ESTATE_REGISTRY: readonly CanonicalEstatePlace[] = [
  ...CANONICAL_ESTATE_PLACES,
  ...CANONICAL_ESTATE_SUBPLACES,
];

/**
 * Legacy place ids → canonical id (P0 errata).
 * @see docs/estate/P0_CANON_ERRATA.md
 * @see lib/estate/placeIdAliases.ts — full alias table (Phase 1)
 */
export { CANONICAL_PLACE_LEGACY_IDS } from "./placeIdAliases";

export function resolveCanonicalPlaceId(id: string): string {
  return resolvePlaceId(id);
}

const BY_ID = new Map<string, CanonicalEstatePlace>(
  CANONICAL_ESTATE_REGISTRY.map((place) => [place.id, place]),
);

/** Alias phrase (normalized) → place id — longest match wins at call site. */
const ALIAS_INDEX = buildAliasIndex(CANONICAL_ESTATE_REGISTRY);

function normalizeAlias(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildAliasIndex(
  places: readonly CanonicalEstatePlace[],
): Map<string, string> {
  const index = new Map<string, string>();
  for (const place of places) {
    for (const alias of place.aliases) {
      index.set(normalizeAlias(alias), place.id);
    }
    index.set(normalizeAlias(place.officialName), place.id);
  }
  return index;
}

export function getCanonicalEstatePlaceById(
  id: string,
): CanonicalEstatePlace | undefined {
  return BY_ID.get(resolveCanonicalPlaceId(id));
}

export function requireCanonicalEstatePlace(id: string): CanonicalEstatePlace {
  const place = getCanonicalEstatePlaceById(id);
  if (!place) {
    throw new Error(`Unknown canonical estate place: ${id}`);
  }
  return place;
}

export function getAllCanonicalEstatePlaces(): readonly CanonicalEstatePlace[] {
  return CANONICAL_ESTATE_REGISTRY;
}

export function getCanonicalEstatePlacesByCategory(
  category: CanonicalEstateCategory,
): CanonicalEstatePlace[] {
  return CANONICAL_ESTATE_REGISTRY.filter((p) => p.category === category);
}

export function getCanonicalLivingPlaces(): CanonicalEstatePlace[] {
  return getCanonicalEstatePlacesByCategory("living-place");
}

export function getCanonicalDestinations(): CanonicalEstatePlace[] {
  return getCanonicalEstatePlacesByCategory("destination");
}

export function getCanonicalCollections(): CanonicalEstatePlace[] {
  return getCanonicalEstatePlacesByCategory("collection");
}

export function getCanonicalTransitionSpaces(): CanonicalEstatePlace[] {
  return getCanonicalEstatePlacesByCategory("transition-space");
}

export function isCanonicalEstatePlaceId(id: string): id is CanonicalEstatePlaceId {
  return BY_ID.has(resolveCanonicalPlaceId(id));
}

/**
 * Resolve a member phrase to a canonical place id (exact normalized match).
 * For fuzzy / substring routing, use legacy adapters until Phase C unifies matchers.
 */
export function resolveCanonicalPlaceIdFromAlias(
  phrase: string,
): string | undefined {
  const normalized = normalizeAlias(phrase);
  if (!normalized) return undefined;
  return ALIAS_INDEX.get(normalized);
}

/**
 * Longest-alias wins — scan known aliases contained in text (ordered by length).
 */
export function matchCanonicalPlaceInText(text: string): CanonicalEstatePlace | null {
  const normalized = normalizeAlias(text);
  if (!normalized) return null;

  const exact = ALIAS_INDEX.get(normalized);
  if (exact) return getCanonicalEstatePlaceById(exact) ?? null;

  let best: { id: string; len: number } | null = null;
  for (const [alias, id] of ALIAS_INDEX.entries()) {
    if (alias.length < 3) continue;
    if (!normalized.includes(alias)) continue;
    if (!best || alias.length > best.len) {
      best = { id, len: alias.length };
    }
  }
  if (!best) return null;
  return getCanonicalEstatePlaceById(best.id) ?? null;
}

export function canonicalPlaceIds(): readonly string[] {
  return CANONICAL_ESTATE_REGISTRY.map((p) => p.id);
}

export function canonicalRegistryStats(): {
  total: number;
  byCategory: Record<CanonicalEstateCategory, number>;
  byStatus: Record<CanonicalEstateStatus, number>;
} {
  const byCategory: Record<CanonicalEstateCategory, number> = {
    "living-place": 0,
    destination: 0,
    collection: 0,
    "transition-space": 0,
  };
  const byStatus: Record<CanonicalEstateStatus, number> = {
    live: 0,
    partial: 0,
    planned: 0,
    future: 0,
    "needs-asset": 0,
  };
  for (const place of CANONICAL_ESTATE_REGISTRY) {
    byCategory[place.category] += 1;
    byStatus[place.status] += 1;
  }
  return {
    total: CANONICAL_ESTATE_REGISTRY.length,
    byCategory,
    byStatus,
  };
}

/** Living places must not use object-invitation or feature-grid arrival (canon law). */
export function isLivingPlaceArrivalValid(place: CanonicalEstatePlace): boolean {
  if (place.category !== "living-place") return true;
  return (
    place.arrivalBehavior === "threshold" ||
    place.arrivalBehavior === "ambient-crossfade" ||
    place.arrivalBehavior === "presence-only"
  );
}

/** Transition spaces must pass through without blocking. */
export function isTransitionSpaceArrivalValid(
  place: CanonicalEstatePlace,
): boolean {
  if (place.category !== "transition-space") return true;
  return place.arrivalBehavior === "pass-through";
}

export function validateCanonicalRegistryIntegrity(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const place of CANONICAL_ESTATE_REGISTRY) {
    if (ids.has(place.id)) {
      errors.push(`Duplicate canonical id: ${place.id}`);
    }
    ids.add(place.id);

    if (place.aliases.length === 0) {
      errors.push(`${place.id}: missing aliases`);
    }

    if (!isLivingPlaceArrivalValid(place)) {
      errors.push(
        `${place.id}: living place has invalid arrivalBehavior ${place.arrivalBehavior}`,
      );
    }

    if (!isTransitionSpaceArrivalValid(place)) {
      errors.push(
        `${place.id}: transition space must use pass-through arrival`,
      );
    }

    for (const related of place.relatedPlaces) {
      if (!BY_ID.has(related)) {
        errors.push(`${place.id}: unknown relatedPlace ${related}`);
      }
    }

    if (place.parentPlaceId && !BY_ID.has(place.parentPlaceId)) {
      errors.push(`${place.id}: unknown parentPlaceId ${place.parentPlaceId}`);
    }

    const routeType = inferRouteType(place);
    if (
      (routeType === "subspace" || routeType === "object") &&
      !place.parentPlaceId
    ) {
      errors.push(`${place.id}: ${routeType} requires parentPlaceId`);
    }
  }

  return errors;
}

/** Resolve route type — explicit on record, otherwise inferred from canon shape. */
export function inferRouteType(place: CanonicalEstatePlace): EstateRouteType {
  if (place.routeType) return place.routeType;
  if (place.parentPlaceId) {
    return place.category === "collection" ? "object" : "subspace";
  }
  if (place.arrivalBehavior === "presence-only") return "presence-only";
  return "room";
}
