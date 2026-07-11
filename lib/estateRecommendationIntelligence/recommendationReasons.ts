/**
 * Estate recommendation reasons — why a place fits right now.
 */

import { filterPlacesForAudioContext } from "@/lib/estate/estateNonAudioPlaces";
import recommendationReasonsJson from "@/docs/estate-knowledge-base/estate-recommendation-reasons.json";
import {
  getEstateLocationById,
  toLocationOption,
} from "@/lib/estateKnowledgeBase/estateLocations";
import { validateEstateNavigationTarget } from "@/lib/estateNavigationIntelligence/routeValidation";
import type {
  EstateRecommendationChoice,
  EstateRecommendationContext,
  EstateRecommendationReason,
} from "./types";

type RecommendationReasonsFile = {
  reasons: EstateRecommendationReason[];
};

const FILE = recommendationReasonsJson as RecommendationReasonsFile;

export function getRecommendationReasons(): EstateRecommendationReason[] {
  return FILE.reasons;
}

export function getReasonsForSignal(
  signalId: string,
): EstateRecommendationReason[] {
  return FILE.reasons
    .filter((reason) => reason.signalId === signalId && reason.status === "Live")
    .sort((a, b) => a.priority - b.priority);
}

function isDeprioritized(
  locationId: string,
  context: EstateRecommendationContext,
): boolean {
  if (context.currentLocationId === locationId) return true;
  return context.recentLocationIds?.includes(locationId) ?? false;
}

export function buildRecommendationChoices(
  signalId: string,
  context: EstateRecommendationContext = {},
  maxChoices = 3,
): EstateRecommendationChoice[] {
  const reasons = getReasonsForSignal(signalId);
  const choices: EstateRecommendationChoice[] = [];

  for (const reason of reasons) {
    if (choices.length >= maxChoices) break;
    if (isDeprioritized(reason.locationId, context)) continue;
    if (
      (signalId === "need-focus" || signalId === "need-quiet") &&
      filterPlacesForAudioContext([reason.locationId]).length === 0
    ) {
      continue;
    }

    const validation = validateEstateNavigationTarget(reason.locationId);
    if (!validation.ok) continue;

    const location = getEstateLocationById(reason.locationId);
    if (!location) continue;

    const option = toLocationOption(location);
    choices.push({
      locationId: reason.locationId,
      placeId: validation.target.placeId,
      officialDisplayName: option.officialDisplayName,
      memberFacingHint: option.memberFacingHint,
      whyNow: reason.whyNow,
    });
  }

  if (choices.length === 0) {
    for (const reason of reasons) {
      if (choices.length >= maxChoices) break;
      const validation = validateEstateNavigationTarget(reason.locationId);
      if (!validation.ok) continue;
      const location = getEstateLocationById(reason.locationId);
      if (!location) continue;
      const option = toLocationOption(location);
      choices.push({
        locationId: reason.locationId,
        placeId: validation.target.placeId,
        officialDisplayName: option.officialDisplayName,
        memberFacingHint: option.memberFacingHint,
        whyNow: reason.whyNow,
      });
    }
  }

  return choices;
}
