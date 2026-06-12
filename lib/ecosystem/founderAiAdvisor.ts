// Founder AI Advisor — interpret ecosystem intelligence for GHL embed.

import type { GhlDashboardPayload, GhlPeriod } from "@/lib/ghl/types";

import { FOUNDER_AI_ADVISOR_SYSTEM_PROMPT } from "./founderAiAdvisorPrompt";

import { buildBusinessEcosystemDashboard } from "./businessEcosystemDashboard";
import { loadContentDrafts } from "./postcraftDraftStore";
import {
  answerPostCraftPublishingQuestion,
  formatPublishingForAdvisor,
  loadPostCraftPublishingIntelligence,
  type PostCraftPublishingIntelligence,
} from "./postcraftLivePublishing";
import { getPostCraftSyncQueue } from "./postcraftSyncQueue";
import type { FounderCostIntelligence } from "./costIntelligenceEngine";
import { answerCostFounderQuestion, loadCostIntelligence } from "./costIntelligenceEngine";
import type { ExecutiveMorningBriefing } from "./executiveMorningBriefing";
import type { CrossSystemIntelligenceHub } from "./crossSystemIntelligenceHub";
import {
  answerFounderHubQuestion,
  formatHubForAdvisor,
  loadCrossSystemIntelligenceHub,
} from "./crossSystemIntelligenceHub";
import {
  answerMorningBriefingQuestion,
  formatExecutiveBriefingForAdvisor,
  loadExecutiveMorningBriefing,
} from "./executiveMorningBriefing";
import type { FounderRevenueIntelligence } from "./revenueIntelligenceEngine";
import {
  answerRevenueFounderQuestion,
  loadRevenueIntelligence,
} from "./revenueIntelligenceEngine";
import type { FounderUserHealthInputs } from "./userHealthEngine";
import { answerUserHealthFounderQuestion, loadUserHealthIntelligence } from "./userHealthEngine";

export type FounderAdvisorRecommendation = {
  observation: string;
  reason: string;
  suggestedAction: string;
  expectedImpact: string;
  priority: number;
};

export type FounderAdvisorResponse = {
  message: string;
  recommendations: FounderAdvisorRecommendation[];
  nextStep: string;
  usedLlm: boolean;
};

export type FounderAdvisorHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type FounderAdvisorContext = {
  generatedAt: string;
  period: GhlPeriod;
  businessIntelligence: {
    totalContacts: number;
    newContacts: number;
    openOpportunities: number;
    pipelineValue: number;
    conversionRate: number;
    period: GhlPeriod;
  } | null;
  userIntelligence: { label: string; count: number; kind: string }[];
  productIntelligence: { label: string; count: number }[];
  contentIntelligence: {
    topic: string;
    opportunityScore: number;
    mentions: number;
    trend?: string;
    topAssetTitle?: string;
    whyThisMatters?: string;
  }[];
  revenueIntelligence: FounderRevenueIntelligence | null;
  costIntelligence: FounderCostIntelligence | null;
  retentionIntelligence: {
    wonOpportunities: number;
    lostOpportunities: number;
    conversionRate: number;
    trialSubscribers: number;
    payingSubscribers: number;
    notes: string[];
  } | null;
  contentPipeline: {
    draftsTotal: number;
    draftsApproved: number;
    draftsDrafted: number;
    syncQueueReady: number;
    syncQueueFailed: number;
    syncQueueSent: number;
  };
  founderOps: {
    activeProjects: number;
    activeExperiments: number;
    topProjects: string[];
  };
  integration: GhlDashboardPayload["integration"];
  userHealth?: FounderUserHealthInputs;
  morningBriefing?: ExecutiveMorningBriefing;
  intelligenceHub?: CrossSystemIntelligenceHub;
  postcraftPublishing?: PostCraftPublishingIntelligence;
};

function struggleAndQuestionSignals(
  signals: GhlDashboardPayload["productSignals"],
) {
  return signals
    .filter((s) => s.kind === "struggle" || s.kind === "question" || s.kind === "feedback")
    .map((s) => ({ label: s.label, count: s.count, kind: s.kind }));
}

