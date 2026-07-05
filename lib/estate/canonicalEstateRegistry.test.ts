import { describe, expect, it } from "vitest";

import {
  CANONICAL_ESTATE_REGISTRY,
  CANONICAL_ESTATE_REGISTRY_VERSION,
  canonicalRegistryStats,
  getCanonicalEstatePlaceById,
  matchCanonicalPlaceInText,
  resolveCanonicalPlaceId,
  resolveCanonicalPlaceIdFromAlias,
  validateCanonicalRegistryIntegrity,
} from "./canonicalEstateRegistry";

describe("canonicalEstateRegistry", () => {
  it("has expected version and place count from Phase A canon", () => {
    expect(CANONICAL_ESTATE_REGISTRY_VERSION).toBe("1.0");
    expect(CANONICAL_ESTATE_REGISTRY.length).toBe(75);
  });

  it("passes integrity validation", () => {
    expect(validateCanonicalRegistryIntegrity()).toEqual([]);
  });

  it("indexes library and institute as distinct destinations", () => {
    const library = getCanonicalEstatePlaceById("library");
    const institute = getCanonicalEstatePlaceById("momentum-institute");
    expect(library?.category).toBe("destination");
    expect(institute?.category).toBe("destination");
    expect(library?.id).not.toBe(institute?.id);
  });

  it("resolves exact aliases", () => {
    expect(resolveCanonicalPlaceIdFromAlias("take me home")).toBe("welcome-home");
    expect(resolveCanonicalPlaceIdFromAlias("momentum institute")).toBe(
      "momentum-institute",
    );
    expect(resolveCanonicalPlaceIdFromAlias("brain dump")).toBe("clear-my-mind");
  });

  it("matches longest alias in free text", () => {
    const match = matchCanonicalPlaceInText(
      "Can we go to the momentum institute today?",
    );
    expect(match?.id).toBe("momentum-institute");
  });

  it("categories match canon distribution", () => {
    const stats = canonicalRegistryStats();
    expect(stats.byCategory["living-place"]).toBe(32);
    expect(stats.byCategory.destination).toBe(28);
    expect(stats.byCategory.collection).toBe(8);
    expect(stats.byCategory["transition-space"]).toBe(7);
  });

  it("living places forbid object-invitation arrival", () => {
    for (const place of CANONICAL_ESTATE_REGISTRY) {
      if (place.category !== "living-place") continue;
      expect(["threshold", "ambient-crossfade", "presence-only"]).toContain(
        place.arrivalBehavior,
      );
    }
  });

  it("includes Phase A-only places not in legacy room registry", () => {
    expect(getCanonicalEstatePlaceById("reading-nook")).toBeDefined();
    expect(getCanonicalEstatePlaceById("celebration-room")).toBeDefined();
    expect(getCanonicalEstatePlaceById("accomplishments-shelf")).toBeDefined();
    expect(getCanonicalEstatePlaceById("main-hallway")).toBeDefined();
  });

  it("maps legacy celebration-garden id to gardens (member-facing Celebration Garden)", () => {
    expect(resolveCanonicalPlaceId("celebration-garden")).toBe("gardens");
    expect(getCanonicalEstatePlaceById("celebration-garden")?.id).toBe("gardens");
  });

  it("keeps reading nook and library as distinct places", () => {
    const nook = getCanonicalEstatePlaceById("reading-nook");
    const library = getCanonicalEstatePlaceById("library");
    expect(nook?.category).toBe("living-place");
    expect(library?.category).toBe("destination");
    expect(resolveCanonicalPlaceIdFromAlias("reading nook")).toBe("reading-nook");
    expect(resolveCanonicalPlaceIdFromAlias("library")).toBe("library");
  });
});
