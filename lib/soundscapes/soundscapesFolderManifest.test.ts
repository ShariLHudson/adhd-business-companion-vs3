import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  PEACEFUL_PLACES_MUSIC_TRACKS,
} from "./experienceSoundscapesMenu";
import {
  buildSoundscapesFolderTracks,
  SOUNDSCAPES_FOLDER_FILENAMES,
  SOUNDSCAPES_TRACK_META,
  soundscapesFolderSrc,
} from "./soundscapesFolderManifest";

/** The two normalized storm soundscapes added by this integration. */
const NEW_STORM_SOUNDSCAPES = [
  { filename: "distant-thunder.mp3", title: "Distant Thunder" },
  { filename: "rain-and-thunder.mp3", title: "Rain and Thunder" },
] as const;

const SOUNDSCAPES_DIR = resolve(
  process.cwd(),
  "public/audio/Soundscapes",
);

describe("soundscapesFolderManifest", () => {
  it("lists every mp3 in public/audio/Soundscapes", () => {
    const onDisk = readdirSync(SOUNDSCAPES_DIR)
      .filter((name) => name.toLowerCase().endsWith(".mp3"))
      .sort();
    expect([...SOUNDSCAPES_FOLDER_FILENAMES].sort()).toEqual(onDisk);
  });

  it("builds playback URLs only from the Soundscapes folder", () => {
    for (const track of buildSoundscapesFolderTracks()) {
      expect(track.src).toBe(soundscapesFolderSrc(track.filename));
      expect(track.src.startsWith("/audio/Soundscapes/")).toBe(true);
    }
    expect(EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS).toHaveLength(
      SOUNDSCAPES_FOLDER_FILENAMES.length,
    );
  });
});

describe("Environmental soundscapes — two new storm tracks", () => {
  it("registers both normalized filenames in the catalog", () => {
    for (const t of NEW_STORM_SOUNDSCAPES) {
      expect(SOUNDSCAPES_FOLDER_FILENAMES).toContain(t.filename);
    }
  });

  it("surfaces both in EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS with intended titles and space-free src", () => {
    for (const t of NEW_STORM_SOUNDSCAPES) {
      const src = `/audio/Soundscapes/${t.filename}`;
      const track = EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.find(
        (x) => x.src === src,
      );
      expect(track, t.filename).toBeDefined();
      expect(track!.title).toBe(t.title);
      expect(track!.src).not.toMatch(/\s/); // no unencoded spaces in the URL
    }
  });

  it("does NOT add either storm track to the Peaceful Moments music catalog", () => {
    for (const t of NEW_STORM_SOUNDSCAPES) {
      const src = `/audio/Soundscapes/${t.filename}`;
      const inMusic = PEACEFUL_PLACES_MUSIC_TRACKS.some(
        (x) => x.src === src || x.title === t.title,
      );
      expect(inMusic, t.filename).toBe(false);
    }
  });

  it("exposes the future-filtering metadata structure for both (labels may be pending)", () => {
    const keys = Object.keys(SOUNDSCAPES_TRACK_META);
    for (const t of NEW_STORM_SOUNDSCAPES) {
      expect(keys).toContain(t.filename);
    }
  });
});
