import { describe, expect, it } from "vitest";

import { getIntelligenceGraphCenterBootstrap } from "./services/intelligenceGraphCenterService";

describe("Intelligence Graph Center", () => {
  it("returns ecosystem areas and suggested searches", () => {
    const bootstrap = getIntelligenceGraphCenterBootstrap();
    expect(bootstrap.suggestedSearches.length).toBeGreaterThan(4);
    expect(bootstrap.featuredNodeId).toBe("node-listening-rooms");
  });
});
