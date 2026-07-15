import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Bust cache when desk or welcome plates change. */
export const JOURNAL_DESK_BACKGROUND_VERSION = "20260714d" as const;

/** First visit — desk plate with the baked welcome letter. */
export const JOURNAL_GAZEBO_BACKGROUND_URL =
  `/backgrounds/journal-desk-background.png?v=${JOURNAL_DESK_BACKGROUND_VERSION}` as const;

/**
 * Return visits — same gazebo desk with the welcome letter removed
 * so Create / Write never share the frame with first-visit stationery.
 */
export const JOURNAL_GAZEBO_RETURN_BACKGROUND_URL =
  `/backgrounds/journal-desk-return-background.png?v=${JOURNAL_DESK_BACKGROUND_VERSION}` as const;

/** Alias — prefer framing helpers in journalSceneRotation for visit-specific plates. */
export const GAZEBO_JOURNAL_BACKGROUND_URL = JOURNAL_GAZEBO_BACKGROUND_URL;

/**
 * Alternate welcome plate (letter + props). Prefer JOURNAL_GAZEBO_BACKGROUND_URL
 * for first visit so baked Create/Open buttons from this asset are never shown.
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

/** Soft page-corner watermark — gazebo only, feathered edges (no square frame). */
export const JOURNAL_GAZEBO_PAGE_WATERMARK_URL =
  "/images/journal-gazebo/page-watermarks/gazebo.png";

/** Rotating Estate place watermarks live in `pageWatermarks.ts`. */

/** Embossed estate — Old World printed cover art. */
export const JOURNAL_ESTATE_COVER_ART_URL = ESTATE_ROOM_BG.sparkEstatePhoto;
