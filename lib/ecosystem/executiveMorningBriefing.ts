// Executive Morning Briefing — 60-second founder priorities (aggregated signals only).

import type { GhlDashboardPayload, GhlPeriod } from "@/lib/ghl/types";

import { buildBusinessEcosystemDashboard } from "./businessEcosystemDashboard";
import { generateCrossSystemInsights } from "./crossSystemIntelligenceHub";
import type { CrossSystemInsight } from "./crossSystemIntelligenceHub";
import { formatUsd } from "./revenueIntelligenceEngine";
import { loadRevenueIntelligence } from "./revenueIntelligenceEngine";
import type { EcosystemSignalCount } from "./serverSignalStore";
import { loadEcosystemSignalCounts } from "./serverSignalStore";
import {
  loadAllUserHealthRecords,
  loadUserHealthIntelligence,
} from "./userHealthEngine";
import { loadContentDrafts } from "./postcraftDraftStore";
import { getPostCraftSyncQueue } from "./postcraftSyncQueue";

export type BriefingBusinessSnapshot = {
  revenue: number;
  mrr: number;
  activeUsers: number;
  atRiskUsers: number;
  newUsers: number;
  cancelledUsers: number;
};

export type BriefingUserIntelligence = {
  topStruggle: string;
  topQuestion: string;
  topEmotion: string;
  trendingTopic: string;
};

export type BriefingProductIntelligence = {
  mostUsedFeature: string;
  leastUsedFeature: string;
  mostRequestedFeature: string;
  mostConfusingFeature: string;
};

export type BriefingContentIntelligence = {
  topContentOpportunity: string;
  recommendedBlog: string;
  recommendedNewsletter: string;
  recommendedWorkshop: string;
};

export type BriefingFounderFocus = {
  biggestOpportunity: string;
  biggestRisk: string;
  recommendedAction: string;
  expectedImpact: string;
};

export type BriefingQuickAction = {
  id: string;
  label: string;
  anchor: string;
};

export type ExecutiveMorningBriefing = {
  generatedAt: string;
  period: GhlPeriod;
  readSecondsEstimate: number;
  headline: string;
  businessSnapshot: BriefingBusinessSnapshot;
  userIntelligence: BriefingUserIntelligence;
  productIntelligence: BriefingProductIntelligence;
  contentIntelligence: BriefingContentIntelligence;
  founderFocus: BriefingFounderFocus;
  quickActions: BriefingQuickAction[];
};

const PRODUCT_FEATURES = [
  "Companion Chat",
  "Brain Dump",
  "Focus Audio",
  "Time Block",
  "Content Create",
  "Projects",
  "Google Workspace",
] as const;

const STRUGGLE_LABELS: Record<string, string> = {
  overwhelm: "Overwhelm",
  prioritization: "Prioritization",
  focus: "Focus",
  follow_through: "Follow Through",
  decision_making: "Decision Making",
  marketing: "Marketing",
  content_creation: "Content Creation",
};

const QUESTION_LABELS: Record<string, string> = {
  what_should_i_work_on: "What should I work on?",
  help_me_prioritize: "Help me prioritize",
  im_overwhelmed: "I'm overwhelmed",
  dont_know_where_to_start: "Don't know where to start",
};

const EMOTION_LABELS: Record<string, string> = {
  frustrated: "Frustrated",
  stuck: "Stuck",
  confused: "Confused",
  excited: "Excited",
  hopeful: "Hopeful",
};

function labelFor(kind: string, category: string): string {
  if (kind === "struggle") return STRUGGLE_LABELS[category] ?? category;
  if (kind === "question") return QUESTION_LABELS[category] ?? category;
  if (kind === "emotion") return EMOTION_LABELS[category] ?? category;
  return category;
}

function topByKind(counts: EcosystemSignalCount[], kind: string): string {
  const row = counts
    .filter((c) => c.kind === kind)
    .sort((a, b) => b.count - a.count)[0];
  return row ? labelFor(row.kind, row.category) : "Building signal volume";
}

function countFor(counts: EcosystemSignalCount[], kind: string, category: string): number {
  return counts.find((c) => c.kind === kind && c.category === category)?.count ?? 0;
}

