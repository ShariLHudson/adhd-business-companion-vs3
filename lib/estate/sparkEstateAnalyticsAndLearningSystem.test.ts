import { describe, expect, it } from "vitest";

import {
  aggregateSparkEstateAnalyticsByCategory,
  assessSparkEstateAnalyticsCompliance,
  buildSparkEstateFounderReport,
  buildSparkEstatePersonalizationInsights,
  clearSparkEstateAnalyticsEvents,
  formatSparkEstateAnalyticsAndLearningReport,
  identifySparkEstateFrictionPoints,
  recordSparkEstateAnalyticsEvent,
  SPARK_ESTATE_ANALYTICS_CATEGORIES,
  SPARK_ESTATE_ANALYTICS_PRINCIPLE,
  SPARK_ESTATE_ANALYTICS_PRIVACY_PRINCIPLES,
  SPARK_ESTATE_ANALYTICS_SUCCESS_METRICS,
  SPARK_ESTATE_CARD_ANALYTICS_EVENTS,
  SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES,
  SPARK_ESTATE_PRODUCT_IMPROVEMENT_LOOP,
  SPARK_ESTATE_VANITY_METRICS_AVOID,
  verifySparkEstateAnalyticsAndLearningSystem,
} from "./sparkEstateAnalyticsAndLearningSystem";

describe("sparkEstateAnalyticsAndLearningSystem", () => {
  it("defines analytics categories, privacy principles, and success metrics", () => {
    const verification = verifySparkEstateAnalyticsAndLearningSystem();
    expect(SPARK_ESTATE_ANALYTICS_CATEGORIES).toHaveLength(7);
    expect(SPARK_ESTATE_ANALYTICS_PRIVACY_PRINCIPLES).toHaveLength(4);
    expect(SPARK_ESTATE_ANALYTICS_SUCCESS_METRICS).toHaveLength(4);
    expect(SPARK_ESTATE_ANALYTICS_PRINCIPLE).toContain("improvement");
    expect(verification.categories).toBe(7);
    expect(verification.analyticsReady).toBe(true);
  });

  it("maps card analytics events for spark, momentum, and knowledge cards", () => {
    expect(SPARK_ESTATE_CARD_ANALYTICS_EVENTS["spark-card"]).toContain("opened");
    expect(SPARK_ESTATE_CARD_ANALYTICS_EVENTS["momentum-card"]).toContain("acted-on");
    expect(SPARK_ESTATE_CARD_ANALYTICS_EVENTS["knowledge-card"]).toContain("applied");
  });

  it("records events and aggregates by category", () => {
    clearSparkEstateAnalyticsEvents();
    recordSparkEstateAnalyticsEvent({
      category: "progress",
      signal: "milestone reached",
    });
    recordSparkEstateAnalyticsEvent({
      category: "engagement",
      signal: "cards opened",
    });
    const aggregates = aggregateSparkEstateAnalyticsByCategory();
    expect(aggregates.progress).toBe(1);
    expect(aggregates.engagement).toBe(1);
    clearSparkEstateAnalyticsEvents();
  });

  it("detects friction and builds personalization insights", () => {
    clearSparkEstateAnalyticsEvents();
    recordSparkEstateAnalyticsEvent({
      category: "friction",
      signal: "too many choices",
    });
    recordSparkEstateAnalyticsEvent({
      category: "workflow-success",
      signal: "completed",
      metadata: { workflow: "email creation" },
    });
    recordSparkEstateAnalyticsEvent({
      category: "cards",
      signal: "opened",
      metadata: { cardKind: "momentum-card" },
    });
    const friction = identifySparkEstateFrictionPoints();
    const insights = buildSparkEstatePersonalizationInsights();
    expect(friction).toContain("too many choices");
    expect(insights.preferredWorkflows).toContain("email creation");
    expect(insights.helpfulCardTypes).toContain("momentum-card");
    clearSparkEstateAnalyticsEvents();
  });

  it("builds founder reports for daily, weekly, and monthly schedules", () => {
    clearSparkEstateAnalyticsEvents();
    recordSparkEstateAnalyticsEvent({
      category: "engagement",
      signal: "login",
    });
    for (const schedule of SPARK_ESTATE_FOUNDER_REPORT_SCHEDULES) {
      const report = buildSparkEstateFounderReport(schedule.id);
      expect(report.schedule).toBe(schedule.id);
      expect(report.sections.length).toBe(schedule.includes.length);
    }
    clearSparkEstateAnalyticsEvents();
  });

  it("defines improvement loop and avoids vanity metrics", () => {
    const compliance = assessSparkEstateAnalyticsCompliance();
    expect(SPARK_ESTATE_PRODUCT_IMPROVEMENT_LOOP).toHaveLength(5);
    expect(SPARK_ESTATE_VANITY_METRICS_AVOID.length).toBeGreaterThanOrEqual(3);
    expect(compliance.categoriesReady).toBe(true);
    expect(compliance.founderReportingReady).toBe(true);
    expect(compliance.productImprovementLoopReady).toBe(true);
  });

  it("formats a readable analytics report", () => {
    const report = formatSparkEstateAnalyticsAndLearningReport();
    expect(report).toContain("Analytics categories");
    expect(report).toContain("Privacy principles");
    expect(report).toContain("Product improvement loop");
    expect(report).toContain("Avoid vanity metrics");
  });
});
