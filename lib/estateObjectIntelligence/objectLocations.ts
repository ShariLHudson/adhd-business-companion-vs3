/**
 * Estate Object Intelligence™ — object ↔ location placement loader.
 */

import objectLocationsJson from "@/docs/estate-knowledge-base/object-locations.json";
import type { ObjectLocationPlacement } from "./types";

type ObjectLocationsFile = {
  placements: ObjectLocationPlacement[];
};

const FILE = objectLocationsJson as ObjectLocationsFile;

export function getObjectLocationPlacements(): ObjectLocationPlacement[] {
  return FILE.placements;
}

export function getPlacementsForObject(
  objectId: string,
): ObjectLocationPlacement[] {
  return FILE.placements.filter(
    (placement) => placement.objectId === objectId,
  );
}

export function getPlacementsForLocation(
  locationId: string,
): ObjectLocationPlacement[] {
  return FILE.placements.filter(
    (placement) => placement.locationId === locationId,
  );
}

export function getLivePlacementsForLocation(
  locationId: string,
): ObjectLocationPlacement[] {
  return getPlacementsForLocation(locationId).filter(
    (placement) => placement.status === "Live",
  );
}

export function selectPlacementForContext(
  objectId: string,
  currentLocationId?: string,
): ObjectLocationPlacement | null {
  const placements = getPlacementsForObject(objectId);
  if (!placements.length) return null;

  if (currentLocationId) {
    const inRoom = placements.find(
      (placement) =>
        placement.locationId === currentLocationId &&
        placement.status === "Live",
    );
    if (inRoom) return inRoom;
  }

  const livePrimary = placements.find(
    (placement) =>
      placement.status === "Live" && placement.prominence === "primary",
  );
  if (livePrimary) return livePrimary;

  return placements.find((placement) => placement.status === "Live") ?? null;
}
