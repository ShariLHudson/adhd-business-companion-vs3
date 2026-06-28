import { describe, expect, it } from "vitest";
import {
  PEACEFUL_PLACES,
  peacefulPlaceForSoundscape,
  signaturePeacefulPlace,
  SUMMER_STORM_COVERED_DECK,
  COZY_CAFE,
} from "./index";
import { SOUNDSCAPES } from "@/lib/soundscapes";

describe("peaceful places", () => {
  it("registers summer storm as the signature estate destination", () => {
    const signature = signaturePeacefulPlace();
    expect(signature.id).toBe("summer-storm-covered-deck");
    expect(signature.signature).toBe(true);
    expect(signature.audioLayers.length).toBeGreaterThanOrEqual(5);
  });

  it("links summer storm soundscape to the covered deck place", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "summer-storm");
    expect(soundscape?.peacefulPlaceId).toBe("summer-storm-covered-deck");
    expect(soundscape?.signature).toBe(true);

    const place = peacefulPlaceForSoundscape("summer-storm");
    expect(place?.title).toContain("Covered Deck");
    expect(place?.backgroundImageUrl).toContain("summer-storm-covered-deck");
  });

  it("links coffee shop soundscape to the cozy café place", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "coffee-shop");
    expect(soundscape?.peacefulPlaceId).toBe("cozy-cafe");

    const place = peacefulPlaceForSoundscape("coffee-shop");
    expect(place?.id).toBe("cozy-cafe");
    expect(place?.backgroundImageUrl).toContain("cozy-cafeimage");
    expect(COZY_CAFE.audioLayers.some((layer) => layer.id === "cafe-murmur")).toBe(true);
  });

  it("keeps workspace-safe center zone metadata on every place", () => {
    for (const place of PEACEFUL_PLACES) {
      expect(place.workspaceZone.centerQuiet).toBe(true);
      expect(place.workspaceZone.layout).toContain("workspace");
    }
  });

  it("stores the full summer storm place definition", () => {
    expect(SUMMER_STORM_COVERED_DECK.emotionalGoal).toMatch(/safe/i);
    expect(SUMMER_STORM_COVERED_DECK.imagePrompt).toMatch(/cedar/i);
  });
});
