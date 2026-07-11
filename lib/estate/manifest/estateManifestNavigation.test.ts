import { describe, expect, it } from "vitest";

import {
  findPlaceByAlias,
  findPlacesByIntent,
  getNavigationOptions,
  getPlaceById,
  getPlaceMedia,
  resolveManifestNavigation,
} from "./estatePlaceMasterManifest";
import { resolveEstatePlaceIdFromUserText } from "@/lib/estate/estateRoomAliasRegistry";
import { resolveCanonicalPlaceBackground, resolveCanonicalPlaceVideo } from "@/lib/estate/estatePlaceMedia";
import { resolveEstateRoutingDecision } from "@/lib/estate/estateRoutingRegistry";

describe("estatePlaceMasterManifest — protocol regression", () => {
  it("take me to butterflies → Butterfly House", () => {
    const result = resolveManifestNavigation("take me to butterflies");
    expect(result.kind).toBe("navigate");
    if (result.kind === "navigate") {
      expect(result.legacyPlaceId).toBe("butterfly-house");
      expect(result.place.official_name).toBe("Butterfly House");
    }
    expect(resolveEstatePlaceIdFromUserText("take me to butterflies")).toBe(
      "butterfly-house",
    );
  });

  it("does not route butterflies to sunroom, greenhouse, or celebration garden", () => {
    const matches = findPlacesByIntent("take me to butterflies");
    expect(matches.map((p) => p.legacy_place_id)).toEqual(["butterfly-house"]);
    expect(findPlaceByAlias("sunroom").map((p) => p.legacy_place_id)).not.toContain(
      "butterfly-house",
    );
  });

  it("take me to aquarium → Aquarium Room", () => {
    const result = resolveManifestNavigation("take me to aquarium");
    expect(result.kind).toBe("navigate");
    if (result.kind === "navigate") {
      expect(result.legacyPlaceId).toBe("conservatory");
      expect(result.place.official_name).toBe("Aquarium Room");
    }
  });

  it("take me to the fish → Aquarium Room", () => {
    const result = resolveManifestNavigation("take me to the fish");
    expect(result.kind).toBe("navigate");
    if (result.kind === "navigate") {
      expect(result.legacyPlaceId).toBe("conservatory");
    }
  });

  it("take me to personal library → Personal Library (not Estate Library)", () => {
    const result = resolveManifestNavigation("take me to personal library");
    expect(result.kind).toBe("navigate");
    if (result.kind === "navigate") {
      expect(result.legacyPlaceId).toBe("personal-library");
      expect(result.place.official_name).toBe("Personal Library");
    }
    expect(resolveEstatePlaceIdFromUserText("personal library")).toBe(
      "personal-library",
    );
    expect(resolveEstatePlaceIdFromUserText("estate library")).toBe("library");
  });

  it("take me to observatory → choice list (never random)", () => {
    const manifest = getNavigationOptions("take me to the observatory");
    expect(manifest.kind).toBe("suggest");
    if (manifest.kind === "suggest") {
      expect(manifest.options.length).toBeGreaterThanOrEqual(2);
      expect(manifest.options.map((o) => o.legacyPlaceId)).toEqual(
        expect.arrayContaining([
          "observatory",
          "house-possibility-observatory",
          "house-possibility-telescope-deck",
        ]),
      );
    }

    const routing = resolveEstateRoutingDecision("take me to the observatory");
    expect(routing.kind).toBe("suggest");
    expect(routing.suggestedPlaceIds).toEqual(
      expect.arrayContaining([
        "observatory",
        "house-possibility-observatory",
        "house-possibility-telescope-deck",
      ]),
    );
    expect(resolveEstatePlaceIdFromUserText("take me to the observatory")).toBe(
      null,
    );
  });
});

describe("estatePlaceMasterManifest — media from manifest", () => {
  it("loads Butterfly House image and video from manifest", () => {
    const media = getPlaceMedia("butterfly-house");
    expect(media.primaryImage).toBe("butterfly-house-background.png");
    expect(media.video).toBe("butterfly-house-video.mp4");
    expect(resolveCanonicalPlaceBackground("butterfly-house")).toContain(
      "butterfly-house-background.png",
    );
    expect(resolveCanonicalPlaceVideo("butterfly-house")).toContain(
      "butterfly-house-video.mp4",
    );
  });

  it("loads Aquarium Room image and video from manifest", () => {
    const media = getPlaceMedia("conservatory");
    expect(media.primaryImage).toBe("aquarium-room-background.png");
    expect(media.video).toBe("aquarium-room-video.mp4");
  });

  it("getPlaceById resolves manifest and legacy ids", () => {
    expect(getPlaceById("BUTTERFLY-HOUSE")?.legacy_place_id).toBe(
      "butterfly-house",
    );
    expect(getPlaceById("reflection-pond")?.legacy_place_id).toBe("seat-at-pond");
  });
});
