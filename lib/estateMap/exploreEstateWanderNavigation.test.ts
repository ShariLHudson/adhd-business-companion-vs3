/**
 * Wander the Estate / Explore Estate — every image tile must navigate.
 *
 * Regression coverage for a bug where selecting several Explore Estate cards
 * (Chamber of Momentum, Cartographer's Studio, Horizon Point, Estate Back
 * Deck, Back Fireside Deck Rain) silently reopened the map instead of
 * navigating, because `estateNavigateCommandForPlace()` returned null for
 * their destination ids.
 *
 * A small, known set of destinations are intentionally handled by dedicated
 * special cases in `handleExploreSparkMapSelect()` (CompanionPageClient.tsx)
 * *before* `estateNavigateCommandForPlace()` is ever called — those are
 * exempted here, not broken.
 *
 * @see app/companion/CompanionPageClient.tsx handleExploreSparkMapSelect
 * @see lib/estate/estateRoomAliasCatalog.ts
 */
import { describe, expect, it } from "vitest";
import { getExploreEstateDestinations } from "./exploreEstateDestinations";
import { resolveExploreMapLocationPlaceId } from "./exploreSparkNavigation";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";

/**
 * Destinations routed through a dedicated overlay/open-core function inside
 * `handleExploreSparkMapSelect` *before* the generic direct-navigation
 * command is built. These are expected to NOT resolve via
 * `estateNavigateCommandForPlace()` — that is by design, not a bug.
 */
const HANDLED_BEFORE_DIRECT_NAVIGATION = new Set(["breathe", "my-business-estate"]);

describe("Wander the Estate — every card navigates", () => {
  it("resolves every Explore Estate destination to a place id", () => {
    const destinations = getExploreEstateDestinations();
    expect(destinations.length).toBeGreaterThan(0);

    for (const dest of destinations) {
      const placeId = resolveExploreMapLocationPlaceId(dest);
      expect(placeId, `${dest.id} should resolve to a navigable place id`).toBeTruthy();
    }
  });

  it("builds a navigation command for every destination not covered by a special case", () => {
    const destinations = getExploreEstateDestinations();
    const failures: string[] = [];

    for (const dest of destinations) {
      const placeId = resolveExploreMapLocationPlaceId(dest);
      if (!placeId) continue;
      if (HANDLED_BEFORE_DIRECT_NAVIGATION.has(placeId)) continue;
      if (placeId === "welcome-home" || placeId === "spark-estate") continue;

      const command = estateNavigateCommandForPlace(placeId, `probe:${dest.name}`);
      if (!command) {
        failures.push(`${dest.id} (destinationId=${placeId})`);
      }
    }

    expect(
      failures,
      `Explore Estate destinations that do not navigate:\n${failures.join("\n")}`,
    ).toEqual([]);
  });

  it("resolves the previously-broken cards to their expected sections", () => {
    const expectations: Array<[placeId: string, expectedSection: string]> = [
      ["chamber-of-momentum", "chamber-of-momentum"],
      ["cartographers-studio", "visual-focus"],
      ["horizon-point", "home"],
      ["estate-back-deck", "home"],
      ["back-fireside-deck-rain", "home"],
    ];

    for (const [placeId, expectedSection] of expectations) {
      const command = estateNavigateCommandForPlace(placeId, `probe:${placeId}`);
      expect(command, `${placeId} should resolve to a command`).toBeTruthy();
      expect(command?.section).toBe(expectedSection);
    }
  });
});