function featureRequestSignals(signals: GhlDashboardPayload["productSignals"]) {
  return signals
    .filter((s) => s.kind === "feature_request")
    .map((s) => ({ label: s.label, count: s.count }));
}

export function buildFounderAdvisorContext(
  dashboard: GhlDashboardPayload,
  period: GhlPeriod,
  pipeline?: {
    draftsTotal: number;
    draftsApproved: number;
    draftsDrafted: number;
    syncQueueReady: number;
    syncQueueFailed: number;
    syncQueueSent: number;
  },
  userHealth?: FounderUserHealthInputs,
  revenueIntelligence?: FounderRevenueIntelligence | null,
  costIntelligence?: FounderCostIntelligence | null,
  morningBriefing?: ExecutiveMorningBriefing,
  intelligenceHub?: CrossSystemIntelligenceHub,
  postcraftPublishing?: PostCraftPublishingIntelligence,
): FounderAdvisorContext {
  const biz = dashboard.business;
  const retentionNotes: string[] = [];
  if (biz) {
    if (biz.lostOpportunities > biz.wonOpportunities) {
      retentionNotes.push(
        `Lost opportunities (${biz.lostOpportunities}) exceed won (${biz.wonOpportunities}) in GHL pipeline.`,
      );
    }
    if (biz.trialSubscribers > 0 && biz.payingSubscribers === 0) {
      retentionNotes.push(
        `${biz.trialSubscribers} trial contacts with no paying subscribers tagged yet.`,
      );
    }
    if (biz.conversionRate < 30 && biz.wonOpportunities + biz.lostOpportunities > 0) {
      retentionNotes.push(`Win rate is ${biz.conversionRate}% — below typical healthy range.`);
    }
  }
  if (!dashboard.integration.ecosystemSignalsConfigured) {
    retentionNotes.push("Companion signal sync not live yet — engagement trends are limited.");
  }

  return {
    generatedAt: dashboard.generatedAt,
    period,
    businessIntelligence: biz
      ? {
          totalContacts: biz.totalContacts,
          newContacts: biz.newContacts,
          openOpportunities: biz.openOpportunities,
          pipelineValue: biz.pipelineValue,
          conversionRate: biz.conversionRate,
          period: biz.period,
        }
      : null,
    userIntelligence: struggleAndQuestionSignals(dashboard.productSignals),
    productIntelligence: featureRequestSignals(dashboard.productSignals),
    contentIntelligence: dashboard.contentOpportunities.slice(0, 6).map((o) => ({
      topic: o.topic,
      opportunityScore: o.opportunityScore,
      mentions: o.mentions,
      trend: o.trend,
      topAssetTitle: o.assetIdeas?.[0]?.title ?? o.suggestedAssets[0],
      whyThisMatters: o.whyThisMatters,
    })),
    revenueIntelligence: revenueIntelligence ?? null,
    costIntelligence: costIntelligence ?? null,
    retentionIntelligence: biz
      ? {
          wonOpportunities: biz.wonOpportunities,
          lostOpportunities: biz.lostOpportunities,
          conversionRate: biz.conversionRate,
          trialSubscribers: biz.trialSubscribers,
          payingSubscribers: biz.payingSubscribers,
          notes: retentionNotes,
        }
      : retentionNotes.length
        ? {
            wonOpportunities: 0,
            lostOpportunities: 0,
            conversionRate: 0,
            trialSubscribers: 0,
            payingSubscribers: 0,
            notes: retentionNotes,
          }
        : null,
    contentPipeline: pipeline ?? {
      draftsTotal: 0,
      draftsApproved: 0,
      draftsDrafted: 0,
      syncQueueReady: 0,
      syncQueueFailed: 0,
      syncQueueSent: 0,
    },
    founderOps: {
      activeProjects: dashboard.founder.activeProjects,
      activeExperiments: dashboard.founder.activeExperiments,
      topProjects: dashboard.founder.topProjects.map((p) => p.title),
    },
    integration: dashboard.integration,
    userHealth,
    morningBriefing,
    intelligenceHub,
    postcraftPublishing,
  };
}

