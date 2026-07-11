/**
 * KB-backed semantic target resolution — aliases, descriptors, objects, features.
 */

import { matchEstateAlias } from "@/lib/estateKnowledgeBase/estateAliases";
import {
  getEstateLocationById,
  getLiveEstateLocations,
  isRecommendableEstateLocation,
  locationOptionsForIds,
  toLocationOption,
} from "@/lib/estateKnowledgeBase/estateLocations";
import { matchExperienceGroupFromQuery } from "@/lib/estateKnowledgeBase/experienceGroups";
import {
  longestPhraseMatch,
  stripNavigationVerbsFromQuery,
} from "@/lib/estateKnowledgeBase/locationPhraseMatch";
import {
  getFeatureHowToGuides,
  matchFeatureHowToGuide,
} from "@/lib/estateHelpDiscoveryIntelligence/featureHowTo";
import { matchObjectAlias } from "@/lib/estateObjectIntelligence/objectAliases";
import { getEstateObjectById } from "@/lib/estateObjectIntelligence/estateObjects";
import {
  filterValidatedNavigationTargets,
} from "@/lib/estateNavigationIntelligence/routeValidation";
import type { SemanticTarget } from "./types";

export type SemanticLocationDescriptor = {
  id: string;
  locationId: string;
  patterns: RegExp[];
  displayHint?: string;
};

/** Colloquial place language not yet in estate-aliases.json. */
export const SEMANTIC_LOCATION_DESCRIPTORS: SemanticLocationDescriptor[] = [
  {
    id: "treehouse-colloquial",
    locationId: "house-possibility-outside",
    patterns: [
      /\bhouse in the trees\b/i,
      /\bhouse among the trees\b/i,
      /\bamong the trees\b/i,
      /\btree\s*house\b/i,
      /\bcreative retreat among\b/i,
    ],
    displayHint: "Possibility House",
  },
];

const FEATURE_OPEN_HINTS: Array<{
  pattern: RegExp;
  guideId: string;
}> = [
  { pattern: /\breminders?\b/i, guideId: "reminders" },
  { pattern: /\bsettings\b/i, guideId: "settings-overview" },
  { pattern: /\bclear my mind\b/i, guideId: "clear-my-mind" },
  { pattern: /\bmy thoughts\b/i, guideId: "my-thoughts" },
  { pattern: /\bguidebook\b/i, guideId: "guidebook" },
];

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchLocationByDisplayName(query: string): string | null {
  const probe = stripNavigationVerbsFromQuery(query) || query.trim();
  const match = longestPhraseMatch(
    probe,
    getLiveEstateLocations(),
    (loc) => loc.officialDisplayName.replace(/\u2122/g, ""),
    { probeText: probe },
  );
  if (match) return match.item.locationId;

  const idMatch = longestPhraseMatch(
    probe,
    getLiveEstateLocations(),
    (loc) => loc.locationId.replace(/-/g, " "),
    { probeText: probe },
  );
  return idMatch?.item.locationId ?? null;
}

function matchSemanticDescriptor(query: string): {
  locationId: string;
  matchedPhrase: string;
  displayHint?: string;
} | null {
  for (const descriptor of SEMANTIC_LOCATION_DESCRIPTORS) {
    for (const pattern of descriptor.patterns) {
      const m = query.match(pattern);
      if (m) {
        return {
          locationId: descriptor.locationId,
          matchedPhrase: m[0],
          displayHint: descriptor.displayHint,
        };
      }
    }
  }
  return null;
}

function placeIdForLocation(locationId: string): string | undefined {
  const validated = filterValidatedNavigationTargets([locationId]);
  return validated[0]?.placeId;
}

function buildRoomTarget(
  locationId: string,
  matchedPhrase: string,
  displayName?: string,
): SemanticTarget {
  const location = getEstateLocationById(locationId);
  const placeId = placeIdForLocation(locationId);
  return {
    kind: "room",
    id: locationId,
    locationId,
    placeId,
    displayName:
      displayName ??
      location?.officialDisplayName?.replace(/\u2122/g, "") ??
      matchedPhrase,
    matchedPhrase,
  };
}

