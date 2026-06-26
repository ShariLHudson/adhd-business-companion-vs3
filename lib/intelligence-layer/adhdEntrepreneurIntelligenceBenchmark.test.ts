/**
 * adhdEntrepreneurIntelligenceBenchmark.test.ts
 *
 * Phase 2 — ADHD Entrepreneur Intelligence Benchmark
 *
 * Runs all 50 new scenarios across 10 categories and validates that the
 * companion framework correctly detects ADHD patterns and routes responses.
 *
 * Phase 1 validation (24 scenarios) is tested separately in:
 *   - lib/intelligence-layer/trustValidationScenarios.test.ts
 *   - lib/adhdEntrepreneurIntelligence.test.ts
 *   - lib/companionGovernor.test.ts
 *   - lib/intelligence-layer/governorTrustSignals.test.ts
 *   - lib/intelligence-layer/signalValidation.test.ts
 *   - lib/intelligence-layer/trustInspector.test.ts
 *
 * DO NOT modify this file to weaken validation thresholds.
 */

import { beforeAll, describe, expect, it } from "vitest";
import {
  runAdhdEntrepreneurIntelligenceBenchmark,
  buildBenchmarkReport,
  formatScenarioLibrarySummary,
  formatBenchmarkRunReport,
  SCENARIO_LIBRARY,
} from "./adhdEntrepreneurIntelligenceBenchmark";

// ─────────────────────────────────────────────────────────────────────────────
// Scenario Library Structure
// ─────────────────────────────────────────────────────────────────────────────

