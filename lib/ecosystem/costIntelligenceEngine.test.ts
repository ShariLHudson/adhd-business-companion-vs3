import { beforeEach, describe, expect, it } from "vitest";

import {
  buildFounderCostIntelligence,
  computeProfitEstimate,
  COST_CATEGORY_LABELS,
  recordCostEvent,
  resetCostStore,
  sumCostsByCategory,
} from "./costIntelligenceEngine";
import type { CostEvent } from "./costIntelligenceEngine";

const NOW = new Date("2026-06-12T12:00:00.000Z");

function cost(
  category: CostEvent["category"],
  amount: number,
  occurredAt: string,
): CostEvent {
  return {
    id: `cost-${category}-${occurredAt}`,
    category,
    amount,
    currency: "USD",
    occurredAt,
    source: "manual",
  };
}

describe("costIntelligenceEngine", () => {
  beforeEach(() => {
    resetCostStore();
  });

  it("1. costs are tracked", async () => {
    const recorded = await recordCostEvent({
      category: "openai",
      amount: 85.5,
      source: "api",
    });
    expect(recorded.amount).toBe(85.5);
    expect(recorded.category).toBe("openai");
  });

  it("2. costs are categorized", () => {
    const events: CostEvent[] = [
      cost("openai", 100, "2026-06-05T10:00:00.000Z"),
      cost("claude", 40, "2026-06-06T10:00:00.000Z"),
      cost("vercel", 20, "2026-06-07T10:00:00.000Z"),
      cost("ghl", 97, "2026-06-08T10:00:00.000Z"),
    ];

    const byCat = sumCostsByCategory(events, "2026-06");
    expect(byCat.openai).toBe(100);
    expect(byCat.claude).toBe(40);
    expect(byCat.vercel).toBe(20);
    expect(byCat.ghl).toBe(97);

    const intel = buildFounderCostIntelligence(events, {}, NOW);
    expect(intel.categoryBreakdown.length).toBe(8);
    expect(intel.dashboardMetrics.biggestCost).toBe("openai");
    expect(intel.dashboardMetrics.biggestCostLabel).toBe(COST_CATEGORY_LABELS.openai);
  });

  it("3. profit estimates calculate", () => {
    const events: CostEvent[] = [
      cost("openai", 50, "2026-06-01T10:00:00.000Z"),
      cost("vercel", 30, "2026-06-01T10:00:00.000Z"),
      cost("ghl", 97, "2026-06-01T10:00:00.000Z"),
    ];

    const intel = buildFounderCostIntelligence(
      events,
      { monthlyRevenue: 1000, totalUsers: 20, activeUsers: 10 },
      NOW,
    );

    expect(intel.monthlyCosts).toBe(177);
    expect(intel.profitEstimate).toBe(computeProfitEstimate(1000, 177));
    expect(intel.dashboardMetrics.profitEstimate).toBe(823);
    expect(intel.grossMarginPercent).toBeGreaterThan(0);
    expect(intel.netMarginPercent).toBeGreaterThan(0);
    expect(intel.costPerUser).toBe(8.85);
    expect(intel.costPerActiveUser).toBe(17.7);
  });

  it("4. founder AI can discuss costs via buildFounderCostIntelligence", () => {
    const events: CostEvent[] = [
      cost("openai", 150, "2026-06-01T10:00:00.000Z"),
      cost("openai", 50, "2026-05-01T10:00:00.000Z"),
      cost("vercel", 20, "2026-06-01T10:00:00.000Z"),
      cost("vercel", 20, "2026-05-01T10:00:00.000Z"),
    ];

    const intel = buildFounderCostIntelligence(
      events,
      { monthlyRevenue: 500, totalUsers: 5, activeUsers: 3 },
      NOW,
    );

    expect(intel.dashboardMetrics.fastestGrowingCost).toBe("openai");
    expect(intel.costGrowthPercent).toBeDefined();
    expect(intel.costTrend).toHaveLength(6);
  });
});
