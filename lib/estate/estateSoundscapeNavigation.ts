/**
 * Estate Soundscapes™ — PATH B audio-only navigation (never physical places).
 */

import {
  detectAudioRequest,
  isRhetoricalSoundUsage,
} from "@/lib/audioSuggestions";
import { messageNamesExactEstateRoom } from "./estateRoomAliasRegistry";
import { isPhysicalQuietPlaceRequest } from "./resolveEstatePlace";

export const ESTATE_SOUNDSCAPES_PLACE_ID = "estate-soundscapes";

const HARD_NAV_RE =
  /\b(?:take me to|go to|visit|head to|bring me to|let(?:'s| us) go to)\b/i;

/** Music / audio / soundscape requests — not physical Estate places. */
export function isEstateSoundscapeNavigationRequest(text: string): boolean {
  const t = text.trim();
  if (!t || isRhetoricalSoundUsage(t)) return false;
  if (isPhysicalQuietPlaceRequest(t)) return false;

  if (
    HARD_NAV_RE.test(t) &&
    messageNamesExactEstateRoom(t) &&
    !/\b(?:soundscapes?|estate soundscapes?)\b/i.test(t)
  ) {
    return false;
  }

  if (
    /\b(?:take me to|go to|visit|head to|open)\b/i.test(t) &&
    /\b(?:soundscapes?|estate soundscapes?)\b/i.test(t)
  ) {
    return true;
  }

  if (
    /\b(?:take me to|go to|visit)\b/i.test(t) &&
    !/\b(?:music|audio|sound|soundscape|listen|play)\b/i.test(t)
  ) {
    return false;
  }

  return detectAudioRequest(t).isAudio;
}
