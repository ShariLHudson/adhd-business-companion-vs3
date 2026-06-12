// Cross-System Intelligence Hub — unified founder intelligence (summaries only).

import type { GhlDashboardPayload, GhlPeriod } from "@/lib/ghl/types";
import { ghlApiConfigured } from "@/lib/ghl/client";

import { buildBusinessEcosystemDashboard } from "./businessEcosystemDashboard";
import { loadCostIntelligence } from "./costIntelligenceEngine";
import type { FounderCostIntelligence } from "./costIntelligenceEngine";
import type { ContentDraft } from "./postcraftDraftGenerator";
import { loadContentDrafts } from "./postcraftDraftStore";
import { getPostCraftSyncQueue } from "./postcraftSyncQueue";
import type { FounderRevenueIntelligence } from "./revenueIntelligenceEngine";
import { formatUsd, loadRevenueIntelligence } from "./revenueIntelligenceEngine";
import { loadEcosystemSignalCounts } from "./serverSignalStore";
import type { FounderUserHealthInputs } from "./userHealthEngine";
import { loadUserHealthIntelligence } from "./userHealthEngine";

export type IntelligenceSource =
  | "companion_app"
  | "ghl"
  | "postcraft"
  | "google_workspace"
  | "future";

export type SourceConnectionStatus =
  | "live"
  | "partial"
  | "waiting"
  | "not_configured";

export type UnifiedIntelligenceCategory =
  | "business_intelligence"
  | "user_intelligence"
  | "product_intelligence"
  | "content_intelligence"
  | "growth_intelligence";

export type InsightType =
  | "problem"
  | "opportunity"
  | "trend"
  | "risk"
  | "content_idea"
  | "growth";

export type CrossSystemInsight = {
  id: string;
  category: UnifiedIntelligenceCategory;
  type: InsightType;
  title: string;
  summary: string;
  suggestedAction: string;
  expectedImpact: string;
  priority: number;
  sources: IntelligenceSource[];
};

export type IntelligenceCategoryBlock = {
  category: UnifiedIntelligenceCategory;
  label: string;
  headline: string;
  highlights: string[];
  insightCount: number;
};

export type SourceStatus = {
  source: IntelligenceSource;
  label: string;
  status: SourceConnectionStatus;
  summary: string;
};

export type ProactiveIntelligence = {
  problems: string[];
  opportunities: string[];
  trends: string[];
  risks: string[];
  contentIdeas: string[];
  growthOpportunities: string[];
};

export type ReceivedIntelligence = {
  userIntelligence: boolean;
  productIntelligence: boolean;
  contentIntelligence: boolean;
  businessIntelligence: boolean;
  revenueIntelligence: boolean;
  retentionIntelligence: boolean;
};

export type IntelligenceContribution = {
  source: IntelligenceSource;
  label: string;
  categories: UnifiedIntelligenceCategory[];
  summary: string;
  active: boolean;
};

export type CrossSystemIntelligenceHub = {
  generatedAt: string;
  period: GhlPeriod;
  sources: SourceStatus[];
  received: ReceivedIntelligence;
  contributions: IntelligenceContribution[];
  categories: IntelligenceCategoryBlock[];
  correlations: string[];
  insights: CrossSystemInsight[];
  recommendedActions: {
    action: string;
    impact: string;
    priority: number;
  }[];
  proactive: ProactiveIntelligence;
};

export type HubInput = {
  dashboard: GhlDashboardPayload;
  period: GhlPeriod;
  drafts: ContentDraft[];
  syncQueueReady: number;
  syncQueueSent: number;
  syncQueueFailed: number;
  postCraftConnected: boolean;
  totalSignalVolume: number;
  userHealth?: FounderUserHealthInputs | null;
  revenueIntelligence?: FounderRevenueIntelligence | null;
  costIntelligence?: FounderCostIntelligence | null;
};

function userSignals(dashboard: GhlDashboardPayload) {
  return dashboard.productSignals.filter(
    (s) => s.kind === "struggle" || s.kind === "question" || s.kind === "feedback",
  );
}

function productSignals(dashboard: GhlDashboardPayload) {
  return dashboard.productSignals.filter((s) => s.kind === "feature_request");
}

function topOpportunity(dashboard: GhlDashboardPayload) {
  return [...dashboard.contentOpportunities].sort(
    (a, b) => b.opportunityScore - a.opportunityScore || b.mentions - a.mentions,
  )[0];
}

