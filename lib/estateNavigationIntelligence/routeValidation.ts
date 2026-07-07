/**
 * Route validation — never navigate to Draft, Future, Hidden, or Retired destinations.
 */

import { goToPlace } from "@/lib/estate/goToPlace";
import { getEstateAssetByFileName } from "@/lib/estateKnowledgeBase/estateAssets";
import {
  getEstateLocationById,
  isRecommendableEstateLocation,
  toLocationOption,
} from "@/lib/estateKnowledgeBase/estateLocations";
import type { ValidatedNavigationTarget } from "./types";

export type RouteValidationFailureCode =
  | "unknown_location"
  | "not_live"
  | "missing_asset"
  | "not_navigable";

export type RouteValidationResult =
  | { ok: true; target: ValidatedNavigationTarget }
  | { ok: false; locationId: string; code: RouteValidationFailureCode };

export function validateEstateNavigationTarget(
  locationId: string,
): RouteValidationResult {
  const location = getEstateLocationById(locationId);
  if (!location) {
    return { ok: false, locationId, code: "unknown_location" };
  }

  if (!isRecommendableEstateLocation(location)) {
    return { ok: false, locationId, code: "not_live" };
  }

  const asset = getEstateAssetByFileName(location.primaryAssetFileName);
  if (!asset) {
    return { ok: false, locationId, code: "missing_asset" };
  }

  const placeId = location.canonicalPlaceId || location.locationId;
  const nav = goToPlace({ placeId });
  if (!nav.ok) {
    return { ok: false, locationId, code: "not_navigable" };
  }

  return {
    ok: true,
    target: {
      locationId: location.locationId,
      placeId: nav.placeId,
      option: toLocationOption(location),
    },
  };
}

export function filterValidatedNavigationTargets(
  locationIds: readonly string[],
): ValidatedNavigationTarget[] {
  const targets: ValidatedNavigationTarget[] = [];

  for (const locationId of locationIds) {
    const result = validateEstateNavigationTarget(locationId);
    if (result.ok) targets.push(result.target);
  }

  return targets;
}
