import { SOUNDSCAPES_AUDIO_DIR } from "./audioAssets";

/** Every owned ambient loop in public/audio/Soundscapes. */
export const SOUNDSCAPES_FOLDER_FILENAMES = [
  "aquarium bubbles.mp3",
  "bird-song.mp3",
  "birds-singing-in-early-summer.mp3",
  "church-bells-clock chime.mp3",
  "coffee-shop-chatter-audio.mp3",
  "crickets-birds-and-bee-flight.mp3",
  "distant-thunder.mp3",
  "fireplace-crackling-fire.mp3",
  "frogs-croaking-at-night.mp3",
  "gentle_rain_on_a_tin.mp3",
  "greenhouse-birds-ambience.mp3",
  "morning-birdsong.mp3",
  "rain-and-thunder.mp3",
  "water-fountain.mp3",
] as const;

const SOUNDSCAPE_TITLE_OVERRIDES: Readonly<Record<string, string>> = {
  "aquarium bubbles.mp3": "Aquarium Bubbles",
  "bird-song.mp3": "Bird Song",
  "birds-singing-in-early-summer.mp3": "Birds Singing in Early Summer",
  "church-bells-clock chime.mp3": "Church Bells Clock Chime",
  "coffee-shop-chatter-audio.mp3": "Coffee Shop Chatter",
  "crickets-birds-and-bee-flight.mp3": "Crickets, Birds, and Bee Flight",
  "distant-thunder.mp3": "Distant Thunder",
  "fireplace-crackling-fire.mp3": "Fireplace Crackling Fire",
  "frogs-croaking-at-night.mp3": "Frogs Croaking at Night",
  "gentle_rain_on_a_tin.mp3": "Gentle Rain on a Tin Roof",
  "greenhouse-birds-ambience.mp3": "Greenhouse Birds",
  "morning-birdsong.mp3": "Morning Birdsong",
  "rain-and-thunder.mp3": "Rain and Thunder",
  "water-fountain.mp3": "Water Fountain",
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
    SOUNDSCAPE_TITLE_OVERRIDES[filename] ??
    filename
      .replace(/\.mp3$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function soundscapesFolderSrc(filename: string): string {
  return `${SOUNDSCAPES_AUDIO_DIR}/${filename}`;
}

export function buildSoundscapesFolderTracks() {
  return SOUNDSCAPES_FOLDER_FILENAMES.map((filename) => ({
    id: `soundscape-${slugFromFilename(filename)}`,
    title: titleFromFilename(filename),
    src: soundscapesFolderSrc(filename),
    filename,
  }));
}

/**
 * Future-filtering metadata for ambient soundscapes — STRUCTURE ONLY.
 *
 * Mirrors the Peaceful Moments music pattern (`PEACEFUL_PLACES_TRACK_META`) so
 * both audio domains carry tags the same way. This map is intentionally NOT
 * consumed yet, so it changes no current behavior. Values are left UNSET on
 * purpose — assigning mood, energy, purpose, or setting requires actually
 * listening to each track; never infer from the filename. Populate per file
 * only after a human listen.
 */
export type SoundscapeEnergy = "low" | "medium" | "high";

export type SoundscapeTrackMeta = {
  /** e.g. "rain", "birdsong", "fire", "water". */
  setting?: string;
  /** free descriptors, e.g. ["calming", "dramatic"]. */
  mood?: readonly string[];
  energy?: SoundscapeEnergy;
  /** intended use, e.g. ["focus", "sleep", "unwind"]. */
  purpose?: readonly string[];
};

/**
 * Keyed by folder filename. Empty entries = structure present, labels pending a
 * human listen. Measured integrated loudness is noted inline as evidence of the
 * technical inspection performed — it is NOT a filter label.
 */
export const SOUNDSCAPES_TRACK_META: Readonly<
  Record<string, SoundscapeTrackMeta>
> = {
  // measured: I -27.2 LUFS, LRA 19.2 LU  (labels pending listen)
  "distant-thunder.mp3": {},
  // measured: I -25.9 LUFS, LRA 21.6 LU  (labels pending listen)
  "rain-and-thunder.mp3": {},
};
