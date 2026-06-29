import { describe, expect, it } from "vitest";
import { suggestGrowthStoryDestinations } from "./suggestStoryDestinations";

describe("suggestGrowthStoryDestinations", () => {
  it("suggests wins and evidence for courageous client moments", () => {
    const result = suggestGrowthStoryDestinations(
      "Today I finally had the courage to call a difficult client, and it went much better than I expected.",
    );

    expect(result.headline).toMatch(/important/i);
    expect(result.recommendations.map((rec) => rec.id)).toEqual(
      expect.arrayContaining(["wins-this-week", "evidence-bank"]),
    );
  });

  it("returns journal when reflection language dominates", () => {
    const result = suggestGrowthStoryDestinations(
      "Today I feel grateful and needed time to reflect on how overwhelmed I've been.",
    );

    expect(result.recommendations[0]?.id).toBe("growth-journal");
  });
});
