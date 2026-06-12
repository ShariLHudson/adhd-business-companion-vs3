import { describe, expect, it } from "vitest";

import type { FounderEvent } from "@/lib/ecosystem/events";
import { buildProductIntelligenceReport } from "@/lib/founderWorkspace/productIntelligence/productIntelligenceEngine";

import {
  buildBusinessHealthReport,
  computeEngagementHealth,
  computeUserHealth,
} from "./businessHealthEngine";
import { detectHealthWarnings } from "./warningEngine";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-09T12:00:00.000Z");

function evt(partial: Omit<FounderEvent, "founderId">): FounderEvent {
  return { founderId: FOUNDER, ...partial };
}

describe("businessHealthEngine", () => {
  it("computes user health with retention", () => {
    const events: FounderEvent[] = [
      evt({ id: "1", type: "workspace.opened", ts: "2026-06-01T10:00:00.000Z", refs: { workspace: "create" } }),
      evt({ id: "2", type: "workspace.opened", ts: "2026-06-08T10:00:00.000Z", refs: { workspace: "create" } }),
      evt({ id: "3", type: "focus.completed", ts: "2026-06-08T11:00:00.000Z", data: { actualMinutes: 25 } }),
    ];

    const user = computeUserHealth(events, NOW);
    expect(user.activeUsers).toBe(1);
    expect(user.returningUsers).toBe(1);
    expect(user.retentionRate).toBe(100);
  });

  it("scores health dimensions and generates weekly report", () => {
    const events: FounderEvent[] = [
      evt({ id: "a1", type: "focus.completed", ts: "2026-06-08T10:00:00.000Z", data: { actualMinutes: 25 } }),
      evt({ id: "a2", type: "focus.completed", ts: "2026-06-08T11:00:00.000Z", data: { actualMinutes: 25 } }),
      evt({ id: "a3", type: "document.created", ts: "2026-06-08T12:00:00.000Z", refs: { documentId: "d1" } }),
      evt({
        id: "a4",
        type: "painpoint.observed",
        ts: "2026-06-08T13:00:00.000Z",
        data: { text: "Where did my document go?" },
      }),
    ];

    const productReport = buildProductIntelligenceReport(events, FOUNDER, NOW);
    const report = buildBusinessHealthReport({
      events,
      productReport,
      now: NOW,
    });

    expect(report.engagement.level).toBe("healthy");
    expect(report.weeklyReport.wins.length).toBeGreaterThan(0);
    expect(report.weeklyReport.summary.length).toBeGreaterThan(5);
  });

  it("triggers warnings when retention drops", () => {
    const events: FounderEvent[] = [
      evt({ id: "p1", type: "workspace.opened", ts: "2026-05-20T10:00:00.000Z", refs: { workspace: "create" } }),
      evt({ id: "p2", type: "workspace.opened", ts: "2026-05-22T10:00:00.000Z", refs: { workspace: "create" } }),
      evt({ id: "c1", type: "workspace.opened", ts: "2026-06-08T10:00:00.000Z", refs: { workspace: "create" } }),
    ];

    const metrics = {
      user: { ...computeUserHealth(events, NOW), retentionTrend: "down" as const },
      product: {
        topFeature: "create",
        leastUsedFeature: "focus",
        errorSignals: 0,
        abandonedWorkflows: 1,
        topFriction: "confusion",
      },
      engagement: computeEngagementHealth(events, NOW),
      business: {
        payingUsers: 0,
        trialUsers: 0,
        conversions: 0,
        churnRate: 0,
        dataConnected: false,
        revenueTrend: "unknown" as const,
      },
      system: {
        openAiStatus: "healthy" as const,
        claudeStatus: "healthy" as const,
        googleIntegration: "healthy" as const,
        ghlIntegration: "needs_attention" as const,
        errorLogCount: 0,
      },
    };

    const warnings = detectHealthWarnings(metrics, events, NOW);
    expect(warnings.some((w) => w.id === "warn-retention")).toBe(true);
  });
});