describe("SCENARIO_LIBRARY structure", () => {
  it("contains exactly 50 Phase 2 scenarios", () => {
    expect(SCENARIO_LIBRARY.length).toBe(50);
  });

  it("covers all 10 required categories", () => {
    const categories = new Set(SCENARIO_LIBRARY.map((s) => s.category));
    const required = [
      "money_financial_avoidance",
      "visibility_being_seen",
      "launch_psychology",
      "adhd_time_blindness",
      "relationships_support",
      "reentry_recovery",
      "success_challenges",
      "founder_life_reality",
      "identity_growth",
      "pattern_memory_intelligence",
    ];
    for (const cat of required) {
      expect(categories.has(cat)).toBe(true);
    }
  });

  it("has exactly 5 scenarios per category", () => {
    const counts: Record<string, number> = {};
    for (const s of SCENARIO_LIBRARY) {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    }
    for (const count of Object.values(counts)) {
      expect(count).toBe(5);
    }
  });

  it("every scenario has required metadata fields", () => {
    for (const scenario of SCENARIO_LIBRARY) {
      expect(scenario.id).toBeTruthy();
      expect(scenario.category).toBeTruthy();
      expect(scenario.name).toBeTruthy();
    }
  });

  it("Pattern Memory run results include enhanced category scores", () => {
    const results = runAdhdEntrepreneurIntelligenceBenchmark();
    const pmResults = results.filter(
      (r) => r.scenario.category === "pattern_memory_intelligence",
    );
    expect(pmResults.length).toBe(5);
    for (const r of pmResults) {
      expect(r.categoryScore).toBeTruthy();
      const cs = r.categoryScore!;
      expect(cs.patternRecognition).toBe(true);
      expect(cs.usedPriorContext).toBe(true);
      expect(cs.namedPattern).toBe(true);
      expect(cs.offeredInterruption).toBe(true);
      expect(cs.shameReduction).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark Run
// ─────────────────────────────────────────────────────────────────────────────

describe("runAdhdEntrepreneurIntelligenceBenchmark()", () => {
  let results: ReturnType<typeof runAdhdEntrepreneurIntelligenceBenchmark>;

  beforeAll(() => {
    results = runAdhdEntrepreneurIntelligenceBenchmark();
  });

  it("returns 50 scenario results", () => {
    expect(results.length).toBe(50);
  });

  it("every result has required ScenarioResult fields", () => {
    for (const r of results) {
      expect(r.scenario.id).toBeTruthy();
      expect(r.scenario.category).toBeTruthy();
      expect(r.scenario.name).toBeTruthy();
      expect(typeof r.pass).toBe("boolean");
      expect(Array.isArray(r.detectedPatterns)).toBe(true);
      expect(r.governorOutcome).toBeTruthy();
      expect(Array.isArray(r.notes)).toBe(true);
    }
  });

  it("pass rate is at least 60% across all scenarios", () => {
    const passCount = results.filter((r) => r.pass).length;
    const passRate = passCount / results.length;
    // 60% minimum — benchmark is intentionally strict but not impossible at launch
    expect(passRate).toBeGreaterThanOrEqual(0.6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Report Generation
// ─────────────────────────────────────────────────────────────────────────────

describe("buildBenchmarkReport()", () => {
  let results: ReturnType<typeof runAdhdEntrepreneurIntelligenceBenchmark>;
  let report: ReturnType<typeof buildBenchmarkReport>;

  beforeAll(() => {
    results = runAdhdEntrepreneurIntelligenceBenchmark();
    report = buildBenchmarkReport(results);
  });

  it("report has all required top-level fields", () => {
    expect(report).toHaveProperty("totalScenarios");
    expect(report).toHaveProperty("passed");
    expect(report).toHaveProperty("failed");
    expect(report).toHaveProperty("passRate");
    expect(report).toHaveProperty("categorySummaries");
    expect(report).toHaveProperty("scores");
    expect(report.scores).toHaveProperty("overallBenchmark");
    expect(report.scores).toHaveProperty("historicalPatternDetection");
    expect(report.scores).toHaveProperty("reEntryQuality");
    expect(report.scores).toHaveProperty("founderReality");
    expect(report.scores).toHaveProperty("successHandling");
    expect(report).toHaveProperty("strongestCategory");
    expect(report).toHaveProperty("weakestCategory");
    expect(report).toHaveProperty("mostCommonFailureType");
  });

  it("totalScenarios is 50", () => {
    expect(report.totalScenarios).toBe(50);
  });

  it("passed + failed === totalScenarios", () => {
    expect(report.passed + report.failed).toBe(report.totalScenarios);
  });

  it("passRate is between 0 and 100", () => {
    expect(report.passRate).toBeGreaterThanOrEqual(0);
    expect(report.passRate).toBeLessThanOrEqual(100);
  });

  it("overallBenchmark score is between 0 and 100", () => {
    expect(report.scores.overallBenchmark).toBeGreaterThanOrEqual(0);
    expect(report.scores.overallBenchmark).toBeLessThanOrEqual(100);
  });

  it("categorySummaries has 10 entries", () => {
    expect(report.categorySummaries.length).toBe(10);
  });

  it("each category summary has pass rate and scenario count", () => {
    for (const summary of report.categorySummaries) {
      expect(summary).toHaveProperty("passRate");
      expect(summary).toHaveProperty("total");
      expect(summary.total).toBe(5);
    }
  });

  it("strongestCategory and weakestCategory are valid labels", () => {
    const labels = report.categorySummaries.map((s) => s.label);
    expect(labels).toContain(report.strongestCategory);
    expect(labels).toContain(report.weakestCategory);
  });

  it("all scoring dimensions are numbers between 0 and 100", () => {
    const dims = [
      report.scores.historicalPatternDetection,
      report.scores.reEntryQuality,
      report.scores.founderReality,
      report.scores.successHandling,
    ];
    for (const d of dims) {
      expect(typeof d).toBe("number");
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(100);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

describe("formatScenarioLibrarySummary()", () => {
  it("returns a non-empty string", () => {
    const summary = formatScenarioLibrarySummary();
    expect(typeof summary).toBe("string");
    expect(summary.length).toBeGreaterThan(100);
  });

  it("mentions all 10 categories", () => {
    const summary = formatScenarioLibrarySummary();
    const categories = [
      "Money",
      "Visibility",
      "Launch",
      "Time Blindness",
      "Relationships",
      "Re-Entry",
      "Success",
      "Founder",
      "Identity",
      "Pattern Memory",
    ];
    for (const cat of categories) {
      expect(summary).toContain(cat);
    }
  });

  it("includes the scoring formula", () => {
    const summary = formatScenarioLibrarySummary();
    // The formula uses PassRate and pattern weights
    expect(summary).toMatch(/0\.4|40%|PassRate/i);
  });
});

describe("formatBenchmarkRunReport()", () => {
  it("returns a formatted string report", () => {
    const results = runAdhdEntrepreneurIntelligenceBenchmark();
    const report = buildBenchmarkReport(results);
    const formatted = formatBenchmarkRunReport(report);
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(200);
  });

  it("contains pass rate information", () => {
    const results = runAdhdEntrepreneurIntelligenceBenchmark();
    const report = buildBenchmarkReport(results);
    const formatted = formatBenchmarkRunReport(report);
    expect(formatted).toMatch(/\d+/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Category-level Spot Checks
// ─────────────────────────────────────────────────────────────────────────────

describe("Category spot checks", () => {
  let results: ReturnType<typeof runAdhdEntrepreneurIntelligenceBenchmark>;

  beforeAll(() => {
    results = runAdhdEntrepreneurIntelligenceBenchmark();
  });

  it("Money & Financial Avoidance: at least 2 of 5 scenarios pass", () => {
    const catResults = results.filter(
      (r) => r.scenario.category === "money_financial_avoidance",
    );
    expect(catResults.length).toBe(5);
    expect(catResults.filter((r) => r.pass).length).toBeGreaterThanOrEqual(2);
  });

  it("Launch Psychology: at least 2 of 5 scenarios pass", () => {
    const catResults = results.filter(
      (r) => r.scenario.category === "launch_psychology",
    );
    expect(catResults.length).toBe(5);
    expect(catResults.filter((r) => r.pass).length).toBeGreaterThanOrEqual(2);
  });

  it("Re-Entry & Recovery: at least 2 of 5 scenarios pass", () => {
    const catResults = results.filter(
      (r) => r.scenario.category === "reentry_recovery",
    );
    expect(catResults.length).toBe(5);
    expect(catResults.filter((r) => r.pass).length).toBeGreaterThanOrEqual(2);
  });

  it("Pattern Memory Intelligence: all 5 scenarios complete (pass or fail) without throwing", () => {
    const catResults = results.filter(
      (r) => r.scenario.category === "pattern_memory_intelligence",
    );
    expect(catResults.length).toBe(5);
    for (const r of catResults) {
      expect(r.scenario.id).toBeTruthy();
      expect(r.governorOutcome).toBeTruthy();
    }
  });
});
