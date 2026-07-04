/**
 * "Visit Another Room" — one warm question, three real room names (not abstract categories).
 */

import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";
import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import { matchVaguePlaceCluster } from "./estatePlaceClusters";

/** Rotating wander destinations — member sees actual room names first. */
export const ESTATE_WANDER_PLACE_ORDER = [
  "coffee-house",
  "library",
  "observatory",
  "tea-room",
  "dining-room",
  "discovery-room",
  "estate-kitchen",
  "evidence-vault",
  "summer-terrace",
  "music-room",
  "conservatory",
  "stables",
  "estate-gardens",
  "greenhouse",
  "reading-nook",
] as const;

export function pickWanderPlaceIds(excludePlaceId?: string | null): string[] {
  const pool = ESTATE_WANDER_PLACE_ORDER.filter((id) => id !== excludePlaceId);
  return pool.slice(0, 3);
}

export function formatEstateWanderMenu(
  excludePlaceId?: string | null,
): { line: string; placeIds: string[] } {
  const placeIds = pickWanderPlaceIds(excludePlaceId);
  const line = formatEstatePlaceSuggestionMenu(placeIds, {
    intro: "Where would you like to go?",
    closer:
      "Pick one of these — or just tell me the room you have in mind.",
  });
  return { line, placeIds };
}

/** Vague mood → three concrete rooms (never abstract category labels). */
export function formatVagueWanderClusterMenu(
  userText: string,
  excludePlaceId?: string | null,
): { line: string; placeIds: string[] } | null {
  return matchVaguePlaceCluster(userText, excludePlaceId);
}

export function placeOfficialName(placeId: string): string {
  return getCanonicalEstatePlaceById(placeId)?.officialName ?? placeId;
}

/** @deprecated Category step removed — kept for menu text recovery only. */
export function extractWanderCategoryIdsFromMenu(_text: string): string[] {
  return [];
}
