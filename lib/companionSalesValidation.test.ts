import { describe, expect, it } from "vitest";
import {
  runCompanionValidationFramework,
  formatScenarioLibrarySummary,
  formatScenarioLibrarySummaryText,
  evaluateValidationScenario,
} from "./companionValidationFramework";
import { SALES_SCENARIOS } from "./companionValidationScenarios";
import { analyzeSalesIntelligence } from "./companionSalesIntelligence";

describe("companionSalesValidation", () => {
  it("includes 11 sales conversation scenarios", () => {
    expect(SALES_SCENARIOS.length).toBe(11);
  });

  it("passes all sales scenarios", () => {
    for (const scenario of SALES_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      if (!result.passed) {
        // eslint-disable-next-line no-console
        console.log(scenario.id, result.failures);
      }
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("detects sales journey stages", () => {
    const avoidance = analyzeSalesIntelligence({
      userText: "I know I should make the call but I keep putting it off",
      messages: [],
    });
    expect(avoidance?.stage).toBe("discovery_preparation");
    expect(avoidance?.patterns).toContain("sales_avoidance");

    const objection = analyzeSalesIntelligence({
      userText: "They said it's too expensive",
      messages: [],
    });
    expect(objection?.stage).toBe("objection_handling");
    expect(objection?.actualNeed).toBe("make_decision");
  });

  it("summary includes sales category metrics", () => {
    const summary = formatScenarioLibrarySummary();
    expect(summary.sales.total).toBe(11);
    expect(summary.sales.passing).toBe(11);
    expect(summary.sales.averageByDimension.confidence).toBeGreaterThanOrEqual(80);
    expect(summary.sales.averageByDimension.action).toBeGreaterThanOrEqual(85);

    const text = formatScenarioLibrarySummaryText(summary);
    expect(text).toMatch(/Sales \(11\)/);
    expect(text).toMatch(/Sales averages/);
  });

  it("full library passes with sales expansion", () => {
    const { failed, passed } = runCompanionValidationFramework();
    expect(failed).toBe(0);
    expect(passed).toBeGreaterThanOrEqual(47);
  });
});
