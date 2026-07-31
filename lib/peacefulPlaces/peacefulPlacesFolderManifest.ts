/** Every owned music title in public/audio/peaceful-places. */
export const PEACEFUL_PLACES_AUDIO_DIR = "/audio/peaceful-places" as const;

export const PEACEFUL_PLACES_FOLDER_FILENAMES = [
  "bright-studio.mp3",
  "evening-hearth.mp3",
  "evening-reflections.mp3",
  "hall-of-reflections.mp3",
  "java-seranade-coffee-house.mp3",
  "lofty-studio.mp3",
  "morning-whisper.mp3",
  "nightime-melody.mp3",
  "pulse-of-momentum-energy-exercise-room.mp3",
  "pulse-of-momentum-energy.mp3",
  "reflections-of-triumph.mp3",
  "reflections-of-victory.mp3",
  // Recovered 2026-07-31 from the v4 clone (see ESTATE_REGRESSION_AUDIT).
  // Filenames preserved exactly as accepted (Title Case with spaces).
  "Catalyst of Joy.mp3",
  "Dawn of New Horizons.mp3",
  "Energize the Day.mp3",
  "Momentum Unleashed.mp3",
  "Radiant Horizons.mp3",
] as const;

const PEACEFUL_PLACES_TITLE_OVERRIDES: Readonly<Record<string, string>> = {
  "bright-studio.mp3": "Bright Studio",
  "evening-hearth.mp3": "Evening Hearth",
  "evening-reflections.mp3": "Evening Reflections",
  "hall-of-reflections.mp3": "Hall of Reflections",
  "java-seranade-coffee-house.mp3": "Java Serenade",
  "lofty-studio.mp3": "Lofty Studio",
  "morning-whisper.mp3": "Morning Whisper",
  "nightime-melody.mp3": "Nighttime Melody",
  "pulse-of-momentum-energy-exercise-room.mp3": "Pulse of Momentum",
  "pulse-of-momentum-energy.mp3": "Pulse of Momentum Energy",
  "reflections-of-triumph.mp3": "Reflections of Triumph",
  "reflections-of-victory.mp3": "Reflections of Victory",
  // Recovered 2026-07-31 (v4 clone). Titles preserved exactly.
  "Catalyst of Joy.mp3": "Catalyst of Joy",
  "Dawn of New Horizons.mp3": "Dawn of New Horizons",
  "Energize the Day.mp3": "Energize the Day",
  "Momentum Unleashed.mp3": "Momentum Unleashed",
  "Radiant Horizons.mp3": "Radiant Horizons",
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
