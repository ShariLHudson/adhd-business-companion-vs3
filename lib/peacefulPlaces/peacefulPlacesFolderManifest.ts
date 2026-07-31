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

/**
 * Peaceful Moments groupings (2026-07-31).
 *
 * The audio carries no genre/mood metadata, so songs are grouped by title
 * and filename intent. Confirmed with Shari before implementation. These
 * are presentation groupings only — they never affect ids, paths, titles,
 * durations, playback, or saved preferences.
 */
export type PeacefulPlaceGroup =
  | "Calm & Settle"
  | "Focus & Flow"
  | "Creative Thinking"
  | "Gentle Energy"
  | "Motivation & Momentum"
  | "Reflection & Rest";

/** Fixed display order for the groups (calm → energized → rest). */
export const PEACEFUL_PLACES_GROUP_ORDER: readonly PeacefulPlaceGroup[] = [
  "Calm & Settle",
  "Focus & Flow",
  "Creative Thinking",
  "Gentle Energy",
  "Motivation & Momentum",
  "Reflection & Rest",
] as const;

const PEACEFUL_PLACES_GROUP_BY_FILENAME: Readonly<
  Record<string, PeacefulPlaceGroup>
> = {
  "morning-whisper.mp3": "Calm & Settle",
  "java-seranade-coffee-house.mp3": "Focus & Flow",
  "bright-studio.mp3": "Creative Thinking",
  "lofty-studio.mp3": "Creative Thinking",
  "Dawn of New Horizons.mp3": "Gentle Energy",
  "Radiant Horizons.mp3": "Gentle Energy",
  "Catalyst of Joy.mp3": "Motivation & Momentum",
  "Energize the Day.mp3": "Motivation & Momentum",
  "Momentum Unleashed.mp3": "Motivation & Momentum",
  "pulse-of-momentum-energy-exercise-room.mp3": "Motivation & Momentum",
  "pulse-of-momentum-energy.mp3": "Motivation & Momentum",
  "reflections-of-triumph.mp3": "Motivation & Momentum",
  "reflections-of-victory.mp3": "Motivation & Momentum",
  "evening-hearth.mp3": "Reflection & Rest",
  "evening-reflections.mp3": "Reflection & Rest",
  "hall-of-reflections.mp3": "Reflection & Rest",
  "nightime-melody.mp3": "Reflection & Rest",
};

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

function groupFromFilename(filename: string): PeacefulPlaceGroup | undefined {
  return PEACEFUL_PLACES_GROUP_BY_FILENAME[filename];
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
    group: groupFromFilename(filename),
  }));
}

export type PeacefulPlacesTrackGroup = {
  group: PeacefulPlaceGroup;
  tracks: ReturnType<typeof buildPeacefulPlacesFolderTracks>;
};

/**
 * Groups the peaceful-moments songs for display: fixed group order, songs
 * alphabetized by title within each group. Only non-empty groups appear.
 * Every song must map to a known group — an unmapped song is a build error
 * surfaced by the manifest test, never a silent drop.
 */
export function buildPeacefulPlacesGroupedTracks(): PeacefulPlacesTrackGroup[] {
  const tracks = buildPeacefulPlacesFolderTracks();
  return PEACEFUL_PLACES_GROUP_ORDER.map((group) => ({
    group,
    tracks: tracks
      .filter((track) => track.group === group)
      .sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((section) => section.tracks.length > 0);
}
