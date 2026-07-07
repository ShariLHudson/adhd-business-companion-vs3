import { describe, expect, it } from "vitest";

import {
  getKnowledgeItem,
  getLiveKnowledgeItems,
  getEstateIntelligenceItem,
  searchKnowledgeItems,
  officialNameFor,
  canRecommendKnowledgeItem,
  discoveriesForEntity,
  momentumActivitiesForEntity,
  isForbiddenSubstitution,
} from "@/lib/estateKnowledgeBase";

describe("Estate Knowledge Base", () => {
  it("loads live greenhouse room", () => {
    const room = getKnowledgeItem("rooms", "greenhouse");
    expect(room?.officialName).toBe("Greenhouse™");
    expect(room?.status).toBe("Live");
    expect(canRecommendKnowledgeItem(room)).toBe(true);
  });

  it("blocks recommendation for draft rooms", () => {
    const room = getKnowledgeItem("rooms", "observatory");
    expect(room?.status).toBe("Draft");
    expect(canRecommendKnowledgeItem(room)).toBe(false);
  });

  it("resolves official vocabulary name", () => {
    expect(officialNameFor("rooms", "greenhouse")).toBe("Greenhouse™");
    expect(officialNameFor("features", "focus-audio")).toBe("Peaceful Places");
  });

  it("flags forbidden substitutions", () => {
    expect(isForbiddenSubstitution("Clear My Mind™", "Brain dump room")).toBe(
      true,
    );
    expect(isForbiddenSubstitution("Clear My Mind™", "Show Me How")).toBe(
      false,
    );
  });

  it("bridges discovery engine registry lookup", () => {
    const item = getEstateIntelligenceItem("estate-rooms", "greenhouse");
    expect(item?.route).toBe("/companion?section=growth-greenhouse");
  });

  it("returns discovery mappings for greenhouse", () => {
    expect(discoveriesForEntity("room", "greenhouse")).toContain("DISC-001");
  });

  it("returns live momentum activities for clear my mind", () => {
    const activities = momentumActivitiesForEntity("feature", "clear-my-mind");
    expect(activities.map((a) => a.id)).toContain("mental-unload");
  });

  it("searches by keyword", () => {
    const results = searchKnowledgeItems("greenhouse");
    expect(results.some((item) => item.id === "greenhouse")).toBe(true);
  });

  it("lists only live items per registry", () => {
    const liveRooms = getLiveKnowledgeItems("rooms");
    expect(liveRooms.every((room) => room.status === "Live")).toBe(true);
    expect(liveRooms.some((room) => room.id === "observatory")).toBe(false);
    expect(liveRooms.some((room) => room.id === "music-room")).toBe(true);
  });
});
