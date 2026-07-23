import { describe, expect, it } from "vitest";

import {
  CANONICAL_PLACE_AMBIENCE,
  CANONICAL_PLACE_BACKGROUNDS,
  estateBackgroundPath,
  resolveCanonicalPlaceAmbience,
  resolveCanonicalPlaceBackground,
} from "./estatePlaceMedia";

describe("estatePlaceMedia", () => {
  it("encodes spaces in background filenames", () => {
    const url = estateBackgroundPath("reading-nook-window background.png");
    expect(url).toBe(
      "/backgrounds/reading-nook-window%20background.png",
    );
  });

  it("maps reading nook and library to distinct plates", () => {
    expect(resolveCanonicalPlaceBackground("reading-nook")).toContain(
      "reading-nook-window",
    );
    expect(resolveCanonicalPlaceBackground("library")).toContain(
      "room-library-estate",
    );
  });

  it("maps celebration-room to celebration hall plate", () => {
    expect(resolveCanonicalPlaceBackground("celebration-room")).toContain(
      "room-celebration-hall",
    );
  });

  it("wires room-named coffee house ambience", () => {
    expect(CANONICAL_PLACE_AMBIENCE["coffee-house"]?.src).toContain(
      "java-seranade-coffee-house",
    );
  });

  it("wires room-named celebration ambience", () => {
    // On-disk plate is `reflections-of-triumph.mp3` — see audioAssets.ts
    // CELEBRATION_ROOM_AMBIENCE_MP3 for why the original `-celebration-garden`
    // filename was never on disk.
    expect(CANONICAL_PLACE_AMBIENCE["celebration-room"]?.src).toContain(
      "reflections-of-triumph",
    );
  });

  it("wires exercise room pulse-of-momentum ambience", () => {
    expect(CANONICAL_PLACE_AMBIENCE["game-room"]?.src).toContain(
      "pulse-of-momentum-energy-exercise-room",
    );
    expect(resolveCanonicalPlaceAmbience("exercise-room")?.src).toContain(
      "pulse-of-momentum-energy-exercise-room",
    );
  });

  it("includes welcome-home background on disk", () => {
    expect(CANONICAL_PLACE_BACKGROUNDS["welcome-home"]).toContain(
      "welcome-home-background",
    );
  });
});