function topUserSignal(dashboard: GhlDashboardPayload) {
  return [...userSignals(dashboard)].sort((a, b) => b.count - a.count)[0];
}

export function resolveSourceStatuses(input: HubInput): SourceStatus[] {
  const companionLive = input.dashboard.integration.ecosystemSignalsConfigured;
  const ghlLive = input.dashboard.integration.ghlConfigured && Boolean(input.dashboard.business);
  const postCraftPartial =
    input.postCraftConnected ||
    input.syncQueueSent > 0 ||
    input.drafts.some((d) => d.status === "published" || d.status === "scheduled");

  return [
    {
      source: "companion_app",
      label: "ADHD Companion App",
      status: companionLive ? "live" : input.totalSignalVolume > 0 ? "partial" : "waiting",
      summary: companionLive
        ? `${input.totalSignalVolume} aggregated signals synced`
        : "Waiting for companion signal sync",
    },
    {
      source: "ghl",
      label: "Go High Level",
      status: ghlLive ? "live" : ghlApiConfigured() ? "partial" : "not_configured",
      summary: ghlLive
        ? `Revenue proxy: ${input.dashboard.business!.payingSubscribers} paying · ${input.dashboard.business!.trialSubscribers} trial`
        : "Connect GHL_API_TOKEN + GHL_LOCATION_ID",
    },
    {
      source: "postcraft",
      label: "PostCraft",
      status: input.postCraftConnected
        ? "live"
        : postCraftPartial
          ? "partial"
          : "not_configured",
      summary: input.postCraftConnected
        ? `${input.syncQueueSent} sent · ${input.syncQueueReady} ready to sync`
        : `${input.drafts.length} drafts · sync API optional`,
    },
    {
      source: "google_workspace",
      label: "Google Workspace",
      status: "waiting",
      summary: "Workshop & document counts — connect server sync (coming soon)",
    },
    {
      source: "future",
      label: "Future Integrations",
      status: "not_configured",
      summary: "Reserved for additional platforms",
    },
  ];
}

export function buildIntelligenceContributions(input: HubInput): IntelligenceContribution[] {
  const { dashboard, userHealth, revenueIntelligence, costIntelligence } = input;
  const biz = dashboard.business;
  const topSignal = topUserSignal(dashboard);

  return [
    {
      source: "companion_app",
      label: "ADHD Companion",
      categories: ["user_intelligence", "product_intelligence", "content_intelligence"],
      summary: topSignal
        ? `${topSignal.label} leads user signals (${topSignal.count})`
        : "Companion signal sync",
      active: input.totalSignalVolume > 0 || Boolean(userHealth),
    },
    {
      source: "ghl",
      label: "Go High Level",
      categories: ["business_intelligence", "growth_intelligence"],
      summary: biz
        ? `${biz.payingSubscribers} paying · ${biz.newContacts} new contacts`
        : "GHL not connected",
      active: Boolean(biz),
    },
    {
      source: "postcraft",
      label: "PostCraft",
      categories: ["content_intelligence"],
      summary: `${input.syncQueueReady} ready · ${input.syncQueueSent} sent`,
      active: input.postCraftConnected || input.drafts.length > 0,
    },
    {
      source: "google_workspace",
      label: "Google Workspace",
      categories: ["content_intelligence", "product_intelligence"],
      summary: "Document & workshop workflows (sync pending)",
      active: false,
    },
    {
      source: "future",
      label: "Future Integrations",
      categories: ["growth_intelligence"],
      summary: "Stripe, PayPal, and more",
      active: Boolean(revenueIntelligence?.sourcesConnected.length),
    },
  ];
}

export function buildReceivedIntelligence(input: HubInput): ReceivedIntelligence {
  const { dashboard, userHealth, revenueIntelligence } = input;
  const biz = dashboard.business;
  const hasRetention =
    Boolean(userHealth) ||
    Boolean(biz) ||
    (revenueIntelligence?.dashboardMetrics.churnRate ?? 0) > 0;

  return {
    userIntelligence:
      input.totalSignalVolume > 0 || Boolean(userHealth?.dashboardMetrics.activeUsers),
    productIntelligence: dashboard.productSignals.some((s) => s.count > 0),
    contentIntelligence:
      dashboard.contentOpportunities.length > 0 || input.drafts.length > 0,
    businessIntelligence: Boolean(biz) || Boolean(input.costIntelligence),
    revenueIntelligence: Boolean(
      revenueIntelligence &&
        (revenueIntelligence.dashboardMetrics.mrr > 0 ||
          revenueIntelligence.dashboardMetrics.revenueThisMonth > 0),
    ),
    retentionIntelligence: hasRetention,
  };
}

