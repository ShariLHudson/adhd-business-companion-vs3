import { describe, expect, it } from "vitest";

import {
  prepareFounderDailyDiscoveryBrief,
  prepareFounderExecutiveDiscoveryEngine,
} from "./executiveDiscoveryEngineBridge";

describe("Founder Executive Discovery Engine bridge", () => {
  it("prepareFounderExecutiveDiscoveryEngine returns bootstrap", () => {
    const result = prepareFounderExecutiveDiscoveryEngine();
    expect(result.bootstrap.dailyBriefReady).toBe(true);
    expect(result.principle).toContain("value");
  });

  it("prepareFounderDailyDiscoveryBrief returns overnight brief", () => {
    const result = prepareFounderDailyDiscoveryBrief();
    expect(result.brief.overnightMessage).toContain("away");
    expect(result.brief.topDiscovery.headline).toBeTruthy();
  });
});
