import { describe, expect, it } from "vitest";

import { getResearchCenterBootstrap } from "./services/researchCenterService";

describe("Executive Research Center bootstrap", () => {
  it("returns categories, queries, and alerts for room UI", () => {
    const boot = getResearchCenterBootstrap();
    expect(boot.categories.length).toBeGreaterThan(10);
    expect(boot.suggestedQueries.length).toBeGreaterThan(3);
    expect(boot.significantAlerts.length).toBeLessThanOrEqual(3);
    expect(boot.sampleReportId).toBeTruthy();
  });
});
