import { describe, expect, it } from "vitest";

import {
  prepareFounderOpportunityCenter,
  prepareFounderOpportunityDetail,
  prepareFounderOpportunityOverview,
} from "./opportunityDiscoveryBridge";

describe("Founder Opportunity Discovery bridge", () => {
  it("prepareFounderOpportunityCenter returns overview", () => {
    const center = prepareFounderOpportunityCenter("listening-rooms");
    expect(center.overview.todaysBiggest).toBeDefined();
  });

  it("prepareFounderOpportunityOverview includes buckets", () => {
    const view = prepareFounderOpportunityOverview();
    expect(view.emerging.length).toBeLessThanOrEqual(3);
  });

  it("prepareFounderOpportunityDetail loads full opportunity", () => {
    const detail = prepareFounderOpportunityDetail("opp-listening-rooms-restart");
    expect(detail.opportunity?.boardRecommendation).toBeTruthy();
    expect(detail.opportunity?.outsideTheBox.potentialRisks.length).toBeGreaterThan(0);
  });
});
