import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveIntegrationCenter,
  prepareFounderIntegrationSearch,
} from "./executiveIntegrationBridge";

describe("Founder Executive Integration bridge", () => {
  it("prepareFounderExecutiveIntegrationCenter returns center view", () => {
    const result = prepareFounderExecutiveIntegrationCenter();
    expect(result.center.groups.length).toBeGreaterThan(7);
    expect(result.principle).toContain("orchestrates");
  });

  it("prepareFounderIntegrationSearch returns results", () => {
    const result = prepareFounderIntegrationSearch("PostCraft");
    expect(result.search.results.length).toBeGreaterThan(0);
  });
});
