/**
 * Canonical estate room identity — aliases and equivalence groups.
 */

import { resolveEstatePlaceIdFromUserText } from "../estateRoomAliasRegistry";

const ROOM_EQUIVALENCE: Record<string, readonly string[]> = {
  journal: ["journal", "journal-gazebo"],
  "momentum-institute": [
    "momentum-institute",
    "momentum-room",
    "study-hall",
  ],
  "creative-studio": ["creative-studio", "art-studio", "strategy-studio"],
  library: ["library", "personal-library", "estate-library", "growth-library"],
};

export function normalizeEstateRoomId(
  placeId: string | null | undefined,
): string | null {
  if (!placeId?.trim()) return null;
  const trimmed = placeId.trim();
  return resolveEstatePlaceIdFromUserText(trimmed) ?? trimmed;
}

export function estateRoomsEquivalent(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = normalizeEstateRoomId(a);
  const nb = normalizeEstateRoomId(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  for (const ids of Object.values(ROOM_EQUIVALENCE)) {
    if (ids.includes(na) && ids.includes(nb)) return true;
  }
  return false;
}
