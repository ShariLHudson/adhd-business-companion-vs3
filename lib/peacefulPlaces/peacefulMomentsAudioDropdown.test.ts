/**
 * 122–124 / 137–139 — Peaceful Moments: woodland + Choose Music + opt-in playback.
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

  it("requires Play after select — no autoplay on open or select", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("peaceful-moments-play");
    expect(room).toContain("peaceful-moments-pause");
    expect(room).toContain("peaceful-moments-stop");
    expect(room).toContain("peaceful-moments-mute");
    expect(room).toContain("peaceful-moments-volume");
    expect(room).toContain("registerEstateMediaStopper");
    expect(room).toContain("stopAllAudio");
    expect(room).not.toContain("autoPlay");
    expect(room).toMatch(
      /Selecting a track must not start playback|does not start playback/i,
    );
    // selectTrack must not call .play()
    const selectBlock = room.match(
      /const selectTrack = useCallback\([\s\S]*?\}, \[\]\);/,
    )?.[0];
    expect(selectBlock).toBeTruthy();
    expect(selectBlock).not.toMatch(/\.play\(/);
  });

  it("FocusAudioPanel mounts PeacefulMomentsRoom without garden extras", () => {
    const panel = read("components/companion/FocusAudioPanel.tsx");
    expect(panel).toContain("PeacefulMomentsRoom");
    expect(panel).not.toContain("GardenDestinationCardMenu");
    expect(panel).not.toContain("PathwayEstateSignposts");
    expect(panel).not.toContain("PeacefulPlaceSession");
    expect(panel).not.toContain("breathe");
    expect(panel).not.toContain("journal");
  });

  it("Welcome Home Take a Moment labels Peaceful Moments", () => {
    const takeAMoment = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "take-a-moment",
    );
    const peaceful = takeAMoment?.destinations.find(
      (d) => d.id === "peaceful-places",
    );
    expect(peaceful?.label).toBe("Peaceful Moments");
  });

  it("does not embed Soundscapes ambient tracks in Peaceful Moments", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).not.toContain("EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS");
    expect(room).not.toContain("GardenDestinationCardMenu");
  });
});
