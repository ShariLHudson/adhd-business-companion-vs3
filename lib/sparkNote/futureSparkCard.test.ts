import { describe, expect, it } from "vitest";
import {
  deriveTeaser,
  futureSparkCardToCatalogEntry,
  normalizeRegionCode,
  type FutureSparkCard,
} from "./futureSparkCard";

function card(overrides: Partial<FutureSparkCard> & { id: string }): FutureSparkCard {
  return {
    volume: 2,
    collection: "core",
    displayRule: "core",
    priority: 100,
    category: "001",
    categoryLabel: "Discovery",
    categoryImage: "/spark-card-images/discovery.png",
    title: overrides.id,
    story: "A short but complete story sentence about the discovery. And a second sentence with more.",
    spark: "The meaningful takeaway that matters.",
    action: "What could you try today?",
    sparkType: "story",
    tags: ["Discovery", "volume-2"],
    status: "future-ready",
    ...overrides,
  };
}

describe("futureSparkCardToCatalogEntry — body + metadata mapping", () => {
  it("maps story/spark/action to whatHappened/whyItMatters/sparkApplication", () => {
    const e = futureSparkCardToCatalogEntry(
      card({ id: "SPARK-X", story: "S", spark: "K", action: "A?" }),
    );
    expect(e.whatHappened).toBe("S");
    expect(e.whyItMatters).toBe("K"); // "Today's Spark"
    expect(e.sparkApplication).toBe("A?");
  });

  it("carries id/category/label/image/tags/priority and derives a teaser", () => {
    const e = futureSparkCardToCatalogEntry(card({ id: "SPARK-Y" }));
    expect(e.id).toBe("SPARK-Y");
    expect(e.category).toBe("001");
    expect(e.categoryLabel).toBe("Discovery");
    expect(e.imageSrc).toBe("/spark-card-images/discovery.png");
    expect(e.tags).toEqual(["Discovery", "volume-2"]);
    expect(e.priority).toBe(100);
    expect(e.shortTitle).toBe("SPARK-Y");
    expect(e.teaser.length).toBeGreaterThan(0);
    // No teaser field exists on FutureSparkCard, so it comes from the story.
    expect(e.teaser.startsWith("A short but complete story sentence")).toBe(true);
  });
});

describe("futureSparkCardToCatalogEntry — scheduling fields", () => {
  it("core", () => {
    const e = futureSparkCardToCatalogEntry(card({ id: "C", displayRule: "core" }));
    expect(e.displayRule).toBe("core");
    expect(e.volume).toBe(2);
    expect(e.collection).toBe("core");
    expect(e.month).toBeUndefined();
  });

  it("exact-date carries flat month/day", () => {
    const e = futureSparkCardToCatalogEntry(
      card({ id: "E", displayRule: "exact-date", month: 11, day: 11 }),
    );
    expect(e.displayRule).toBe("exact-date");
    expect(e.month).toBe(11);
    expect(e.day).toBe(11);
  });

  it("calculated-date carries the dateRule", () => {
    const e = futureSparkCardToCatalogEntry(
      card({
        id: "K",
        displayRule: "calculated-date",
        dateRule: "thanksgiving-us",
      }),
    );
    expect(e.dateRule).toBe("thanksgiving-us");
  });

  it("seasonal carries season/months and a normalized region", () => {
    const e = futureSparkCardToCatalogEntry(
      card({
        id: "S",
        collection: "iowa-seasons",
        displayRule: "seasonal",
        season: "autumn",
        months: [9, 10, 11],
        region: "Iowa",
        priority: 140,
      }),
    );
    expect(e.displayRule).toBe("seasonal");
    expect(e.season).toBe("autumn");
    expect(e.months).toEqual([9, 10, 11]);
    expect(e.region).toBe("US-IA"); // "Iowa" → structured code
    expect(e.collection).toBe("iowa-seasons");
  });
});

describe("normalizeRegionCode", () => {
  it("maps Iowa → US-IA and passes structured codes through", () => {
    expect(normalizeRegionCode("Iowa")).toBe("US-IA");
    expect(normalizeRegionCode("US-IA")).toBe("US-IA");
    expect(normalizeRegionCode(undefined)).toBeUndefined();
    expect(normalizeRegionCode("")).toBeUndefined();
  });
});

describe("deriveTeaser", () => {
  it("uses the first sentence when it is substantial", () => {
    const story =
      "This first sentence is clearly long enough to stand on its own. Second.";
    expect(deriveTeaser(story)).toBe(
      "This first sentence is clearly long enough to stand on its own.",
    );
  });

  it("appends a second sentence when the first is very short", () => {
    expect(deriveTeaser("Short. A longer follow-up sentence here.")).toBe(
      "Short. A longer follow-up sentence here.",
    );
  });
});
