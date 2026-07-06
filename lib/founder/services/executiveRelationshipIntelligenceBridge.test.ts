import { describe, expect, it } from "vitest";

import {
  prepareFounderDiscoverySession,
  prepareFounderExecutiveRelationshipIntelligence,
} from "./executiveRelationshipIntelligenceBridge";

describe("Founder Executive Relationship Intelligence bridge", () => {
  it("prepareFounderExecutiveRelationshipIntelligence returns bootstrap", () => {
    const ri = prepareFounderExecutiveRelationshipIntelligence();
    expect(ri.bootstrap.discoveryCount).toBeGreaterThan(3);
    expect(ri.principle).toContain("knowledge");
  });

  it("prepareFounderDiscoverySession returns founder alerts", () => {
    const result = prepareFounderDiscoverySession("customer patterns");
    expect(result.session?.discoveries.length).toBeGreaterThan(0);
    expect(result.session?.founderAlerts.length).toBeGreaterThanOrEqual(0);
  });
});
