import { describe, expect, it } from "vitest";

import type { GhlDashboardPayload } from "@/lib/ghl/types";

import {
  buildFounderAdvisorContext,
  formatFounderAdvisorContextBlock,
  generateFounderAdvisorFallback,
  parseFounderAdvisorResponse,
} from "./founderAiAdvisor";
import { buildFounderCostIntelligence } from "./costIntelligenceEngine";
import { buildCrossSystemIntelligenceHub } from "./crossSystemIntelligenceHub";
import { buildExecutiveMorningBriefing } from "./executiveMorningBriefing";
import { buildFounderRevenueIntelligence } from "./revenueIntelligenceEngine";
import type { CostEvent } from "./costIntelligenceEngine";
import type { PostCraftPublishingIntelligence } from "./postcraftLivePublishing";

function sampleDashboard(): GhlDashboardPayload {
  return {
    generatedAt: "2026-06-12T12:00:00.000Z",
    business: {
      totalContacts: 500,
      newContacts: 40,
      openOpportunities: 12,
      wonOpportunities: 8,
      lostOpportunities: 4,
      pipelineValue: 12000,
      conversionRate: 67,
      payingSubscribers: 30,
      trialSubscribers: 15,
      period: "30d",
      fetchedAt: "2026-06-12T12:00:00.000Z",
    },
    founder: {
      activeProjects: 2,
      activeExperiments: 1,
      recentNotes: 3,
      topProjects: [{ title: "Launch funnel", status: "active" }],
      configured: true,
    },
    productSignals: [
      { label: "Overwhelm", count: 42, kind: "struggle" },
      { label: "What should I work on?", count: 18, kind: "question" },
      { label: "Calendar integration", count: 5, kind: "feature_request" },
    ],
    contentOpportunities: [
      {
        topic: "Overwhelm",
        topicKey: "overwhelm",
        mentions: 42,
        opportunityScore: 88,
        trend: "up",
        whyThisMatters: "High signal volume.",
        suggestedAssets: ["Workshop"],
        assetIdeas: [
          {
            type: "workshop",
            label: "Workshop",
            title: "ADHD overwhelm rescue workshop",
            angle: "Triage in 15 minutes.",
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

describe("founderAiAdvisor", () => {
  it("builds context from dashboard sources", () => {
    const ctx = buildFounderAdvisorContext(sampleDashboard(), "30d", {
      draftsTotal: 3,
      draftsApproved: 1,
      draftsDrafted: 2,
      syncQueueReady: 1,
      syncQueueFailed: 0,
      syncQueueSent: 0,
    });
    expect(ctx.userIntelligence[0].label).toBe("Overwhelm");
    expect(ctx.contentIntelligence[0].topic).toBe("Overwhelm");
    expect(ctx.revenueIntelligence).toBeNull();
    expect(ctx.contentPipeline.syncQueueReady).toBe(1);
  });

  it("parses structured advisor JSON with recommendations", () => {
    const parsed = parseFounderAdvisorResponse(
      JSON.stringify({
        message: "Focus on overwhelm content.",
        recommendations: [
          {
            observation: "Overwhelm mentions increased.",
            reason: "Top struggle signal.",
            suggestedAction: "Create an overwhelm workshop.",
            expectedImpact: "Higher engagement and retention.",
            priority: 1,
          },
        ],
        nextStep: "Draft the workshop today.",
      }),
    );
    expect(parsed.recommendations.length).toBe(1);
    expect(parsed.recommendations[0].suggestedAction).toContain("workshop");
    expect(parsed.nextStep).toContain("Draft");
  });

  it("fallback answers founder questions with actionable recommendations", () => {
    const ctx = buildFounderAdvisorContext(sampleDashboard(), "30d");
    const res = generateFounderAdvisorFallback("What content should we create?", ctx);
    expect(res.message.length).toBeGreaterThan(10);
    expect(res.recommendations.length).toBeGreaterThan(0);
    expect(res.recommendations[0].suggestedAction.length).toBeGreaterThan(5);
    expect(res.recommendations[0].expectedImpact.length).toBeGreaterThan(5);
    expect(res.nextStep.length).toBeGreaterThan(5);
  });

  it("addresses engagement dropping in fallback", () => {
    const ctx = buildFounderAdvisorContext(sampleDashboard(), "30d");
    const res = generateFounderAdvisorFallback("Why is engagement dropping?", ctx);
    expect(res.message.toLowerCase()).toMatch(/engagement|overwhelm|signal/);
    expect(res.recommendations[0].observation.length).toBeGreaterThan(0);
  });

  it("fallback references revenue intelligence when loaded", () => {
    const revenue = buildFounderRevenueIntelligence([], sampleDashboard().business!);
    const ctx = buildFounderAdvisorContext(sampleDashboard(), "30d", undefined, undefined, revenue);
    const res = generateFounderAdvisorFallback("How healthy is revenue?", ctx);
    expect(res.message.toLowerCase()).toMatch(/revenue|mrr|health/);
    expect(ctx.revenueIntelligence?.ghlSignals?.payingSubscribers).toBe(30);
  });

  it("fallback discusses cost intelligence when loaded", () => {
    const costs: CostEvent[] = [
      {
        id: "c1",
        category: "openai",
        amount: 90,
        currency: "USD",
        occurredAt: "2026-06-01T10:00:00.000Z",
        source: "manual",
      },
    ];
    const cost = buildFounderCostIntelligence(costs, { monthlyRevenue: 500 });
    const ctx = buildFounderAdvisorContext(
      sampleDashboard(),
      "30d",
      undefined,
      undefined,
      null,
      cost,
    );
    const res = generateFounderAdvisorFallback("What is my profit estimate?", ctx);
    expect(res.message.toLowerCase()).toMatch(/profit|margin|cost/);
    expect(ctx.costIntelligence?.dashboardMetrics.profitEstimate).toBe(410);
  });

  it("fallback uses morning briefing when loaded", () => {
    const briefing = buildExecutiveMorningBriefing({
      dashboard: sampleDashboard(),
      period: "30d",
      signalCounts: [],
      revenueThisMonth: 500,
      mrr: 500,
      activeUsers: 5,
      atRiskUsers: 0,
      newUsers: 1,
      cancelledUsers: 0,
      companionUsageTotal: 0,
      featureUsageTotal: 0,
    });
    const ctx = buildFounderAdvisorContext(
      sampleDashboard(),
      "30d",
      undefined,
      undefined,
      null,
      null,
      briefing,
    );
    const res = generateFounderAdvisorFallback("What's my morning briefing?", ctx);
    expect(res.message.length).toBeGreaterThan(10);
    expect(formatFounderAdvisorContextBlock(ctx)).toContain("MORNING BRIEFING");
  });

  it("fallback references postcraft publishing when loaded", () => {
    const publishing: PostCraftPublishingIntelligence = {
      connected: true,
      generatedAt: "2026-06-12T12:00:00.000Z",
      metrics: {
        contentPublished: 2,
        contentScheduled: 1,
        failedPublications: 1,
        topPerformingTopics: [{ topic: "Overwhelm", score: 200 }],
      },
      items: [
        {
          draftId: "d1",
          title: "Overwhelm blog",
          topic: "Overwhelm",
          assetType: "blog",
          assetLabel: "Blog",
          publishStatus: "scheduled",
          opportunityScore: 88,
          scheduledAt: "2026-06-15T09:00:00.000Z",
        },
        {
          draftId: "d2",
          title: "Failed post",
          topic: "Focus",
          assetType: "blog",
          assetLabel: "Blog",
          publishStatus: "failed",
          opportunityScore: 70,
          error: "API timeout",
        },
      ],
    };
    const ctx = buildFounderAdvisorContext(
      sampleDashboard(),
      "30d",
      undefined,
      undefined,
      null,
      null,
      undefined,
      undefined,
      publishing,
    );
    const scheduled = generateFounderAdvisorFallback("What content is scheduled?", ctx);
    expect(scheduled.message.toLowerCase()).toMatch(/scheduled/);
    const failed = generateFounderAdvisorFallback("What failed?", ctx);
    expect(failed.message.toLowerCase()).toMatch(/failed/);
    expect(formatFounderAdvisorContextBlock(ctx)).toContain("POSTCRAFT PUBLISHING");
  });

  it("fallback uses cross-system intelligence hub when loaded", () => {
    const hub = buildCrossSystemIntelligenceHub({
      dashboard: sampleDashboard(),
      period: "30d",
      drafts: [],
      syncQueueReady: 1,
      syncQueueSent: 0,
      syncQueueFailed: 0,
      postCraftConnected: false,
      totalSignalVolume: 50,
    });
    const ctx = buildFounderAdvisorContext(
      sampleDashboard(),
      "30d",
      undefined,
      undefined,
      null,
      null,
      undefined,
      hub,
    );
    const res = generateFounderAdvisorFallback("What should we improve?", ctx);
    expect(res.message.length).toBeGreaterThan(5);
    expect(formatFounderAdvisorContextBlock(ctx)).toContain("CROSS-SYSTEM INTELLIGENCE HUB");
  });
});