function buildFeatureUsageScores(
  counts: EcosystemSignalCount[],
  companionTotal: number,
  featureTotal: number,
): Record<string, number> {
  const scores: Record<string, number> = Object.fromEntries(
    PRODUCT_FEATURES.map((f) => [f, 0]),
  ) as Record<string, number>;

  scores["Companion Chat"] = companionTotal;
  scores["Brain Dump"] += countFor(counts, "struggle", "overwhelm") * 2;
  scores["Brain Dump"] += countFor(counts, "question", "im_overwhelmed");
  scores["Focus Audio"] += countFor(counts, "struggle", "focus") * 2;
  scores["Time Block"] += countFor(counts, "struggle", "prioritization");
  scores["Time Block"] += countFor(counts, "question", "help_me_prioritize");
  scores["Content Create"] += countFor(counts, "struggle", "content_creation") * 2;
  scores["Content Create"] += countFor(counts, "struggle", "marketing");
  scores["Projects"] += countFor(counts, "struggle", "follow_through");
  scores["Projects"] += countFor(counts, "question", "what_should_i_work_on");
  scores["Google Workspace"] += Math.floor(featureTotal * 0.15);

  const toolPool = Math.max(0, featureTotal - scores["Google Workspace"]);
  const toolTargets = ["Brain Dump", "Focus Audio", "Time Block", "Content Create", "Projects"];
  const toolWeight = toolTargets.reduce((sum, key) => sum + scores[key], 0) || 1;
  for (const key of toolTargets) {
    scores[key] += Math.floor((scores[key] / toolWeight) * toolPool);
  }

  return scores;
}

function pickMostAndLeast(
  scores: Record<string, number>,
): { most: string; least: string } {
  const ranked = PRODUCT_FEATURES.map((label) => ({
    label,
    score: scores[label] ?? 0,
  })).sort((a, b) => b.score - a.score);

  const most = ranked[0]?.score > 0 ? ranked[0].label : "Companion Chat";
  const least =
    ranked.filter((r) => r.score > 0).at(-1)?.label ??
    ranked.at(-1)?.label ??
    "Time Block";

  return { most, least };
}

function assetTitle(
  dashboard: GhlDashboardPayload,
  type: string,
  fallback: string,
): string {
  const top = [...dashboard.contentOpportunities].sort(
    (a, b) => b.opportunityScore - a.opportunityScore || b.mentions - a.mentions,
  )[0];
  if (!top?.assetIdeas?.length) return fallback;

  const match =
    top.assetIdeas.find((a) => a.type === type || a.label.toLowerCase().includes(type)) ??
    top.assetIdeas[0];

  return match?.title ?? fallback;
}

function deriveFounderFocus(
  insights: CrossSystemInsight[],
  dashboard: GhlDashboardPayload,
): BriefingFounderFocus {
  const opportunity =
    insights.find((i) => i.type === "opportunity" || i.type === "growth") ??
    insights[0];
  const risk = insights.find((i) => i.type === "risk" || i.type === "problem");

  const topOpp = [...dashboard.contentOpportunities].sort(
    (a, b) => b.opportunityScore - a.opportunityScore,
  )[0];

  return {
    biggestOpportunity:
      opportunity?.title ??
      (topOpp ? `Publish on ${topOpp.topic}` : "Grow companion signal volume"),
    biggestRisk:
      risk?.title ??
      (dashboard.business && dashboard.business.lostOpportunities > dashboard.business.wonOpportunities
        ? "Pipeline losses outpacing wins"
        : "Limited data — connect GHL and sync companion signals"),
    recommendedAction:
      opportunity?.suggestedAction ??
      (topOpp
        ? `Draft a ${topOpp.suggestedAssets[0] ?? "workshop"} on ${topOpp.topic}`
        : "Use the companion today to build intelligence"),
    expectedImpact:
      opportunity?.expectedImpact ??
      risk?.expectedImpact ??
      "Clearer priorities and faster founder decisions",
  };
}

