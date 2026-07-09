import { describe, expect, it } from "vitest";

import {
  formatSparkEstateProductionReadinessReport,
  runSparkEstateProductionReadinessChecklist,
  SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS,
  SPARK_ESTATE_PRODUCTION_PHASES,
  SPARK_ESTATE_PRODUCTION_PRINCIPLE,
  SPARK_ESTATE_PRODUCTION_SUCCESS_JOURNEY,
  verifySparkEstateProductionReadiness,
} from "./sparkEstateProductionReadinessChecklist";

describe("sparkEstateProductionReadinessChecklist", () => {
  it("defines ten production verification phases", () => {
    const verification = verifySparkEstateProductionReadiness();
    expect(SPARK_ESTATE_PRODUCTION_PHASES).toHaveLength(10);
    expect(SPARK_ESTATE_PRODUCTION_PHASES).toContain("member-readiness");
    expect(SPARK_ESTATE_PRODUCTION_PHASES).toContain("error-prevention");
    expect(verification.phases).toEqual(SPARK_ESTATE_PRODUCTION_PHASES);
    expect(verification.launchQuestions).toBe(
      SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS.length,
    );
    expect(verification.checklistRuns).toBe(true);
  });

  it("passes automated must-fix checks for current estate build", () => {
    const result = runSparkEstateProductionReadinessChecklist();
    const failedMustFix = result.mustFix.filter((item) => !item.passed);
    expect(failedMustFix).toEqual([]);
    expect(result.readyForProduction).toBe(true);
    expect(result.launchDecisionReady).toBe(true);
    expect(result.launchQuestions.every((entry) => entry.ready)).toBe(true);
  });

  it("separates manual mobile and language checks as can-wait", () => {
    const result = runSparkEstateProductionReadinessChecklist();
    expect(result.canWait.some((item) => item.phase === "mobile-testing")).toBe(
      true,
    );
    expect(
      result.canWait.some((item) => item.id === "language-warmth-preservation"),
    ).toBe(true);
    expect(result.important.some((item) => item.phase === "experience-testing")).toBe(
      true,
    );
  });

  it("formats a readable production readiness report", () => {
    const report = formatSparkEstateProductionReadinessReport();
    expect(report).toContain(SPARK_ESTATE_PRODUCTION_PRINCIPLE);
    expect(report).toContain("Launch decision questions");
    expect(report).toContain(SPARK_ESTATE_PRODUCTION_SUCCESS_JOURNEY[0]);
    expect(report).toContain("/companion?section=chamber-of-momentum");
  });
});
