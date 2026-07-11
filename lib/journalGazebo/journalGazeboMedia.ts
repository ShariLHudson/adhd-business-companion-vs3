import { CANONICAL_PLACE_BACKGROUNDS } from "@/lib/estate/estatePlaceMedia";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Bust cache when desk or welcome plates change. */
export const JOURNAL_DESK_BACKGROUND_VERSION = "20260710b" as const;

/** Return visits — clean desk without the welcome letter (`journal-desk-background.png`). */
export const JOURNAL_GAZEBO_BACKGROUND_URL =
  CANONICAL_PLACE_BACKGROUNDS.journal;

/** Full gazebo vista — design studio, workshop, and return visits. */
export const GAZEBO_JOURNAL_BACKGROUND_URL = JOURNAL_GAZEBO_BACKGROUND_URL;

/**
 * First visit only — welcome letter baked into the plate
 * (`public/images/welcome-to-the-journal-gazebo.png`).
 */
export const JOURNAL_WELCOME_PLATE_URL =
  `/images/welcome-to-the-journal-gazebo.png?v=${JOURNAL_DESK_BACKGROUND_VERSION}` as const;

/**
 * Journal Gazebo plate — creation choices, gift, ceremony, return visits.
 */
export const JOURNAL_GAZEBO_SCENE_URL = JOURNAL_GAZEBO_BACKGROUND_URL;

/** @deprecated Use JOURNAL_GAZEBO_SCENE_URL */
export const JOURNAL_WORKSHOP_PLATE_URL = JOURNAL_GAZEBO_SCENE_URL;

/** Printed cover — white gazebo watercolor. */
export const JOURNAL_GAZEBO_COVER_ART_URL =
  "/images/journal-gazebo/gazebo-cover-watercolor.png";

/** Embossed estate — Old World printed cover art. */
export const JOURNAL_ESTATE_COVER_ART_URL = ESTATE_ROOM_BG.sparkEstatePhoto;
