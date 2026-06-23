import { describe, expect, it } from "vitest";
import {
  evaluateValidationScenario,
  formatScenarioLibrarySummary,
  formatScenarioLibrarySummaryText,
  runCompanionValidationFramework,
} from "./companionValidationFramework";
import {
  MONEY_SCENARIOS,
  DELEGATION_SCENARIOS,
  LAUNCH_SCENARIOS,
  VISIBILITY_EXPANSION_SCENARIOS,
  ALL_VALIDATION_SCENARIOS,
} from "./companionValidationScenarios";
import { analyzeMoneyIntelligence } from "./companionMoneyIntelligence";
import { analyzeDelegationIntelligence } from "./companionDelegationIntelligence";
import { analyzeLaunchIntelligence } from "./companionLaunchIntelligence";
import { analyzeVisibilityIntelligence } from "./companionVisibilityIntelligence";
import { detectAdhdBusinessPatterns } from "./adhdEntrepreneurIntelligence";

describe("companionBehavioralExpansion", () => {
  it("includes 18 new behavioral expansion scenarios", () => {
    expect(MONEY_SCENARIOS.length).toBe(5);
    expect(DELEGATION_SCENARIOS.length).toBe(5);
    expect(LAUNCH_SCENARIOS.length).toBe(5);
    expect(VISIBILITY_EXPANSION_SCENARIOS.length).toBe(3);
    expect(ALL_VALIDATION_SCENARIOS.length).toBeGreaterThanOrEqual(65);
  });

  it("detects money ADHD patterns and actual needs", () => {
    const avoidance = analyzeMoneyIntelligence({
      userText: "I haven't looked at my revenue in months",
      messages: [],
    });
    expect(avoidance?.patterns).toContain("financial_avoidance");
    expect(avoidance?.actualNeed).toBe("start_execution");

    const guilt = analyzeMoneyIntelligence({
      userText: "I feel bad charging that much",
      messages: [],
    });
    expect(guilt?.patterns).toContain("pricing_guilt");
    expect(guilt?.actualNeed).toBe("build_confidence");
  });

  it("detects delegation patterns", () => {
    const resistance = analyzeDelegationIntelligence({
      userText: "It takes longer to explain than to do it myself",
      messages: [],
    });
    expect(resistance?.patterns).toContain("delegation_resistance");

    const micromanage = analyzeDelegationIntelligence({
      userText: "No one does it right",
      messages: [],
    });
    expect(micromanage?.patterns).toContain("perfectionism_control");
  });

  it("detects launch patterns", () => {
    const panic = analyzeLaunchIntelligence({
      userText: "What if nobody buys when I launch?",
      messages: [],
    });
    expect(panic?.patterns).toContain("launch_panic");
    expect(panic?.actualNeed).toBe("build_confidence");

    const perfection = analyzeLaunchIntelligence({
      userText: "Just one more thing before I launch",
      messages: [],
    });
    expect(perfection?.patterns).toContain("launch_perfectionism");
    expect(perfection?.actualNeed).toBe("launch_move");
  });

  it("detects expanded visibility patterns", () => {
    const seen = analyzeVisibilityIntelligence({
      userText: "I don't want people watching me",
      messages: [],
    });
    expect(seen?.patterns).toContain("visibility_fear");

    const imposter = analyzeVisibilityIntelligence({
      userText: "Who am I to teach this?",
      messages: [],
    });
    expect(imposter?.patterns).toContain("fear_of_judgment");

    const regret = analyzeVisibilityIntelligence({
      userText: "I posted and now I regret it",
      messages: [],
    });
    expect(regret?.patterns).toContain("visibility_hangover");
  });

  it("extends ADHD entrepreneur pattern detection", () => {
    expect(detectAdhdBusinessPatterns("I haven't looked at my revenue")).toContain(
      "financial_avoidance",
    );
    expect(detectAdhdBusinessPatterns("Who am I to teach this")).toContain(
      "imposter_syndrome",
    );
    expect(detectAdhdBusinessPatterns("What if nobody buys")).toContain("launch_panic");
  });

  it("passes all money scenarios", () => {
    for (const scenario of MONEY_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("passes all delegation scenarios", () => {
    for (const scenario of DELEGATION_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("passes all launch scenarios", () => {
    for (const scenario of LAUNCH_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("passes visibility expansion scenarios", () => {
    for (const scenario of VISIBILITY_EXPANSION_SCENARIOS) {
      const result = evaluateValidationScenario(scenario);
      expect(result.passed, `${scenario.id}: ${result.failures.join("; ")}`).toBe(true);
    }
  });

  it("full library passes with behavioral expansion", () => {
    const { failed, passed, results } = runCompanionValidationFramework();
    if (failed > 0) {
      const fails = results.filter((r) => !r.passed).map((r) => `${r.id}: ${r.failures[0]}`);
      // eslint-disable-next-line no-console
      console.log(fails.join("\n"));
    }
    expect(failed).toBe(0);
    expect(passed).toBeGreaterThanOrEqual(65);
  });

  it("behavioral categories meet elevated scorecard thresholds", () => {
    const summary = formatScenarioLibrarySummary();
    const behavioral = [
      ...MONEY_SCENARIOS,
      ...DELEGATION_SCENARIOS,
      ...LAUNCH_SCENARIOS,
    ];
    const behavioralResults = summary.results.filter((r) =>
      behavioral.some((s) => s.id === r.id),
    );
    for (const result of behavioralResults) {
      expect(result.scorecard.dimensions.understanding.score).toBeGreaterThanOrEqual(85);
      expect(result.scorecard.dimensions.trust.score).toBeGreaterThanOrEqual(85);
      expect(result.scorecard.dimensions.adhdAlignment.score).toBeGreaterThanOrEqual(90);
    }
  });

  it("summary includes behavioral category metrics", () => {
    const summary = formatScenarioLibrarySummary();
    expect(summary.money.total).toBe(5);
    expect(summary.money.passing).toBe(5);
    expect(summary.delegation.total).toBe(5);
    expect(summary.delegation.passing).toBe(5);
    expect(summary.launch.total).toBe(5);
    expect(summary.launch.passing).toBe(5);

    const text = formatScenarioLibrarySummaryText(summary);
    expect(text).toMatch(/Money \(5\)/);
    expect(text).toMatch(/Delegation \(5\)/);
    expect(text).toMatch(/Launch \(5\)/);
  });
});
