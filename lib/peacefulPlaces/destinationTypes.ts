import type { PeacefulPlaceId } from "./types";

/** User-facing estate category — maps from soundscape mood ids. */
export type PeacefulPlaceCategoryId =
  | "slowDown"
  | "focus"
  | "unwind"
  | "recharge";

export type PeacefulPlaceAudioType = "youtube" | "direct";

/**
 * Phase 1 — one object per immersive destination.
 * Image and ambient audio are entered together; never separate actions.
 */
export type PeacefulPlaceDestination = {
  id: string;
  category: PeacefulPlaceCategoryId;
  placeName: string;
  experienceName: string;
  imageSrc: string;
  audioSrc: string;
  audioType: PeacefulPlaceAudioType;
  enabled: boolean;
  /** Extended session copy + V2 metadata */
  placeId: PeacefulPlaceId;
  soundscapeId: string;
};
