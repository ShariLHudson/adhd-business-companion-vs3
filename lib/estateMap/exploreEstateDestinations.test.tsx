/**
 * @vitest-environment jsdom
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EstateMapFullScreen } from "@/components/estateMap/EstateMapFullScreen";
import {
  EXPLORE_ESTATE_REQUIRED_BACKGROUNDS,
  EXPLORE_ESTATE_REQUIRED_NAMES,
  EXPLORE_ESTATE_REQUIRED_VIDEOS,
  getExploreEstateCategoryGroups,
  getExploreEstateDestinations,
  resetExploreEstateDestinationsCache,
  searchExploreEstateDestinations,
} from "@/lib/estateMap/exploreEstateDestinations";
import {
  estateRoomUsesExperienceVideo,
  resolveEstateRoomExperienceVideo,
} from "@/lib/estate/estateRoomExperienceVideo";
import { resolveCanonicalPlaceBackground } from "@/lib/estate/estatePlaceMedia";
import {
  EXPLORE_SPARK_FORBIDDEN_PLACE_IDS,
  exploreMapLocationIdForPlaceId,
  getExploreSparkMapLocations,
  isExploreSparkForbiddenPlaceId,
  isExploreSparkRequest,
  resolveExploreMapLocationPlaceId,
} from "@/lib/estateMap/exploreSparkNavigation";
import { getPlaceMedia } from "@/lib/estate/manifest/estatePlaceMasterManifest";

function publicPathExists(url: string): boolean {
  if (!url.startsWith("/")) return false;
  const relative = decodeURIComponent(url.replace(/^\//, ""));
  return existsSync(join(process.cwd(), "public", relative));
}

describe("Explore Estate visual destinations", () => {
  beforeEach(() => {
    resetExploreEstateDestinationsCache();
  });

  it("builds image cards from the master manifest registry", () => {
    const destinations = getExploreEstateDestinations();
    expect(destinations.length).toBeGreaterThan(20);
    expect(destinations.every((d) => d.name.trim().length > 0)).toBe(true);
    expect(destinations.every((d) => d.imagePath.length > 0 || !d.imageReady)).toBe(
      true,
    );
  });

  it("does not include Create or Clear My Mind", () => {
    const destinations = getExploreEstateDestinations();
    for (const dest of destinations) {
      expect(isExploreSparkForbiddenPlaceId(dest.destinationId)).toBe(false);
      expect(isExploreSparkForbiddenPlaceId(dest.id)).toBe(false);
      expect(dest.name.toLowerCase()).not.toContain("clear my mind");
      expect(dest.destinationId).not.toBe("create");
      expect(dest.destinationId).not.toBe("content-generator");
    }
    for (const forbidden of EXPLORE_SPARK_FORBIDDEN_PLACE_IDS) {
      expect(
        destinations.some(
          (d) => d.id === forbidden || d.destinationId === forbidden,
        ),
      ).toBe(false);
    }
  });

  it("uses one card per official place — aliases do not duplicate", () => {
    const destinations = getExploreEstateDestinations();
    const ids = destinations.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = destinations.map((d) => d.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("does not show two catalog cards with the same image", () => {
    const destinations = getExploreEstateDestinations().filter(
      (d) => d.imageReady && d.imagePath,
    );
    const byImage = new Map<string, string[]>();
    for (const d of destinations) {
      const key = d.imagePath.toLowerCase();
      const list = byImage.get(key) ?? [];
      list.push(d.name);
      byImage.set(key, list);
    }
    const duplicateGroups = [...byImage.entries()].filter(
      ([, names]) => names.length > 1,
    );
    expect(duplicateGroups).toEqual([]);
  });

  it("hides catalog-only duplicate plates from Explore Estate", () => {
    const destinations = getExploreEstateDestinations();
    const hidden = [
      "personal-library",
      "main-staircase",
      "window-seat",
      "coffee-house",
      "momentum-builder",
      "momentum-room",
      "peaceful-places",
      "garden-bench",
      "writing-room",
      "observatory",
      "observatory-day-outside",
      "observatory-day-inside",
      "lakeside-verandah",
      "balcony",
      "personal-deck",
      "the-swing-beneath-the-oak",
      "reflection-tree-main",
    ];
    for (const id of hidden) {
      expect(
        destinations.some((d) => d.id === id),
        id,
      ).toBe(false);
    }
  });

  it("removes requested destinations from the Explore Estate member-facing list", () => {
    const destinations = getExploreEstateDestinations();
    const forbiddenNames = [
      "Personal Library",
      "Momentum Builder",
      "Momentum Room",
      "Main Staircase",
      "Window Seat",
      "Lakeside Verandah",
      "Private Balcony",
      "Private Deck",
      "Personal Deck",
      "The Swing Beneath the Oak",
      "Tree Swing",
      "Reflection Tree",
      "Observatory",
      "Observatory Daytime",
      "Observatory Inside",
    ];
    for (const name of forbiddenNames) {
      expect(
        destinations.some((d) => d.name === name),
        name,
      ).toBe(false);
    }
    expect(destinations.every((d) => d.name.trim().length > 0)).toBe(true);
    expect(destinations.every((d) => Boolean(d.id))).toBe(true);
  });

  it("places Spark Estate Entry first and Welcome Home second", () => {
    const destinations = getExploreEstateDestinations();
    expect(destinations[0]?.name).toBe("Spark Estate Entry");
    expect(destinations[0]?.id).toBe("spark-estate");
    expect(destinations[1]?.name).toBe("Welcome Home");
    expect(destinations[1]?.id).toBe("welcome-home");

    const entry = getExploreEstateCategoryGroups().find((g) => g.id === "entry");
    expect(entry?.label).toBe("Estate Entry");
    expect(entry?.destinations.map((d) => d.name)).toEqual([
      "Spark Estate Entry",
      "Welcome Home",
    ]);
  });

  it("excludes Personal Library / Reading Nook Under Stairway from Explore Estate", () => {
    const destinations = getExploreEstateDestinations();
    expect(destinations.some((d) => d.id === "personal-library")).toBe(false);
    expect(destinations.some((d) => d.id === "stairway-reading-nook")).toBe(
      false,
    );
    expect(
      destinations.some((d) => d.name === "Personal Library"),
    ).toBe(false);
    expect(
      destinations.some((d) => d.name === "Reading Nook Under Stairway"),
    ).toBe(false);
  });

  it("includes every required Explore Estate room name exactly once", () => {
    const destinations = getExploreEstateDestinations();
    const byName = new Map(
      destinations.map((d) => [d.name, destinations.filter((x) => x.name === d.name)]),
    );
    for (const name of EXPLORE_ESTATE_REQUIRED_NAMES) {
      const matches = destinations.filter((d) => d.name === name);
      expect(matches, name).toHaveLength(1);
      expect(byName.get(name)?.length).toBe(1);
    }
  });

  it("lists Explore Estate cards alphabetically within each category", () => {
    const groups = getExploreEstateCategoryGroups();
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      const names = group.destinations.map((d) => d.name);
      const sorted = [...names].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
      expect(names, group.id).toEqual(sorted);
    }
  });

  it("resolves required background assets on disk", () => {
    const destinations = getExploreEstateDestinations();
    for (const [id, expectedPath] of Object.entries(
      EXPLORE_ESTATE_REQUIRED_BACKGROUNDS,
    )) {
      const dest = destinations.find((d) => d.id === id);
      expect(dest, id).toBeTruthy();
      expect(dest?.imagePath).toBe(expectedPath);
      expect(dest?.imageReady).toBe(true);
      expect(publicPathExists(expectedPath), expectedPath).toBe(true);
    }
  });

  it("keeps Aquarium and Butterfly House as Explore Estate video destinations", () => {
    const aquarium = getExploreEstateDestinations().find(
      (d) => d.id === "conservatory",
    );
    expect(aquarium?.name).toBe("Aquarium Room");
    expect(aquarium?.mediaType).toBe("video");
    expect(aquarium?.videoPath).toBe("/Videos/aquarium-room-video.mp4");
    expect(aquarium?.imagePath).not.toMatch(/\.mp4$/i);
    expect(publicPathExists(aquarium!.videoPath!)).toBe(true);
    expect(resolveEstateRoomExperienceVideo("conservatory")).toBe(
      "/Videos/aquarium-room-video.mp4",
    );
    expect(estateRoomUsesExperienceVideo("conservatory")).toBe(true);

    const butterfly = getExploreEstateDestinations().find(
      (d) => d.id === "butterfly-house",
    );
    expect(butterfly?.name).toBe("Butterfly House");
    expect(butterfly?.mediaType).toBe("video");
    expect(butterfly?.videoPath).toBe("/Videos/butterfly-house-video.mp4");
    expect(butterfly?.imagePath).not.toMatch(/\.mp4$/i);
    expect(publicPathExists(butterfly!.videoPath!)).toBe(true);
    expect(resolveEstateRoomExperienceVideo("butterfly-house")).toBe(
      "/Videos/butterfly-house-video.mp4",
    );
    expect(estateRoomUsesExperienceVideo("butterfly-house")).toBe(true);

    for (const [id, expectedPath] of Object.entries(
      EXPLORE_ESTATE_REQUIRED_VIDEOS,
    )) {
      const dest = getExploreEstateDestinations().find((d) => d.id === id);
      expect(dest?.mediaType).toBe("video");
      expect(dest?.videoPath).toBe(expectedPath);
    }

    const media = getPlaceMedia("butterfly-house");
    expect(media.video).toBeTruthy();
    expect(media.videoUrl).toBe("/Videos/butterfly-house-video.mp4");
  });

  it("uses the corrected Woodland Path and Discovery Room still images", () => {
    const woodland = getExploreEstateDestinations().find(
      (d) => d.id === "woodland-path",
    );
    expect(woodland?.name).toBe("Woodland Path");
    expect(woodland?.mediaType).toBe("image");
    expect(woodland?.imagePath).toBe("/backgrounds/woodland-pathway.png");
    expect(woodland?.imageReady).toBe(true);
    expect(publicPathExists(woodland!.imagePath)).toBe(true);
    expect(resolveCanonicalPlaceBackground("woodland-path")).toContain(
      "woodland-pathway.png",
    );

    const discovery = getExploreEstateDestinations().find(
      (d) => d.id === "discovery-room",
    );
    expect(discovery?.name).toBe("Discovery Room");
    expect(discovery?.mediaType).toBe("image");
    expect(discovery?.imagePath).toBe(
      "/backgrounds/writing-room-2-background.png",
    );
    expect(discovery?.imageReady).toBe(true);
    expect(publicPathExists(discovery!.imagePath)).toBe(true);
    expect(resolveCanonicalPlaceBackground("discovery-room")).toContain(
      "writing-room-2-background.png",
    );
  });

  it("groups indoor and outside spaces with updated labels", () => {
    const groups = getExploreEstateCategoryGroups();
    expect(groups.some((g) => g.id === "rooms" && g.label === "Indoor Spaces")).toBe(
      true,
    );
    expect(
      groups.some((g) => g.id === "grounds" && g.label === "Outside Spaces"),
    ).toBe(true);
    const indoor = groups.find((g) => g.id === "rooms");
    expect(indoor?.destinations.some((d) => d.name === "Study Hall")).toBe(true);
    expect(indoor?.destinations.some((d) => d.name === "Aquarium Room")).toBe(
      true,
    );
    expect(indoor?.destinations.some((d) => d.name === "Discovery Room")).toBe(
      true,
    );
    expect(
      indoor?.destinations.some((d) => d.name === "Hall of Achievements"),
    ).toBe(false);
    const reflection = groups.find((g) => g.id === "reflection");
    expect(reflection?.label).toBe("Reflection and Progress");
    expect(
      reflection?.destinations.some((d) => d.name === "Hall of Achievements"),
    ).toBe(true);
    const outside = groups.find((g) => g.id === "grounds");
    expect(outside?.destinations.some((d) => d.name === "Woodland Path")).toBe(
      true,
    );
    expect(outside?.destinations.some((d) => d.name === "Horizon Point")).toBe(
      true,
    );
  });

  it("shows Possibility House for the treehouse place and Boardroom for round table", () => {
    const destinations = getExploreEstateDestinations();
    const possibility = destinations.find(
      (d) => d.id === "house-possibility-outside",
    );
    expect(possibility?.name).toBe("Possibility House");
    expect(
      possibility?.aliases?.some((a) => a.toLowerCase().includes("treehouse")),
    ).toBe(true);

    const board = destinations.find((d) => d.id === "round-table");
    expect(board?.name).toBe("Round Table Boardroom");
    expect(board?.destinationId).toBe("boardroom");
  });

  it("routes Chamber of Momentum to chamber-of-momentum", () => {
    const chamber = getExploreEstateDestinations().find(
      (d) => d.id === "momentum-institute",
    );
    expect(chamber?.name).toMatch(/Chamber of Momentum/i);
    expect(chamber?.destinationId).toBe("chamber-of-momentum");
  });

  it("validates available destinations have nonempty image paths pointing at public assets", () => {
    const destinations = getExploreEstateDestinations();
    const missing: string[] = [];
    for (const dest of destinations) {
      expect(dest.imagePath.trim().length).toBeGreaterThan(0);
      if (dest.imageReady && !publicPathExists(dest.imagePath)) {
        missing.push(`${dest.id} → ${dest.imagePath}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("reports calm fallback for destinations without a ready image", () => {
    const pending = getExploreEstateDestinations().filter((d) => !d.imageReady);
    for (const dest of pending) {
      expect(dest.unavailableMessage ?? "Image being prepared").toMatch(
        /image being prepared/i,
      );
    }
  });

  it("groups into calm categories", () => {
    const groups = getExploreEstateCategoryGroups();
    expect(groups.length).toBeGreaterThan(3);
    expect(groups.some((g) => g.id === "rooms" || g.id === "peaceful")).toBe(
      true,
    );
  });

  it("search finds official names and aliases", () => {
    expect(
      searchExploreEstateDestinations("treehouse").some(
        (d) => d.name === "Possibility House",
      ),
    ).toBe(true);
    expect(
      searchExploreEstateDestinations("boardroom").some(
        (d) => d.id === "round-table",
      ),
    ).toBe(true);
    expect(
      searchExploreEstateDestinations("journal").some((d) => d.id === "journal"),
    ).toBe(true);
    expect(
      searchExploreEstateDestinations("pond").some(
        (d) => d.id === "seat-at-pond" || d.category === "peaceful",
      ),
    ).toBe(true);
    expect(
      searchExploreEstateDestinations("cartography").length,
    ).toBeGreaterThanOrEqual(0);
  });

  it("getExploreSparkMapLocations exposes image paths for the directory UI", () => {
    const locations = getExploreSparkMapLocations();
    expect(locations.length).toBeGreaterThan(20);
    for (const loc of locations) {
      expect(loc.image).toMatch(/^\//);
      expect(resolveExploreMapLocationPlaceId(loc)).toBeTruthy();
      expect(isExploreSparkForbiddenPlaceId(resolveExploreMapLocationPlaceId(loc))).toBe(
        false,
      );
    }
  });

  it("renders Explore Estate image cards without broken image markup for ready assets", () => {
    const html = renderToStaticMarkup(
      <EstateMapFullScreen
        open
        onClose={() => {}}
        locations={getExploreSparkMapLocations()}
      />,
    );
    expect(html).toContain('data-testid="explore-estate-directory"');
    expect(html).toContain("Explore Estate");
    expect(html).toContain('data-testid="explore-estate-search"');
    expect(html).toContain("Possibility House");
    expect(html).toContain("Round Table Boardroom");
    expect(html).toContain("Chamber of Momentum");
    expect(html).toContain("data-image-ready=");
    expect(html).not.toContain('src=""');
  });

  it("resolves you-are-here from place ids", () => {
    expect(exploreMapLocationIdForPlaceId("welcome-home")).toBe("welcome-home");
    expect(exploreMapLocationIdForPlaceId("creative-studio")).toBe(
      "creative-studio",
    );
    expect(exploreMapLocationIdForPlaceId("chamber-of-momentum")).toBe(
      "momentum-institute",
    );
  });

  it("renders updated Explore Estate names in the directory", () => {
    const html = renderToStaticMarkup(
      <EstateMapFullScreen
        open
        onClose={() => {}}
        locations={getExploreSparkMapLocations()}
      />,
    );
    expect(html).toContain("Spark Estate Entry");
    expect(html).toContain("Welcome Home");
    expect(html).toContain("Aquarium Room");
    expect(html).toContain("Butterfly House");
    expect(html).toContain("Discovery Room");
    expect(html).toContain("Woodland Path");
    expect(html).toContain("Hall of Achievements");
    expect(html).toContain("Cartographer&#x27;s Studio");
    expect(html).not.toContain("Personal Library");
    expect(html).not.toContain("Reading Nook Under Stairway");
    expect(html).not.toContain("Tree Swing");
    expect(html).not.toContain("Personal Deck");
    expect(html).not.toContain("Observatory Daytime");
    expect(html).toContain('data-media-type="video"');
    expect(html).toContain('data-video-path="/Videos/aquarium-room-video.mp4"');
    expect(html).toContain(
      'data-video-path="/Videos/butterfly-house-video.mp4"',
    );
    expect(html).not.toMatch(/src="\/Videos\/[^"]+\.mp4"/);
    expect(html).toContain("Estate Entry");
    expect(html).toContain("Indoor Spaces");
    expect(html).toContain("Outside Spaces");
  });

  it("still detects Explore Estate chat phrases", () => {
    expect(isExploreSparkRequest("Explore Estate")).toBe(true);
    expect(isExploreSparkRequest("Show me the Estate grounds")).toBe(true);
    expect(isExploreSparkRequest("Show me peaceful places")).toBe(true);
  });
});
