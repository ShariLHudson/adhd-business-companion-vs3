import { describe, expect, it } from "vitest";
import {
  COMPANION_BEHAVIOR_AUDIT_CASES,
  formatCompanionBehaviorAuditReport,
  runCompanionBehaviorAudit,
} from "./companionBehaviorAudit";

describe("companionBehaviorAudit", () => {
  it("defines 50+ behavior audit prompts", () => {
    expect(COMPANION_BEHAVIOR_AUDIT_CASES.length).toBeGreaterThanOrEqual(50);
  });

  it("covers all ten audit categories", () => {
    const categories = new Set(
      COMPANION_BEHAVIOR_AUDIT_CASES.map((c) => c.category),
    );
    expect(categories).toEqual(
      expect.objectContaining({
        size: 10,
      }),
    );
    for (const cat of [
      "learn",
      "create",
      "decide",
      "plan",
      "organize",
      "focus",
      "calm",
      "relationship",
      "navigate",
      "yes_continuation",
    ] as const) {
      expect(categories.has(cat)).toBe(true);
    }
  });

  it("passes the companion behavior audit", () => {
    const report = runCompanionBehaviorAudit();
    if (report.failed > 0) {
      // eslint-disable-next-line no-console
      console.log(formatCompanionBehaviorAuditReport(report));
    }
    expect(report.failed, formatCompanionBehaviorAuditReport(report)).toBe(0);
    expect(report.passRate).toBe(100);
  });

  it("returns structured pass/fail rows for every case", () => {
    const report = runCompanionBehaviorAudit();
    for (const row of report.results) {
      expect(row.userInput).toBeTruthy();
      expect(row.actualIntent).toBeTruthy();
      expect(row.actualRoute).toBeTruthy();
      expect(row.actualSuppressionFlags).toBeDefined();
      expect(typeof row.pass).toBe("boolean");
    }
  });
});
