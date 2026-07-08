/**
 * Chamber of Momentum™ — member-facing umbrella identity (Phase 1).
 * Internal areas (Institute, Builder, Goals & Projects) keep their placeIds.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_IDENTITY_CONSOLIDATION_FIX_PHASE1.md
 */

export const CHAMBER_OF_MOMENTUM_MEMBER_NAME = "Chamber of Momentum™";

/** Canonical doorway — chamber aliases and learning entry route here. */
export const CHAMBER_OF_MOMENTUM_ENTRY_PLACE_ID = "momentum-institute";

export const CHAMBER_OF_MOMENTUM_SECTION = "chamber-of-momentum" as const;

/** Legacy placeIds that share the Chamber member-facing identity. */
export const CHAMBER_OF_MOMENTUM_PLACE_IDS = [
  "chamber-of-momentum",
  "momentum-institute",
  "momentum-builder",
  "goals-projects",
  "study-hall",
  "momentum-room",
] as const;

export type ChamberOfMomentumPlaceId =
  (typeof CHAMBER_OF_MOMENTUM_PLACE_IDS)[number];

export function isChamberOfMomentumPlace(
  placeId: string,
): placeId is ChamberOfMomentumPlaceId {
  return (CHAMBER_OF_MOMENTUM_PLACE_IDS as readonly string[]).includes(placeId);
}

/** Member-facing room label for estate chrome and navigation menus. */
export function resolveChamberMemberFacingName(
  legacyPlaceId: string,
): string | null {
  if (!isChamberOfMomentumPlace(legacyPlaceId)) return null;
  return CHAMBER_OF_MOMENTUM_MEMBER_NAME;
}

/**
 * Collapse multiple Momentum sub-places into one Chamber doorway in numbered menus.
 */
export function consolidateChamberPlaceIdsForMenu(
  placeIds: readonly string[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let chamberAdded = false;

  for (const id of placeIds) {
    if (isChamberOfMomentumPlace(id)) {
      if (!chamberAdded) {
        out.push(CHAMBER_OF_MOMENTUM_ENTRY_PLACE_ID);
        chamberAdded = true;
        seen.add(CHAMBER_OF_MOMENTUM_ENTRY_PLACE_ID);
      }
      continue;
    }
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}