export function formatFounderAdvisorContextBlock(ctx: FounderAdvisorContext): string {
  const briefingBlock = ctx.morningBriefing
    ? `\n\nMORNING BRIEFING:\n${formatExecutiveBriefingForAdvisor(ctx.morningBriefing)}`
    : "";
  const hubBlock = ctx.intelligenceHub
    ? `\n\nCROSS-SYSTEM INTELLIGENCE HUB:\n${formatHubForAdvisor(ctx.intelligenceHub)}`
    : "";
  const publishingBlock = ctx.postcraftPublishing
    ? `\n\nPOSTCRAFT PUBLISHING:\n${formatPublishingForAdvisor(ctx.postcraftPublishing)}`
    : "";
  return `${JSON.stringify(ctx, null, 2)}${briefingBlock}${hubBlock}${publishingBlock}`;
}

function clampRecommendations(
  raw: unknown,
): FounderAdvisorRecommendation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, idx) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const observation = typeof r.observation === "string" ? r.observation.trim() : "";
      const reason = typeof r.reason === "string" ? r.reason.trim() : "";
      const suggestedAction =
        typeof r.suggestedAction === "string" ? r.suggestedAction.trim() : "";
      const expectedImpact =
        typeof r.expectedImpact === "string" ? r.expectedImpact.trim() : "";
      if (!observation || !suggestedAction) return null;
      const priority =
        typeof r.priority === "number" && Number.isFinite(r.priority)
          ? r.priority
          : idx + 1;
      return {
        observation: observation.slice(0, 500),
        reason: (reason || "Based on current ecosystem signals.").slice(0, 400),
        suggestedAction: suggestedAction.slice(0, 400),
        expectedImpact: (expectedImpact || "Clearer focus and better user outcomes.").slice(
          0,
          400,
        ),
        priority,
      };
    })
    .filter((r): r is FounderAdvisorRecommendation => r !== null)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

export function parseFounderAdvisorResponse(raw: string): FounderAdvisorResponse {
  const trimmed = raw.trim();
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    const message =
      typeof json.message === "string" && json.message.trim()
        ? json.message.trim()
        : trimmed;
    const recommendations = clampRecommendations(json.recommendations);
    const nextStep =
      typeof json.nextStep === "string" && json.nextStep.trim()
        ? json.nextStep.trim()
        : recommendations[0]?.suggestedAction ?? "Review the top content opportunity in your dashboard.";
    return { message, recommendations, nextStep, usedLlm: true };
  } catch {
    return {
      message: trimmed,
      recommendations: [],
      nextStep: "Pick one action from the dashboard and execute it today.",
      usedLlm: true,
    };
  }
}

function topUserSignal(ctx: FounderAdvisorContext) {
  return [...ctx.userIntelligence].sort((a, b) => b.count - a.count)[0];
}

function topContentOpportunity(ctx: FounderAdvisorContext) {
  return [...ctx.contentIntelligence].sort(
    (a, b) => b.opportunityScore - a.opportunityScore,
  )[0];
}

