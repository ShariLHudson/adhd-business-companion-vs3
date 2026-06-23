import { describe, expect, it } from "vitest";
import {
  runCompanionValidationFramework,
  VALIDATION_SCENARIOS,
  evaluateValidationScenario,
  buildCompanionScorecard,
  evaluateIntelligenceBundle,
} from "./companionValidationFramework";

describe("companionValidationFramework", () => {
  it("runs all real-world ADHD entrepreneur scenarios", () => {
    const { passed, failed, results } = runCompanionValidationFramework();
    for (const result of results) {
      if (!result.passed) {
        // eslint-disable-next-line no-console
        console.log(result.id, result.failures, result.scorecard.overall);
      }
    }
    expect(failed).toBe(0);
    expect(passed).toBe(VALIDATION_SCENARIOS.length);
  });

  it("scores launch avoidance with understanding and action dimensions", () => {
    const scenario = VALIDATION_SCENARIOS.find((s) => s.id === "launch-avoidance")!;
    const result = evaluateValidationScenario(scenario);
    expect(result.bundle.intuitive.actualNeed).toBe("launch_move");
    expect(result.scorecard.dimensions.understanding.passed).toBe(true);
    expect(result.scorecard.dimensions.action.score).toBeGreaterThanOrEqual(80);
  });

  it("builds scorecard with all eight dimensions", () => {
    const bundle = evaluateIntelligenceBundle({
      turns: VALIDATION_SCENARIOS[4].turns,
      lastUserMessage: VALIDATION_SCENARIOS[4].lastUserMessage,
      emotionalState: "focused",
    });
    const scorecard = buildCompanionScorecard(bundle);
    expect(Object.keys(scorecard.dimensions)).toHaveLength(8);
    expect(scorecard.overall).toBeGreaterThan(0);
  });
});
