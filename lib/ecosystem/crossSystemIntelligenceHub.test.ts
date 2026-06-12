import { describe, expect, it } from "vitest";

import type { GhlDashboardPayload } from "@/lib/ghl/types";

import {
  answerFounderHubQuestion,
  buildCrossSystemIntelligenceHub,
  buildReceivedIntelligence,
  formatHubForAdvisor,
  generateCrossSystemInsights,
  resolveSourceStatuses,
} from "./crossSystemIntelligenceHub";
import { buildFounderCostIntelligence } from "./costIntelligenceEngine";
import { buildFounderRevenueIntelligence } from "./revenueIntelligenceEngine";
import { buildFounderUserHealthInputs } from "./userHealthEngine";

function sampleDashboard(): GhlDashboardPayload {
  return {
    generatedAt: "2026-06-12T12:00:00.000Z",
    business: {
      totalContacts: 400,
      newContacts: 25,
      openOpportunities: 10,
      wonOpportunities: 6,
      lostOpportunities: 8,
      pipelineValue: 8000,
      conversionRate: 43,
      payingSubscribers: 20,
      trialSubscribers: 35,
      period: "30d",
      fetchedAt: "2026-06-12T12:00:00.000Z",
    },
    founder: {
      activeProjects: 1,
      activeExperiments: 0,
      recentNotes: 2,
      topProjects: [],
      configured: true,
    },
    productSignals: [
      { label: "Overwhelm", count: 50, kind: "struggle" },
      { label: "Calendar integration", count: 4, kind: "feature_request" },
    ],
    contentOpportunities: [
      {
        topic: "Overwhelm",
        topicKey: "overwhelm",
        mentions: 50,
        opportunityScore: 90,
        trend: "up",
        whyThisMatters: "Dominant theme.",
        suggestedAssets: ["Workshop"],
        assetIdeas: [
          { type: "workshop", label: "Workshop", title: "Overwhelm rescue", angle: "Triage fast." },
        ],
      },
    ],
    postCraftExport: null,
    integration: {
      ghlConfigured: true,
      founderDbConfigured: true,
      ecosystemSignalsConfigured: true,
      errors: [],
    },
  };
}

const userHealth = buildFounderUserHealthInputs(
  [
    {
      userId: "u1",
      lastActivityAt: "2026-06-10T10:00:00.000Z",
      loginCount: 2,
      featureUsageCount: 1,
      companionUsageCount: 3,
      sessionCount: 2,
      healthScore: 55,
      healthStatus: "at_risk",
      daysSinceLastActivity: 2,
      updatedAt: "2026-06-12T10:00:00.000Z",
    },
  ],
  new Date("2026-06-12T12:00:00.000Z"),
);

const revenueIntelligence = buildFounderRevenueIntelligence([], sampleDashboard().business!);
const costIntelligence = buildFounderCostIntelligence([], {
  monthlyRevenue: revenueIntelligence.dashboardMetrics.revenueThisMonth,
});

const baseInput = {
  dashboard: sampleDashboard(),
  period: "30d" as const,
  drafts: [],
  syncQueueReady: 2,
  syncQueueSent: 1,
  syncQueueFailed: 0,
  postCraftConnected: false,
  totalSignalVolume: 54,
  userHealth,
  revenueIntelligence,
  costIntelligence,
};

describe("crossSystemIntelligenceHub", () => {
  it("1. systems contribute intelligence", () => {
    const sources = resolveSourceStatuses(baseInput);
    expect(sources.map((s) => s.source)).toEqual([
      "companion_app",
      "ghl",
      "postcraft",
      "google_workspace",
      "future",
    ]);
    expect(sources.find((s) => s.source === "companion_app")?.status).toBe("live");
    expect(sources.find((s) => s.source === "ghl")?.status).toBe("live");

    const received = buildReceivedIntelligence(baseInput);
    expect(received.userIntelligence).toBe(true);
    expect(received.businessIntelligence).toBe(true);
    expect(received.retentionIntelligence).toBe(true);
  });

  it("2. intelligence is centralized in unified hub", () => {
    const hub = buildCrossSystemIntelligenceHub(baseInput);
    expect(hub.categories.length).toBe(5);
    expect(hub.contributions.length).toBe(5);
    expect(hub.received.revenueIntelligence).toBe(true);
    expect(hub.insights.length).toBeGreaterThan(0);
    expect(hub.recommendedActions.length).toBeGreaterThan(0);
    expect(hub.proactive.opportunities.length + hub.proactive.risks.length).toBeGreaterThan(0);
    expect(formatHubForAdvisor(hub)).toContain("TOP ACTION");
  });

  it("generates actionable cross-system insights", () => {
    const insights = generateCrossSystemInsights(baseInput);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].suggestedAction.length).toBeGreaterThan(5);
    expect(insights.some((i) => i.sources.includes("companion_app"))).toBe(true);
  });

  it("answers founder hub questions", () => {
    const hub = buildCrossSystemIntelligenceHub(baseInput);

    const work = answerFounderHubQuestion("What should I work on next?", hub);
    expect(work.answer.length).toBeGreaterThan(5);

    const improve = answerFounderHubQuestion("What should we improve?", hub);
    expect(improve.answer.length).toBeGreaterThan(5);

    const create = answerFounderHubQuestion("What should we create?", hub);
    expect(create.relatedInsights.length).toBeGreaterThan(0);

    const growth = answerFounderHubQuestion("What is hurting growth?", hub);
    expect(growth.answer.length).toBeGreaterThan(3);

    const retention = answerFounderHubQuestion("What is helping retention?", hub);
    expect(retention.answer.length).toBeGreaterThan(3);
  });

  it("flags retention risk when losses exceed wins", () => {
    const hub = buildCrossSystemIntelligenceHub(baseInput);
    expect(hub.proactive.risks.length + hub.insights.filter((i) => i.type === "risk").length).toBeGreaterThan(0);
  });
});
