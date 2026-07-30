import { describe, expect, it } from "vitest";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  experienceSoundscapeTrackById,
  PEACEFUL_PLACES_MUSIC_TRACKS,
} from "./experienceSoundscapesMenu";

describe("experienceSoundscapesMenu", () => {
  it("keeps music titles separate from ambient soundscapes", () => {
    expect(PEACEFUL_PLACES_MUSIC_TRACKS.every((track) =>
      track.src.startsWith("/audio/peaceful-places/"),
    )).toBe(true);
    expect(EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.every((track) =>
      track.src.startsWith("/audio/Soundscapes/"),
    )).toBe(true);
    // 12 original + 5 new Peaceful Moments tracks = 17 music titles.
    expect(PEACEFUL_PLACES_MUSIC_TRACKS).toHaveLength(17);
    // Ambient soundscapes are unchanged — the five music tracks were NOT added here.
    expect(EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS).toHaveLength(12);
  });

  it("resolves tracks by id", () => {
    const ambient = experienceSoundscapeTrackById("soundscape-fireplace-crackling-fire");
    expect(ambient?.title).toBe("Fireplace Crackling Fire");
    expect(ambient?.src).toBe("/audio/Soundscapes/fireplace-crackling-fire.mp3");
    const music = experienceSoundscapeTrackById("peaceful-place-bright-studio");
    expect(music?.title).toBe("Bright Studio");
    expect(music?.src).toBe("/audio/peaceful-places/bright-studio.mp3");
  });
});
