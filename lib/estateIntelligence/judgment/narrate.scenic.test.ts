import { describe, expect, it } from "vitest";
import { buildRecommendationWhy } from "./narrate";
import type { EstateContextSignals } from "./types";

function signals(
  emotional: EstateContextSignals["emotional"],
): EstateContextSignals {
  return {
    emotional,
    overwhelmLevel: emotional === "overwhelmed" ? 3 : 0,
    intentFamilies: [],
    activityMode: "rest",
    wantsReading: false,
    wantsWater: false,
    wantsFocus: false,
    wantsThink: false,
    wantsRecover: true,
    wantsCatalog: false,
    wantsRoomStory: false,
    namedPlaceId: null,
    confidence: 0.8,
  };
}

describe("scenic place recommendation copy", () => {
  it("uses curated descriptions instead of feeling+unhurried templates", () => {
    const overwhelmed = signals("overwhelmed");
    for (const placeId of [
      "peaceful-places",
      "lakeside-hammock",
      "conservatory",
    ]) {
      const why = buildRecommendationWhy(placeId, overwhelmed);
      expect(why.toLowerCase()).not.toContain("and unhurried");
      expect(why).not.toMatch(/\b(calm|drift|wonder) and unhurried\b/i);
      expect(why.length).toBeGreaterThan(20);
    }
  });
});
