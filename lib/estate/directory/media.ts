/**
 * Estate Directory — background plates and ambience per place id.
 */

import type { CanonicalEstatePlace } from "../canonicalEstateRegistryTypes";
import {
  resolveCanonicalPlaceAmbience,
  resolveCanonicalPlaceBackground,
  resolveCanonicalPlaceBackgroundCandidates,
} from "../estatePlaceMedia";
import type { EstateLocationMedia } from "./types";

export function resolveEstateLocationMedia(
  place: CanonicalEstatePlace,
): EstateLocationMedia {
  const fromMap = resolveCanonicalPlaceBackground(place.id);
  const backgroundUrl = place.backgroundImage ?? fromMap ?? null;
  const candidates = resolveCanonicalPlaceBackgroundCandidates(place.id);
  const backgroundFallbacks =
    candidates.length > 0
      ? candidates
      : backgroundUrl
        ? [backgroundUrl]
        : [];

  return {
    backgroundUrl,
    backgroundFallbacks,
    ambience: resolveCanonicalPlaceAmbience(place.id),
  };
}
