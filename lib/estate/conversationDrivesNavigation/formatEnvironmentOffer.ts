/**
 * Hospitality copy for environment offers — canonical names only.
 */

import { getCanonicalEstatePlaceById } from "../canonicalEstateRegistry";
import { canonicalPlaceSuggestionBlurb } from "../estatePlaceIdentityLock";
import { ENVIRONMENT_NEED_MAX_SUGGESTIONS } from "./types";

export const ENVIRONMENT_OFFER_CLOSER =
  "Say a number or name, stay here and keep talking, or ask to see the Estate map.";

export function formatEnvironmentPlaceOffer(
  intro: string,
  placeIds: readonly string[],
): string {
  const places = placeIds
    .map((id) => getCanonicalEstatePlaceById(id))
    .filter((place): place is NonNullable<typeof place> => Boolean(place))
    .slice(0, ENVIRONMENT_NEED_MAX_SUGGESTIONS);

  if (!places.length) {
    return "We can stay right here — or name a place from the Estate map when you're ready.";
  }

  const lines = places.map((place, index) => {
    const blurb = canonicalPlaceSuggestionBlurb(
      place.id,
      place.primaryFeeling,
    );
    return `${index + 1}. ${place.officialName} — ${blurb}`;
  });

  return `${intro}\n${lines.join("\n")}\n${ENVIRONMENT_OFFER_CLOSER}`;
}