export function buildCategoryBlocks(input: HubInput): IntelligenceCategoryBlock[] {
  const { dashboard, userHealth, revenueIntelligence, costIntelligence } = input;
  const biz = dashboard.business;
  const topSignal = topUserSignal(dashboard);
  const topOpp = topOpportunity(dashboard);
  const features = productSignals(dashboard);

  const businessHighlights: string[] = [];
  if (revenueIntelligence) {
    businessHighlights.push(
      `MRR ${formatUsd(revenueIntelligence.dashboardMetrics.mrr)} · Revenue ${formatUsd(revenueIntelligence.dashboardMetrics.revenueThisMonth)}`,
      `Growth ${revenueIntelligence.dashboardMetrics.revenueGrowthPercent}% · Churn ${revenueIntelligence.dashboardMetrics.churnRate}%`,
    );
  }
  if (costIntelligence) {
    businessHighlights.push(
      `Costs ${formatUsd(costIntelligence.dashboardMetrics.totalMonthlyCosts)} · Profit est. ${formatUsd(costIntelligence.dashboardMetrics.profitEstimate)}`,
    );
  }
  if (biz) {
    businessHighlights.push(
      `${biz.newContacts} new leads (${biz.period})`,
      `Pipeline: ${biz.openOpportunities} open · $${biz.pipelineValue.toLocaleString()}`,
      `Win rate ${biz.conversionRate}% · ${biz.payingSubscribers} paying subscribers`,
    );
    if (biz.lostOpportunities > biz.wonOpportunities) {
      businessHighlights.push(
        `Churn risk: ${biz.lostOpportunities} lost vs ${biz.wonOpportunities} won opportunities`,
      );
    }
  } else if (businessHighlights.length === 0) {
    businessHighlights.push("GHL not connected — business metrics unavailable");
  }

  const userHighlights: string[] = [];
  if (userHealth) {
    userHighlights.push(
      `${userHealth.dashboardMetrics.activeUsers} active users`,
      `${userHealth.dashboardMetrics.atRiskUsers + userHealth.dashboardMetrics.criticalUsers} at risk`,
      `Retention trend: ${userHealth.retentionTrend}`,
    );
  }
  if (topSignal) {
    userHighlights.push(
      `Top struggle/theme: ${topSignal.label} (${topSignal.count})`,
      `${userSignals(dashboard).length} tracked user themes`,
    );
  }
  if (userHighlights.length === 0) {
    userHighlights.push("No user signals yet — companion usage will populate counts");
  }

  const productHighlights =
    features.length > 0
      ? features.slice(0, 3).map((f) => `${f.label}: ${f.count} requests`)
      : ["No feature-request signals yet"];

  const approved = input.drafts.filter((d) => d.status === "approved").length;
  const contentHighlights = [
    topOpp
      ? `Top opportunity: ${topOpp.topic} (score ${topOpp.opportunityScore})`
      : "Content opportunities populate from live signals",
    `${input.drafts.length} drafts · ${approved} approved`,
    `${input.syncQueueReady} ready for PostCraft · ${input.syncQueueFailed} failed`,
  ];

  const growthHighlights: string[] = [];
  if (revenueIntelligence?.revenueHealth === "strong") {
    growthHighlights.push(`Revenue health: ${revenueIntelligence.revenueHealth}`);
  }
  if (revenueIntelligence && revenueIntelligence.dashboardMetrics.revenueGrowthPercent > 0) {
    growthHighlights.push(
      `Revenue up ${revenueIntelligence.dashboardMetrics.revenueGrowthPercent}% month over month`,
    );
  }
  if (biz && biz.trialSubscribers > 0) {
    growthHighlights.push(`${biz.trialSubscribers} trials — conversion opportunity`);
  }
  if (topOpp?.trend === "up") {
    growthHighlights.push(`${topOpp.topic} trend is up — timely content window`);
  }
  if (biz && biz.newContacts > 0) {
    growthHighlights.push(`${biz.newContacts} new contacts in period — nurture pipeline`);
  }
  if (userHealth && userHealth.dashboardMetrics.recoveredUsers > 0) {
    growthHighlights.push(`${userHealth.dashboardMetrics.recoveredUsers} recovered users this week`);
  }
  if (growthHighlights.length === 0) {
    growthHighlights.push("Growth signals strengthen as GHL and companion data sync");
  }

  return [
    {
      category: "business_intelligence",
      label: "Business Intelligence",
      headline: biz ? "Revenue & pipeline snapshot" : "Business data pending",
      highlights: businessHighlights,
      insightCount: 0,
    },
    {
      category: "user_intelligence",
      label: "User Intelligence",
      headline: topSignal ? `Users need help with ${topSignal.label}` : "Building user picture",
      highlights: userHighlights,
      insightCount: 0,
    },
    {
      category: "product_intelligence",
      label: "Product Intelligence",
      headline: features[0] ? `Top request: ${features[0].label}` : "Product feedback accumulating",
      highlights: productHighlights,
      insightCount: 0,
    },
    {
      category: "content_intelligence",
      label: "Content Intelligence",
      headline: topOpp ? `Create around ${topOpp.topic}` : "Content pipeline ready",
      highlights: contentHighlights,
      insightCount: 0,
    },
    {
      category: "growth_intelligence",
      label: "Growth Intelligence",
      headline: "Emerging growth levers",
      highlights: growthHighlights,
      insightCount: 0,
    },
  ];
}

