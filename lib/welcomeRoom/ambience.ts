/**
 * Welcome Room optional sunroom ambience — Shari (Songer), stored locally.
 */

export const WELCOME_ROOM_AMBIENCE_SRC =
  "/audio/welcome-room/welcome-room-ambience.mp3" as const;

export const WELCOME_ROOM_AMBIENCE_CREDIT =
  "Sunroom music by Shari — created in Songer" as const;

/** Target playback — 15–20%, like music elsewhere in the house. */
export const WELCOME_ROOM_AMBIENCE_VOLUME = 0.17 as const;

/** Volume while Shari is speaking. */
export const WELCOME_ROOM_AMBIENCE_DUCK_VOLUME = 0.05 as const;

/** Volume while Shari pauses — slightly raised. */
export const WELCOME_ROOM_AMBIENCE_PAUSE_VOLUME = 0.1 as const;

export const WELCOME_ROOM_AMBIENCE_FADE_MS = 2000 as const;

export const WELCOME_ROOM_AMBIENCE_RESTORE_MS = 2000 as const;

export const WELCOME_ROOM_AMBIENCE_LABELS = {
  off: "🔊 Room Ambience",
  on: "🔊 Room Ambience On",
  mute: "🔇 Mute Music",
  unavailable: "Room ambience unavailable",
} as const;
