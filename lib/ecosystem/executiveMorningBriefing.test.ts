import { describe, expect, it } from "vitest";

import type { GhlDashboardPayload } from "@/lib/ghl/types";

import {
  answerMorningBriefingQuestion,
  buildExecutiveMorningBriefing,
  formatExecutiveBriefingForAdvisor,
} from "./executiveMorningBriefing";

function sampleDashboard(): GhlDashboardPayload {
  return {
    generatedAt: "2026-06-12T12:00:00.000Z",
    business: {
      totalContacts: 200,
      newContacts: 12,
      openOpportunities: 5,
      wonOpportunities: 4,
      lostOpportunities: 2,
      pipelineValue: 8000,
      conversionRate: 67,
      payingSubscribers: 25,
      trialSubscribers: 8,
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
      { label: "Overwhelm", count: 40, kind: "struggle" },
      { label: "Calendar integration", count: 6, kind: "feature_request" },
    ],
    contentOpportunities: [
      {
        topic: "Overwhelm",
        topicKey: "overwhelm",
        mentions: 40,
        opportunityScore: 90,
        trend: "up",
        whyThisMatters: "High volume.",
        suggestedAssets: ["Workshop", "Blog"],
        assetIdeas: [
          {
            type: "workshop",
            label: "Workshop",
            title: "Overwhelm triage workshop",
            angle: "15 minutes.",
          },
          {
            type: "blog",
            label: "Blog",
            title: "Stop ADHD overwhelm spirals",
            angle: "Practical steps.",
          },
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

describe("executiveMorningBriefing", () => {
  it("1. briefing builds quickly with all sections", () => {
    const start = performance.now();
    const briefing = buildExecutiveMorningBriefing({
      dashboard: sampleDashboard(),
      period: "30d",
      signalCounts: [
        {
          kind: "struggle",
          category: "overwhelm",
          count: 40,
          lastSeen: "2026-06-12T10:00:00.000Z",
        },
        {
          kind: "question",
          category: "what_should_i_work_on",
          count: 18,
          lastSeen: "2026-06-12T09:00:00.000Z",
        },
        {
          kind: "emotion",
          category: "stuck",
          count: 12,
          lastSeen: "2026-06-12T08:00:00.000Z",
        },
      ],
      revenueThisMonth: 1200,
      mrr: 1175,
      activeUsers: 20,
      atRiskUsers: 3,
      newUsers: 12,
      cancelledUsers: 1,
      companionUsageTotal: 55,
      featureUsageTotal: 30,
    });
    const elapsedMs = performance.now() - start;

    expect(elapsedMs).toBeLessThan(500);
    expect(briefing.readSecondsEstimate).toBeLessThanOrEqual(60);
    expect(briefing.businessSnapshot.mrr).toBe(1175);
    expect(briefing.userIntelligence.topStruggle).toBe("Overwhelm");
    expect(briefing.productIntelligence.mostRequestedFeature).toBe("Calendar integration");
    expect(briefing.contentIntelligence.topContentOpportunity).toBe("Overwhelm");
    expect(briefing.founderFocus.recommendedAction.length).toBeGreaterThan(5);
    expect(briefing.quickActions).toHaveLength(4);
  });

  it("2. founder understands priorities immediately via headline and focus", () => {
    const briefing = buildExecutiveMorningBriefing({
      dashboard: sampleDashboard(),
      period: "30d",
      signalCounts: [],
      revenueThisMonth: 500,
      mrr: 500,
      activeUsers: 10,
      atRiskUsers: 4,
      newUsers: 2,
      cancelledUsers: 0,
      companionUsageTotal: 0,
      featureUsageTotal: 0,
    });

    expect(briefing.headline).toContain("4 users need attention");
    expect(briefing.founderFocus.biggestOpportunity.length).toBeGreaterThan(3);
    expect(briefing.founderFocus.biggestRisk.length).toBeGreaterThan(3);
  });

  it("3. founder AI can use briefing data", () => {
    const briefing = buildExecutiveMorningBriefing({
      dashboard: sampleDashboard(),
      period: "30d",
      signalCounts: [
        {
          kind: "struggle",
          category: "overwhelm",
          count: 10,
          lastSeen: "2026-06-12T10:00:00.000Z",
        },
      ],
      revenueThisMonth: 900,
      mrr: 900,
      activeUsers: 8,
      atRiskUsers: 1,
      newUsers: 3,
      cancelledUsers: 0,
      companionUsageTotal: 12,
      featureUsageTotal: 4,
    });

    const block = formatExecutiveBriefingForAdvisor(briefing);
    expect(block).toContain("MRR");
    expect(block).toContain("Overwhelm");

    const answer = answerMorningBriefingQuestion("What's my morning briefing?", briefing);
    expect(answer.nextStep).toBe(briefing.founderFocus.recommendedAction);
  });
});
