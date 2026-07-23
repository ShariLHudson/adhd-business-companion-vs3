/**
 * Peaceful Moments: Choose Music + contextual Play → Estate Sounds.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";
import { PEACEFUL_PLACES_MUSIC_TRACKS } from "@/lib/soundscapes/experienceSoundscapesMenu";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Peaceful Moments audio dropdown (137–139)", () => {
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

  it("owns one Choose Music dropdown over PEACEFUL_PLACES_MUSIC_TRACKS", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("PEACEFUL_PLACES_MUSIC_TRACKS");
    expect(room).toContain("Choose Music");
    expect(room).toContain("peaceful-moments-music-dropdown");
    expect(room).toContain("peaceful-moments-music-list");
    expect(room).toContain("max-h-64");
    expect(room).toContain("overflow-y-auto");
    expect(room).toContain("peaceful-moments-audio");
    expect(PEACEFUL_PLACES_MUSIC_TRACKS.length).toBeGreaterThan(5);
    expect(
      PEACEFUL_PLACES_MUSIC_TRACKS.every((t) =>
        t.src.startsWith("/audio/peaceful-places/"),
      ),
    ).toBe(true);
  });

  it("offers contextual Play only — management lives in Estate Sounds", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("peaceful-moments-play");
    expect(room).toContain("noteEstateSoundsStarted");
    expect(room).toContain("Estate Sounds");
    expect(room).not.toContain("peaceful-moments-pause");
    expect(room).not.toContain("peaceful-moments-stop");
    expect(room).not.toContain("peaceful-moments-mute");
    expect(room).not.toContain("peaceful-moments-volume");
    expect(room).toContain("playSoundscapeTrack");
    expect(room).toContain("subscribeSoundscapePlayback");
    expect(room).not.toContain("autoPlay");
    expect(room).toMatch(
      /Selecting a track must not start playback|does not start playback/i,
    );
    const selectBlock = room.match(
      /const selectTrack = useCallback\([\s\S]*?\}, \[\]\);/,
    )?.[0];
    expect(selectBlock).toBeTruthy();
    expect(selectBlock).not.toMatch(/\.play\(/);
  });

  it("keeps playing after Previous Screen — Estate Sounds manages stop", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    const leaveBlock = room.match(
      /const handleLeave = useCallback\([\s\S]*?\}, \[[\s\S]*?\]\);/,
    )?.[0];
    expect(leaveBlock).toBeTruthy();
    expect(leaveBlock).not.toMatch(/stopSoundscapeOverlay|stopAllAudio/);
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
