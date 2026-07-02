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
    const url = estateBackgroundPath("arched-window reading-nook-background.png");
    expect(url).toBe(
      "/backgrounds/arched-window%20reading-nook-background.png",
    );
  });

  it("maps reading nook and library to distinct plates", () => {
    expect(resolveCanonicalPlaceBackground("reading-nook")).toContain(
      "arched-window",
    );
    expect(resolveCanonicalPlaceBackground("library")).toContain(
      "estate-library",
    );
  });

  it("maps celebration-room to celebration room plate", () => {
    expect(resolveCanonicalPlaceBackground("celebration-room")).toContain(
      "celebration-room-background",
    );
  });

  it("wires room-named coffee house ambience", () => {
    expect(CANONICAL_PLACE_AMBIENCE["coffee-house"]?.src).toContain(
      "java-seranade-coffee-house",
    );
  });

  it("wires room-named celebration ambience", () => {
    expect(CANONICAL_PLACE_AMBIENCE["celebration-room"]?.src).toContain(
      "celebration-garden",
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
