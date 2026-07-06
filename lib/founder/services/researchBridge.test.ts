import { describe, expect, it } from "vitest";

import {
  prepareFounderResearchAlerts,
  prepareFounderResearchCenter,
  prepareFounderResearchSession,
  prepareFounderResearchSessionById,
} from "./researchBridge";

describe("Founder Research bridge", () => {
  it("prepareFounderResearchCenter returns bootstrap", () => {
    const center = prepareFounderResearchCenter("listening-rooms");
    expect(center.product).toBe("founder");
    expect(center.bootstrap.categories.length).toBeGreaterThan(10);
  });

  it("prepareFounderResearchSession returns full report", () => {
    const result = prepareFounderResearchSession("What AI tools could save us time?");
    expect(result.session?.report.recommendedNextSteps.length).toBeGreaterThan(0);
    expect(result.session?.report.boardRecommendation).toBeTruthy();
  });

  it("prepareFounderResearchSessionById loads by id", () => {
    const result = prepareFounderResearchSessionById("report-adhd-founders-month");
    expect(result.session?.report.categoryId).toBe("adhd");
  });

  it("prepareFounderResearchAlerts respects significance", () => {
    const alerts = prepareFounderResearchAlerts();
    expect(alerts.alerts.length).toBeLessThanOrEqual(3);
  });
});
