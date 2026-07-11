/**
 * Estate rooms that are never audio / sound / focus-environment destinations.
 * Evidence Vault is a preservation room — not Peaceful Places, Music Room, or wander audio.
 */

/** Canonical place ids that must never appear as sound or focus-audio destinations. */
export const ESTATE_NON_AUDIO_PLACE_IDS = new Set([
  "evidence-vault",
  "evidence-bank",
  "portfolio",
  "gallery-of-firsts",
  "growth-profile",
  "goals-projects",
  "momentum-builder",
  "momentum-institute",
  "institute-cabinet",
  "creative-studio",
  "round-table",
  "strategy-studio",
  "art-studio",
  "decision-compass",
  "observatory",
  "stables",
  "seeds-planted",
  "greenhouse",
  "journal",
  "growth-journal",
]);

/** Places where members listen — soundscapes, focus audio, gentle ambience. */
export const ESTATE_AUDIO_DESTINATION_PLACE_IDS = new Set([
  "music-room",
  "peaceful-places",
  "focus-audio",
  "reading-nook",
  "conservatory",
  "coffee-house",
  "clear-my-mind",
  "lakeside-hammock",
  "sunroom",
  "gardens",
  "estate-gardens",
  "greenhouse",
  "personal-library",
  "library",
  "woodland-path",
  "reflection-pond",
  "seat-at-pond",
  "back-deck",
  "fireside-deck",
  "porch-swing",
]);

export function normalizeEstatePlaceIdForAudio(placeId: string): string {
  if (placeId === "evidence-bank") return "evidence-vault";
  return placeId;
}

export function isEstateNonAudioPlace(placeId: string): boolean {
  const id = normalizeEstatePlaceIdForAudio(placeId);
  return ESTATE_NON_AUDIO_PLACE_IDS.has(id);
}

export function isEstateAudioDestinationPlace(placeId: string): boolean {
  const id = normalizeEstatePlaceIdForAudio(placeId);
  if (isEstateNonAudioPlace(id)) return false;
  return ESTATE_AUDIO_DESTINATION_PLACE_IDS.has(id);
}

export function filterPlacesForAudioContext(
  placeIds: readonly string[],
): string[] {
  return placeIds.filter((id) => !isEstateNonAudioPlace(id));
}
