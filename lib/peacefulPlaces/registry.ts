import { BEDROOM_WINDOW } from "./bedroomWindowPeacefulPlace";
import { BRIGHT_STUDIO } from "./brightStudioPeacefulPlace";
import { COZY_CAFE } from "./cozyCafePeacefulPlace";
import { EAST_TERRACE } from "./eastTerracePeacefulPlace";
import { EVENING_HEARTH } from "./eveningHearthPeacefulPlace";
import { MUSIC_ROOM } from "./musicRoomPeacefulPlace";
import { NATURE_ESCAPE } from "./natureEscapePeacefulPlace";
import { SUMMER_STORM_COVERED_DECK } from "./summerStormCoveredDeck";
import type { PeacefulPlace, PeacefulPlaceId } from "./types";

export const PEACEFUL_PLACES: readonly PeacefulPlace[] = [
  SUMMER_STORM_COVERED_DECK,
  COZY_CAFE,
  NATURE_ESCAPE,
  EAST_TERRACE,
  BRIGHT_STUDIO,
  BEDROOM_WINDOW,
  EVENING_HEARTH,
] as const;

const BY_ID = new Map<PeacefulPlaceId, PeacefulPlace>(
  PEACEFUL_PLACES.map((place) => [place.id, place]),
);

const BY_SOUNDSCAPE = new Map<string, PeacefulPlace>(
  PEACEFUL_PLACES.map((place) => [place.soundscapeId, place]),
);

export function peacefulPlaceById(id: PeacefulPlaceId): PeacefulPlace | null {
  return BY_ID.get(id) ?? null;
}

export function peacefulPlaceForSoundscape(
  soundscapeId: string,
): PeacefulPlace | null {
  return BY_SOUNDSCAPE.get(soundscapeId) ?? null;
}

export function signaturePeacefulPlace(): PeacefulPlace {
  const signature = PEACEFUL_PLACES.find((place) => place.signature);
  if (!signature) {
    return SUMMER_STORM_COVERED_DECK;
  }
  return signature;
}
