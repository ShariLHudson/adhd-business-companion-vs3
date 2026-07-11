import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

/** Ocean Conservatory — living aquarium scene (muted; ambience is separate). */
export const OCEAN_CONSERVATORY_VIDEO =
  "/Videos/aquarium-room-video.mp4" as const;

/**
 * Slower than real-time — stretches the short source loop so fish motion
 * and the seam feel calmer and less noticeable.
 */
export const OCEAN_CONSERVATORY_VIDEO_PLAYBACK_RATE = 0.65 as const;

/** Poster / fallback while the aquarium video buffers. */
export const OCEAN_CONSERVATORY_POSTER = estateBackgroundPath(
  "aquarium-room-background.png",
);
