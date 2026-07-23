import { describe, expect, it } from "vitest";
import { enterPeacefulPlace } from "./enterPeacefulPlace";
import {
  peacefulPlaceDestinationById,
  peacefulPlaceDestinationBySoundscapeId,
  peacefulPlaceDestinationFromSoundscape,
  PEACEFUL_PLACE_DESTINATIONS,
} from "./destinations";
import { resolvePeacefulPlacePlayback } from "./resolvePeacefulPlacePlayback";
import { SUMMER_STORM_COVERED_DECK_BG } from "./summerStormCoveredDeck";
import { SOUNDSCAPES } from "@/lib/soundscapes";

describe("peaceful place destinations", () => {
  const summerStorm = SOUNDSCAPES.find((item) => item.id === "summer-storm");
  if (!summerStorm) throw new Error("summer-storm soundscape missing");

  it("builds Covered Deck / Summer Storm as one unified destination object", () => {
    const destination = peacefulPlaceDestinationFromSoundscape(summerStorm);
    expect(destination).toMatchObject({
      id: "covered-deck-summer-storm",
      category: "slowDown",
      placeName: "Covered Deck",
      experienceName: "Summer Storm",
      imageSrc: SUMMER_STORM_COVERED_DECK_BG,
      audioType: "direct",
      enabled: true,
      placeId: "summer-storm-covered-deck",
      soundscapeId: "summer-storm",
    });
    expect(destination?.audioSrc).toContain("gentle_rain_on_a_tin.mp3");
  });

  it("resolves the destination by id and soundscape id", () => {
    expect(peacefulPlaceDestinationById("covered-deck-summer-storm")?.placeName).toBe(
      "Covered Deck",
    );
    expect(peacefulPlaceDestinationBySoundscapeId("summer-storm")?.id).toBe(
      "covered-deck-summer-storm",
    );
  });

  it("registers at least the signature covered deck destination", () => {
    expect(PEACEFUL_PLACE_DESTINATIONS.some((d) => d.id === "covered-deck-summer-storm")).toBe(
      true,
    );
    expect(PEACEFUL_PLACE_DESTINATIONS.some((d) => d.id === "cozy-cafe-coffee-shop")).toBe(
      true,
    );
  });

  it("resolves hidden in-app playback for summer storm without YouTube", () => {
    const destination = peacefulPlaceDestinationFromSoundscape(summerStorm);
    expect(destination).not.toBeNull();
    const playback = resolvePeacefulPlacePlayback(destination!);
    expect(playback.kind).toBe("direct");
    if (playback.kind === "direct") {
      expect(playback.src).toContain("gentle_rain_on_a_tin.mp3");
    }
  });

  it("enterPeacefulPlace returns the active destination as one entry action", () => {
    const destination = peacefulPlaceDestinationFromSoundscape(summerStorm);
    expect(destination).not.toBeNull();
    const result = enterPeacefulPlace(destination!);
    expect(result.destination).toBe(destination);
    expect(result.destination.imageSrc).toContain("summer-storm-covered-deck");
    expect(result.destination.audioSrc).toBe(summerStorm.playbackUrl);
  });

  const coffeeShop = SOUNDSCAPES.find((item) => item.id === "coffee-shop");
  if (!coffeeShop) throw new Error("coffee-shop soundscape missing");

  it("builds Cozy Café / Coffee Shop as one unified destination object", () => {
    const destination = peacefulPlaceDestinationFromSoundscape(coffeeShop);
    expect(destination).toMatchObject({
      id: "cozy-cafe-coffee-shop",
      category: "focus",
      placeName: "Cozy Café",
      experienceName: "Coffee Shop",
      imageSrc: expect.stringContaining("cozy-cafeimage"),
      audioType: "direct",
      enabled: true,
      placeId: "cozy-cafe",
      soundscapeId: "coffee-shop",
    });
    expect(destination?.audioSrc).toContain("coffee-shop-chatter-audio.mp3");
  });

  it("resolves cozy café destination by id and soundscape id", () => {
    expect(peacefulPlaceDestinationById("cozy-cafe-coffee-shop")?.placeName).toBe(
      "Cozy Café",
    );
    expect(peacefulPlaceDestinationBySoundscapeId("coffee-shop")?.id).toBe(
      "cozy-cafe-coffee-shop",
    );
  });

  it("resolves owned mp3 playback for the cozy café", () => {
    const destination = peacefulPlaceDestinationFromSoundscape(coffeeShop);
    expect(destination).not.toBeNull();
    const playback = resolvePeacefulPlacePlayback(destination!);
    expect(playback.kind).toBe("direct");
    if (playback.kind === "direct") {
      expect(playback.src).toContain("coffee-shop-chatter-audio.mp3");
    }
  });
});
