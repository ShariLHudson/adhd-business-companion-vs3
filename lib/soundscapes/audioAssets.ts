/** Owned ambience loops — no YouTube dependency. */

/** Canonical Soundscapes folder for master inventory plates (#181). */
export const SOUNDSCAPES_AUDIO_DIR = "/audio/Soundscapes" as const;

/** Coffee House — room-named loop (preferred). Lives in peaceful-places, not Soundscapes. */
export const COFFEE_HOUSE_AMBIENCE_MP3 =
  "/audio/peaceful-places/java-seranade-coffee-house.mp3" as const;

export const COFFEE_SHOP_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/coffee-shop-chatter-audio.mp3` as const;

export const TIN_ROOF_RAIN_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/gentle_rain_on_a_tin.mp3` as const;

/** Music Loft ambience — Morning Momentum (Songer). Also plays in Focus → Music Room. */
export const MUSIC_LOFT_AMBIENCE_MP3 =
  "/audio/peaceful-places/lofty-studio.mp3" as const;

/** East Terrace — Morning Whisper in the Garden (Songer). */
export const EAST_TERRACE_AMBIENCE_MP3 =
  "/audio/peaceful-places/morning-whisper.mp3" as const;

/** Bright Studio — Movement Studio (Songer). */
export const BRIGHT_STUDIO_AMBIENCE_MP3 =
  "/audio/peaceful-places/bright-studio.mp3" as const;

/** Bedroom Window — Gentle Rain (Songer). */
export const BEDROOM_WINDOW_AMBIENCE_MP3 =
  "/audio/peaceful-places/nightime-melody.mp3" as const;

/** Evening Hearth — Fireplace at Night (Songer). */
export const EVENING_HEARTH_AMBIENCE_MP3 =
  "/audio/peaceful-places/evening-hearth.mp3" as const;

/** Welcome Room — warm indoor hearth ambience. */
export const WELCOME_ROOM_AMBIENCE_MP3 =
  "/audio/welcome-room/welcome-room-ambience.mp3" as const;

/** Gallery — Hall of Reflections (still water, nature hush). File lives in peaceful-places, not gallery/. */
export const HALL_OF_REFLECTIONS_AMBIENCE_MP3 =
  "/audio/peaceful-places/hall-of-reflections.mp3" as const;

/** Gazebo / Journal — water fountain hush. */
export const GAZEBO_JOURNAL_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/water-fountain.mp3` as const;

/** Orchard / pond edge birds — Apple Orchard, garden path, seat-at-pond. */
export const ORCHARD_BIRDS_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/birds-singing-in-early-summer.mp3` as const;

/** Apple Orchard — same birds loop as orchard edge (canonical place identity). */
export const APPLE_ORCHARD_AMBIENCE_MP3 = ORCHARD_BIRDS_AMBIENCE_MP3;

/** Greenhouse / Growth Profile — early summer birds (cleaned loop). */
export const GREENHOUSE_BIRDS_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/greenhouse-birds-ambience.mp3` as const;

/** Ocean Conservatory — indoor aquarium hush. */
export const OCEAN_CONSERVATORY_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/aquarium bubbles.mp3` as const;

/**
 * Celebration Room / garden — reflections of triumph.
 * On-disk plate is named `reflections-of-triumph.mp3` (not the
 * `-celebration-garden` suffix originally referenced here).
 */
export const CELEBRATION_ROOM_AMBIENCE_MP3 =
  "/audio/peaceful-places/reflections-of-triumph.mp3" as const;

/**
 * Library / institute / gallery study hush.
 * On-disk plate is named `reflections-of-victory.mp3` (not the
 * `-gallery` suffix originally referenced here) — the second Songer
 * "Reflections" instrumental, distinct from the Celebration Garden loop.
 */
export const GALLERY_REFLECTIONS_AMBIENCE_MP3 =
  "/audio/peaceful-places/reflections-of-victory.mp3" as const;

/** Exercise Room / Game Room — Pulse of Momentum energy loop. */
export const EXERCISE_ROOM_AMBIENCE_MP3 =
  "/audio/peaceful-places/pulse-of-momentum-energy-exercise-room.mp3" as const;

/** Swimming Pool — Evening Reflections (Songer / inventory AUD-007). */
export const SWIMMING_POOL_AMBIENCE_MP3 =
  "/audio/peaceful-places/evening-reflections.mp3" as const;

/** Any Scene — A Minute of Peace (inventory AUD-008). */
export const MINUTE_OF_PEACE_AMBIENCE_MP3 =
  `${SOUNDSCAPES_AUDIO_DIR}/bird-song.mp3` as const;

/** When a room plate is not yet on disk — garden fountain hush. */
export const ESTATE_AMBIENCE_FALLBACK_MP3 = GAZEBO_JOURNAL_AMBIENCE_MP3;