export function buildExecutiveMorningBriefing(input: {
  dashboard: GhlDashboardPayload;
  period: GhlPeriod;
  signalCounts: EcosystemSignalCount[];
  revenueThisMonth: number;
  mrr: number;
  activeUsers: number;
  atRiskUsers: number;
  newUsers: number;
  cancelledUsers: number;
  companionUsageTotal: number;
  featureUsageTotal: number;
  insights?: CrossSystemInsight[];
}): ExecutiveMorningBriefing {
  const { dashboard, period, signalCounts } = input;

  const topOpp = [...dashboard.contentOpportunities].sort(
    (a, b) => b.opportunityScore - a.opportunityScore || b.mentions - a.mentions,
  )[0];

  const sortedSignals = [...signalCounts].sort((a, b) => b.count - a.count);
  const trending =
    topOpp?.trend === "up"
      ? topOpp.topic
      : sortedSignals[0]
        ? labelFor(sortedSignals[0].kind, sortedSignals[0].category)
        : topOpp?.topic ?? "Building trends";

  const featureScores = buildFeatureUsageScores(
    signalCounts,
    input.companionUsageTotal,
    input.featureUsageTotal,
  );
  const { most, least } = pickMostAndLeast(featureScores);

  const featureRequests = dashboard.productSignals
    .filter((s) => s.kind === "feature_request")
    .sort((a, b) => b.count - a.count);
  const mostRequested =
    featureRequests[0]?.label ??
    dashboard.productSignals.sort((a, b) => b.count - a.count)[0]?.label ??
    "Calendar integration";

  const confusingScore = countFor(signalCounts, "emotion", "confused");
  const stuckScore = countFor(signalCounts, "emotion", "stuck");
  const startScore = countFor(signalCounts, "question", "dont_know_where_to_start");
  const mostConfusing =
    confusingScore >= stuckScore && confusingScore >= startScore
      ? "Onboarding & first steps"
      : startScore > 0
        ? "Getting started flow"
        : least;

  const hubInsights =
    input.insights ??
    generateCrossSystemInsights({
      dashboard,
      period,
      drafts: [],
      syncQueueReady: 0,
      syncQueueSent: 0,
      syncQueueFailed: 0,
      postCraftConnected: false,
      totalSignalVolume: signalCounts.reduce((s, c) => s + c.count, 0),
    });

  const founderFocus = deriveFounderFocus(hubInsights, dashboard);

  const headline = `${input.atRiskUsers > 0 ? `${input.atRiskUsers} users need attention · ` : ""}${
    topOpp ? `Top opportunity: ${topOpp.topic}` : "Your daily founder snapshot"
  }`;

  return {
    generatedAt: new Date().toISOString(),
    period,
    readSecondsEstimate: 45,
    headline,
    businessSnapshot: {
      revenue: input.revenueThisMonth,
      mrr: input.mrr,
      activeUsers: input.activeUsers,
      atRiskUsers: input.atRiskUsers,
      newUsers: input.newUsers,
      cancelledUsers: input.cancelledUsers,
    },
    userIntelligence: {
      topStruggle: topByKind(signalCounts, "struggle"),
      topQuestion: topByKind(signalCounts, "question"),
      topEmotion: topByKind(signalCounts, "emotion"),
      trendingTopic: trending,
    },
    productIntelligence: {
      mostUsedFeature: most,
      leastUsedFeature: least,
      mostRequestedFeature: mostRequested,
      mostConfusingFeature: mostConfusing,
    },
    contentIntelligence: {
      topContentOpportunity: topOpp?.topic ?? "Overwhelm",
      recommendedBlog: assetTitle(dashboard, "blog", "ADHD overwhelm rescue guide"),
      recommendedNewsletter: assetTitle(
        dashboard,
        "newsletter",
        "Weekly focus reset newsletter",
      ),
      recommendedWorkshop: assetTitle(
        dashboard,
        "workshop",
        "15-minute overwhelm triage workshop",
      ),
    },
    founderFocus,
    quickActions: [
      { id: "create-content", label: "Create Content", anchor: "#live-opportunities" },
      { id: "review-users", label: "Review Users", anchor: "#business-snapshot" },
      {
        id: "review-feedback",
        label: "Review Product Feedback",
        anchor: "#user-intelligence",
      },
      { id: "review-revenue", label: "Review Revenue", anchor: "#business-snapshot" },
    ],
  };
}

