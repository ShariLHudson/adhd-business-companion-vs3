import { describe, expect, it } from "vitest";

import { sparkTypeDisplayLabel } from "./delightExperience";
import {
  mySparksShelfBucket,
  MY_SPARKS_SHELF_BUCKETS,
} from "./mySparksCollection";

describe("delightExperience", () => {
  it("labels quick and deep spark types for variety", () => {
    expect(sparkTypeDisplayLabel("quick")).toBe("Quick Spark");
    expect(sparkTypeDisplayLabel("deep")).toBe("Deep Spark");
    expect(sparkTypeDisplayLabel("story")).toBeNull();
  });
});

describe("mySparksCollection shelves", () => {
  it("maps categories to delight shelf buckets", () => {
    expect(mySparksShelfBucket("010")).toBe("business"); // Business
    expect(mySparksShelfBucket("003")).toBe("reflections"); // Creativity & Inspiration
    expect(mySparksShelfBucket("008")).toBe("growth"); // Reflection
    expect(mySparksShelfBucket("012")).toBe("fun"); // Wonder
    expect(MY_SPARKS_SHELF_BUCKETS.length).toBeGreaterThan(4);
  });
});
