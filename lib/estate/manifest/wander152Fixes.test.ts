/**
 * 152 — Wander room name / route acceptance checks.
 */
import { describe, expect, it } from "vitest";
import {
  getWanderableManifestPlaces,
  resolveWanderRoomDisplayName,
} from "@/lib/estate/manifest/estateWanderMode";
import { getPlaceById } from "@/lib/estate/manifest/estatePlaceMasterManifest";
import { resolvePlaceId } from "@/lib/estate/placeIdAliases";
import { listSceneViewsForPlace } from "@/lib/estate/estatePlaceSceneViews";

describe("152 Wander name and route fixes", () => {
  const wanderable = () => getWanderableManifestPlaces();

  it("renames Gallery (not Hall of Accomplishments)", () => {
    expect(resolveWanderRoomDisplayName("gallery-of-firsts")).toBe("Gallery");
    expect(getPlaceById("gallery-of-firsts")?.display_name).toBe("Gallery");
  });

  it("removes Decision Compass from Wander; Apple Orchard is Live with Kinsey plate", () => {
    const ids = wanderable().map((p) => p.legacy_place_id);
    expect(ids).not.toContain("decision-compass");
    expect(ids).toContain("apple-orchard");
    expect(getPlaceById("apple-orchard")?.primary_image).toBe(
      "apple-orchard-kinsey-background.png",
    );
  });

  it("includes The Stables as Live with dedicated plate", () => {
    const ids = wanderable().map((p) => p.legacy_place_id);
    expect(ids).toContain("stables");
    expect(getPlaceById("stables")?.primary_image).toBe(
      "spark-estate-stables-background.png",
    );
    expect(getPlaceById("stables")?.status).toBe("Live");
    expect(getPlaceById("stables")?.navigable).toBe(true);
  });

  it("includes Celebration Garden with a real image plate", () => {
    const garden = getPlaceById("gardens");
    expect(garden?.status).toBe("Live");
    expect(garden?.navigable).toBe(true);
    expect(garden?.display_name).toBe("Celebration Garden");
    expect(garden?.primary_image).toBe("swing-background.png");
    expect(wanderable().some((p) => p.legacy_place_id === "gardens")).toBe(
      true,
    );
  });

  it("renames Estate Library", () => {
    expect(resolveWanderRoomDisplayName("library")).toBe("Estate Library");
  });

  it("shows Hall of Accomplishments instead of Portfolio", () => {
    expect(resolveWanderRoomDisplayName("portfolio")).toBe(
      "Hall of Accomplishments",
    );
    expect(resolvePlaceId("hall-of-accomplishments")).toBe("portfolio");
  });

  it("labels Swimming Pool (not Summer Terrace)", () => {
    expect(resolveWanderRoomDisplayName("summer-terrace")).toBe(
      "Swimming Pool",
    );
  });

  it("keeps Sunroom distinct from Butterfly House", () => {
    expect(resolveWanderRoomDisplayName("sunroom")).toBe("Sunroom");
    expect(resolveWanderRoomDisplayName("butterfly-house")).toBe(
      "Butterfly House",
    );
    expect(getPlaceById("butterfly-house")?.video).toBe(
      "butterfly-house-video.mp4",
    );
    expect(
      wanderable().some((p) => p.legacy_place_id === "butterfly-house"),
    ).toBe(true);
  });

  it("adds treehouse sub-rooms to Wander with correct names", () => {
    const ids = wanderable().map((p) => p.legacy_place_id);
    expect(ids).toContain("house-possibility-discovery-chest");
    expect(ids).toContain("house-possibility-reflection-desk");
    expect(ids).toContain("house-possibility-staircase");
    expect(ids).toContain("house-possibility-studio");
    expect(resolveWanderRoomDisplayName("house-possibility-discovery-chest")).toBe(
      "Treehouse Discovery Chest",
    );
    expect(resolveWanderRoomDisplayName("house-possibility-studio")).toBe(
      "Treehouse Possibility Studio",
    );
    expect(listSceneViewsForPlace("house-possibility-outside").length).toBe(4);
  });

  it("adds Writing Room, Swing, Tea Room, hammock, observatory variants", () => {
    const ids = wanderable().map((p) => p.legacy_place_id);
    expect(ids).toContain("writing-room");
    expect(ids).toContain("porch-swing");
    expect(ids).toContain("tea-room");
    expect(ids).toContain("lakeside-hammock");
    expect(ids).toContain("observatory-day-inside");
    expect(ids).toContain("observatory-day-outside");
    expect(ids).toContain("observatory-night-outside");
    expect(ids).toContain("discovery-room");
    expect(ids).toContain("study-hall");
    expect(ids).toContain("celebration-room");
    expect(resolveWanderRoomDisplayName("reading-nook")).toBe(
      "Reading Nook Window",
    );
    expect(resolveWanderRoomDisplayName("porch-swing")).toBe("Swing");
    expect(resolveWanderRoomDisplayName("lakeside-hammock")).toBe(
      "Water / Lakeside Hammock",
    );
  });

  it("deduplicates Discovery Room (single canonical id)", () => {
    const discovery = wanderable().filter(
      (p) => p.legacy_place_id === "discovery-room",
    );
    expect(discovery).toHaveLength(1);
  });
});
