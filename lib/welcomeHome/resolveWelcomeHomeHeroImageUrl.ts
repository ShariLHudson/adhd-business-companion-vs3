import {
  getRoomBackdropImageUrl,
  getRoomBackdropOverrideId,
} from "@/lib/chatBackdrop/chatBackdropPreference";
import { WELCOME_HOME_BACKGROUND } from "@/lib/welcomeRoom/types";
import {
  resolveEstateBackground,
  type EstateBackgroundResolution,
} from "@/lib/estate/resolveEstateBackground";

const WELCOME_HOME_PLACE = "welcome-home";

/**
 * Welcome Home lobby photograph, resolved through resolveEstateBackground().
 * memberChoice is scoped to the welcome-home room override ONLY — never the
 * general chat backdrop or the Clear My Mind preference. Welcome Home has no
 * dedicated-experience lock and no genuine room requirement, so this is the
 * simplest possible live adopter: member choice, else the default lobby plate.
 */
export function resolveWelcomeHomeBackground(): EstateBackgroundResolution {
  const overrideId = getRoomBackdropOverrideId(WELCOME_HOME_PLACE);
  const overrideImageUrl = overrideId
    ? getRoomBackdropImageUrl(WELCOME_HOME_PLACE)
    : null;

  return resolveEstateBackground({
    place: WELCOME_HOME_PLACE,
    memberChoice:
      overrideId && overrideImageUrl
        ? { backgroundId: overrideId, imageUrl: overrideImageUrl }
        : null,
    roomRequired: null,
    default: {
      backgroundId: WELCOME_HOME_PLACE,
      imageUrl: WELCOME_HOME_BACKGROUND,
    },
  });
}

/**
 * Welcome Home lobby photograph — room-specific override only.
 * Never falls back to global everyday-chat backdrop (e.g. Fireside Deck).
 */
export function resolveWelcomeHomeHeroImageUrl(): string {
  return resolveWelcomeHomeBackground().imageUrl;
}
