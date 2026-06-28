import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";
import { COZY_CAFE_IMAGE } from "./cozyCafePeacefulPlace";
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
  "gentle-rain": SUMMER_STORM_COVERED_DECK_BG,
  "fireplace-night": "/backgrounds/evening/evening-bg.png",
  "night-forest": "/backgrounds/recovery/background_09.png",
  "ocean-night": "/backgrounds/evening/night-bg.png",
  "morning-momentum": "/backgrounds/today/morning-bg.png",
  "sunrise-terrace": "/backgrounds/today/afternoon-bg.png",
  "movement-studio": "/backgrounds/high-energy-bg.png",
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
  return DESTINATION_THUMBNAIL_BY_ID[soundscape.id] ?? DEFAULT_DESTINATION_THUMBNAIL;
}