export function generateCrossSystemInsights(input: HubInput): CrossSystemInsight[] {
  const insights: CrossSystemInsight[] = [];
  const { dashboard, userHealth, revenueIntelligence, costIntelligence } = input;
  const topSignal = topUserSignal(dashboard);
  const topOpp = topOpportunity(dashboard);
  const biz = dashboard.business;
  let priority = 1;

  function push(insight: Omit<CrossSystemInsight, "id" | "priority"> & { priority?: number }) {
    insights.push({
      ...insight,
      id: `insight-${priority}`,
      priority: insight.priority ?? priority,
    });
    priority += 1;
  }

  if (topSignal && topSignal.count > 0 && topOpp) {
    push({
      category: "content_intelligence",
      type: "content_idea",
      title: `${topOpp.topic} content matches top user need`,
      summary: `${topSignal.label} leads user signals (${topSignal.count}) while ${topOpp.topic} scores ${topOpp.opportunityScore}.`,
      suggestedAction: `Draft a ${topOpp.assetIdeas?.[0]?.label ?? "workshop"} on ${topOpp.topic}.`,
      expectedImpact: "Higher engagement from users who feel understood.",
      sources: ["companion_app", "postcraft"],
    });
  }

  if (input.syncQueueReady > 0) {
    push({
      category: "content_intelligence",
      type: "opportunity",
      title: "Approved content waiting to publish",
      summary: `${input.syncQueueReady} draft(s) approved and ready for PostCraft.`,
      suggestedAction: "Send or mark sent in PostCraft Sync Queue.",
      expectedImpact: "Faster time-to-publish and consistent content rhythm.",
      sources: ["postcraft", "companion_app"],
    });
  }

  if (input.syncQueueFailed > 0) {
    push({
      category: "content_intelligence",
      type: "problem",
      title: "PostCraft sync failures need attention",
      summary: `${input.syncQueueFailed} sync attempt(s) failed.`,
      suggestedAction: "Retry failed items or mark sent manually after fixing API config.",
      expectedImpact: "Restores reliable content distribution.",
      sources: ["postcraft"],
      priority: 1,
    });
  }

  if (biz && biz.trialSubscribers > biz.payingSubscribers && biz.trialSubscribers >= 3) {
    push({
      category: "growth_intelligence",
      type: "growth",
      title: "Trial base larger than paying base",
      summary: `${biz.trialSubscribers} trials vs ${biz.payingSubscribers} paying subscribers.`,
      suggestedAction: "Run a trial-to-paid nurture sequence in GHL this week.",
      expectedImpact: "Improved MRR and retention from warmed leads.",
      sources: ["ghl"],
    });
  }

  if (biz && biz.lostOpportunities > biz.wonOpportunities) {
    push({
      category: "business_intelligence",
      type: "risk",
      title: "Pipeline losses outpacing wins",
      summary: `${biz.lostOpportunities} lost vs ${biz.wonOpportunities} won opportunities.`,
      suggestedAction: "Review lost deal patterns in GHL and address top objection in content.",
      expectedImpact: "Better conversion and lower churn.",
      sources: ["ghl"],
    });
  }

  const topFeature = productSignals(dashboard)[0];
  if (topFeature && topFeature.count >= 2) {
    push({
      category: "product_intelligence",
      type: "opportunity",
      title: `Users are asking for ${topFeature.label}`,
      summary: `${topFeature.count} feature-request signals aggregated.`,
      suggestedAction: `Evaluate building or communicating roadmap for ${topFeature.label}.`,
      expectedImpact: "Reduced friction and stronger product-market fit.",
      sources: ["companion_app"],
    });
  }

  if (!dashboard.integration.ecosystemSignalsConfigured) {
    push({
      category: "user_intelligence",
      type: "problem",
      title: "Companion intelligence not fully live",
      summary: "Signal sync to dashboard is still waiting.",
      suggestedAction: "Use companion app and confirm /api/ecosystem/signals is receiving counts.",
      expectedImpact: "Richer user and content intelligence for decisions.",
      sources: ["companion_app"],
    });
  }

  if (userHealth) {
    const atRisk =
      userHealth.dashboardMetrics.atRiskUsers + userHealth.dashboardMetrics.criticalUsers;
    if (atRisk > 0) {
      push({
        category: "user_intelligence",
        type: "risk",
        title: `${atRisk} users need retention attention`,
        summary: `${userHealth.dashboardMetrics.inactive14Days} inactive 14+ days · trend ${userHealth.retentionTrend}.`,
        suggestedAction: "Re-engage at-risk users before they cancel.",
        expectedImpact: "Improved retention and fewer silent churns.",
        sources: ["companion_app", "ghl"],
        priority: 1,
      });
    }
    if (userHealth.dashboardMetrics.recoveredUsers > 0) {
      push({
        category: "growth_intelligence",
        type: "trend",
        title: "Users are re-engaging",
        summary: `${userHealth.dashboardMetrics.recoveredUsers} recovered users this week.`,
        suggestedAction: "Study what brought them back and repeat that touchpoint.",
        expectedImpact: "Stronger retention playbook.",
        sources: ["companion_app"],
      });
    }
  }

  if (revenueIntelligence) {
    const rev = revenueIntelligence.dashboardMetrics;
    if (revenueIntelligence.churnTrend === "up" || rev.churnRate >= 8) {
      push({
        category: "business_intelligence",
        type: "risk",
        title: "Churn is elevated",
        summary: `Churn rate ${rev.churnRate}% · trend ${revenueIntelligence.churnTrend}.`,
        suggestedAction: "Address top user struggle with retention content and check-ins.",
        expectedImpact: "Stabilized MRR and fewer cancellations.",
        sources: ["ghl", "companion_app"],
        priority: 1,
      });
    }
    if (revenueIntelligence.revenueHealth === "strong" || rev.revenueGrowthPercent > 5) {
      push({
        category: "growth_intelligence",
        type: "growth",
        title: "Revenue momentum is positive",
        summary: `MRR ${formatUsd(rev.mrr)} · growth ${rev.revenueGrowthPercent}%.`,
        suggestedAction: "Double down on trial conversion while momentum is high.",
        expectedImpact: "Compounding MRR growth.",
        sources: ["ghl", "future"],
      });
    }
  }

  if (costIntelligence && costIntelligence.dashboardMetrics.profitEstimate < 0) {
    push({
      category: "business_intelligence",
      type: "problem",
      title: "Costs exceed revenue this month",
      summary: `Profit estimate ${formatUsd(costIntelligence.dashboardMetrics.profitEstimate)}.`,
      suggestedAction: `Review ${costIntelligence.dashboardMetrics.biggestCostLabel} spend first.`,
      expectedImpact: "Healthier unit economics.",
      sources: ["future", "ghl"],
    });
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 10);
}

