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
    expect(mySparksShelfBucket("business")).toBe("business");
    expect(mySparksShelfBucket("creativity")).toBe("reflections");
    expect(mySparksShelfBucket("gratitude")).toBe("growth");
    expect(mySparksShelfBucket("fun_fact")).toBe("fun");
    expect(MY_SPARKS_SHELF_BUCKETS.length).toBeGreaterThan(4);
  });
});
