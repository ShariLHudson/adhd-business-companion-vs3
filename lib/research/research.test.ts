import { describe, expect, it } from "vitest";

import {
  composeResearchSession,
  composeResearchSessionById,
  getSignificantResearchAlerts,
  getResearchCategories,
  researchService,
} from "./services/researchService";
import { RESEARCH_PRINCIPLE } from "./sample/researchData";

describe("Executive Research Center engine", () => {
  it("exposes research principle", () => {
    expect(RESEARCH_PRINCIPLE).toContain("needs to know");
  });

  it("composeResearchSession returns answer through prep offers", () => {
    const session = composeResearchSession("What are ADHD founders struggling with this month?");
    expect(session).not.toBeNull();
    expect(session!.report.answer.length).toBeGreaterThan(10);
    expect(session!.report.evidence.length).toBeGreaterThan(0);
    expect(session!.report.prepOffers.length).toBeGreaterThan(3);
    expect(session!.report.passesSoWhatRule).toBe(true);
  });

  it("composeResearchSessionById loads sample report", () => {
    const session = composeResearchSessionById("report-ai-tools-time");
    expect(session?.report.categoryId).toBe("artificial-intelligence");
    expect(session?.report.sparkApplications.length).toBeGreaterThan(0);
  });

  it("significant alerts respect Rule of Three", () => {
    const alerts = getSignificantResearchAlerts();
    expect(alerts.length).toBeLessThanOrEqual(3);
    expect(alerts.every((a) => a.significant)).toBe(true);
  });

  it("categories are expandable", () => {
    expect(getResearchCategories().length).toBeGreaterThanOrEqual(20);
  });

  it("researchService composes sessions", () => {
    const session = researchService.composeSession("What AI tools could save us time?");
    expect(session?.report.explainLikeImBusy).toBeTruthy();
  });
});
