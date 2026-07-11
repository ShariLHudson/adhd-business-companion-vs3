import { describe, expect, it } from "vitest";
import {
  filterPlacesForAudioContext,
  isEstateAudioDestinationPlace,
  isEstateNonAudioPlace,
} from "./estateNonAudioPlaces";

describe("estateNonAudioPlaces", () => {
  it("treats Evidence Vault as non-audio", () => {
    expect(isEstateNonAudioPlace("evidence-vault")).toBe(true);
    expect(isEstateNonAudioPlace("evidence-bank")).toBe(true);
    expect(isEstateAudioDestinationPlace("evidence-vault")).toBe(false);
  });

  it("allows Music Room and Peaceful Places as audio destinations", () => {
    expect(isEstateAudioDestinationPlace("music-room")).toBe(true);
    expect(isEstateAudioDestinationPlace("peaceful-places")).toBe(true);
    expect(isEstateNonAudioPlace("music-room")).toBe(false);
  });

  it("excludes create and business rooms from audio context lists", () => {
    const filtered = filterPlacesForAudioContext([
      "music-room",
      "art-studio",
      "round-table",
      "evidence-vault",
      "peaceful-places",
    ]);
    expect(filtered).toEqual(["music-room", "peaceful-places"]);
  });
});
