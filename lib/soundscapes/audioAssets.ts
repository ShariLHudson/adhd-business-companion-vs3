/** Owned ambience loops — no YouTube dependency. */

/** Coffee House™ — room-named loop (preferred). */
export const COFFEE_HOUSE_AMBIENCE_MP3 =
  "/audio/java-seranade-coffee-house.mp3" as const;

export const COFFEE_SHOP_AMBIENCE_MP3 =
  "/audio/AMBRest-Quiet_coffee_shop_am-Elevenlabs.mp3" as const;

export const TIN_ROOF_RAIN_AMBIENCE_MP3 =
  "/audio/RAINMetl-Gentle_rain_on_a_tin-Elevenlabs.mp3" as const;

/** Music Loft™ ambience — Morning Momentum (Songer). Also plays in Focus → Music Room. */
export const MUSIC_LOFT_AMBIENCE_MP3 =
  "/audio/peaceful-places/music-loft-ambience.mp3" as const;

/** East Terrace™ — Morning Whisper in the Garden (Songer). Source: songer.co/song/khxe3s8si94k1pnkgixr5bw6 */
export const EAST_TERRACE_AMBIENCE_MP3 =
  "/audio/peaceful-places/east-terrace-morning-whisper.mp3" as const;

/** Bright Studio™ — Movement Studio (Songer). Source: songer.co/song/ux81ctn5va8keal0p0bicgwy */
export const BRIGHT_STUDIO_AMBIENCE_MP3 =
  "/audio/peaceful-places/bright-studio-ambience.mp3" as const;

/** Bedroom Window™ — Gentle Rain (Songer). Source: songer.co/song/xww1safasfl7vavpicfkabdx */
export const BEDROOM_WINDOW_AMBIENCE_MP3 =
  "/audio/peaceful-places/bedroom-window-ambience.mp3" as const;

/** Evening Hearth™ — Fireplace at Night (Songer). Source: songer.co/song/d68o1fbz1lgaplvwovrmamwa */
export const EVENING_HEARTH_AMBIENCE_MP3 =
  "/audio/peaceful-places/evening-hearth-ambience.mp3" as const;

/** Welcome Room — warm indoor hearth ambience. */
export const WELCOME_ROOM_AMBIENCE_MP3 =
  "/audio/welcome-room/welcome-room-ambience.mp3" as const;

/** Gallery — Hall of Reflections (still water, nature hush). */
export const HALL_OF_REFLECTIONS_AMBIENCE_MP3 =
  "/audio/gallery/hall-of-reflections.mp3" as const;

/** Gazebo / Journal™ — Mustique water fountain (Freesound Community). */
export const GAZEBO_JOURNAL_AMBIENCE_MP3 =
  "/audio/freesound_community-mustique-water-fountain-27721.mp3" as const;

/** Orchard / pond edge birds — Apple Orchard™, garden path, seat-at-pond. */
export const ORCHARD_BIRDS_AMBIENCE_MP3 =
  "/audio/nils_vega-birds-singing-in-early-summer-359446.mp3" as const;

/** Apple Orchard™ — same birds loop as orchard edge (canonical place identity). */
export const APPLE_ORCHARD_AMBIENCE_MP3 = ORCHARD_BIRDS_AMBIENCE_MP3;

/** Greenhouse™ / Growth Profile™ — early summer birds (cleaned loop). */
export const GREENHOUSE_BIRDS_AMBIENCE_MP3 =
  "/audio/greenhouse-birds-ambience.mp3" as const;

/** Celebration Room™ / garden — reflections of triumph. */
export const CELEBRATION_ROOM_AMBIENCE_MP3 =
  "/audio/reflections-of-triumph-celebration-garden.mp3" as const;

/** Library / institute / gallery study hush. */
export const GALLERY_REFLECTIONS_AMBIENCE_MP3 =
  "/audio/reflections-of-triumph-gallery.mp3" as const;

/** Exercise Room™ / Game Room™ — Pulse of Momentum energy loop. */
export const EXERCISE_ROOM_AMBIENCE_MP3 =
  "/audio/pulse-of-momentum-energy-exercise-room.mp3" as const;

/** When a room plate is not yet on disk — garden fountain hush. */
export const ESTATE_AMBIENCE_FALLBACK_MP3 = GAZEBO_JOURNAL_AMBIENCE_MP3;
