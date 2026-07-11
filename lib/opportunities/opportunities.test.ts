import { describe, expect, it } from "vitest";

import {
  composeOpportunityDiscoveryOverview,
  getOpportunityById,
  OPPORTUNITY_DISCOVERY_PRINCIPLE,
} from "./index";

describe("Opportunity Discovery Center engine", () => {
  it("exposes discovery principle", () => {
    expect(OPPORTUNITY_DISCOVERY_PRINCIPLE).toContain("build next");
  });

  it("composeOpportunityDiscoveryOverview surfaces executive opening zones", () => {
    const view = composeOpportunityDiscoveryOverview();
    expect(view.todaysBiggest).toBeDefined();
    expect(view.emerging.length).toBeLessThanOrEqual(3);
    expect(view.quickWins.length).toBeLessThanOrEqual(3);
    expect(view.competitiveThreats.length).toBeLessThanOrEqual(3);
    expect(view.watching.length).toBeLessThanOrEqual(3);
  });

  it("opportunity includes why now and so what", () => {
    const opp = getOpportunityById("opp-listening-rooms-restart");
    expect(opp?.whyNow.whyNow.length).toBeGreaterThan(10);
    expect(opp?.soWhat.ecosystemImpact.length).toBeGreaterThan(0);
    expect(opp?.recommendationRationale.length).toBeGreaterThan(10);
    expect(opp?.ifIgnored.length).toBeGreaterThan(10);
  });

  it("opportunity includes value metrics and prep offers", () => {
    const opp = getOpportunityById("opp-research-to-build-pipeline");
    expect(opp?.valueMetrics.strategicValue).toBe("high");
    expect(opp?.prepOffers.length).toBeGreaterThan(5);
  });
});
