import { describe, expect, it } from "vitest";

import { getOpportunityCenterBootstrap } from "./services/opportunityCenterService";

describe("Opportunity Discovery Center bootstrap", () => {
  it("returns overview for room UI", () => {
    const boot = getOpportunityCenterBootstrap();
    expect(boot.todaysBiggest.name.length).toBeGreaterThan(5);
    expect(boot.principle).toContain("evidence");
  });
});
