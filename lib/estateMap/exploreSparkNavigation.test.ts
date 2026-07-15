import { describe, expect, it } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { planEstateActionExecution } from "@/lib/estate/decisionKernel";
import { resolveEstateAction } from "@/lib/estate/decisionKernel/resolveEstateAction";
import { evaluateEstatePlaceTurn } from "@/lib/estate/estatePlaceNavigation";
import {
  evaluateMetaEstateNavigationTurn,
  isEstateRoomListOrMapRequest,
} from "@/lib/estate/estateMetaNavigation";
import {
  EXPLORE_SPARK_LABEL,
  exploreMapLocationIdForPlaceId,
  getExploreSparkMapLocations,
  isExploreSparkForbiddenPlaceId,
  isExploreSparkRequest,
  isStaleCreateLastLocation,
  resolveExploreMapLocationPlaceId,
} from "./exploreSparkNavigation";

describe("Explore Spark visual navigation", () => {
  it("uses the approved Explore Spark label", () => {
    expect(EXPLORE_SPARK_LABEL).toBe("Explore Spark");
  });

  it("detects Explore Spark chat phrases", () => {
    const phrases = [
      "Open Explore Spark",
      "Take me to Explore Spark",
      "Show me the Estate rooms",
      "Let me explore the Estate",
      "Show all rooms and spaces",
      "explore spark",
      "Explore Estate",
    ];
    for (const phrase of phrases) {
      expect(isExploreSparkRequest(phrase) || isEstateRoomListOrMapRequest(phrase)).toBe(
        true,
      );
    }
  });

  it("does not treat Create / content-generator as Explore Spark destinations", () => {
    expect(isExploreSparkForbiddenPlaceId("content-generator")).toBe(true);
    expect(isExploreSparkForbiddenPlaceId("create")).toBe(true);
    expect(isExploreSparkForbiddenPlaceId("clear-my-mind")).toBe(true);
    expect(isExploreSparkForbiddenPlaceId("creative-studio")).toBe(false);
    expect(isExploreSparkForbiddenPlaceId("library")).toBe(false);
  });

  it("ignores stale Create last-location values", () => {
    expect(isStaleCreateLastLocation("creative-studio")).toBe(true);
    expect(isStaleCreateLastLocation("content-generator")).toBe(true);
    expect(isStaleCreateLastLocation("welcome-home")).toBe(false);
  });

  it("maps approved cards to navigable place ids — never Create", () => {
    const locations = getExploreSparkMapLocations();
    expect(locations.length).toBeGreaterThan(0);
    for (const loc of locations) {
      const placeId = resolveExploreMapLocationPlaceId(loc);
      expect(placeId).toBeTruthy();
      expect(isExploreSparkForbiddenPlaceId(placeId)).toBe(false);
      expect(loc.image).toMatch(/^\//);
    }
    expect(resolveExploreMapLocationPlaceId("welcome-home")).toBe("welcome-home");
    expect(resolveExploreMapLocationPlaceId("apple-orchard")).toBe("apple-orchard");
    expect(resolveExploreMapLocationPlaceId("stables")).toBe("stables");
    expect(resolveExploreMapLocationPlaceId("momentum-institute")).toBe(
      "chamber-of-momentum",
    );
  });

  it("resolves You-are-here from place ids", () => {
    expect(exploreMapLocationIdForPlaceId("welcome-home")).toBe("welcome-home");
    expect(exploreMapLocationIdForPlaceId("creative-studio")).toBe(
      "creative-studio",
    );
    expect(exploreMapLocationIdForPlaceId("create")).toBeUndefined();
  });

  it("meta navigation opens the visual explorer for Explore Spark", () => {
    const turn = evaluateMetaEstateNavigationTurn({
      userText: "Take me to Explore Spark",
      currentPlaceId: "welcome-home",
    });
    expect(turn?.type).toBe("open_visual_explorer");
  });

  it("place turn opens visual explorer — not Create navigate", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "Take me to Explore Spark",
      currentPlaceId: "library",
    });
    expect(turn.type).toBe("open_visual_explorer");
  });

  it("kernel opens Explore Spark instead of place-menu or Create", () => {
    const decision = resolveEstateAction({
      userText: "Take me to Explore Spark",
      currentPlaceId: "welcome-home",
    });
    expect(decision.action).toBe("OPEN_EXPLORE_SPARK");
    expect(planEstateActionExecution(decision).type).toBe("open-explore-spark");
  });

  it("classifyCompanionIntent plans open-explore-spark", () => {
    const classified = classifyCompanionIntent({
      userText: "Show me the Estate rooms",
      currentPlaceId: "welcome-home",
    });
    expect(classified.plan.type).toBe("open-explore-spark");
  });

  it("room list phrases open visual explorer, not text Create menus", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "do you have a list of rooms i can visit",
      currentPlaceId: "library",
    });
    expect(turn.type).toBe("open_visual_explorer");
  });

  it("direct room requests still navigate to that room", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "Take me to the Coffee House",
      currentPlaceId: "welcome-home",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("coffee-house");
    }
  });
});
