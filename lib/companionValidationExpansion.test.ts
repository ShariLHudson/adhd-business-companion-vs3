import { describe, expect, it } from "vitest";
import {
  runCompanionValidationFramework,
  VALIDATION_SCENARIOS,
  evaluateValidationScenario,
  formatScenarioLibrarySummary,
  formatScenarioLibrarySummaryText,
  formatScorecardSummary,
  buildCompanionScorecard,
  evaluateIntelligenceBundle,
} from "./companionValidationFramework";
import { EXPANDED_SCENARIOS, FOUNDATION_SCENARIOS, SALES_SCENARIOS, VISIBILITY_SCENARIOS } from "./companionValidationScenarios";

describe("companionValidationExpansion", () => {
  it("includes at least 47 total scenarios", () => {
    expect(VALIDATION_SCENARIOS.length).toBeGreaterThanOrEqual(47);
    expect(FOUNDATION_SCENARIOS.length).toBe(5);
    expect(EXPANDED_SCENARIOS.length).toBeGreaterThanOrEqual(15);
    expect(SALES_SCENARIOS.length).toBe(11);
    expect(VISIBILITY_SCENARIOS.length).toBe(12);
  });

  it("passes all scenarios in the expanded library", () => {
    const summary = formatScenarioLibrarySummary();
    for (const result of summary.results) {
      if (!result.passed) {
        // eslint-disable-next-line no-console
        console.log(result.id, result.failures);
      }
    }
    expect(summary.failingScenarios).toBe(0);
    expect(summary.passingScenarios).toBe(summary.totalScenarios);
  });

  it("existing foundation scenarios still pass", () => {
    for (const scenario of FOUNDATION_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("generates scorecard summary for each category sample", () => {
    const revenue = VALIDATION_SCENARIOS.find((s) => s.id === "revenue-pricing-paralysis")!;
    const result = evaluateValidationScenario(revenue);
    const text = formatScorecardSummary(result.scorecard);
    expect(text).toMatch(/understanding/i);
    expect(text).toMatch(/PASS/);
  });

  it("formatScenarioLibrarySummary returns library metrics", () => {
    const summary = formatScenarioLibrarySummary();
    expect(summary.totalScenarios).toBeGreaterThanOrEqual(47);
    expect(summary.averageByDimension.understanding).toBeGreaterThan(0);
    expect(summary.weakestDimension).toBeTruthy();
    expect(summary.recommendedTuningArea).toBeTruthy();

    const text = formatScenarioLibrarySummaryText(summary);
    expect(text).toMatch(/Total:/);
    expect(text).toMatch(/Weakest dimension/);
  });

  it("covers all required ADHD business categories", () => {
    const categories = new Set(VALIDATION_SCENARIOS.map((s) => s.category));
    expect(categories.has("revenue_sales")).toBe(true);
    expect(categories.has("content_marketing")).toBe(true);
    expect(categories.has("operations_systems")).toBe(true);
    expect(categories.has("client_work")).toBe(true);
    expect(categories.has("energy_recovery")).toBe(true);
    expect(categories.has("decisions")).toBe(true);
    expect(categories.has("follow_through")).toBe(true);
    expect(categories.has("sales_conversations")).toBe(true);
    expect(categories.has("visibility_marketing")).toBe(true);
  });

  it("evaluates intelligence bundle for regression detection", () => {
    const bundle = evaluateIntelligenceBundle({
      turns: VALIDATION_SCENARIOS[0].turns,
      lastUserMessage: VALIDATION_SCENARIOS[0].lastUserMessage,
      emotionalState: "stuck",
    });
    const scorecard = buildCompanionScorecard(bundle, VALIDATION_SCENARIOS[0].expectations);
    expect(bundle.intuitive.actualNeed).toBe("launch_move");
    expect(scorecard.passed).toBe(true);
  });
});
