/**
 * Estate Wander Mode — casual exploration from the Room chrome.
 * Manifest-driven; random with recent-place avoidance.
 *
 * @see docs/protocols/ESTATE_WANDER_MODE_PROTOCOL.md
 */

import type { EstateManifestPlaceRecord } from "./types";
import {
  getManifestDocument,
  getPlaceById,
  resolveManifestLegacyPlaceId,
} from "./estatePlaceMasterManifest";
import { resolveChamberMemberFacingName } from "../chamberOfMomentumIdentity";

const WANDER_RECENT_KEY = "estate-wander-recent-v1";
const MAX_RECENT = 8;

export type EstateWanderPick = {
  place: EstateManifestPlaceRecord;
  legacyPlaceId: string;
  manifestPlaceId: string;
};

/** Navigable Live places from ESTATE_PLACE_MASTER_MANIFEST.json only. */
export function getWanderableManifestPlaces(): EstateManifestPlaceRecord[] {
  return getManifestDocument().places.filter(
    (place) => place.navigable && place.status === "Live",
  );
}

let memoryRecentManifestPlaceIds: string[] = [];

export function loadWanderRecentManifestPlaceIds(): string[] {
  if (typeof window === "undefined") return [...memoryRecentManifestPlaceIds];
  try {
    const raw = window.sessionStorage.getItem(WANDER_RECENT_KEY);
    if (!raw) return [...memoryRecentManifestPlaceIds];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...memoryRecentManifestPlaceIds];
    memoryRecentManifestPlaceIds = parsed.filter(
      (id): id is string => typeof id === "string",
    );
    return [...memoryRecentManifestPlaceIds];
  } catch {
    return [...memoryRecentManifestPlaceIds];
  }
}

export function saveWanderRecentManifestPlaceIds(ids: readonly string[]): void {
  memoryRecentManifestPlaceIds = [...new Set(ids)].slice(0, MAX_RECENT);
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      WANDER_RECENT_KEY,
      JSON.stringify(memoryRecentManifestPlaceIds),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearWanderRecentHistory(): void {
  memoryRecentManifestPlaceIds = [];
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(WANDER_RECENT_KEY);
  } catch {
    // ignore
  }
}

/** Filter pool — exported for tests. */
export function filterWanderCandidatePool(
  places: readonly EstateManifestPlaceRecord[],
  currentLegacyPlaceId: string | null,
  recentManifestPlaceIds: readonly string[],
): EstateManifestPlaceRecord[] {
  const resolvedCurrent = currentLegacyPlaceId
    ? resolveManifestLegacyPlaceId(currentLegacyPlaceId)
    : null;
  const currentManifest = resolvedCurrent
    ? getPlaceById(resolvedCurrent)
    : null;

  return places.filter((place) => {
    if (place.legacy_place_id === resolvedCurrent) return false;
    if (currentManifest && place.place_id === currentManifest.place_id) {
      return false;
    }
    if (recentManifestPlaceIds.includes(place.place_id)) return false;
    return true;
  });
}

export function pickWanderFromPool(
  pool: readonly EstateManifestPlaceRecord[],
  random = Math.random,
): EstateManifestPlaceRecord | null {
  if (pool.length === 0) return null;
  const index = Math.floor(random() * pool.length);
  return pool[index] ?? null;
}

/** Record departure + arrival after a successful wander transition. */
export function recordWanderTransition(
  fromLegacyPlaceId: string | null,
  toPlace: EstateManifestPlaceRecord,
): void {
  const fromPlace = fromLegacyPlaceId ? getPlaceById(fromLegacyPlaceId) : null;
  const recent = loadWanderRecentManifestPlaceIds().filter(
    (id) => id !== toPlace.place_id && id !== fromPlace?.place_id,
  );
  const next = [
    toPlace.place_id,
    ...(fromPlace ? [fromPlace.place_id] : []),
    ...recent,
  ].slice(0, MAX_RECENT);
  saveWanderRecentManifestPlaceIds(next);
}

/**
 * Pick the next wander destination.
 * Returns null when no other Live place is available (stay in current room).
 */
export function pickWanderDestination(
  currentLegacyPlaceId: string | null,
  random = Math.random,
): EstateWanderPick | null {
  const wanderable = getWanderableManifestPlaces();
  let recent = loadWanderRecentManifestPlaceIds();

  let pool = filterWanderCandidatePool(
    wanderable,
    currentLegacyPlaceId,
    recent,
  );

  if (pool.length === 0 && recent.length > 0) {
    recent = [];
    clearWanderRecentHistory();
    pool = filterWanderCandidatePool(wanderable, currentLegacyPlaceId, recent);
  }

  const picked = pickWanderFromPool(pool, random);
  if (!picked) return null;

  return {
    place: picked,
    legacyPlaceId: picked.legacy_place_id,
    manifestPlaceId: picked.place_id,
  };
}

export function resolveWanderRoomDisplayName(
  legacyPlaceId: string,
): string {
  const chamberName = resolveChamberMemberFacingName(legacyPlaceId);
  if (chamberName) return chamberName;

  const fromManifest = getPlaceById(legacyPlaceId);
  if (fromManifest?.display_name) return fromManifest.display_name;
  if (fromManifest?.official_name) return fromManifest.official_name;
  return legacyPlaceId;
}

/** Ensure wander pick uses one manifest record for name, image, and route. */
export function validateWanderPick(pick: EstateWanderPick): boolean {
  const { place, legacyPlaceId, manifestPlaceId } = pick;
  if (place.place_id !== manifestPlaceId) return false;
  if (place.legacy_place_id !== legacyPlaceId) return false;
  if (!place.official_name?.trim()) return false;
  if (!place.route?.trim()) return false;
  if (!place.primary_image?.trim()) return false;
  const resolved = getPlaceById(legacyPlaceId);
  return resolved?.place_id === place.place_id;
}
