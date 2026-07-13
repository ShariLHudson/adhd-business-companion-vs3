import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS } from "./experienceSoundscapesMenu";
import {
  buildSoundscapesFolderTracks,
  SOUNDSCAPES_FOLDER_FILENAMES,
  soundscapesFolderSrc,
} from "./soundscapesFolderManifest";

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
