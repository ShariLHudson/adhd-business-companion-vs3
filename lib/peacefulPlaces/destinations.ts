import { isYoutubeUrl } from "@/lib/focusAudio/youtubeEmbed";
import type { Soundscape, SoundscapeMoodId } from "@/lib/soundscapes/types";
import { SOUNDSCAPES } from "@/lib/soundscapes/catalog";
import { peacefulPlaceById } from "./registry";
import type {
  PeacefulPlaceCategoryId,
  PeacefulPlaceDestination,
} from "./destinationTypes";
import type { PeacefulPlaceId } from "./types";

const MOOD_TO_CATEGORY: Record<SoundscapeMoodId, PeacefulPlaceCategoryId> = {
  calming: "slowDown",
  focus: "focus",
  unwind: "unwind",
  energize: "recharge",
};

const DESTINATION_ID_BY_PLACE: Record<PeacefulPlaceId, string> = {
  "summer-storm-covered-deck": "covered-deck-summer-storm",
  "cozy-cafe": "cozy-cafe-coffee-shop",
  "nature-escape": "nature-escape-recharge",
  "east-terrace": "east-terrace-morning-whisper",
  "bright-studio": "bright-studio-movement-studio",
  "bedroom-window": "bedroom-window-gentle-rain",
  "evening-hearth": "evening-hearth-fireplace-night",
  "music-room": "music-room-deep-focus-piano",
};

function destinationIdForPlace(placeId: PeacefulPlaceId): string {
  return DESTINATION_ID_BY_PLACE[placeId] ?? placeId;
}

function audioTypeForUrl(url: string): PeacefulPlaceDestination["audioType"] {
  return isYoutubeUrl(url) ? "youtube" : "direct";
}

export function peacefulPlaceDestinationFromSoundscape(
  soundscape: Soundscape,
): PeacefulPlaceDestination | null {
  if (!soundscape.peacefulPlaceId) return null;

  const place = peacefulPlaceById(soundscape.peacefulPlaceId);
  if (!place) return null;

  return {
    id: destinationIdForPlace(place.id),
    category: MOOD_TO_CATEGORY[soundscape.mood],
    placeName: soundscape.destinationName,
    experienceName: soundscape.experience ?? soundscape.title,
    imageSrc: place.backgroundImageUrl,
    audioSrc: soundscape.playbackUrl,
    audioType: audioTypeForUrl(soundscape.playbackUrl),
    enabled: true,
    placeId: place.id,
    soundscapeId: soundscape.id,
  };
}

export function peacefulPlaceDestinationById(
  id: string,
): PeacefulPlaceDestination | null {
  for (const soundscape of SOUNDSCAPES) {
    const destination = peacefulPlaceDestinationFromSoundscape(soundscape);
    if (destination?.id === id) return destination;
  }
  return null;
}

export function peacefulPlaceDestinationBySoundscapeId(
  soundscapeId: string,
): PeacefulPlaceDestination | null {
  const soundscape = SOUNDSCAPES.find((item) => item.id === soundscapeId);
  if (!soundscape) return null;
  return peacefulPlaceDestinationFromSoundscape(soundscape);
}

export const PEACEFUL_PLACE_DESTINATIONS: readonly PeacefulPlaceDestination[] =
  SOUNDSCAPES.flatMap((soundscape) => {
    const destination = peacefulPlaceDestinationFromSoundscape(soundscape);
    return destination ? [destination] : [];
  });
