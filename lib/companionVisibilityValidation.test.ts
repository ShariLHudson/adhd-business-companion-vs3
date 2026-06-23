import { describe, expect, it } from "vitest";
import {
  runCompanionValidationFramework,
  formatScenarioLibrarySummary,
  formatScenarioLibrarySummaryText,
  evaluateValidationScenario,
} from "./companionValidationFramework";
import { VISIBILITY_SCENARIOS } from "./companionValidationScenarios";
import { analyzeVisibilityIntelligence } from "./companionVisibilityIntelligence";

describe("companionVisibilityValidation", () => {
  it("includes 12 visibility & marketing confidence scenarios", () => {
    expect(VISIBILITY_SCENARIOS.length).toBe(12);
  });

  it("passes all visibility scenarios", () => {
    for (const scenario of VISIBILITY_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      if (!result.passed) {
        // eslint-disable-next-line no-console
        console.log(scenario.id, result.failures);
      }
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("detects visibility ADHD patterns", () => {
    const avoidance = analyzeVisibilityIntelligence({
      userText: "I know I should make videos but I keep putting it off",
      messages: [],
    });
    expect(avoidance?.patterns).toContain("visibility_avoidance");
    expect(avoidance?.actualNeed).toBe("start_execution");

    const perfectionism = analyzeVisibilityIntelligence({
      userText: "I recorded it 17 times and still don't like it",
      messages: [],
    });
    expect(perfectionism?.patterns).toContain("content_perfectionism");
    expect(perfectionism?.actualNeed).toBe("start_execution");

    const brandBlock = analyzeVisibilityIntelligence({
      userText: "I need a better brand before I start posting",
      messages: [],
    });
    expect(brandBlock?.actualNeed).toBe("launch_move");
  });

  it("summary includes visibility category metrics", () => {
    const summary = formatScenarioLibrarySummary();
    expect(summary.visibility.total).toBe(12);
    expect(summary.visibility.passing).toBe(12);
    expect(summary.visibility.averageByDimension.confidence).toBeGreaterThanOrEqual(85);
    expect(summary.visibility.averageByDimension.adhdAlignment).toBeGreaterThanOrEqual(90);
    expect(summary.visibility.confidenceRecoverySuccessRate).toBeGreaterThanOrEqual(80);

    const text = formatScenarioLibrarySummaryText(summary);
    expect(text).toMatch(/Visibility \(12\)/);
    expect(text).toMatch(/confidence recovery success/);
  });

  it("full library passes with visibility expansion", () => {
    const { failed, passed } = runCompanionValidationFramework();
    expect(failed).toBe(0);
    expect(passed).toBeGreaterThanOrEqual(47);
  });
});
