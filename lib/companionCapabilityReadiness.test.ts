import { describe, expect, it } from "vitest";
import {
  buildAllCompanionReadinessScores,
  buildCompanionReadinessScore,
  evaluateReadinessPortfolio,
  formatReadinessPortfolioText,
} from "./companionCapabilityReadiness";
import { getCapabilitiesByStatus } from "./companionCapabilityRegistry";

describe("companionCapabilityReadiness", () => {
  it("buildCompanionReadinessScore returns scored dimensions", () => {
    const score = buildCompanionReadinessScore("clear_my_mind");
    expect(score).not.toBeNull();
    expect(score!.overall).toBeGreaterThanOrEqual(90);
    expect(score!.passed).toBe(true);
    expect(score!.designGatePassed).toBe(true);
    expect(score!.dimensions.discoverability).toBeGreaterThanOrEqual(90);
  });

  it("every production capability scores 90+", () => {
    for (const cap of getCapabilitiesByStatus("production")) {
      const score = buildCompanionReadinessScore(cap.id)!;
      expect(score.overall, `${cap.id}: ${score.overall}`).toBeGreaterThanOrEqual(90);
      expect(score.passed, `${cap.id} gaps: ${score.gaps.join("; ")}`).toBe(true);
    }
  });

  it("every partial capability scores 75+", () => {
    for (const cap of getCapabilitiesByStatus("partial")) {
      const score = buildCompanionReadinessScore(cap.id)!;
      expect(score.overall, `${cap.id}: ${score.overall}`).toBeGreaterThanOrEqual(75);
      expect(score.passed, `${cap.id}`).toBe(true);
    }
  });

  it("future capabilities pass minimum registration gate", () => {
    for (const cap of getCapabilitiesByStatus("future")) {
      const score = buildCompanionReadinessScore(cap.id)!;
      expect(score.passed, `${cap.id}`).toBe(true);
    }
  });

  it("portfolio evaluation summarizes readiness", () => {
    const portfolio = evaluateReadinessPortfolio();
    expect(portfolio.total).toBe(buildAllCompanionReadinessScores().length);
    expect(portfolio.productionPassing).toBe(portfolio.productionTotal);
    expect(portfolio.failing).toBe(0);

    const text = formatReadinessPortfolioText();
    expect(text).toMatch(/12\/10 Portfolio/);
    expect(text).toMatch(/Production:/);
  });
});
