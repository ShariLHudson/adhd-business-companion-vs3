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
});
