/**
 * @vitest-environment jsdom
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EstateMapFullScreen } from "@/components/estateMap/EstateMapFullScreen";
import {
  getExploreEstateCategoryGroups,
  getExploreEstateDestinations,
  resetExploreEstateDestinationsCache,
  searchExploreEstateDestinations,
} from "@/lib/estateMap/exploreEstateDestinations";
import {
  EXPLORE_SPARK_FORBIDDEN_PLACE_IDS,
  exploreMapLocationIdForPlaceId,
  getExploreSparkMapLocations,
  isExploreSparkForbiddenPlaceId,
  isExploreSparkRequest,
  resolveExploreMapLocationPlaceId,
} from "@/lib/estateMap/exploreSparkNavigation";

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
      searchExploreEstateDestinations("peaceful").some(
        (d) => d.id === "peaceful-places" || d.category === "peaceful",
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
    expect(exploreMapLocationIdForPlaceId("creative-studio")).toBeUndefined();
    expect(exploreMapLocationIdForPlaceId("chamber-of-momentum")).toBe(
      "momentum-institute",
    );
  });

  it("still detects Explore Estate chat phrases", () => {
    expect(isExploreSparkRequest("Explore Estate")).toBe(true);
    expect(isExploreSparkRequest("Show me the Estate grounds")).toBe(true);
    expect(isExploreSparkRequest("Show me peaceful places")).toBe(true);
  });
});
