/**
 * Object phrase + navigate verb → parent live location navigation.
 */

import { matchObjectAlias } from "@/lib/estateObjectIntelligence/objectAliases";
import { getEstateObjectById } from "@/lib/estateObjectIntelligence/estateObjects";
import { selectPlacementForContext } from "@/lib/estateObjectIntelligence/objectLocations";
import {
  getEstateLocationById,
  isRecommendableEstateLocation,
} from "@/lib/estateKnowledgeBase/estateLocations";
import { filterValidatedNavigationTargets } from "@/lib/estateNavigationIntelligence/routeValidation";
import { resolveParentLocationId } from "./locationAreas";

const OBJECT_NAVIGATE_RE =
  /\b(?:take me to|go to|visit|bring me to|head to|show me)\b/i;

export type ObjectNavigationTarget = {
  placeId: string;
  locationId: string;
  displayName: string;
  objectName: string;
};

function resolveLiveNavigationTarget(locationId: string): ObjectNavigationTarget | null {
  const validated = filterValidatedNavigationTargets([locationId]);
  if (validated[0]) {
    const loc = getEstateLocationById(validated[0].locationId);
    return {
      placeId: validated[0].placeId,
      locationId: validated[0].locationId,
      displayName: loc?.officialDisplayName?.replace(/\u2122/g, "") ?? validated[0].locationId,
      objectName: "",
    };
  }

  const parentId = resolveParentLocationId(locationId);
  if (parentId !== locationId) {
    const parentValidated = filterValidatedNavigationTargets([parentId]);
    if (parentValidated[0]) {
      const loc = getEstateLocationById(parentValidated[0].locationId);
      return {
        placeId: parentValidated[0].placeId,
        locationId: parentValidated[0].locationId,
        displayName: loc?.officialDisplayName?.replace(/\u2122/g, "") ?? parentValidated[0].locationId,
        objectName: "",
      };
    }
  }

  const loc = getEstateLocationById(locationId);
  if (loc && isRecommendableEstateLocation(loc)) {
    return {
      placeId: loc.canonicalPlaceId ?? loc.locationId,
      locationId: loc.locationId,
      displayName: loc.officialDisplayName.replace(/\u2122/g, ""),
      objectName: "",
    };
  }

  return null;
}

export function resolveObjectNavigationTarget(
  userText: string,
  currentLocationId?: string | null,
): ObjectNavigationTarget | null {
  const t = userText.trim();
  if (!t || !OBJECT_NAVIGATE_RE.test(t)) return null;

  const alias = matchObjectAlias(t);
  if (!alias) return null;

  const object = getEstateObjectById(alias.objectId);
  if (!object) return null;

  const placement = selectPlacementForContext(
    alias.objectId,
    currentLocationId ?? undefined,
  );
  const locationId =
    placement?.locationId ?? object.appearsInLocations?.[0] ?? null;
  if (!locationId) return null;

  const target = resolveLiveNavigationTarget(locationId);
  if (!target) return null;

  return {
    ...target,
    objectName: object.officialName,
  };
}
