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

  it("links nature escape soundscape to the garden restoration place", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "nature-escape");
    expect(soundscape?.peacefulPlaceId).toBe("nature-escape");

    const place = peacefulPlaceForSoundscape("nature-escape");
    expect(place?.id).toBe("nature-escape");
    expect(place?.backgroundImageUrl).toContain("music-loft-peaceful-places");
  });

  it("links sunrise terrace soundscape to the east terrace place", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "sunrise-terrace");
    expect(soundscape?.peacefulPlaceId).toBe("east-terrace");

    const place = peacefulPlaceForSoundscape("sunrise-terrace");
    expect(place?.id).toBe("east-terrace");
    expect(place?.backgroundImageUrl).toContain("east-terrace-peaceful-places");
  });

  it("links movement studio soundscape to the bright studio place", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "movement-studio");
    expect(soundscape?.peacefulPlaceId).toBe("bright-studio");

    const place = peacefulPlaceForSoundscape("movement-studio");
    expect(place?.id).toBe("bright-studio");
    expect(place?.backgroundImageUrl).toContain("bright-studio-peaceful-places");
  });

  it("links gentle rain soundscape to the bedroom window place", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "gentle-rain");
    expect(soundscape?.peacefulPlaceId).toBe("bedroom-window");

    const place = peacefulPlaceForSoundscape("gentle-rain");
    expect(place?.id).toBe("bedroom-window");
    expect(place?.backgroundImageUrl).toContain("bedroom-window-peaceful-places");
  });

  it("links evening hearth soundscape to the owned fireplace ambience", () => {
    const soundscape = SOUNDSCAPES.find((s) => s.id === "fireplace-night");
    expect(soundscape?.peacefulPlaceId).toBe("evening-hearth");
    expect(soundscape?.playbackUrl).toContain("evening-hearth.mp3");

    const place = peacefulPlaceForSoundscape("fireplace-night");
    expect(place?.id).toBe("evening-hearth");
    expect(place?.backgroundImageUrl).toContain("evening-hearth-peaceful-places");
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
