import { beforeEach, describe, expect, it } from "vitest";

import {
  buildFounderRevenueIntelligence,
  computeMrrAt,
  computeRevenueGrowthPercent,
  computeRevenuePeriodSnapshot,
  formatUsd,
  recordRevenueEvent,
  resetRevenueStore,
} from "./revenueIntelligenceEngine";
import type { RevenueEvent } from "./revenueIntelligenceEngine";

const NOW = new Date("2026-06-12T12:00:00.000Z");

function event(
  kind: RevenueEvent["kind"],
  amount: number,
  occurredAt: string,
  recurringAmount?: number,
): RevenueEvent {
  return {
    id: `evt-${kind}-${occurredAt}`,
    kind,
    amount,
    recurringAmount,
    currency: "USD",
    occurredAt,
    source: "internal",
  };
}

describe("revenueIntelligenceEngine", () => {
  beforeEach(() => {
    resetRevenueStore();
  });

  it("1. revenue metrics calculate correctly", () => {
    const events: RevenueEvent[] = [
      event("new_sale", 47, "2026-06-01T10:00:00.000Z", 47),
      event("renewal", 47, "2026-06-05T10:00:00.000Z"),
      event("upgrade", 20, "2026-06-08T10:00:00.000Z", 20),
      event("refund", 10, "2026-06-09T10:00:00.000Z"),
      event("cancelled_subscription", 47, "2026-06-10T10:00:00.000Z", 47),
      event("trial_conversion", 47, "2026-06-11T10:00:00.000Z", 47),
    ];

    const snap = computeRevenuePeriodSnapshot(events, "2026-06");
    expect(snap.newSales).toBe(1);
    expect(snap.renewals).toBe(1);
    expect(snap.upgrades).toBe(1);
    expect(snap.refunds).toBe(1);
    expect(snap.cancelledSubscriptions).toBe(1);
    expect(snap.trialConversions).toBe(1);
    expect(snap.monthlyRevenue).toBe(47 + 47 + 20 - 10 + 47);

    const mrr = computeMrrAt(events, NOW);
    expect(mrr).toBe(47 + 20 + 47 - 47);

    const intel = buildFounderRevenueIntelligence(events, null, NOW);
    expect(intel.dashboardMetrics.mrr).toBe(mrr);
    expect(intel.dashboardMetrics.revenueThisMonth).toBe(snap.monthlyRevenue);
    expect(intel.dashboardMetrics.arr).toBe(mrr * 12);
  });

  it("2. growth metrics calculate correctly", () => {
    const events: RevenueEvent[] = [
      event("new_sale", 100, "2026-05-15T10:00:00.000Z", 100),
      event("new_sale", 150, "2026-06-05T10:00:00.000Z", 150),
    ];

    const intel = buildFounderRevenueIntelligence(events, null, NOW);
    expect(intel.previousPeriod?.monthlyRevenue).toBe(100);
    expect(intel.currentPeriod.monthlyRevenue).toBe(150);
    expect(intel.dashboardMetrics.revenueGrowthPercent).toBe(50);
    expect(computeRevenueGrowthPercent(150, 100)).toBe(50);
    expect(intel.revenueTrend.length).toBe(6);
  });

  it("3. founder AI can reference revenue via buildFounderRevenueIntelligence", () => {
    const intel = buildFounderRevenueIntelligence(
      [event("new_sale", 47, "2026-06-01T10:00:00.000Z", 47)],
      {
        totalContacts: 100,
        newContacts: 10,
        openOpportunities: 5,
        wonOpportunities: 3,
        lostOpportunities: 1,
        pipelineValue: 5000,
        conversionRate: 75,
        payingSubscribers: 20,
        trialSubscribers: 5,
        period: "30d",
        fetchedAt: NOW.toISOString(),
      },
      NOW,
    );

    expect(intel.ghlSignals?.payingSubscribers).toBe(20);
    expect(intel.dashboardMetrics.mrr).toBeGreaterThan(0);
    expect(intel.revenueHealth).toBeDefined();
    expect(intel.revenueTrend.some((p) => p.monthKey === "2026-06")).toBe(true);
  });

  it("4. dashboard revenue trends include monthly series", () => {
    const events: RevenueEvent[] = [
      event("renewal", 50, "2026-04-10T10:00:00.000Z"),
      event("renewal", 60, "2026-05-10T10:00:00.000Z"),
      event("renewal", 70, "2026-06-10T10:00:00.000Z"),
    ];
    const intel = buildFounderRevenueIntelligence(events, null, NOW);
    expect(intel.revenueTrend).toHaveLength(6);
    const june = intel.revenueTrend.find((p) => p.monthKey === "2026-06");
    expect(june?.monthlyRevenue).toBe(70);
  });

  it("records revenue events in memory store", async () => {
    const recorded = await recordRevenueEvent({
      kind: "new_sale",
      amount: 99,
      recurringAmount: 99,
      source: "stripe",
    });
    expect(recorded.amount).toBe(99);
    expect(recorded.source).toBe("stripe");
  });

  it("formatUsd renders currency", () => {
    expect(formatUsd(1234)).toBe("$1,234");
  });
});
