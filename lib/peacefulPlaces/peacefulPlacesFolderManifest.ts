/** Every owned music title in public/audio/peaceful-places. */
export const PEACEFUL_PLACES_AUDIO_DIR = "/audio/peaceful-places" as const;

export const PEACEFUL_PLACES_FOLDER_FILENAMES = [
  "bright-studio.mp3",
  "catalyst-of-joy.mp3",
  "dawn-of-new-horizons.mp3",
  "energize-the-day.mp3",
  "evening-hearth.mp3",
  "evening-reflections.mp3",
  "hall-of-reflections.mp3",
  "java-seranade-coffee-house.mp3",
  "lofty-studio.mp3",
  "momentum-unleashed.mp3",
  "morning-whisper.mp3",
  "nightime-melody.mp3",
  "pulse-of-momentum-energy-exercise-room.mp3",
  "pulse-of-momentum-energy.mp3",
  "radiant-horizons.mp3",
  "reflections-of-triumph.mp3",
  "reflections-of-victory.mp3",
] as const;

const PEACEFUL_PLACES_TITLE_OVERRIDES: Readonly<Record<string, string>> = {
  "bright-studio.mp3": "Bright Studio",
  "catalyst-of-joy.mp3": "Catalyst of Joy",
  "dawn-of-new-horizons.mp3": "Dawn of New Horizons",
  "energize-the-day.mp3": "Energize the Day",
  "evening-hearth.mp3": "Evening Hearth",
  "evening-reflections.mp3": "Evening Reflections",
  "hall-of-reflections.mp3": "Hall of Reflections",
  "java-seranade-coffee-house.mp3": "Java Serenade",
  "lofty-studio.mp3": "Lofty Studio",
  "momentum-unleashed.mp3": "Momentum Unleashed",
  "morning-whisper.mp3": "Morning Whisper",
  "nightime-melody.mp3": "Nighttime Melody",
  "pulse-of-momentum-energy-exercise-room.mp3": "Pulse of Momentum",
  "pulse-of-momentum-energy.mp3": "Pulse of Momentum Energy",
  "radiant-horizons.mp3": "Radiant Horizons",
  "reflections-of-triumph.mp3": "Reflections of Triumph",
  "reflections-of-victory.mp3": "Reflections of Victory",
};

function slugFromFilename(filename: string): string {
  return filename
    .replace(/\.mp3$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromFilename(filename: string): string {
  return (
    PEACEFUL_PLACES_TITLE_OVERRIDES[filename] ??
    filename
      .replace(/\.mp3$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function peacefulPlacesFolderSrc(filename: string): string {
  return `${PEACEFUL_PLACES_AUDIO_DIR}/${filename}`;
}

export function buildPeacefulPlacesFolderTracks() {
  return PEACEFUL_PLACES_FOLDER_FILENAMES.map((filename) => ({
    id: `peaceful-place-${slugFromFilename(filename)}`,
    title: titleFromFilename(filename),
    src: peacefulPlacesFolderSrc(filename),
    filename,
  }));
}

/**
 * Future-filtering metadata for Peaceful Moments music — STRUCTURE ONLY.
 *
 * These five axes let a later filtering engine narrow the catalog without any
 * change to today's catalog shape, playback, or UI: this map is intentionally
 * NOT consumed yet. Values are left UNSET on purpose — assigning mood, energy,
 * purpose, musicType, or vocals requires actually listening to each track.
 * Technical inspection alone did not yield trustworthy labels (all five master
 * to ~-14 LUFS integrated, so loudness does not separate them, and no tempo
 * measurement was available). Populate per track only after a human listen;
 * never infer from the filename.
 */
export type PeacefulPlacesEnergy = "low" | "medium" | "high";
export type PeacefulPlacesVocals = "instrumental" | "vocal";

export type PeacefulPlacesTrackMeta = {
  /** e.g. "cinematic", "ambient-piano", "uplifting-instrumental". */
  musicType?: string;
  /** free descriptors, e.g. ["bright", "hopeful"]. */
  mood?: readonly string[];
  energy?: PeacefulPlacesEnergy;
  /** intended use, e.g. ["focus", "celebrate", "wind-down"]. */
  purpose?: readonly string[];
  vocals?: PeacefulPlacesVocals;
};

/**
 * Keyed by folder filename. Empty entries = structure present, labels pending a
 * human listen. Measured integrated loudness is noted inline as evidence of the
 * technical inspection that was performed — it is NOT a filter label.
 */
export const PEACEFUL_PLACES_TRACK_META: Readonly<
  Record<string, PeacefulPlacesTrackMeta>
> = {
  // measured: I -14.0 LUFS, LRA 5.9 LU  (labels pending listen)
  "catalyst-of-joy.mp3": {},
  // measured: I -13.8 LUFS, LRA 7.5 LU  (labels pending listen)
  "dawn-of-new-horizons.mp3": {},
  // measured: I -14.5 LUFS, LRA 4.4 LU  (labels pending listen)
  "energize-the-day.mp3": {},
  // measured: I -13.6 LUFS, LRA 4.0 LU  (labels pending listen)
  "momentum-unleashed.mp3": {},
  // measured: I -14.2 LUFS, LRA 7.8 LU  (labels pending listen)
  "radiant-horizons.mp3": {},
};
