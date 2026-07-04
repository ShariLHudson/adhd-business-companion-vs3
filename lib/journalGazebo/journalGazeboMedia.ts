import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Full gazebo vista — design studio, workshop, and return visits. */
export const GAZEBO_JOURNAL_BACKGROUND_URL = estateBackgroundPath(
  "gazebo-journal-background.png",
);

/** First-visit welcome letter — letter on the gazebo desk. */
export const JOURNAL_WELCOME_PLATE_URL = estateBackgroundPath(
  "journal-gazebo-letter-background.png",
);

/**
 * Journal Gazebo plate — creation choices, gift, ceremony, return visits.
 * Asset: `public/backgrounds/gazebo-journal-background.png`
 */
export const JOURNAL_GAZEBO_SCENE_URL = GAZEBO_JOURNAL_BACKGROUND_URL;

/** @deprecated Use JOURNAL_GAZEBO_SCENE_URL */
export const JOURNAL_WORKSHOP_PLATE_URL = JOURNAL_GAZEBO_SCENE_URL;

/** Printed cover — white gazebo watercolor. */
export const JOURNAL_GAZEBO_COVER_ART_URL =
  "/images/journal-gazebo/gazebo-cover-watercolor.png";

/** Embossed estate — Old World printed cover art. */
export const JOURNAL_ESTATE_COVER_ART_URL = ESTATE_ROOM_BG.sparkEstatePhoto;
