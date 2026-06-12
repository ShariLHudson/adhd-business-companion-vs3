import { beforeEach, describe, expect, it } from "vitest";

import {
  buildFounderUserHealthInputs,
  classifyUserHealth,
  computeHealthScore,
  computeUserHealthDashboardMetrics,
  daysSinceLastActivity,
  enrichUserHealthRecord,
  healthStatusFromScore,
  recordUserHealthActivity,
  resetUserHealthStore,
  toGhlUserHealthFields,
} from "./userHealthEngine";
import type { UserHealthRecord } from "./userHealthEngine";

const NOW = new Date("2026-06-12T12:00:00.000Z");

function daysAgo(n: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function baseRecord(overrides: Partial<UserHealthRecord> = {}): UserHealthRecord {
  return enrichUserHealthRecord(
    {
      userId: "usr-test",
      lastActivityAt: daysAgo(1),
      loginCount: 2,
      featureUsageCount: 2,
      companionUsageCount: 1,
      sessionCount: 3,
      healthScore: 100,
      healthStatus: "healthy",
      daysSinceLastActivity: 1,
      updatedAt: NOW.toISOString(),
      ...overrides,
    },
    NOW,
  );
}

describe("userHealthEngine", () => {
  beforeEach(() => {
    resetUserHealthStore();
  });

  it("1. every user receives a health score 0-100", async () => {
    const record = await recordUserHealthActivity({
      userId: "usr-test-001",
      kind: "active",
      at: daysAgo(2),
    });
    expect(record.healthScore).toBeGreaterThanOrEqual(0);
    expect(record.healthScore).toBeLessThanOrEqual(100);
    expect(healthStatusFromScore(record.healthScore)).toBe(record.healthStatus);
  });

  it("2. inactive users are categorized by score bands", () => {
    expect(healthStatusFromScore(95)).toBe("healthy");
    expect(healthStatusFromScore(80)).toBe("needs_attention");
    expect(healthStatusFromScore(55)).toBe("at_risk");
    expect(healthStatusFromScore(20)).toBe("critical");

    expect(
      classifyUserHealth(
        { daysSinceLastActivity: 5, loginCount: 3, featureUsageCount: 2, companionUsageCount: 1, sessionCount: 2 },
        NOW,
      ),
    ).toBe("healthy");
    expect(
      classifyUserHealth(
        { daysSinceLastActivity: 8, loginCount: 1, featureUsageCount: 1, companionUsageCount: 0, sessionCount: 1 },
        NOW,
      ),
    ).toBe("needs_attention");
    expect(
      classifyUserHealth(
        { daysSinceLastActivity: 15, loginCount: 1, featureUsageCount: 0, companionUsageCount: 0, sessionCount: 0 },
        NOW,
      ),
    ).toBe("at_risk");
    expect(
      classifyUserHealth(
        { daysSinceLastActivity: 31, loginCount: 0, featureUsageCount: 0, companionUsageCount: 0, sessionCount: 0 },
        NOW,
      ),
    ).toBe("critical");
  });

  it("3. dashboard displays counts including at-risk and critical", () => {
    const inputs = buildFounderUserHealthInputs(
      [
        baseRecord({ userId: "u-active", lastActivityAt: daysAgo(1), daysSinceLastActivity: 1 }),
        baseRecord({
          userId: "u-7",
          lastActivityAt: daysAgo(10),
          daysSinceLastActivity: 10,
          loginCount: 1,
          sessionCount: 1,
        }),
        baseRecord({
          userId: "u-14",
          lastActivityAt: daysAgo(20),
          daysSinceLastActivity: 20,
          loginCount: 0,
          featureUsageCount: 0,
          companionUsageCount: 0,
          sessionCount: 0,
        }),
        baseRecord({
          userId: "u-30",
          lastActivityAt: daysAgo(40),
          daysSinceLastActivity: 40,
          loginCount: 0,
          featureUsageCount: 0,
          companionUsageCount: 0,
          sessionCount: 0,
        }),
        baseRecord({
          userId: "u-cancel",
          lastActivityAt: daysAgo(1),
          cancelledAt: daysAgo(1),
          daysSinceLastActivity: 1,
        }),
      ],
      NOW,
    );

    const m = inputs.dashboardMetrics;
    expect(m.activeUsers).toBe(1);
    expect(m.inactive7Days).toBe(1);
    expect(m.inactive14Days).toBe(1);
    expect(m.inactive30Days).toBe(1);
    expect(m.atRiskUsers).toBeGreaterThanOrEqual(1);
    expect(m.criticalUsers).toBeGreaterThanOrEqual(1);
    expect(m.cancelledUsers).toBe(1);
  });

  it("4. founder AI inputs include at-risk users and retention trend", () => {
    const inputs = buildFounderUserHealthInputs(
      [
        baseRecord({
          userId: "usr-at-risk-abc",
          lastActivityAt: daysAgo(16),
          daysSinceLastActivity: 16,
          loginCount: 1,
          sessionCount: 1,
        }),
      ],
      NOW,
    );
    expect(inputs.topAtRiskUsers.length).toBe(1);
    expect(inputs.topAtRiskUsers[0].healthScore).toBeLessThan(70);
    expect(inputs.topAtRiskUsers[0].userRef).toContain("…");
    expect(inputs.retentionTrend).toBeDefined();
  });

  it("5. no private conversation text — GHL fields use signals only", async () => {
    const record = await recordUserHealthActivity({
      userId: "usr-anon-xyz",
      kind: "companion",
      at: NOW.toISOString(),
    });
    const blob = JSON.stringify(record);
    expect(blob).not.toMatch(/conversation|message|chat|transcript|email/i);

    const ghl = toGhlUserHealthFields(record, NOW);
    expect(ghl.userHealthScore).toBeGreaterThanOrEqual(0);
    expect(ghl.daysInactive).toBe(0);
    expect(ghl.lastActivityDate).toBeTruthy();
  });

  it("tracks session frequency on active sessions", async () => {
    const record = await recordUserHealthActivity({
      userId: "usr-sessions",
      kind: "active",
      at: NOW.toISOString(),
    });
    expect(record.sessionCount).toBe(1);
    const again = await recordUserHealthActivity({
      userId: "usr-sessions",
      kind: "active",
      at: NOW.toISOString(),
    });
    expect(again.sessionCount).toBe(2);
  });

  it("computeHealthScore respects engagement", () => {
    const low = computeHealthScore(
      {
        daysSinceLastActivity: 4,
        loginCount: 0,
        featureUsageCount: 0,
        companionUsageCount: 0,
        sessionCount: 0,
      },
      NOW,
    );
    const high = computeHealthScore(
      {
        daysSinceLastActivity: 4,
        loginCount: 5,
        featureUsageCount: 4,
        companionUsageCount: 3,
        sessionCount: 6,
      },
      NOW,
    );
    expect(high).toBeGreaterThan(low);
  });

  it("computeUserHealthDashboardMetrics helper", () => {
    const metrics = computeUserHealthDashboardMetrics([baseRecord()], NOW);
    expect(metrics.activeUsers).toBe(1);
  });
});
