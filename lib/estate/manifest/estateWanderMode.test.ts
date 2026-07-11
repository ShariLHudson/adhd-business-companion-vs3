import { describe, expect, it, beforeEach } from "vitest";

import {
  clearWanderRecentHistory,
  filterWanderCandidatePool,
  getWanderableManifestPlaces,
  loadWanderRecentManifestPlaceIds,
  pickWanderDestination,
  pickWanderFromPool,
  recordWanderTransition,
  resolveWanderRoomDisplayName,
  saveWanderRecentManifestPlaceIds,
  validateWanderPick,
} from "./estateWanderMode";
import { getPlaceById } from "./estatePlaceMasterManifest";

describe("estateWanderMode", () => {
  beforeEach(() => {
    clearWanderRecentHistory();
  });

  it("only includes navigable Live manifest places", () => {
    const places = getWanderableManifestPlaces();
    expect(places.length).toBeGreaterThan(10);
    expect(places.every((p) => p.navigable && p.status === "Live")).toBe(true);
    expect(places.some((p) => p.legacy_place_id === "butterfly-house")).toBe(
      true,
    );
  });

  it("excludes goals-projects from wanderable manifest places", () => {
    const places = getWanderableManifestPlaces();
    expect(places.map((p) => p.legacy_place_id)).not.toContain("goals-projects");
  });

  it("shows Clear My Mind for the capture workspace room id", () => {
    expect(resolveWanderRoomDisplayName("clear-my-mind")).toBe("Clear My Mind");
    expect(resolveWanderRoomDisplayName("brain-dump")).toBe("Clear My Mind");
  });

  it("shows Chamber of Momentum for momentum sub-places in room chrome", () => {
    expect(resolveWanderRoomDisplayName("momentum-institute")).toBe(
      "Chamber of Momentum",
    );
    expect(resolveWanderRoomDisplayName("momentum-builder")).toBe(
      "Chamber of Momentum",
    );
    expect(resolveWanderRoomDisplayName("goals-projects")).toBe(
      "Chamber of Momentum",
    );
  });

  it("excludes current room and recent manifest ids from pool", () => {
    const wanderable = getWanderableManifestPlaces();
    const pool = filterWanderCandidatePool(wanderable, "butterfly-house", [
      "GREENHOUSE-MAIN",
      "AQUA-MAIN",
    ]);
    expect(pool.map((p) => p.legacy_place_id)).not.toContain("butterfly-house");
    expect(pool.map((p) => p.place_id)).not.toContain("GREENHOUSE-MAIN");
    expect(pool.map((p) => p.place_id)).not.toContain("AQUA-MAIN");
  });

  it("clears recent history when pool is exhausted then picks again", () => {
    const wanderable = getWanderableManifestPlaces();
    const allIds = wanderable.map((p) => p.place_id);
    saveWanderRecentManifestPlaceIds(
      allIds.filter((id) => id !== "BUTTERFLY-HOUSE"),
    );

    const pick = pickWanderDestination("butterfly-house", () => 0);
    expect(pick).not.toBeNull();
    expect(pick!.legacyPlaceId).not.toBe("butterfly-house");
    expect(loadWanderRecentManifestPlaceIds().length).toBeLessThan(allIds.length);
  });

  it("returns null when only the current room exists in pool", () => {
    const solo = getPlaceById("butterfly-house");
    expect(solo).not.toBeNull();
    const pool = filterWanderCandidatePool([solo!], "butterfly-house", []);
    expect(pickWanderFromPool(pool)).toBeNull();
  });

  it("records from and to manifest ids in recent history", () => {
    const to = getPlaceById("greenhouse");
    expect(to).not.toBeNull();
    recordWanderTransition("butterfly-house", to!);
    const recent = loadWanderRecentManifestPlaceIds();
    expect(recent[0]).toBe("GREENHOUSE-MAIN");
    expect(recent).toContain("BUTTERFLY-HOUSE");
  });

  it("picks a different room from butterfly house on wander", () => {
    const pick = pickWanderDestination("butterfly-house", () => 0.42);
    expect(pick).not.toBeNull();
    expect(pick!.legacyPlaceId).not.toBe("butterfly-house");
    expect(pick!.place.primary_image).toBeTruthy();
    expect(validateWanderPick(pick!)).toBe(true);
  });

  it("rejects wander picks with inconsistent manifest identity", () => {
    const pick = pickWanderDestination("butterfly-house", () => 0.42);
    expect(pick).not.toBeNull();
    expect(
      validateWanderPick({
        ...pick!,
        manifestPlaceId: "INVALID-PLACE",
      }),
    ).toBe(false);
  });
});
