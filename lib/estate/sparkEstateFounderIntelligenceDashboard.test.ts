import { describe, expect, it } from "vitest";

import {
  assessSparkEstateFounderIntelligenceCompliance,
  buildSparkEstateFounderIntelligenceDashboard,
  formatSparkEstateFounderIntelligenceDashboardReport,
  SPARK_ESTATE_FOUNDER_DASHBOARD_HREF,
  SPARK_ESTATE_FOUNDER_DASHBOARD_QUESTIONS,
  SPARK_ESTATE_FOUNDER_IMPROVEMENT_LOOP,
  SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES,
  SPARK_ESTATE_FOUNDER_INTELLIGENCE_PRINCIPLE,
  SPARK_ESTATE_FOUNDER_INTELLIGENCE_QUESTIONS,
  SPARK_ESTATE_FOUNDER_REPORTING_RHYTHMS,
  SPARK_ESTATE_FOUNDER_SUCCESS_MEASURES,
  SPARK_ESTATE_FOUNDER_WORKFLOW_EXAMPLES,
  verifySparkEstateFounderIntelligenceDashboard,
} from "./sparkEstateFounderIntelligenceDashboard";

describe("sparkEstateFounderIntelligenceDashboard", () => {
  it("defines eight founder intelligence categories and dashboard questions", () => {
    const verification = verifySparkEstateFounderIntelligenceDashboard();
    expect(SPARK_ESTATE_FOUNDER_INTELLIGENCE_CATEGORIES).toHaveLength(8);
    expect(SPARK_ESTATE_FOUNDER_DASHBOARD_QUESTIONS).toHaveLength(4);
    expect(SPARK_ESTATE_FOUNDER_INTELLIGENCE_QUESTIONS).toHaveLength(5);
    expect(SPARK_ESTATE_FOUNDER_INTELLIGENCE_PRINCIPLE).toContain("member experience");
    expect(verification.categories).toBe(8);
    expect(verification.founderDashboardReady).toBe(true);
  });

  it("builds a dashboard bridging analytics and Founder Studio", () => {
    const dashboard = buildSparkEstateFounderIntelligenceDashboard();
    expect(dashboard.dashboardHref).toBe(SPARK_ESTATE_FOUNDER_DASHBOARD_HREF);
    expect(dashboard.dailyReport.schedule).toBe("daily");
    expect(dashboard.weeklyReport.schedule).toBe("weekly");
    expect(dashboard.monthlyReport.schedule).toBe("monthly");
    expect(dashboard.founderStudio.pipelineStageCount).toBeGreaterThan(0);
    expect(dashboard.founderStudio.incomingSignalCount).toBeGreaterThan(0);
  });

  it("defines reporting rhythms and workflow examples", () => {
    expect(SPARK_ESTATE_FOUNDER_REPORTING_RHYTHMS).toHaveLength(3);
    expect(SPARK_ESTATE_FOUNDER_WORKFLOW_EXAMPLES).toContain("email creation");
    expect(SPARK_ESTATE_FOUNDER_WORKFLOW_EXAMPLES).toContain("strategy creation");
    expect(SPARK_ESTATE_FOUNDER_IMPROVEMENT_LOOP).toHaveLength(5);
  });

  it("aligns founder intelligence with estate analytics and journey systems", () => {
    const compliance = assessSparkEstateFounderIntelligenceCompliance();
    expect(compliance.analyticsBridgeReady).toBe(true);
    expect(compliance.onboardingBridgeReady).toBe(true);
    expect(compliance.journeyIntelligenceReady).toBe(true);
    expect(compliance.founderStudioBridgeReady).toBe(true);
    expect(SPARK_ESTATE_FOUNDER_SUCCESS_MEASURES).toHaveLength(4);
  });

  it("confirms listening-system vision and reporting readiness", () => {
    const verification = verifySparkEstateFounderIntelligenceDashboard();
    expect(verification.reportingReady).toBe(true);
    expect(verification.listeningSystemReady).toBe(true);
  });

  it("formats a readable founder intelligence report", () => {
    const report = formatSparkEstateFounderIntelligenceDashboardReport();
    expect(report).toContain("Founder intelligence categories");
    expect(report).toContain("Reporting rhythms");
    expect(report).toContain("Product improvement loop");
    expect(report).toContain("Compliance checks");
    expect(report).toContain("/companion/founder/executive-intelligence");
  });
});
