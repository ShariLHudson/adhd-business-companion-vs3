import { describe, expect, it } from "vitest";

import {
  composeDailyDiscoveryBrief,
  composeDiscoveryFindingDetail,
  composeMonthlyExecutiveDiscoveryReport,
  composeWeeklyDiscoveryReport,
  DISCOVERY_ENGINE_PRINCIPLE,
  getDiscoveryEngineBootstrap,
} from "./index";

describe("Executive Discovery Engine", () => {
  it("exposes discovery department principle", () => {
    expect(DISCOVERY_ENGINE_PRINCIPLE).toContain("value");
  });

  it("composeDailyDiscoveryBrief includes overnight message and top discovery", () => {
    const brief = composeDailyDiscoveryBrief();
    expect(brief.overnightMessage).toContain("While you were away");
    expect(brief.topDiscovery.whyImportant).toBeTruthy();
    expect(brief.importantFindings).toHaveLength(3);
    expect(brief.questionWorthExploring).toBeTruthy();
    expect(brief.founderAlert?.urgency).toBe("now");
  });

  it("composeWeeklyDiscoveryReport includes priorities", () => {
    const report = composeWeeklyDiscoveryReport();
    expect(report.mostImportantDiscoveries.length).toBeGreaterThan(2);
    expect(report.recommendedPriorities.length).toBeGreaterThan(2);
    expect(report.emergingPatterns[0]).toBeTruthy();
  });

  it("composeMonthlyExecutiveDiscoveryReport answers executive questions", () => {
    const report = composeMonthlyExecutiveDiscoveryReport();
    expect(report.whatSparkShouldBuildNext.length).toBeGreaterThan(0);
    expect(report.whatToStopDoing.length).toBeGreaterThan(0);
    expect(report.whatToAutomate.length).toBeGreaterThan(0);
  });

  it("composeDiscoveryFindingDetail includes executive recommendation", () => {
    const detail = composeDiscoveryFindingDetail("ede-butterfly-chain");
    expect(detail).not.toBeNull();
    expect(detail!.finding.executiveRecommendation.myRecommendation).toBeTruthy();
    expect(detail!.finding.pathways.missions.length).toBeGreaterThan(0);
  });

  it("getDiscoveryEngineBootstrap reports brief readiness", () => {
    const bootstrap = getDiscoveryEngineBootstrap();
    expect(bootstrap.dailyBriefReady).toBe(true);
    expect(bootstrap.findingCount).toBeGreaterThan(4);
    expect(bootstrap.categoriesRepresented.length).toBeGreaterThan(4);
  });
});
