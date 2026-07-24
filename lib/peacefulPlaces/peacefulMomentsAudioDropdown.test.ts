/**
 * Peaceful Moments vs Soundscapes — separate catalogs + item Stop controls.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  PEACEFUL_PLACES_MUSIC_TRACKS,
  isAmbientSoundscapeTrackId,
  isPeacefulPlacesMusicTrackId,
} from "@/lib/soundscapes/experienceSoundscapesMenu";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Peaceful Moments audio dropdown", () => {
  it("uses woodland pathway background from public backgrounds", () => {
    expect(PEACEFUL_PLACES_PATHWAY_BG).toContain(
      "/backgrounds/woodland-pathway.png",
    );
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("PEACEFUL_PLACES_PATHWAY_BG");
    expect(room).not.toMatch(/Lakeside Hammock|Ocean Conservatory/);
  });

  it("contains songs only — not ambient soundscapes", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("PEACEFUL_PLACES_MUSIC_TRACKS");
    expect(room).toContain("peacefulPlacesMusicTrackById");
    expect(room).not.toContain("EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS");
    expect(room).not.toContain("Soundscapes ▼");
    expect(room).not.toContain("data-testid=\"soundscapes-list\"");
    expect(
      PEACEFUL_PLACES_MUSIC_TRACKS.every((t) =>
        t.src.startsWith("/audio/peaceful-places/"),
      ),
    ).toBe(true);
    expect(
      EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.every((t) =>
        t.src.toLowerCase().includes("/audio/soundscapes/"),
      ),
    ).toBe(true);
    for (const track of PEACEFUL_PLACES_MUSIC_TRACKS) {
      expect(isPeacefulPlacesMusicTrackId(track.id)).toBe(true);
      expect(isAmbientSoundscapeTrackId(track.id)).toBe(false);
    }
    for (const track of EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS) {
      expect(isAmbientSoundscapeTrackId(track.id)).toBe(true);
      expect(isPeacefulPlacesMusicTrackId(track.id)).toBe(false);
    }
  });

  it("owns a Peaceful Moments dropdown over music tracks only", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("peaceful-moments-music-dropdown");
    expect(room).toContain("peaceful-moments-music-list");
    expect(room).toContain("max-h-64");
    expect(room).toContain("overflow-y-auto");
    expect(room).toContain("peaceful-moments-audio");
    expect(PEACEFUL_PLACES_MUSIC_TRACKS.length).toBeGreaterThan(5);
  });

  it("shows Play when stopped; Pause+Stop when playing; Resume+Stop when paused", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("peaceful-moments-play");
    expect(room).toContain("peaceful-moments-pause");
    expect(room).toContain("peaceful-moments-resume");
    expect(room).toContain("peaceful-moments-stop");
    expect(room).toContain('itemState === "stopped"');
    expect(room).toContain('itemState === "playing"');
    expect(room).toContain('itemState === "paused"');
    expect(room).toContain("stopActiveEstateSoundscapeItem");
    expect(room).toContain("pauseEstateSounds");
    expect(room).toContain("noteEstateSoundsStarted");
    expect(room).not.toContain("peaceful-moments-mute");
    expect(room).not.toContain("peaceful-moments-volume");
    expect(room).not.toContain("autoPlay");
    expect(room).toMatch(
      /Selecting a track must not start playback|does not start playback/i,
    );
    const selectBlock = room.match(
      /const selectTrack = useCallback\([\s\S]*?\}, \[\]\);/,
    )?.[0];
    expect(selectBlock).toBeTruthy();
    expect(selectBlock).not.toMatch(/playSoundscapeTrack|noteEstateSoundsStarted/);
  });

  it("Stop uses canonical transport and clears active/paused state", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    const transport = read("lib/estate/estateSoundsTransport.ts");
    expect(room).toContain("stopActiveEstateSoundscapeItem");
    expect(transport).toContain("stopActiveEstateSoundscapeItem");
    expect(transport).toContain("stopSoundscapeOverlay");
    expect(transport).toMatch(/currentTime|stopSoundscapeOverlay/);
    expect(room).toContain('setItemState("stopped")');
    expect(room).not.toContain("turnOffEstateSounds");
    expect(room).not.toContain("data-canonical-audio-controller");
    expect(room).not.toContain("GlobalSoundControl");
  });

  it("keeps playing after Previous Screen — Stop or Estate Sounds Turn Off manage end", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    const leaveBlock = room.match(
      /const handleLeave = useCallback\([\s\S]*?\}, \[[\s\S]*?\]\);/,
    )?.[0];
    expect(leaveBlock).toBeTruthy();
    expect(leaveBlock).not.toMatch(/stopSoundscapeOverlay|stopAllAudio|stopActive/);
  });

  it("exposes accessible text controls and playback state", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("aria-label");
    expect(room).toContain("aria-live");
    expect(room).toContain("data-playback-state");
    expect(room).toContain("peaceful-moments-playback-state");
    expect(room).toContain("role=\"group\"");
  });

  it("is reachable from Welcome Home navigation", () => {
    const ids = WELCOME_HOME_NAV_CATEGORIES.flatMap((c) =>
      (c.destinations ?? []).flatMap((d) => [
        d.id,
        ...(d.dropdownChildren?.map((child) => child.id) ?? []),
      ]),
    );
    expect(ids).toContain("peaceful-places");
  });
});

describe("Soundscapes separate section", () => {
  it("lists ambient tracks in their own overlay — not inside Peaceful Moments", () => {
    const overlay = read(
      "components/companion/estate/SoundscapeSelectionOverlay.tsx",
    );
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(overlay).toContain("EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS");
    expect(overlay).toContain("data-soundscapes-section");
    expect(overlay).toContain("soundscapes-list");
    expect(overlay).toContain(
      "Choose an environment sound to shape the atmosphere around you",
    );
    expect(overlay).toContain("Use This Sound");
    expect(overlay).toContain("stopActiveEstateSoundscapeItem");
    expect(overlay).toContain("pauseEstateSounds");
    expect(overlay).toContain("soundscape-pause-");
    expect(overlay).toContain("soundscape-stop-");
    expect(overlay).toContain("soundscape-resume-");
    expect(overlay).not.toContain("PEACEFUL_PLACES_MUSIC_TRACKS");
    expect(room).not.toContain("EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS");
  });

  it("uses the same canonical transport — no second player", () => {
    const overlay = read(
      "components/companion/estate/SoundscapeSelectionOverlay.tsx",
    );
    expect(overlay).toContain("playSoundscapeTrack");
    expect(overlay).toContain("noteEstateSoundsStarted");
    expect(overlay).not.toContain("data-canonical-audio-controller");
    expect(overlay).not.toContain("global-sound-pause");
    expect(overlay).not.toContain("global-sound-off");
    expect(overlay).not.toMatch(/new Audio\(|createAudioManager/);
  });
});
