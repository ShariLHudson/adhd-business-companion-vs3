import { describe, expect, it } from "vitest";

import {
  APPLE_ORCHARD_AMBIENCE_MP3,
  ORCHARD_BIRDS_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";
import { resolveEstatePlaceAmbientProfile } from "./estatePlaceAmbientSound";

describe("apple-orchard ambience", () => {
  it("resolves bird audio for Apple Orchard™", () => {
    const profile = resolveEstatePlaceAmbientProfile("apple-orchard");
    expect(profile).toBeTruthy();
    expect(profile!.src).toBe(ORCHARD_BIRDS_AMBIENCE_MP3);
    expect(profile!.src).toBe(APPLE_ORCHARD_AMBIENCE_MP3);
    expect(profile!.character).toMatch(/birds|orchard/i);
    expect(profile!.layers?.some((l) => l.label.includes("birds"))).toBe(true);
  });
});