export function resolveSemanticTarget(query: string): SemanticTarget {
  const trimmed = query.trim();
  const empty: SemanticTarget = { kind: "unknown" };
  if (!trimmed) return empty;

  const namedLocationId = matchLocationByDisplayName(trimmed);
  if (namedLocationId) {
    const location = getEstateLocationById(namedLocationId);
    if (location && isRecommendableEstateLocation(location)) {
      return buildRoomTarget(namedLocationId, location.officialDisplayName);
    }
  }

  const estateAlias = matchEstateAlias(trimmed);
  if (estateAlias) {
    return buildRoomTarget(estateAlias.locationId, estateAlias.phrase);
  }

  const descriptor = matchSemanticDescriptor(trimmed);
  if (descriptor) {
    const location = getEstateLocationById(descriptor.locationId);
    if (location && isRecommendableEstateLocation(location)) {
      return buildRoomTarget(
        descriptor.locationId,
        descriptor.matchedPhrase,
        descriptor.displayHint,
      );
    }
  }

  const objectAlias = matchObjectAlias(trimmed);
  if (objectAlias) {
    const object = getEstateObjectById(objectAlias.objectId);
    const parentLocationId = object?.appearsInLocations?.[0];
    const parentPlaceId = parentLocationId
      ? placeIdForLocation(parentLocationId)
      : undefined;
    return {
      kind: "object",
      id: objectAlias.objectId,
      displayName: object?.officialName,
      matchedPhrase: objectAlias.phrase,
      parentLocationId,
      parentPlaceId,
    };
  }

  const featureMatch = matchFeatureHowToGuide(trimmed);
  if (featureMatch) {
    return {
      kind: "feature",
      id: featureMatch.guide.guideId,
      displayName: featureMatch.guide.guideId,
      matchedPhrase: featureMatch.matchedPhrase,
      placeId: featureMatch.guide.targetId,
      locationId: featureMatch.guide.targetId,
    };
  }

  for (const hint of FEATURE_OPEN_HINTS) {
    if (hint.pattern.test(trimmed)) {
      const guide = getFeatureHowToGuides().find((g) => g.guideId === hint.guideId);
      if (guide) {
        return {
          kind: "feature",
          id: guide.guideId,
          displayName: guide.guideId,
          matchedPhrase: trimmed.match(hint.pattern)?.[0],
          placeId: guide.targetId,
        };
      }
    }
  }

  const experience = matchExperienceGroupFromQuery(trimmed);
  if (experience) {
    return {
      kind: "experience",
      id: experience.group.id,
      displayName: experience.group.experienceGroup,
      matchedPhrase: experience.matchedPhrase,
      choiceLocationIds: experience.locationIds,
    };
  }

  return empty;
}

export function targetKindSupportsNavigation(target: SemanticTarget): boolean {
  return (
    target.kind === "room" ||
    (target.kind === "object" && Boolean(target.parentLocationId))
  );
}

export function navigationTargetFromSemantic(target: SemanticTarget): SemanticTarget | null {
  if (target.kind === "room" && target.locationId) {
    return target;
  }
  if (target.kind === "object" && target.parentLocationId) {
    const location = getEstateLocationById(target.parentLocationId);
    if (!location) return null;
    return buildRoomTarget(
      target.parentLocationId,
      target.matchedPhrase ?? target.displayName ?? "that place",
      location.officialDisplayName,
    );
  }
  return null;
}

export function experienceChoicesForTarget(
  target: SemanticTarget,
): ReturnType<typeof toLocationOption>[] {
  if (target.kind !== "experience" || !target.choiceLocationIds?.length) {
    return [];
  }
  const max = 4;
  return locationOptionsForIds(target.choiceLocationIds).slice(0, max);
}