export function buildCorrelations(input: HubInput, insights: CrossSystemInsight[]): string[] {
  const lines: string[] = [];
  const topSignal = topUserSignal(input.dashboard);
  const topOpp = topOpportunity(input.dashboard);
  const biz = input.dashboard.business;

  if (topSignal && topOpp && topSignal.label.toLowerCase().includes(topOpp.topic.toLowerCase())) {
    lines.push(
      `User struggles and content opportunities align on ${topOpp.topic} — strong publish signal.`,
    );
  }

  if (biz && biz.newContacts > 5 && input.drafts.filter((d) => d.status === "approved").length === 0) {
    lines.push(
      "Lead flow is active but no approved drafts — content gap may slow nurture.",
    );
  }

  if (biz && biz.payingSubscribers > 0 && topSignal?.kind === "struggle") {
    lines.push(
      `Paying users (${biz.payingSubscribers}) still signal ${topSignal.label} — retention content opportunity.`,
    );
  }

  for (const i of insights.slice(0, 2)) {
    lines.push(`${i.title}: ${i.suggestedAction}`);
  }

  return lines.slice(0, 5);
}

export function buildProactiveIntelligence(insights: CrossSystemInsight[]): ProactiveIntelligence {
  const byType = (t: InsightType) =>
    insights.filter((i) => i.type === t).map((i) => i.summary);

  return {
    problems: byType("problem"),
    opportunities: byType("opportunity").concat(byType("growth")),
    trends: insights
      .filter((i) => i.summary.includes("trend") || i.type === "trend")
      .map((i) => i.summary),
    risks: byType("risk"),
    contentIdeas: byType("content_idea").concat(
      insights
        .filter((i) => i.category === "content_intelligence" && i.type === "opportunity")
        .map((i) => i.title),
    ),
    growthOpportunities: insights
      .filter((i) => i.category === "growth_intelligence")
      .map((i) => i.title),
  };
}

