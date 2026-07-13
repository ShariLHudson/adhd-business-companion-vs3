/**
 * Explore Spark — visual Estate explorer navigation.
 *
 * Approved user-facing label: "Explore Spark".
 * Opens EstateMapFullScreen with DEFAULT_ESTATE_MAP_LOCATIONS.
 * Must never resolve to Create / Create Studio / content-generator.
 */

import { DEFAULT_ESTATE_MAP_LOCATIONS } from "./estateMapLocations";
import type { EstateMapLocation } from "./types";

/** Approved member-facing label (menu, a11y, chat). */
export const EXPLORE_SPARK_LABEL = "Explore Spark";

/** Destinations that must never be Explore Spark targets. */
export const EXPLORE_SPARK_FORBIDDEN_PLACE_IDS = [
  "creative-studio",
  "content-generator",
  "create",
  "art-studio",
  "strategy-studio",
] as const;

/**
 * Map card ids → canonical navigable place ids.
 * Card ids stay stable for layout; places follow the canonical registry.
 */
export const EXPLORE_MAP_LOCATION_TO_PLACE_ID: Readonly<
  Record<string, string>
> = {
  "welcome-house": "welcome-home",
  conservatory: "conservatory",
  library: "library",
  "coffee-house": "coffee-house",
  "reflection-garden": "peaceful-places",
  orchard: "apple-orchard",
  stable: "stables",
  "mountain-cabin": "peaceful-places",
  observatory: "observatory",
};

const EXPLORE_SPARK_PHRASE_RE =
  /\b(?:(?:open|show(?:\s+me)?|take\s+me\s+to|go\s+to)\s+)?explore\s+spark(?:\s+estate)?\b|\bexplore\s+(?:the\s+)?estate\b|\blet(?:'s| us)?\s+explore\s+(?:the\s+)?(?:spark\s+)?estate\b|\bshow\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(?:estate\s+)?rooms?(?:\s+and\s+spaces)?\b|\bshow\s+all\s+rooms?\s+and\s+spaces\b|\btake\s+me\s+to\s+explore\s+spark\b/i;

export function isExploreSparkRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return EXPLORE_SPARK_PHRASE_RE.test(t);
}

export function isExploreSparkForbiddenPlaceId(
  placeId: string | null | undefined,
): boolean {
  if (!placeId) return false;
  const normalized = placeId.trim().toLowerCase();
  return (EXPLORE_SPARK_FORBIDDEN_PLACE_IDS as readonly string[]).includes(
    normalized,
  );
}

/** Resolve a map card to a navigable place id, or null if unavailable / forbidden. */
export function resolveExploreMapLocationPlaceId(
  location: Pick<EstateMapLocation, "id"> | string,
): string | null {
  const locationId = typeof location === "string" ? location : location.id;
  const placeId = EXPLORE_MAP_LOCATION_TO_PLACE_ID[locationId] ?? locationId;
  if (isExploreSparkForbiddenPlaceId(placeId)) return null;
  return placeId;
}

/** Reverse lookup for “You are here” on the map. */
export function exploreMapLocationIdForPlaceId(
  placeId: string | null | undefined,
): string | undefined {
  if (!placeId) return undefined;
  const normalized = placeId.trim().toLowerCase();
  if (isExploreSparkForbiddenPlaceId(normalized)) return undefined;
  for (const [locationId, mapped] of Object.entries(
    EXPLORE_MAP_LOCATION_TO_PLACE_ID,
  )) {
    if (mapped === normalized) return locationId;
  }
  if (DEFAULT_ESTATE_MAP_LOCATIONS.some((loc) => loc.id === normalized)) {
    return normalized;
  }
  return undefined;
}

/** Approved visual destinations — Create never appears. */
export function getExploreSparkMapLocations(): EstateMapLocation[] {
  return DEFAULT_ESTATE_MAP_LOCATIONS.filter((loc) => {
    const placeId = resolveExploreMapLocationPlaceId(loc);
    return placeId !== null;
  });
}

/**
 * Stale last-location values that must not hijack Explore Spark.
 * Ignore these when deciding where Explore Spark should open.
 */
export function isStaleCreateLastLocation(
  value: string | null | undefined,
): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return (
    isExploreSparkForbiddenPlaceId(v) ||
    v === "create-studio" ||
    v.includes("content-generator")
  );
}
