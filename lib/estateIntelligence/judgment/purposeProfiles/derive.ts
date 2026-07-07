/**
 * Derive purpose profiles from registry facts + optional overrides.
 */

import {
  getEstateKnowledgeRegistry,
  getPlaceById,
} from "@/lib/estateKnowledge";
import type { EstateKnowledgePlaceEntry } from "@/lib/estateKnowledge";
import type {
  EstateDiscoveryLevel,
  EstateEnergyLevel,
  EstatePurposeProfile,
} from "../types";
import { ESTATE_PURPOSE_PROFILE_OVERRIDES } from "./overrides";

function inferEnergy(place: EstateKnowledgePlaceEntry): EstateEnergyLevel {
  const groups = place.groups.join(" ");
  if (
    groups.includes("need:rest") ||
    groups.includes("need:overwhelmed") ||
    groups.includes("need:quiet") ||
    groups.includes("water") ||
    groups.includes("recover")
  ) {
    return "low";
  }
  if (
    groups.includes("need:creative") ||
    groups.includes("need:play") ||
    place.category === "destination" &&
      place.id.includes("momentum")
  ) {
    return "high";
  }
  return "medium";
}

function inferDiscoveryLevel(
  place: EstateKnowledgePlaceEntry,
): EstateDiscoveryLevel {
  if (place.status === "hidden" || place.canonicalStatus === "planned") {
    return place.guidebook ? "gentle" : "hidden";
  }
  if (place.status === "broken") return "gentle";
  if (place.canonicalStatus === "live") return "featured";
  if (place.offeredInWanderMenu) return "familiar";
  return "gentle";
}

function inferVisitMinutes(
  energy: EstateEnergyLevel,
): EstatePurposeProfile["recommendedVisitMinutes"] {
  if (energy === "low") return { min: 10, max: 30 };
  if (energy === "high") return { min: 30, max: 90 };
  return { min: 15, max: 45 };
}

function splitFeelings(primaryFeeling: string): string[] {
  return primaryFeeling
    .split(/[,;]|\band\b/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function deriveFromRegistry(
  place: EstateKnowledgePlaceEntry,
): Omit<EstatePurposeProfile, "placeId"> {
  const feelings = splitFeelings(place.primaryFeeling);
  const energy = inferEnergy(place);
  return {
    displayName: place.displayName,
    purpose: place.purpose ?? place.primaryFeeling,
    primaryFeeling: feelings[0] ?? place.primaryFeeling,
    secondaryFeelings: feelings.slice(1),
    energyLevel: energy,
    idealActivities:
      place.activities.length > 0
        ? place.activities
        : ["Quiet presence", "Conversation"],
    conversationStyle: "gentle",
    recommendedVisitMinutes: inferVisitMinutes(energy),
    bestFor: place.emotionalUses.slice(0, 5),
    notRecommendedFor: [],
    relatedPlaceIds: place.relatedPlaces,
    musicRecommendations: place.media.audio
      ? [place.media.audio.character ?? "Room ambience"]
      : [],
    featureRecommendations: [],
    discoveryLevel: inferDiscoveryLevel(place),
  };
}

export function getPurposeProfile(placeId: string): EstatePurposeProfile {
  const place = getPlaceById(placeId);
  if (!place) {
    throw new Error(`Unknown place for purpose profile: ${placeId}`);
  }

  const override = ESTATE_PURPOSE_PROFILE_OVERRIDES[placeId];
  const derived = deriveFromRegistry(place);

  if (!override) {
    return { placeId, ...derived };
  }

  return {
    placeId,
    displayName: place.displayName,
    purpose: override.purpose,
    primaryFeeling: override.primaryFeeling,
    secondaryFeelings: override.secondaryFeelings,
    energyLevel: override.energyLevel,
    idealActivities: override.idealActivities,
    conversationStyle: override.conversationStyle,
    recommendedVisitMinutes: override.recommendedVisitMinutes,
    bestFor: override.bestFor,
    notRecommendedFor: override.notRecommendedFor,
    relatedPlaceIds: override.relatedPlaceIds,
    musicRecommendations: override.musicRecommendations,
    featureRecommendations: override.featureRecommendations,
    discoveryLevel: override.discoveryLevel,
  };
}

export function getAllPurposeProfiles(): EstatePurposeProfile[] {
  return getEstateKnowledgeRegistry().places.map((p) =>
    getPurposeProfile(p.id),
  );
}