/** Rule-based advisor when OpenAI is unavailable. */
export function generateFounderAdvisorFallback(
  question: string,
  ctx: FounderAdvisorContext,
): FounderAdvisorResponse {
  const q = question.toLowerCase();
  const topSignal = topUserSignal(ctx);
  const topOpp = topContentOpportunity(ctx);
  const recommendations: FounderAdvisorRecommendation[] = [];

  if (topSignal && topSignal.count > 0) {
    recommendations.push({
      observation: `${topSignal.label} is the top user signal (${topSignal.count} mentions).`,
      reason: "This theme is showing up most in companion usage patterns.",
      suggestedAction: topOpp
        ? `Create content on ${topOpp.topic} — e.g. "${topOpp.topAssetTitle ?? "a workshop"}".`
        : `Address ${topSignal.label} in your next piece of content or product improvement.`,
      expectedImpact: "Users feel understood and stay engaged longer.",
      priority: 1,
    });
  }

  if (topOpp && topOpp.opportunityScore > 0) {
    recommendations.push({
      observation: `${topOpp.topic} scores ${topOpp.opportunityScore} with ${topOpp.mentions} related signals${topOpp.trend ? ` (trend: ${topOpp.trend})` : ""}.`,
      reason: topOpp.whyThisMatters ?? "Strong demand signal from aggregated user intelligence.",
      suggestedAction: `Draft and approve a ${topOpp.topAssetTitle ?? topOpp.topic} asset from Content Opportunities.`,
      expectedImpact: "Higher engagement and retention from timely, relevant content.",
      priority: recommendations.length ? 2 : 1,
    });
  }

  if (ctx.contentPipeline.syncQueueReady > 0) {
    recommendations.push({
      observation: `${ctx.contentPipeline.syncQueueReady} approved draft(s) are ready for PostCraft sync.`,
      reason: "Approved content is waiting — publishing delay costs momentum.",
      suggestedAction: "Open PostCraft Sync Queue and send or mark sent the top item.",
      expectedImpact: "Faster content distribution and clearer founder follow-through.",
      priority: 1,
    });
  }

  if (
    ctx.intelligenceHub &&
    (q.includes("work on next") ||
      q.includes("should we improve") ||
      (q.includes("should we create") && !q.includes("content should")) ||
      (q.includes("hurting") && q.includes("growth")) ||
      (q.includes("helping") && q.includes("retention")) ||
      q.includes("opportunities are emerging"))
  ) {
    const { answer } = answerFounderHubQuestion(question, ctx.intelligenceHub);
    const top = ctx.intelligenceHub.recommendedActions[0];
    return {
      message: answer,
      recommendations: ctx.intelligenceHub.insights.slice(0, 2).map((i, idx) => ({
        observation: i.title,
        reason: i.summary,
        suggestedAction: i.suggestedAction,
        expectedImpact: i.expectedImpact,
        priority: idx + 1,
      })),
      nextStep: top?.action ?? answer,
      usedLlm: false,
    };
  }

  if (
    ctx.morningBriefing &&
    (q.includes("briefing") ||
      q.includes("morning") ||
      (q.includes("focus") && q.includes("today")) ||
      (q.includes("priority") && !q.includes("prioritiz")))
  ) {
    const { answer, nextStep } = answerMorningBriefingQuestion(question, ctx.morningBriefing);
    return {
      message: answer,
      recommendations,
      nextStep,
      usedLlm: false,
    };
  }

  if (
    ctx.costIntelligence &&
    (q.includes("cost") ||
      q.includes("profit") ||
      (q.includes("increasing") && !q.includes("churn")))
  ) {
    const { answer, nextStep } = answerCostFounderQuestion(question, ctx.costIntelligence);
    return {
      message: answer,
      recommendations,
      nextStep,
      usedLlm: false,
    };
  }

  if (
    ctx.revenueIntelligence &&
    ((q.includes("how healthy") && q.includes("revenue")) ||
      q.includes("what changed") ||
      (q.includes("conversion") && q.includes("improv")) ||
      (q.includes("churn") && (q.includes("increas") || q.includes("rising"))))
  ) {
    const { answer, nextStep } = answerRevenueFounderQuestion(question, ctx.revenueIntelligence);
    return {
      message: answer,
      recommendations,
      nextStep,
      usedLlm: false,
    };
  }

  if (
    ctx.userHealth &&
    (q.includes("need attention") ||
      q.includes("less engaged") ||
      q.includes("retention risk") ||
      q.includes("which users") ||
      q.includes("what should we do"))
  ) {
    const { answer, nextStep } = answerUserHealthFounderQuestion(question, ctx.userHealth);
    return {
      message: answer,
      recommendations: ctx.userHealth.topAtRiskUsers.slice(0, 2).map((u, i) => ({
        observation: `${u.userRef} — health score ${u.healthScore}`,
        reason: `${u.daysSinceLastActivity} days since last activity`,
        suggestedAction: "Send a short re-engagement nudge or check-in.",
        expectedImpact: "Recover user before churn.",
        priority: i + 1,
      })),
      nextStep,
      usedLlm: false,
    };
  }

  if (
    q.includes("cancel") ||
    q.includes("churn") ||
    q.includes("risk")
  ) {
    if (ctx.userHealth) {
      const { answer, nextStep } = answerUserHealthFounderQuestion(question, ctx.userHealth);
      return {
        message: answer,
        recommendations,
        nextStep,
        usedLlm: false,
      };
    }
    const notes = ctx.retentionIntelligence?.notes ?? [];
    return {
      message:
        notes.length > 0
          ? `Biggest retention signal right now: ${notes[0]}`
          : "Retention data is thin — connect GHL and keep companion signals syncing for clearer cancellation trends.",
      recommendations: notes.length
        ? [
            {
              observation: notes[0],
              reason: "Pipeline and subscriber tags surface early churn risk.",
              suggestedAction:
                "Review trial contacts in GHL and add a short check-in email or onboarding touchpoint.",
              expectedImpact: "Fewer silent drop-offs before users see value.",
              priority: 1,
            },
            ...recommendations,
          ].slice(0, 3)
        : recommendations,
      nextStep: "Check GHL trial vs paying tags and follow up with trials this week.",
      usedLlm: false,
    };
  }

  if (q.includes("retention") || q.includes("at risk") || q.includes("health")) {
    const uh = ctx.userHealth;
    return {
      message: uh
        ? `Retention trend: ${uh.retentionTrend}. ${uh.dashboardMetrics.inactive14Days} users inactive 14+ days, ${uh.dashboardMetrics.cancelledUsers} cancelled.`
        : "User health data is still syncing from the companion app.",
      recommendations: uh?.topAtRiskUsers.length
        ? [
            {
              observation: `${uh.topAtRiskUsers.length} users need attention or are at risk.`,
              reason: "Inactive users often disengage before cancelling.",
              suggestedAction: "Reach out with a short check-in email or in-app nudge for top at-risk cohort.",
              expectedImpact: "Improved retention and recovered users.",
              priority: 1,
            },
            ...recommendations,
          ].slice(0, 3)
        : recommendations,
      nextStep: "Review user health counts in Business Snapshot.",
      usedLlm: false,
    };
  }

  if (q.includes("engagement") || q.includes("dropping")) {
    const lowSignals = !ctx.integration.ecosystemSignalsConfigured;
    return {
      message: lowSignals
        ? "Engagement signals are not fully live yet. Turn on companion → server signal sync first."
        : topSignal
          ? `Engagement concern often tracks with ${topSignal.label} — ${topSignal.count} recent signals.`
          : "No strong engagement drop visible in aggregated data yet.",
      recommendations: [
        {
          observation: lowSignals
            ? "Ecosystem signal sync is not live."
            : topSignal
              ? `${topSignal.label} leads user signals (${topSignal.count}).`
              : "Signal volume is still building.",
          reason: "Engagement drops often start as repeated struggle or question patterns.",
          suggestedAction: topOpp
            ? `Ship a quick-win asset on ${topOpp.topic} to re-engage users.`
            : "Prompt users with one clear next step in onboarding or email.",
          expectedImpact: "Users return when the product meets them where they are stuck.",
          priority: 1,
        },
        ...recommendations,
      ].slice(0, 3),
      nextStep: topOpp
        ? `Generate a draft on "${topOpp.topAssetTitle ?? topOpp.topic}" today.`
        : "Confirm companion signals are syncing to the dashboard.",
      usedLlm: false,
    };
  }

  if (
    ctx.postcraftPublishing &&
    (q.includes("scheduled") ||
      q.includes("failed") ||
      q.includes("performed") ||
      (q.includes("best") && (q.includes("content") || q.includes("topic") || q.includes("perform"))))
  ) {
    const { answer, nextStep } = answerPostCraftPublishingQuestion(
      question,
      ctx.postcraftPublishing,
    );
    return { message: answer, recommendations, nextStep, usedLlm: false };
  }

  if (q.includes("content") || q.includes("create") || q.includes("publish")) {
    return {
      message: topOpp
        ? `Best content bet: ${topOpp.topic} (score ${topOpp.opportunityScore}).`
        : "Content opportunities will populate as user signals grow.",
      recommendations,
      nextStep: topOpp
        ? `Generate a draft for ${topOpp.topic} from Live Content Opportunities.`
        : "Use companion chat to build signal volume, then revisit opportunities.",
      usedLlm: false,
    };
  }

  if (q.includes("focus") || q.includes("doing") || q.includes("how are we")) {
    const biz = ctx.businessIntelligence;
    const summary = biz
      ? `Contacts: ${biz.totalContacts}, new (${biz.period}): ${biz.newContacts}, pipeline open: ${biz.openOpportunities}.`
      : "Business metrics need GHL connection.";
    return {
      message: `${summary} ${topSignal ? `Users care most about ${topSignal.label} right now.` : ""}`.trim(),
      recommendations,
      nextStep:
        recommendations[0]?.suggestedAction ??
        "Review Live Content Opportunities and pick one asset to draft.",
      usedLlm: false,
    };
  }

  return {
    message:
      recommendations.length > 0
        ? "Here is what stands out in your ecosystem data right now."
        : "Data is still building. Connect GHL and use the companion to grow signal counts.",
    recommendations,
    nextStep:
      recommendations[0]?.suggestedAction ??
      "Open Live Content Opportunities and mark one item reviewed.",
    usedLlm: false,
  };
}

