/**
 * Room Placement Library™ — approved Discovery Key surfaces per room.
 */

import roomPlacementJson from "@/docs/estate-intelligence/room-placement-library.json";
import type {
  ApprovedKeyLocation,
  RoomPlacementProfile,
  RoomPlacementSelection,
} from "./types";

type RoomPlacementFile = {
  items: RoomPlacementProfile[];
};

const PROFILES = (roomPlacementJson as RoomPlacementFile).items;

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function isLocationEligible(
  location: ApprovedKeyLocation,
  profile: RoomPlacementProfile,
  activeSeasonId?: string | null,
): boolean {
  if (location.status !== "Live") return false;

  if (location.seasonalOnly) {
    if (!activeSeasonId || location.seasonalOnly !== activeSeasonId) {
      return false;
    }
  }

  const variant = profile.seasonalVariants?.find(
    (entry) => entry.seasonId === activeSeasonId,
  );
  if (variant && !variant.enabledLocationIds.includes(location.id)) {
    return false;
  }

  return true;
}

export function getRoomPlacementProfile(
  roomId: string,
): RoomPlacementProfile | null {
  return PROFILES.find((profile) => profile.roomId === roomId) ?? null;
}

export function selectDiscoveryKeyPlacement(input: {
  roomId: string;
  discoveryId: string;
  activeSeasonId?: string | null;
}): RoomPlacementSelection | null {
  const profile = getRoomPlacementProfile(input.roomId);
  if (!profile || profile.status !== "Live") return null;

  const eligible = profile.approvedLocations
    .filter((location) => isLocationEligible(location, profile, input.activeSeasonId))
    .sort((a, b) => a.priority - b.priority);

  if (eligible.length === 0) return null;

  const index = stableHash(input.discoveryId) % eligible.length;
  const location = eligible[index]!;

  return {
    roomId: profile.roomId,
    locationId: location.id,
    label: location.label,
    xPercent: location.position.xPercent,
    yPercent: location.position.yPercent,
    anchor: location.position.anchor,
    scale: location.placementScale ?? profile.defaultPlacementScale,
    rotationDegrees: location.rotationDegrees,
    shadow: location.shadow,
    depthLayer: location.depthLayer,
  };
}
