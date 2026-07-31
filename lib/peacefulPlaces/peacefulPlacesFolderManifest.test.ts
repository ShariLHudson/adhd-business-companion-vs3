import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildPeacefulPlacesFolderTracks,
  PEACEFUL_PLACES_FOLDER_FILENAMES,
  peacefulPlacesFolderSrc,
} from "./peacefulPlacesFolderManifest";

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

  // --- 12 original + 5 recovered (2026-07-31, from the v4 clone) ---

  const ORIGINAL_TWELVE = [
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
  ];
  const RECOVERED_FIVE: Record<string, string> = {
    "Catalyst of Joy.mp3": "Catalyst of Joy",
    "Dawn of New Horizons.mp3": "Dawn of New Horizons",
    "Energize the Day.mp3": "Energize the Day",
    "Momentum Unleashed.mp3": "Momentum Unleashed",
    "Radiant Horizons.mp3": "Radiant Horizons",
  };

  it("lists seventeen peaceful moments", () => {
    expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toHaveLength(17);
  });

  it("keeps the original twelve and adds the five recovered", () => {
    for (const f of ORIGINAL_TWELVE) {
      expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toContain(f);
    }
    for (const f of Object.keys(RECOVERED_FIVE)) {
      expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toContain(f);
    }
  });

  it("renders the five recovered titles with exact asset URLs", () => {
    const tracks = buildPeacefulPlacesFolderTracks();
    for (const [filename, title] of Object.entries(RECOVERED_FIVE)) {
      const track = tracks.find((t) => t.title === title);
      expect(track, `missing recovered title: ${title}`).toBeDefined();
      expect(track?.src).toBe(`/audio/peaceful-places/${filename}`);
    }
  });

  it("has no duplicate ids, titles, or asset paths", () => {
    const tracks = buildPeacefulPlacesFolderTracks();
    const ids = tracks.map((t) => t.id);
    const titles = tracks.map((t) => t.title);
    const srcs = tracks.map((t) => t.src);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(srcs).size).toBe(srcs.length);
  });
});
