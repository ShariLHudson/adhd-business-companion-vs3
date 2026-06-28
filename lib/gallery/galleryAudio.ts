/**
 * The Gallery™ — Hall of Reflections (Songer).
 * Source: https://songer.co/song/n4mxywv47fi61ovoo8994j55
 */

export const GALLERY_AMBIENCE_SRC =
  "/audio/gallery/hall-of-reflections.mp3" as const;

/** Soft room music when The Gallery opens — not background entertainment. */
export const GALLERY_AMBIENCE_VOLUME = 0.16 as const;

export const GALLERY_AMBIENCE_FADE_MS = 2200 as const;

export const GALLERY_AMBIENCE_LABELS = {
  music: "Music",
  musicOn: "Music on",
  unavailable: "Gallery music will play once audio is allowed.",
} as const;
