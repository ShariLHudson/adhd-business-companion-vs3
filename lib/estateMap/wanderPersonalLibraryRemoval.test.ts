/**
 * Temporary scope reduction: Personal Library is removed from Wander the Estate.
 * These tests prove it is gone from every Wander surface (card, map location,
 * image tour, by-id lookup) with no dead hotspot, while the canonical access
 * paths (chat / Spark Card / normal navigation) still resolve the real room.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  getExploreEstateDestinationById,
  getExploreEstateDestinations,
  resetExploreEstateDestinationsCache,
} from "./exploreEstateDestinations";
import { getExploreSparkMapLocations } from "./exploreSparkNavigation";
import {
  getWanderEstateImageById,
  getWanderEstateImageRegistry,
  getWanderEstateTourImages,
} from "./wanderEstateImageRegistry";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";

beforeEach(() => {
  resetExploreEstateDestinationsCache();
});

describe("Wander the Estate no longer offers Personal Library", () => {
  it("is absent from the Explore/Wander destination list and by-id lookup", () => {
    const destinations = getExploreEstateDestinations();
    expect(destinations.some((d) => d.id === "personal-library")).toBe(false);
    expect(
      destinations.some((d) => d.destinationId === "personal-library"),
    ).toBe(false);
    expect(getExploreEstateDestinationById("personal-library")).toBeUndefined();
  });

  it("is absent from the Wander map locations (no tile/hotspot)", () => {
    const locations = getExploreSparkMapLocations();
    expect(locations.some((l) => l.id === "personal-library")).toBe(false);
    // Nothing left behind: every location still has a name and an image.
    expect(locations.every((l) => l.name.trim().length > 0)).toBe(true);
    expect(locations.every((l) => Boolean(l.image))).toBe(true);
  });

  it("is absent from the Wander image tour and by-id (no broken prev/next)", () => {
    expect(getWanderEstateImageById("personal-library")).toBeNull();
    expect(
      getWanderEstateTourImages().some((r) => r.id === "personal-library"),
    ).toBe(false);
    expect(
      getWanderEstateImageRegistry().some((r) => r.id === "personal-library"),
    ).toBe(false);
    // The tour that remains is still a clean, enabled sequence.
    expect(getWanderEstateTourImages().every((r) => r.enabled)).toBe(true);
  });
});

describe("Canonical Personal Library access paths still work", () => {
  // chat / Spark Card / room menu all navigate via estateNavigateCommandForPlace,
  // which resolves the real room independently of the Wander catalog.
  const phrases = [
    "go to my personal library",
    "take me to my personal library",
    "go to spark cards",
    "show my spark collection",
  ];

  for (const phrase of phrases) {
    it(`still resolves the room for: "${phrase}"`, () => {
      const command = estateNavigateCommandForPlace("personal-library", phrase);
      expect(command).not.toBeNull();
      expect(command!.section).toBe("personal-library");
    });
  }
});
