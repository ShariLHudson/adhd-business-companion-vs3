import { SOUNDSCAPES_AUDIO_DIR } from "./audioAssets";

/** Every owned ambient loop in public/audio/Soundscapes. */
export const SOUNDSCAPES_FOLDER_FILENAMES = [
  "aquarium bubbles.mp3",
  "bird-song.mp3",
  "birds-singing-in-early-summer.mp3",
  "church-bells-clock chime.mp3",
  "coffee-shop-chatter-audio.mp3",
  "crickets-birds-and-bee-flight.mp3",
  "fireplace-crackling-fire.mp3",
  "frogs-croaking-at-night.mp3",
  "gentle_rain_on_a_tin.mp3",
  "greenhouse-birds-ambience.mp3",
  "java-seranade-coffee-house.mp3",
  "morning-birdsong.mp3",
  "water-fountain.mp3",
] as const;

const SOUNDSCAPE_TITLE_OVERRIDES: Readonly<Record<string, string>> = {
  "aquarium bubbles.mp3": "Aquarium Bubbles",
  "bird-song.mp3": "Bird Song",
  "birds-singing-in-early-summer.mp3": "Birds Singing in Early Summer",
  "church-bells-clock chime.mp3": "Church Bells Clock Chime",
  "coffee-shop-chatter-audio.mp3": "Coffee Shop Chatter",
  "crickets-birds-and-bee-flight.mp3": "Crickets, Birds, and Bee Flight",
  "fireplace-crackling-fire.mp3": "Fireplace Crackling Fire",
  "frogs-croaking-at-night.mp3": "Frogs Croaking at Night",
  "gentle_rain_on_a_tin.mp3": "Gentle Rain on a Tin Roof",
  "greenhouse-birds-ambience.mp3": "Greenhouse Birds",
  "java-seranade-coffee-house.mp3": "Java Serenade",
  "morning-birdsong.mp3": "Morning Birdsong",
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
