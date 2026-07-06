import { describe, expect, it } from "vitest";

import { getRelationshipIntelligenceCenterBootstrap } from "./services/relationshipIntelligenceCenterService";

describe("Relationship Intelligence Center", () => {
  it("returns bootstrap with alerts", () => {
    const bootstrap = getRelationshipIntelligenceCenterBootstrap();
    expect(bootstrap.founderAlertIds.length).toBeGreaterThan(0);
    expect(bootstrap.featuredDiscoveryId).toBe("disc-seven-conversations");
  });
});
