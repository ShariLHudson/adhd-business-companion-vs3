import { describe, expect, it } from "vitest";

import { APPLE_ORCHARD_AMBIENCE_MP3 } from "@/lib/soundscapes/audioAssets";
import {
  ESTATE_PLACE_AMBIENCE_INTENT,
  formatAmbienceCharacterFromIntent,
  pickAmbienceTrackForVisit,
  resolveEstatePlaceAmbienceIntent,
} from "./estatePlaceAmbienceIntent";
import { resolveCanonicalPlaceAmbience } from "./estatePlaceMedia";

describe("estatePlaceAmbienceIntent", () => {
  it("defines canonical hospitality intents for signature places", () => {
    expect(ESTATE_PLACE_AMBIENCE_INTENT["welcome-home"]?.layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "soft breeze" }),
        expect.objectContaining({ label: "distant birds" }),
      ]),
    );

    const journal = ESTATE_PLACE_AMBIENCE_INTENT.journal;
    expect(journal?.layers.map((l) => l.label)).toEqual(
      expect.arrayContaining([
        "gentle water",
        "birds",
        "breeze",
        "occasional page turn",
      ]),
    );

    const orchard = ESTATE_PLACE_AMBIENCE_INTENT["apple-orchard"];
    expect(orchard?.layers.map((l) => l.label)).toEqual(
      expect.arrayContaining([
        "orchard ambience",
        "leaves moving",
        "bees",
        "soft wind",
      ]),
    );
  });

  it("boardroom intent favors silence and very subtle room tone", () => {
    const boardroom = resolveEstatePlaceAmbienceIntent("goals-projects");
    expect(boardroom?.displayName).toBe("Boardroom");
    expect(boardroom?.layers[0]?.label).toBe("silence");
    expect(boardroom?.layers.every((l) => l.prominence !== "present" || l.id === "silence")).toBe(
      true,
    );
  });

  it("formats character from emotional purpose and layers", () => {
    const intent = ESTATE_PLACE_AMBIENCE_INTENT.greenhouse!;
    const character = formatAmbienceCharacterFromIntent(intent);
    expect(character).toMatch(/glasshouse atmosphere/i);
    expect(character).toMatch(/very subtle/i);
  });

  it("resolveCanonicalPlaceAmbience merges intent layers onto media profile", () => {
    const orchard = resolveCanonicalPlaceAmbience("apple-orchard");
    expect(orchard?.src).toBe(APPLE_ORCHARD_AMBIENCE_MP3);
    expect(orchard?.src).toContain("birds");
    expect(orchard?.layers?.length).toBeGreaterThanOrEqual(5);
    expect(orchard?.character).toMatch(/orchard ambience/i);
    expect(orchard?.trackPool?.[0]?.src).toBe(APPLE_ORCHARD_AMBIENCE_MP3);
  });

  it("pickAmbienceTrackForVisit returns primary in V1", () => {
    const profile = resolveCanonicalPlaceAmbience("journal");
    expect(profile).toBeTruthy();
    expect(pickAmbienceTrackForVisit(profile!)).toBe(profile!.src);
  });
});
