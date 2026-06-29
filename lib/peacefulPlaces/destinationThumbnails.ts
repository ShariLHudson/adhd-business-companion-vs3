import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";
import { BEDROOM_WINDOW_IMAGE } from "./bedroomWindowPeacefulPlace";
import { BRIGHT_STUDIO_IMAGE } from "./brightStudioPeacefulPlace";
import { COZY_CAFE_IMAGE } from "./cozyCafePeacefulPlace";
import { EAST_TERRACE_IMAGE } from "./eastTerracePeacefulPlace";
import { EVENING_HEARTH_IMAGE } from "./eveningHearthPeacefulPlace";
import { NATURE_ESCAPE_IMAGE } from "./natureEscapePeacefulPlace";
import { SUMMER_STORM_COVERED_DECK_BG } from "./summerStormCoveredDeck";
import { PEACEFUL_PLACES_PATHWAY_BG } from "./pathway";
import type { Soundscape } from "@/lib/soundscapes/types";

/** V1 estate thumbnails — future sprint may ship per-destination art. */
const DESTINATION_THUMBNAIL_BY_ID: Record<string, string> = {
  "summer-storm": SUMMER_STORM_COVERED_DECK_BG,
  "morning-garden": "/backgrounds/progress/serene-sunrise-bg.png",
  "ocean-waves": "/backgrounds/progress/blue-sky-clouds-bg.png",
  "fireside-retreat": "/backgrounds/evening/living-room-at-twilight-bg.png",
  "coffee-shop": COZY_CAFE_IMAGE,
  "quiet-library": "/backgrounds/focus/background_07.png",
  "airplane-cabin": "/backgrounds/focus/background_08.png",
  "brown-noise": "/backgrounds/focus/background_14.png",
  "deep-focus-piano": "/backgrounds/focus/background_15.png",
  "gentle-rain": BEDROOM_WINDOW_IMAGE,
  "fireplace-night": EVENING_HEARTH_IMAGE,
  "night-forest": "/backgrounds/recovery/background_09.png",
  "ocean-night": "/backgrounds/evening/night-bg.png",
  "nature-escape": NATURE_ESCAPE_IMAGE,
  "sunrise-terrace": EAST_TERRACE_IMAGE,
  "movement-studio": BRIGHT_STUDIO_IMAGE,
};

export const MY_PLACE_THUMBNAIL = CLEAR_MY_MIND_CONSERVATORY_BG;
export const DEFAULT_DESTINATION_THUMBNAIL = PEACEFUL_PLACES_PATHWAY_BG;

export function thumbnailForSoundscape(soundscape: Soundscape): string {
  if (soundscape.peacefulPlaceId === "summer-storm-covered-deck") {
    return SUMMER_STORM_COVERED_DECK_BG;
  }
  if (soundscape.peacefulPlaceId === "cozy-cafe") {
    return COZY_CAFE_IMAGE;
  }
  if (soundscape.peacefulPlaceId === "nature-escape") {
    return NATURE_ESCAPE_IMAGE;
  }
  if (soundscape.peacefulPlaceId === "east-terrace") {
    return EAST_TERRACE_IMAGE;
  }
  if (soundscape.peacefulPlaceId === "bright-studio") {
    return BRIGHT_STUDIO_IMAGE;
  }
  if (soundscape.peacefulPlaceId === "bedroom-window") {
    return BEDROOM_WINDOW_IMAGE;
  }
  if (soundscape.peacefulPlaceId === "evening-hearth") {
    return EVENING_HEARTH_IMAGE;
  }
  return DESTINATION_THUMBNAIL_BY_ID[soundscape.id] ?? DEFAULT_DESTINATION_THUMBNAIL;
}