export function formatExecutiveBriefingForAdvisor(
  briefing: ExecutiveMorningBriefing,
): string {
  const b = briefing.businessSnapshot;
  return [
    `HEADLINE: ${briefing.headline}`,
    `BUSINESS: Revenue ${formatUsd(b.revenue)}, MRR ${formatUsd(b.mrr)}, Active ${b.activeUsers}, At-risk ${b.atRiskUsers}, New ${b.newUsers}, Cancelled ${b.cancelledUsers}`,
    `USERS: Struggle ${briefing.userIntelligence.topStruggle}, Question ${briefing.userIntelligence.topQuestion}, Emotion ${briefing.userIntelligence.topEmotion}, Trending ${briefing.userIntelligence.trendingTopic}`,
    `PRODUCT: Most used ${briefing.productIntelligence.mostUsedFeature}, Least used ${briefing.productIntelligence.leastUsedFeature}, Requested ${briefing.productIntelligence.mostRequestedFeature}, Confusing ${briefing.productIntelligence.mostConfusingFeature}`,
    `CONTENT: Opportunity ${briefing.contentIntelligence.topContentOpportunity}, Blog ${briefing.contentIntelligence.recommendedBlog}`,
    `FOCUS: Opportunity ${briefing.founderFocus.biggestOpportunity}, Risk ${briefing.founderFocus.biggestRisk}, Action ${briefing.founderFocus.recommendedAction}`,
  ].join("\n");
}

export function answerMorningBriefingQuestion(
  question: string,
  briefing: ExecutiveMorningBriefing,
): { answer: string; nextStep: string } {
  const q = question.toLowerCase();
  const f = briefing.founderFocus;

  if (q.includes("briefing") || q.includes("morning") || q.includes("today")) {
    return {
      answer: briefing.headline,
      nextStep: f.recommendedAction,
    };
  }

  if (q.includes("focus") || q.includes("priority") || q.includes("first")) {
    return {
      answer: `Biggest opportunity: ${f.biggestOpportunity}. Biggest risk: ${f.biggestRisk}.`,
      nextStep: f.recommendedAction,
    };
  }

  return {
    answer: `${briefing.headline} Recommended: ${f.recommendedAction}`,
    nextStep: f.recommendedAction,
  };
}

export async function loadExecutiveMorningBriefing(
  period: GhlPeriod = "30d",
): Promise<ExecutiveMorningBriefing> {
  const [
    dashboard,
    signalCounts,
    userHealth,
    healthRecords,
    drafts,
    syncQueue,
  ] = await Promise.all([
    buildBusinessEcosystemDashboard({ period }),
    loadEcosystemSignalCounts(),
    loadUserHealthIntelligence(),
    loadAllUserHealthRecords(),
    loadContentDrafts(),
    getPostCraftSyncQueue(),
  ]);

  const revenueIntel = await loadRevenueIntelligence(dashboard.business);

  const companionUsageTotal = healthRecords.reduce(
    (sum, r) => sum + r.companionUsageCount,
    0,
  );
  const featureUsageTotal = healthRecords.reduce(
    (sum, r) => sum + r.featureUsageCount,
    0,
  );

  const insights = generateCrossSystemInsights({
    dashboard,
    period,
    drafts,
    syncQueueReady: syncQueue.items.filter((i) => i.status === "ready").length,
    syncQueueSent: syncQueue.items.filter((i) => i.status === "sent").length,
    syncQueueFailed: syncQueue.items.filter((i) => i.status === "failed").length,
    postCraftConnected: syncQueue.connected,
    totalSignalVolume: signalCounts.reduce((s, c) => s + c.count, 0),
  });

  return buildExecutiveMorningBriefing({
    dashboard,
    period,
    signalCounts,
    revenueThisMonth: revenueIntel.dashboardMetrics.revenueThisMonth,
    mrr: revenueIntel.dashboardMetrics.mrr,
    activeUsers: userHealth.dashboardMetrics.activeUsers,
    atRiskUsers:
      userHealth.dashboardMetrics.atRiskUsers +
      userHealth.dashboardMetrics.criticalUsers,
    newUsers: dashboard.business?.newContacts ?? 0,
    cancelledUsers: userHealth.dashboardMetrics.cancelledUsers,
    companionUsageTotal,
    featureUsageTotal,
    insights,
  });
}
