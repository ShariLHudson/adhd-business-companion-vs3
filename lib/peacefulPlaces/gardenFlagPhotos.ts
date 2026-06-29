import { BEDROOM_WINDOW_IMAGE } from "./bedroomWindowPeacefulPlace";
import { COZY_CAFE_IMAGE } from "./cozyCafePeacefulPlace";
import { EAST_TERRACE_IMAGE } from "./eastTerracePeacefulPlace";
import { SUMMER_STORM_COVERED_DECK_BG } from "./summerStormCoveredDeck";
import type { EstateSignId } from "./signpostLayout";

export type GardenFlagPhoto = {
  src: string;
  /** object-position for cover crop */
  position: string;
  /** Label band tint — each flag reads a little different */
  band: string;
  labelColor: string;
};

/** Photographic fills for pathway garden flags — full-bleed, estate-native art. */
export const GARDEN_FLAG_PHOTOS: Record<EstateSignId, GardenFlagPhoto> = {
  focus: {
    src: COZY_CAFE_IMAGE,
    position: "center 62%",
    band: "rgba(62, 48, 38, 0.88)",
    labelColor: "#f8f2ea",
  },
  calming: {
    src: SUMMER_STORM_COVERED_DECK_BG,
    position: "center 45%",
    band: "rgba(42, 58, 52, 0.86)",
    labelColor: "#eef6f0",
  },
  energize: {
    src: EAST_TERRACE_IMAGE,
    position: "center 40%",
    band: "rgba(72, 58, 32, 0.88)",
    labelColor: "#fff8e8",
  },
  unwind: {
    src: BEDROOM_WINDOW_IMAGE,
    position: "center 48%",
    band: "rgba(48, 42, 68, 0.88)",
    labelColor: "#f0eaf8",
  },
  "my-places": {
    src: "/backgrounds/progress/background_10.png",
    position: "center 55%",
    band: "rgba(52, 62, 48, 0.88)",
    labelColor: "#f2f6ea",
  },
};

export function gardenFlagPhotoFor(id: EstateSignId): GardenFlagPhoto {
  return GARDEN_FLAG_PHOTOS[id];
}
