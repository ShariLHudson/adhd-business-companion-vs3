import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

/** Ocean Conservatory™ — living aquarium scene (muted; ambience is separate). */
export const OCEAN_CONSERVATORY_VIDEO =
  "/Videos/aquarium-room-video.mp4" as const;

/** Poster / fallback while the aquarium video buffers. */
export const OCEAN_CONSERVATORY_POSTER = estateBackgroundPath(
  "aquarium-room-background.png",
);