export async function loadFounderAdvisorSnapshot(period: GhlPeriod = "30d") {
  const dashboard = await buildBusinessEcosystemDashboard({ period });
  const [drafts, syncQueue, userHealth, revenueIntelligence, postcraftPublishing] =
    await Promise.all([
      loadContentDrafts(),
      getPostCraftSyncQueue(),
      loadUserHealthIntelligence(),
      loadRevenueIntelligence(dashboard.business),
      loadPostCraftPublishingIntelligence(),
    ]);

  const totalUsers =
    (revenueIntelligence.ghlSignals?.payingSubscribers ?? 0) +
    (revenueIntelligence.ghlSignals?.trialSubscribers ?? 0) ||
    Object.values(userHealth.healthDistribution).reduce((a, b) => a + b, 0);

  const [costIntelligence, morningBriefing, intelligenceHub] = await Promise.all([
    loadCostIntelligence({
      monthlyRevenue: revenueIntelligence.dashboardMetrics.revenueThisMonth,
      totalUsers: Math.max(totalUsers, 1),
      activeUsers: Math.max(userHealth.dashboardMetrics.activeUsers, 1),
    }),
    loadExecutiveMorningBriefing(period),
    loadCrossSystemIntelligenceHub(period),
  ]);

  const pipeline = {
    draftsTotal: drafts.length,
    draftsApproved: drafts.filter((d) => d.status === "approved").length,
    draftsDrafted: drafts.filter((d) => d.status === "drafted" || d.status === "reviewed").length,
    syncQueueReady: syncQueue.items.filter((i) => i.status === "ready").length,
    syncQueueFailed: syncQueue.items.filter((i) => i.status === "failed").length,
    syncQueueSent: syncQueue.items.filter((i) => i.status === "sent").length,
  };

  const context = buildFounderAdvisorContext(
    dashboard,
    period,
    pipeline,
    userHealth,
    revenueIntelligence,
    costIntelligence,
    morningBriefing,
    intelligenceHub,
    postcraftPublishing,
  );
  return { dashboard, context };
}

export async function callFounderAdvisorLlm(input: {
  question: string;
  contextBlock: string;
  history: FounderAdvisorHistoryMessage[];
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured.");
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `${FOUNDER_AI_ADVISOR_SYSTEM_PROMPT}\n\n---\nINTELLIGENCE CONTEXT (aggregated only):\n${input.contextBlock}`,
    },
  ];

  for (const turn of input.history.slice(-8)) {
    messages.push({ role: turn.role, content: turn.content });
  }
  messages.push({ role: "user", content: input.question });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Advisor request failed.");
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export { FOUNDER_AI_ADVISOR_SYSTEM_PROMPT };
