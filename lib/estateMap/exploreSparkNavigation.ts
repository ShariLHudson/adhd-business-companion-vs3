/**
 * Explore Spark / Explore Estate — visual Estate explorer navigation.
 *
 * Approved labels: "Explore Spark" / "Explore Estate".
 * Opens EstateMapFullScreen with destinations from the Place Master Manifest.
 * Must never resolve to Create / Create Studio / Clear My Mind.
 */

import {
  EXPLORE_ESTATE_FORBIDDEN_IDS,
  getExploreEstateDestinationById,
  getExploreEstateDestinations,
} from "./exploreEstateDestinations";
import type { EstateExploreDestination } from "./exploreEstateTypes";
import type { EstateMapLocation } from "./types";

/** Approved member-facing label (menu, a11y, chat). */
export const EXPLORE_SPARK_LABEL = "Explore Spark";

/** Destinations that must never be Explore Spark targets. */
export const EXPLORE_SPARK_FORBIDDEN_PLACE_IDS = EXPLORE_ESTATE_FORBIDDEN_IDS;

const EXPLORE_SPARK_PHRASE_RE =
  /\b(?:(?:open|show(?:\s+me)?|take\s+me\s+to|go\s+to)\s+)?explore\s+spark(?:\s+estate)?\b|\bexplore\s+(?:the\s+)?estate\b|\blet(?:'s| us)?\s+explore\s+(?:the\s+)?(?:spark\s+)?estate\b|\bshow\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(?:estate\s+)?rooms?(?:\s+and\s+spaces)?\b|\bshow\s+all\s+rooms?\s+and\s+spaces\b|\btake\s+me\s+to\s+explore\s+spark\b|\bshow\s+(?:me\s+)?(?:the\s+)?estate\s+grounds\b|\bshow\s+(?:me\s+)?peaceful\s+places\b/i;

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

/** Resolve a map card / explore destination to a navigable place id. */
export function resolveExploreMapLocationPlaceId(
  location: Pick<EstateMapLocation, "id"> | string | EstateExploreDestination,
): string | null {
  if (typeof location === "object" && "destinationId" in location) {
    const placeId = location.destinationId;
    if (isExploreSparkForbiddenPlaceId(placeId)) return null;
    if (!location.isAvailable) return null;
    return placeId;
  }

  const locationId = typeof location === "string" ? location : location.id;
  const dest = getExploreEstateDestinationById(locationId);
  if (dest) {
    if (isExploreSparkForbiddenPlaceId(dest.destinationId)) return null;
    if (!dest.isAvailable) return null;
    return dest.destinationId;
  }

  if (isExploreSparkForbiddenPlaceId(locationId)) return null;
  return locationId;
}

/** Reverse lookup for “You are here” on the explorer. */
export function exploreMapLocationIdForPlaceId(
  placeId: string | null | undefined,
): string | undefined {
  if (!placeId) return undefined;
  const normalized = placeId.trim().toLowerCase();
  if (isExploreSparkForbiddenPlaceId(normalized)) return undefined;

  const dest = getExploreEstateDestinations().find(
    (d) =>
      d.destinationId === normalized ||
      d.id === normalized ||
      d.aliases?.some((a) => a.toLowerCase() === normalized),
  );
  return dest?.id;
}

/**
 * Approved visual destinations as EstateMapLocation cards.
 * Create / Clear My Mind never appear.
 */
export function getExploreSparkMapLocations(): EstateMapLocation[] {
  return getExploreEstateDestinations()
    .filter((dest) => !isExploreSparkForbiddenPlaceId(dest.destinationId))
    .map((dest, index) => ({
      id: dest.id,
      name: dest.name,
      image: dest.imagePath,
      mood: dest.description,
      x: 10 + (index % 5) * 18,
      y: 15 + Math.floor(index / 5) * 18,
      width: 11,
      rotation: 0,
      anchor: dest.id === "welcome-home",
    }));
}

/**
 * Stale last-location values that must not hijack Explore Spark.
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

/** Session flag helpers — return to Explore Estate after visiting a destination. */
const EXPLORE_RETURN_KEY = "explore-estate-return-v1";

export function markExploreEstateReturnPending(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(EXPLORE_RETURN_KEY, "1");
  } catch {
    /* noop */
  }
}

export function consumeExploreEstateReturnPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = window.sessionStorage.getItem(EXPLORE_RETURN_KEY) === "1";
    if (pending) window.sessionStorage.removeItem(EXPLORE_RETURN_KEY);
    return pending;
  } catch {
    return false;
  }
}

export function hasExploreEstateReturnPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(EXPLORE_RETURN_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearExploreEstateReturnPending(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(EXPLORE_RETURN_KEY);
  } catch {
    /* noop */
  }
}