export function answerFounderHubQuestion(
  question: string,
  hub: CrossSystemIntelligenceHub,
): { answer: string; relatedInsights: CrossSystemInsight[] } {
  const q = question.toLowerCase();
  const pick = (types: InsightType[]) =>
    hub.insights.filter((i) => types.includes(i.type)).slice(0, 2);

  if (q.includes("work on") || (q.includes("focus") && q.includes("next"))) {
    const top = hub.recommendedActions[0];
    return {
      answer: top
        ? top.action
        : "Review the highest-priority insight in the hub and execute one action today.",
      relatedInsights: hub.insights.slice(0, 2),
    };
  }
  if (q.includes("improve")) {
    const problems = hub.insights.filter(
      (i) => i.type === "problem" || i.type === "risk",
    );
    return {
      answer:
        problems[0]?.suggestedAction ??
        "Improve the top user struggle theme with clearer onboarding and content.",
      relatedInsights: problems.slice(0, 2),
    };
  }
  if (q.includes("build")) {
    const product = hub.insights.filter((i) => i.category === "product_intelligence");
    return {
      answer: product[0]?.suggestedAction ?? "Watch feature-request signals for the next build bet.",
      relatedInsights: product,
    };
  }
  if (q.includes("create") || q.includes("content")) {
    const content = hub.insights.filter((i) => i.category === "content_intelligence");
    return {
      answer: content[0]?.suggestedAction ?? "Pick the top Live Content Opportunity and generate a draft.",
      relatedInsights: content,
    };
  }
  if (q.includes("hurting") && q.includes("growth")) {
    const blockers = hub.insights.filter(
      (i) =>
        i.type === "risk" ||
        i.type === "problem" ||
        (i.category === "growth_intelligence" && i.type !== "growth"),
    );
    return {
      answer:
        blockers[0]?.summary ??
        hub.proactive.risks[0] ??
        "No major growth blockers flagged yet.",
      relatedInsights: blockers.slice(0, 2),
    };
  }
  if (q.includes("helping") && q.includes("retention")) {
    const positive = hub.insights.filter(
      (i) =>
        i.type === "trend" ||
        i.type === "growth" ||
        i.title.toLowerCase().includes("re-engag") ||
        i.title.toLowerCase().includes("recovered"),
    );
    const recovered = hub.categories
      .find((c) => c.category === "growth_intelligence")
      ?.highlights.find((h) => h.includes("recovered"));
    return {
      answer:
        positive[0]?.summary ??
        recovered ??
        "Retention improves when content matches top user struggles.",
      relatedInsights: positive.slice(0, 2),
    };
  }
  if (q.includes("growth") || q.includes("driving")) {
    const growth = hub.insights.filter((i) => i.category === "growth_intelligence");
    return {
      answer: growth[0]?.summary ?? hub.categories.find((c) => c.category === "growth_intelligence")?.headline ?? "",
      relatedInsights: growth,
    };
  }
  if (q.includes("retention") || q.includes("hurting")) {
    const risks = hub.insights.filter((i) => i.type === "risk" || i.type === "problem");
    return {
      answer: risks[0]?.summary ?? "No major retention risks flagged in aggregated data yet.",
      relatedInsights: risks,
    };
  }
  if (q.includes("opportunit")) {
    const opps = hub.insights.filter((i) => i.type === "opportunity" || i.type === "content_idea");
    return {
      answer: opps[0]?.title ?? "Emerging opportunities appear as companion and GHL data sync.",
      relatedInsights: opps,
    };
  }

  const top = hub.insights[0];
  return {
    answer: top
      ? `${top.summary} → ${top.suggestedAction}`
      : "Intelligence hub is building — keep syncing companion and GHL data.",
    relatedInsights: hub.insights.slice(0, 2),
  };
}

