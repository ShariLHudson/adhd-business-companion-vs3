import { describe, expect, it } from "vitest";
import { SOUNDSCAPES, soundscapesForMood } from "./catalog";
import { parseYoutubeVideoId } from "../focusAudio/youtubeEmbed";

describe("soundscape catalog", () => {
  it("ships slow down, focus, unwind, and recharge destinations", () => {
    expect(soundscapesForMood("calming")).toHaveLength(4);
    expect(soundscapesForMood("focus")).toHaveLength(5);
    expect(soundscapesForMood("unwind")).toHaveLength(4);
    expect(soundscapesForMood("energize")).toHaveLength(3);
  });

  it("uses embeddable playback URLs for every built-in destination", () => {
    for (const soundscape of SOUNDSCAPES) {
      const url = soundscape.playbackUrl;
      const isYoutube = Boolean(parseYoutubeVideoId(url));
      const isOwnedAudio = /\.mp3(\?|$)/i.test(url);
      expect(isYoutube || isOwnedAudio).toBe(true);
    }
  });

  it("paints an estate destination card for every place", () => {
    for (const soundscape of SOUNDSCAPES) {
      expect(soundscape.destinationName.length).toBeGreaterThan(3);
      expect(soundscape.experience.length).toBeGreaterThan(3);
      expect(soundscape.tagline.length).toBeGreaterThan(12);
    }
  });

  it("marks summer storm as the signature peaceful place", () => {
    const summerStorm = SOUNDSCAPES.find((s) => s.id === "summer-storm");
    expect(summerStorm?.signature).toBe(true);
    expect(summerStorm?.peacefulPlaceId).toBe("summer-storm-covered-deck");
    expect(summerStorm?.playbackUrl).toContain("RAINMetl-Gentle_rain_on_a_tin-Elevenlabs.mp3");
    expect(summerStorm?.destinationName).toBe("Covered Deck");
  });

  it("links coffee shop to the cozy café peaceful place image", () => {
    const coffeeShop = SOUNDSCAPES.find((s) => s.id === "coffee-shop");
    expect(coffeeShop?.peacefulPlaceId).toBe("cozy-cafe");
    expect(coffeeShop?.playbackUrl).toContain("AMBRest-Quiet_coffee_shop_am-Elevenlabs.mp3");
    expect(coffeeShop?.destinationName).toBe("Cozy Café");
  });
});
