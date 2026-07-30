import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildPeacefulPlacesFolderTracks,
  PEACEFUL_PLACES_FOLDER_FILENAMES,
  PEACEFUL_PLACES_TRACK_META,
  peacefulPlacesFolderSrc,
} from "./peacefulPlacesFolderManifest";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  PEACEFUL_PLACES_MUSIC_TRACKS,
} from "@/lib/soundscapes/experienceSoundscapesMenu";

/** The five normalized tracks added by this integration. */
const NEW_PEACEFUL_TRACKS = [
  { filename: "catalyst-of-joy.mp3", title: "Catalyst of Joy" },
  { filename: "dawn-of-new-horizons.mp3", title: "Dawn of New Horizons" },
  { filename: "energize-the-day.mp3", title: "Energize the Day" },
  { filename: "momentum-unleashed.mp3", title: "Momentum Unleashed" },
  { filename: "radiant-horizons.mp3", title: "Radiant Horizons" },
] as const;

const PEACEFUL_PLACES_DIR = resolve(
  process.cwd(),
  "public/audio/peaceful-places",
);

describe("peacefulPlacesFolderManifest", () => {
  it("lists every mp3 in public/audio/peaceful-places", () => {
    const onDisk = readdirSync(PEACEFUL_PLACES_DIR)
      .filter((name) => name.toLowerCase().endsWith(".mp3"))
      .sort();
    expect([...PEACEFUL_PLACES_FOLDER_FILENAMES].sort()).toEqual(onDisk);
  });

  it("builds playback URLs only from the peaceful-places folder", () => {
    for (const track of buildPeacefulPlacesFolderTracks()) {
      expect(track.src).toBe(peacefulPlacesFolderSrc(track.filename));
      expect(track.src.startsWith("/audio/peaceful-places/")).toBe(true);
    }
  });
});

describe("Peaceful Moments — five new normalized tracks", () => {
  it("registers all five normalized filenames in the catalog", () => {
    for (const t of NEW_PEACEFUL_TRACKS) {
      expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toContain(t.filename);
    }
  });

  it("surfaces all five in PEACEFUL_PLACES_MUSIC_TRACKS with intended titles and space-free kebab-case src", () => {
    for (const t of NEW_PEACEFUL_TRACKS) {
      const src = `/audio/peaceful-places/${t.filename}`;
      const track = PEACEFUL_PLACES_MUSIC_TRACKS.find((x) => x.src === src);
      expect(track, t.filename).toBeDefined();
      expect(track!.title).toBe(t.title);
      expect(track!.src).not.toMatch(/\s/); // no unencoded spaces in the URL
    }
  });

  it("does NOT add any of the five to the environmental soundscape catalog", () => {
    for (const t of NEW_PEACEFUL_TRACKS) {
      const src = `/audio/peaceful-places/${t.filename}`;
      const inSoundscapes = EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.some(
        (x) => x.src === src || x.title === t.title,
      );
      expect(inSoundscapes, t.filename).toBe(false);
    }
  });

  it("exposes the future-filtering metadata structure for the five (labels may be pending)", () => {
    const keys = Object.keys(PEACEFUL_PLACES_TRACK_META);
    for (const t of NEW_PEACEFUL_TRACKS) {
      expect(keys).toContain(t.filename);
    }
  });
});