export function buildCrossSystemIntelligenceHub(input: HubInput): CrossSystemIntelligenceHub {
  const insights = generateCrossSystemInsights(input);
  const categories = buildCategoryBlocks(input).map((block) => ({
    ...block,
    insightCount: insights.filter((i) => i.category === block.category).length,
  }));

  const recommendedActions = insights.slice(0, 3).map((i) => ({
    action: i.suggestedAction,
    impact: i.expectedImpact,
    priority: i.priority,
  }));

  return {
    generatedAt: new Date().toISOString(),
    period: input.period,
    sources: resolveSourceStatuses(input),
    received: buildReceivedIntelligence(input),
    contributions: buildIntelligenceContributions(input),
    categories,
    correlations: buildCorrelations(input, insights),
    insights,
    recommendedActions,
    proactive: buildProactiveIntelligence(insights),
  };
}

export function formatHubForAdvisor(hub: CrossSystemIntelligenceHub): string {
  const lines = [
    `TOP ACTION: ${hub.recommendedActions[0]?.action ?? "Review proactive insights"}`,
    `PROACTIVE: ${hub.proactive.problems.length} problems · ${hub.proactive.opportunities.length} opportunities · ${hub.proactive.risks.length} risks`,
    ...hub.insights.slice(0, 4).map((i) => `[${i.type}] ${i.title}: ${i.summary}`),
  ];
  return lines.join("\n");
}

export async function loadCrossSystemIntelligenceHub(
  period: GhlPeriod = "30d",
): Promise<CrossSystemIntelligenceHub> {
  const [dashboard, drafts, syncQueue, counts, userHealth] = await Promise.all([
    buildBusinessEcosystemDashboard({ period }),
    loadContentDrafts(),
    getPostCraftSyncQueue(),
    loadEcosystemSignalCounts(),
    loadUserHealthIntelligence(),
  ]);

  const revenueIntelligence = await loadRevenueIntelligence(dashboard.business);

  const totalUsers =
    (revenueIntelligence.ghlSignals?.payingSubscribers ?? 0) +
    (revenueIntelligence.ghlSignals?.trialSubscribers ?? 0) ||
    Object.values(userHealth.healthDistribution).reduce((a, b) => a + b, 0);

  const costIntelligence = await loadCostIntelligence({
    monthlyRevenue: revenueIntelligence.dashboardMetrics.revenueThisMonth,
    totalUsers: Math.max(totalUsers, 1),
    activeUsers: Math.max(userHealth.dashboardMetrics.activeUsers, 1),
  });

  const totalSignalVolume = counts.reduce((sum, c) => sum + c.count, 0);

  return buildCrossSystemIntelligenceHub({
    dashboard,
    period,
    drafts,
    syncQueueReady: syncQueue.items.filter((i) => i.status === "ready").length,
    syncQueueSent: syncQueue.items.filter((i) => i.status === "sent").length,
    syncQueueFailed: syncQueue.items.filter((i) => i.status === "failed").length,
    postCraftConnected: syncQueue.connected,
    totalSignalVolume,
    userHealth,
    revenueIntelligence,
    costIntelligence,
  });
}
