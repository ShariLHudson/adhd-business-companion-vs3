import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveQuestions,
  prepareFounderMorningBrief,
  prepareFounderMorningSummary,
  prepareFounderOffice,
  prepareFounderOvernightBundle,
  prepareFounderRecommendations,
  prepareFounderResearchSummary,
} from "./overnightExecutiveCycleBridge";

describe("Founder Overnight Executive Cycle bridge", () => {
  it("prepareFounderOffice returns prepared office without UI wiring", () => {
    const office = prepareFounderOffice("listening-rooms");
    expect(office.recommendedMission.missionId).toBe("listening-rooms");
    expect(office.recommendations.length).toBeGreaterThan(0);
  });

  it("prepareFounderMorningBrief and summary return calm morning surfaces", () => {
    const brief = prepareFounderMorningBrief();
    expect(brief.greeting).toContain("Shari");

    const morning = prepareFounderMorningSummary();
    expect(morning.stats.researchItemsReviewed).toBe(124);
  });

  it("prepareFounderExecutiveQuestions and recommendations compose", () => {
    expect(prepareFounderExecutiveQuestions().length).toBeGreaterThan(0);
    expect(prepareFounderRecommendations(2).length).toBeLessThanOrEqual(2);
    expect(prepareFounderResearchSummary().length).toBeGreaterThan(0);
  });

  it("prepareFounderOvernightBundle assembles founder overnight surfaces", () => {
    const bundle = prepareFounderOvernightBundle();
    expect(bundle.product).toBe("founder");
    expect(bundle.office.brief).toBeTruthy();
    expect(bundle.history?.briefGenerated).toBe(true);
  });
});
