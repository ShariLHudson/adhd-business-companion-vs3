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
    expect(coffeeShop?.playbackUrl).toContain("coffee-shop-chatter-audio.mp3");
    expect(coffeeShop?.destinationName).toBe("Cozy Café");
  });

  it("links music room to the owned music loft ambience", () => {
    const musicRoom = SOUNDSCAPES.find((s) => s.id === "deep-focus-piano");
    expect(musicRoom?.playbackUrl).toContain("music-loft-ambience.mp3");
    expect(musicRoom?.destinationName).toBe("Music Room");
  });

  it("links nature escape to the garden restoration peaceful place", () => {
    const natureEscape = SOUNDSCAPES.find((s) => s.id === "nature-escape");
    expect(natureEscape?.peacefulPlaceId).toBe("nature-escape");
    expect(natureEscape?.destinationName).toBe("Nature Escape");
  });

  it("links sunrise terrace to the east terrace peaceful place", () => {
    const sunriseTerrace = SOUNDSCAPES.find((s) => s.id === "sunrise-terrace");
    expect(sunriseTerrace?.peacefulPlaceId).toBe("east-terrace");
    expect(sunriseTerrace?.playbackUrl).toContain("east-terrace-morning-whisper.mp3");
    expect(sunriseTerrace?.experience).toBe("Morning Whisper in the Garden");
    expect(sunriseTerrace?.destinationName).toBe("East Terrace");
  });

  it("links movement studio to the bright studio peaceful place", () => {
    const movementStudio = SOUNDSCAPES.find((s) => s.id === "movement-studio");
    expect(movementStudio?.peacefulPlaceId).toBe("bright-studio");
    expect(movementStudio?.playbackUrl).toContain("bright-studio-ambience.mp3");
    expect(movementStudio?.destinationName).toBe("Bright Studio");
  });

  it("links evening hearth to the owned Songer fireplace ambience", () => {
    const eveningHearth = SOUNDSCAPES.find((s) => s.id === "fireplace-night");
    expect(eveningHearth?.peacefulPlaceId).toBe("evening-hearth");
    expect(eveningHearth?.playbackUrl).toContain("evening-hearth-ambience.mp3");
    expect(eveningHearth?.destinationName).toBe("Evening Hearth");
  });
});
