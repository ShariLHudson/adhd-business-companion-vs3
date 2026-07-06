import { describe, expect, it } from "vitest";

import { getDiscoveryEngineCenterBootstrap } from "./index";

describe("Discovery Engine Center", () => {
  it("returns bootstrap with daily brief ready", () => {
    const bootstrap = getDiscoveryEngineCenterBootstrap();
    expect(bootstrap.dailyBriefReady).toBe(true);
    expect(bootstrap.overnightMessage).toContain("away");
  });
});
