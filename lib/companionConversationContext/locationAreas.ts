/**
 * Estate location families — sub-areas within a parent place.
 */

import {
  getEstateLocationById,
  getEstateLocations,
} from "@/lib/estateKnowledgeBase/estateLocations";
import type { EstateLocation } from "@/lib/estateKnowledgeBase/types";

const FAMILY_PREFIXES = ["house-possibility"] as const;

const AREA_DISPLAY: Record<string, string> = {
  "house-possibility-outside": "the treehouse arrival",
  "house-possibility-observatory": "the Observatory",
  "house-possibility-discovery-chest": "the Discovery Chest",
  "house-possibility-studio": "the creative studio",
  "house-possibility-staircase": "the staircase and reading nook",
  "house-possibility-reflection-desk": "the reflection desk",
  "house-possibility-legacy-room": "the legacy room",
  "house-possibility-cabinet-of-chapters": "the Cabinet of Chapters",
  "house-possibility-curiosity-cabinet": "the curiosity cabinet",
  "house-possibility-telescope-deck": "the telescope deck",
};

export function locationFamilyPrefix(locationId: string): string | null {
  for (const prefix of FAMILY_PREFIXES) {
    if (locationId === prefix || locationId.startsWith(`${prefix}-`)) {
      return prefix;
    }
  }
  return null;
}

export function resolveParentLocationId(locationId: string): string {
  const family = locationFamilyPrefix(locationId);
  if (family === "house-possibility") {
    return "house-possibility-outside";
  }
  return locationId;
}

export function getAreasInFamily(familyPrefix: string): EstateLocation[] {
  return getEstateLocations().filter(
    (loc) =>
      loc.locationId === familyPrefix ||
      loc.locationId.startsWith(`${familyPrefix}-`),
  );
}

function formatAreaName(location: EstateLocation): string {
  return (
    AREA_DISPLAY[location.locationId] ??
    location.officialDisplayName.replace(/\u2122/g, "").trim()
  );
}

export function formatLocationAreasReply(parentLocationId: string): string | null {
  const family =
    locationFamilyPrefix(parentLocationId) ??
    locationFamilyPrefix(resolveParentLocationId(parentLocationId));
  if (!family) return null;

  const parent = getEstateLocationById(resolveParentLocationId(parentLocationId));
  const houseName =
    parent?.officialDisplayName?.replace(/\u2122/g, "") ?? "Possibility House";

  const areas = getAreasInFamily(family).filter(
    (loc) => loc.locationId !== resolveParentLocationId(parentLocationId),
  );

  if (!areas.length) return null;

  const listed = areas.map((area, index) => `${index + 1}. ${formatAreaName(area)}`);

  return [
    `${houseName} has a few special corners worth knowing:`,
    ...listed,
    "",
    "Want me to take you to one, or keep exploring from here?",
  ].join("\n");
}

export function formatLocationHereReply(locationId: string): string | null {
  const family = locationFamilyPrefix(locationId);
  if (!family) {
    const loc = getEstateLocationById(locationId);
    if (!loc) return null;
    const hint = loc.memberFacingHint || loc.description;
    return hint
      ? `You're in ${loc.officialDisplayName.replace(/\u2122/g, "")}. ${hint}`
      : `You're in ${loc.officialDisplayName.replace(/\u2122/g, "")}.`;
  }
  return formatLocationAreasReply(locationId);
}
