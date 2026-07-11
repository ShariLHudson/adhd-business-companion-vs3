/**
 * Estate Knowledge Base — location directory loader.
 */

import estateLocationsJson from "@/docs/estate-knowledge-base/estate-locations.json";
import { getKnowledgeItem } from "./loader";
import type { EstateLocation, LocationOption } from "./types";

type EstateLocationsFile = {
  locations: EstateLocation[];
};

const FILE = estateLocationsJson as EstateLocationsFile;

export function getEstateLocations(): EstateLocation[] {
  return FILE.locations;
}

export function getEstateLocationById(
  locationId: string,
): EstateLocation | null {
  return FILE.locations.find((loc) => loc.locationId === locationId) ?? null;
}

export function getLiveEstateLocations(): EstateLocation[] {
  return FILE.locations.filter((loc) => loc.status === "Live");
}

export function isRecommendableEstateLocation(
  location: EstateLocation | null,
): boolean {
  if (!location || location.status !== "Live") return false;

  const room = getKnowledgeItem("rooms", location.locationId);
  if (room && room.status !== "Live") return false;

  return true;
}

export function toLocationOption(location: EstateLocation): LocationOption {
  const room = getKnowledgeItem("rooms", location.locationId);
  return {
    locationId: location.locationId,
    officialDisplayName: location.officialDisplayName,
    memberFacingHint: location.memberFacingHint || location.description,
    primaryAssetFileName: location.primaryAssetFileName,
    route: location.route ?? room?.route ?? null,
  };
}

export function locationOptionsForIds(
  locationIds: string[],
): LocationOption[] {
  const options: LocationOption[] = [];

  for (const id of locationIds) {
    const location = getEstateLocationById(id);
    if (!location || !isRecommendableEstateLocation(location)) continue;
    options.push(toLocationOption(location));
  }

  return options;
}
