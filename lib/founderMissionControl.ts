/**
 * Founder Mission Control — single-screen executive summary for the ecosystem.
 *
 * Answers in under 60 seconds:
 * What needs attention? What is getting worse? What should I fix first?
 */

import { getBehaviorEvents } from "./closedLoopLearning";
import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import {
  getMistakeRecords,
  getRecoveryOutcomes,
} from "./companionMistakeRecovery";
import {
  buildFounderAlerts,
  rankAlertsBySeverity,
  type FounderAlert,
  type FounderAlertsSummary,
} from "./founderAlerts";
import {
  generateFounderFixPrompt,
  type FounderPriorityItem,
} from "./founderCopilot";
import {
  buildPlanCompletionAnalytics,
  type PlanCompletionAnalytics,
} from "./planMyDay/planTaskCompletion";
import {
  buildStrategyFounderAnalytics,
  type StrategyFounderAnalytics,
} from "./strategyIntelligence";
import {
  buildSituationAtlasAnalytics,
  getFounderReviewQueue,
  type FounderReviewQueue,
  type SituationAtlasAnalytics,
} from "./adhdEntrepreneurSituationAtlas";
import {
  buildRecentlyImprovedSummary,
  generateWhatsNewSummary,
  evaluateFounderIssueCommunication,
  type CommunicationDecision,
  type RecentlyImprovedSummary,
  type WhatsNewSummary,
} from "./trustSafeCommunication";
import {
  buildFounderIntelligenceDashboard,
  type FounderIntelligenceDashboard,
  type HealthTrend,
} from "./founderIntelligence";

export type CompanionHealthCard = {
  label: string;
  score: number;
  trend: HealthTrend;
  riskLevel: "low" | "medium" | "high";
};

export type CapabilityHealthEntry = {
  id: string;
  label: string;
  acceptanceRate: number;
  completionRate: number;
  returnRate: number;
  abandonmentRate: number;
  trustImpact: number;
  confidenceImpact: number;
  performance: "top" | "average" | "weak";
};

export type FrictionHeatmapEntry = {
  source: string;
  count: number;
  intensity: number;
  examples: string[];
};

export type MisfireCenterSummary = {
  misunderstandings: number;
  userCorrections: number;
  behavioralSignals: number;
  trustSignals: number;
  recoverySuccessRate: number;
  conversationContinuedRate: number;
  topMisfiringCapabilities: { id: string; label: string; misfireCount: number }[];
  recentCorrections: string[];
};

export type FounderDailyBrief = {
  greeting: string;
  companionHealthScore: number;
  trustStatus: string;
  confidenceStatus: string;
  retentionRisk: string;
  priorities: {
    rank: number;
    headline: string;
    likelyCause: string;
    recommendedAction: string;
    confidencePercent: number;
  }[];
  wins: string[];
  generatedAt: string;
};

export type FounderWeeklyBrief = {
  headline: string;
  biggestWins: string[];
  biggestProblems: string[];
  newTrends: string[];
  retentionRisks: string[];
  topInterventions: string[];
  worstInterventions: string[];
  roadmapPriorities: string[];
  generatedAt: string;
};

export type FounderMissionControl = {
  evaluatedAt: string;
  ecosystemHealth: number;
  companionHealth: CompanionHealthCard[];
  userHealthScore: number;
  capabilityHealth: CapabilityHealthEntry[];
  retentionHealth: number;
  emergingRisks: FounderAlert[];
  topRecommendations: FounderPriorityItem[];
  topPriorities: FounderPriorityItem[];
  frictionHeatmap: FrictionHeatmapEntry[];
  misfireCenter: MisfireCenterSummary;
  alerts: FounderAlertsSummary;
  dailyBrief: FounderDailyBrief;
  weeklyBrief: FounderWeeklyBrief;
  canWait: string[];
  whatsNew: WhatsNewSummary;
  recentlyImproved: RecentlyImprovedSummary;
  priorityCommunication: {
    priority: FounderPriorityItem;
    communication: CommunicationDecision;
  }[];
  situationAtlas: SituationAtlasAnalytics;
  situationReviewQueue: FounderReviewQueue;
  strategyIntelligence: StrategyFounderAnalytics;
  planCompletion: PlanCompletionAnalytics;
};

const DAY_MS = 86_400_000;

function riskFromScore(score: number, trend: HealthTrend): "low" | "medium" | "high" {
  if (score < 45 || trend === "declining") return "high";
  if (score < 65 || trend === "unknown") return "medium";
  return "low";
}

function trendLabel(trend: HealthTrend): string {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Declining";
  if (trend === "stable") return "Stable";
  return "Unknown";
}

export function buildCompanionHealthCards(
  dashboard: FounderIntelligenceDashboard,
): CompanionHealthCard[] {
  return [
    {
      label: "Companion Health",
      score: dashboard.ecosystemHealthScore,
      trend: dashboard.trustHealth.trend,
      riskLevel: riskFromScore(dashboard.ecosystemHealthScore, dashboard.trustHealth.trend),
    },
    {
      label: "Trust",
      score: dashboard.trustScore,
      trend: dashboard.trustHealth.trend,
      riskLevel: riskFromScore(dashboard.trustScore, dashboard.trustHealth.trend),
    },
    {
      label: "Confidence",
      score: dashboard.confidenceScore,
      trend: dashboard.confidenceHealth.trend,
      riskLevel: riskFromScore(dashboard.confidenceScore, dashboard.confidenceHealth.trend),
    },
    {
      label: "Retention",
      score: dashboard.retentionScore,
      trend: dashboard.retentionHealth.trend,
      riskLevel: riskFromScore(dashboard.retentionScore, dashboard.retentionHealth.trend),
    },
    {
      label: "Accuracy",
      score: dashboard.companionAccuracyScore,
      trend: dashboard.companionAccuracy.trend,
      riskLevel: riskFromScore(
        dashboard.companionAccuracyScore,
        dashboard.companionAccuracy.trend,
      ),
    },
    {
      label: "Momentum",
      score: dashboard.momentumScore,
      trend: dashboard.momentumHealth.trend,
      riskLevel: riskFromScore(dashboard.momentumScore, dashboard.momentumHealth.trend),
    },
  ];
}

export function buildCapabilityHealth(): CapabilityHealthEntry[] {
  const entries = getUserInterventionEffectiveness();
  const withRates = entries.map((e) => {
    const abandonmentRate = e.counts.accepted
      ? Math.round(
          ((e.counts.accepted - e.counts.completed) / Math.max(e.counts.accepted, 1)) * 100,
        )
      : 0;
    const returnRate = e.rates.returnRate;
    return {
      id: String(e.id),
      label: e.label,
      acceptanceRate: e.rates.acceptanceRate,
      completionRate: e.rates.completionRate,
      returnRate,
      abandonmentRate,
      trustImpact: Math.round((1 - e.rates.adaptiveWeight) * 100),
      confidenceImpact: e.rates.confidenceImpact,
      performance: "average" as const,
    };
  });

  const sorted = [...withRates].sort((a, b) => b.completionRate - a.completionRate);
  return sorted.map((entry, i) => ({
    ...entry,
    performance:
      i < 2 && entry.completionRate >= 40
        ? "top"
        : entry.completionRate < 25 || entry.abandonmentRate > 60
          ? "weak"
          : "average",
  }));
}

const FRICTION_RULES: { source: string; re: RegExp }[] = [
  { source: "Overwhelm", re: /\b(overwhelm|too much|can't keep up|drowning)\b/i },
  { source: "Visibility fear", re: /\b(visible|watching me|post|video|seen|exposed)\b/i },
  { source: "Sales avoidance", re: /\b(sales|sell|follow.?up|prospect|pitch)\b/i },
  { source: "Pricing anxiety", re: /\b(price|charge|rate|money|revenue|invoice)\b/i },
  { source: "Launch resistance", re: /\b(launch|ship|go live|nobody buys|almost ready)\b/i },
  { source: "Delegation resistance", re: /\b(delegat|va\b|explain|do it myself|hand off)\b/i },
];

export function buildUserFrictionHeatmap(): FrictionHeatmapEntry[] {
  const mistakes = getMistakeRecords().filter(
    (m) => Date.now() - new Date(m.recordedAt).getTime() < 14 * DAY_MS,
  );
  const events = getBehaviorEvents().filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 14 * DAY_MS,
  );
  const snippets: string[] = [
    ...mistakes.map((m) => m.userTextSnippet),
    ...events
      .filter((e) => e.eventType === "offer_dismissed" || e.eventType === "workspace_abandoned")
      .map((e) => String(e.metadata?.userText ?? e.capability ?? "")),
  ].filter((s) => s.length > 0);

  const maxCount = Math.max(1, ...FRICTION_RULES.map(() => 0));
  const entries: FrictionHeatmapEntry[] = [];

  for (const { source, re } of FRICTION_RULES) {
    const matches = snippets.filter((s) => re.test(s));
    if (matches.length === 0) continue;
    entries.push({
      source,
      count: matches.length,
      intensity: Math.min(100, Math.round((matches.length / Math.max(snippets.length, 1)) * 100)),
      examples: matches.slice(0, 2),
    });
  }

  entries.sort((a, b) => b.count - a.count);
  const peak = entries[0]?.count ?? maxCount;
  return entries.map((e) => ({
    ...e,
    intensity: Math.min(100, Math.round((e.count / Math.max(peak, 1)) * 100)),
  }));
}

export function buildMisfireCenter(
  dashboard: FounderIntelligenceDashboard,
): MisfireCenterSummary {
  const profile = dashboard.misfireProfile;
  const outcomes = getRecoveryOutcomes().filter(
    (o) => Date.now() - new Date(o.recordedAt).getTime() < 14 * DAY_MS,
  );
  const continued = outcomes.filter((o) => o.conversationContinued).length;
  const improved = outcomes.filter((o) => o.outcomeAchieved).length;
  const recoverySuccessRate = outcomes.length
    ? Math.round((improved / outcomes.length) * 100)
    : dashboard.trustHealth.repairSuccessRate;
  const conversationContinuedRate = outcomes.length
    ? Math.round((continued / outcomes.length) * 100)
    : dashboard.trustHealth.conversationRecoveryRate;

  return {
    misunderstandings: profile.explicitSignals + profile.behavioralSignals,
    userCorrections: profile.explicitSignals,
    behavioralSignals: profile.behavioralSignals,
    trustSignals: profile.trustSignals,
    recoverySuccessRate,
    conversationContinuedRate,
    topMisfiringCapabilities: profile.topMisfiringCapabilities,
    recentCorrections: profile.recentExplicitPhrases,
  };
}

export function generateFounderDailyBrief(opts?: {
  founderName?: string;
  dashboard?: FounderIntelligenceDashboard;
  alerts?: FounderAlertsSummary;
}): FounderDailyBrief {
  const dashboard = opts?.dashboard ?? buildFounderIntelligenceDashboard();
  const alerts = opts?.alerts ?? buildFounderAlerts(dashboard.earlyWarnings);
  const name = opts?.founderName ?? "Shari";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? `Good morning ${name}.` : hour < 17 ? `Good afternoon ${name}.` : `Good evening ${name}.`;

  const priorities = dashboard.founderPriorities.slice(0, 3).map((item, i) => ({
    rank: i + 1,
    headline: item.copilot.problem,
    likelyCause: item.copilot.likelyCause,
    recommendedAction: item.copilot.recommendation,
    confidencePercent: item.copilot.confidencePercent,
  }));

  const wins: string[] = [];
  if (dashboard.topSuccessfulCapabilities[0]) {
    wins.push(
      `${dashboard.topSuccessfulCapabilities[0].label} generated strong completion (${dashboard.topSuccessfulCapabilities[0].completionRate}%).`,
    );
  }
  if (dashboard.confidenceHealth.trend === "improving") {
    wins.push("Confidence metrics are improving.");
  }
  if (dashboard.trustHealth.repairSuccessRate >= 60) {
    wins.push(`Trust repair success at ${dashboard.trustHealth.repairSuccessRate}%.`);
  }
  if (wins.length === 0) {
    wins.push("Companion health stable — no urgent fires today.");
  }

  const retentionRisk =
    dashboard.retentionRisks.churnPredictors.length > 0
      ? dashboard.retentionRisks.churnPredictors[0] ?? "Elevated"
      : "Low";

  return {
    greeting,
    companionHealthScore: dashboard.ecosystemHealthScore,
    trustStatus: trendLabel(dashboard.trustHealth.trend),
    confidenceStatus: trendLabel(dashboard.confidenceHealth.trend),
    retentionRisk,
    priorities,
    wins,
    generatedAt: new Date().toISOString(),
  };
}

export function generateFounderWeeklyBrief(
  dashboard = buildFounderIntelligenceDashboard(),
): FounderWeeklyBrief {
  const alerts = buildFounderAlerts(dashboard.earlyWarnings);
  const ranked = rankAlertsBySeverity([
    ...alerts.critical,
    ...alerts.high,
    ...alerts.medium,
  ]);

  const capability = buildCapabilityHealth();
  const topCaps = capability.filter((c) => c.performance === "top").slice(0, 3);
  const weakCaps = capability.filter((c) => c.performance === "weak").slice(0, 3);

  return {
    headline: `Companion Health ${dashboard.ecosystemHealthScore}/100 — ${ranked.length} issue(s) need review`,
    biggestWins: [
      ...topCaps.map((c) => `${c.label}: ${c.completionRate}% completion`),
      ...(dashboard.confidenceHealth.winsLast7Days >= 2
        ? [`${dashboard.confidenceHealth.winsLast7Days} confidence wins this week`]
        : []),
    ].slice(0, 4),
    biggestProblems: ranked.slice(0, 4).map((a) => a.issue),
    newTrends: dashboard.topEmergingIssues.slice(0, 3).map((w) => w.title),
    retentionRisks: dashboard.retentionRisks.churnPredictors.slice(0, 3),
    topInterventions: topCaps.map((c) => c.label),
    worstInterventions: weakCaps.map((c) => `${c.label} (${c.abandonmentRate}% abandon)`),
    roadmapPriorities: dashboard.founderPriorities.slice(0, 5).map((p) => p.copilot.recommendation),
    generatedAt: new Date().toISOString(),
  };
}

export function buildFounderMissionControl(): FounderMissionControl {
  const dashboard = buildFounderIntelligenceDashboard();
  const alerts = buildFounderAlerts(dashboard.earlyWarnings);
  const emergingRisks = rankAlertsBySeverity([
    ...alerts.critical,
    ...alerts.high,
    ...dashboard.topEmergingIssues.map((w) => {
      const item = dashboard.founderPriorities.find((p) => p.warning.id === w.id);
      if (!item) return null;
      return {
        id: `alert-${w.id}`,
        level: "medium" as const,
        issue: w.title,
        severity: "medium" as const,
        impact: w.summary,
        trend: w.deltaPercent && w.deltaPercent > 0 ? ("worsening" as const) : ("stable" as const),
        confidencePercent: 70,
        recommendation: item.copilot.recommendation,
        filesToReview: item.copilot.filesToReview,
        cursorPromptAvailable: true,
        warningId: w.id,
        detectedAt: w.detectedAt,
        batched: false,
      };
    }),
  ].filter(Boolean) as FounderAlert[]);

  const dailyBrief = generateFounderDailyBrief({ dashboard, alerts });
  const weeklyBrief = generateFounderWeeklyBrief(dashboard);
  const lowPriority = alerts.low.map((a) => a.issue);
  const priorityCommunication = dashboard.founderPriorities.slice(0, 5).map((priority) => ({
    priority,
    communication: evaluateFounderIssueCommunication(priority.warning),
  }));

  return {
    evaluatedAt: new Date().toISOString(),
    ecosystemHealth: dashboard.ecosystemHealthScore,
    companionHealth: buildCompanionHealthCards(dashboard),
    userHealthScore: dashboard.retentionScore,
    capabilityHealth: buildCapabilityHealth(),
    retentionHealth: dashboard.retentionScore,
    emergingRisks: emergingRisks.slice(0, 8),
    topRecommendations: dashboard.founderPriorities.slice(0, 5),
    topPriorities: dashboard.founderPriorities.slice(0, 5),
    frictionHeatmap: buildUserFrictionHeatmap(),
    misfireCenter: buildMisfireCenter(dashboard),
    alerts,
    dailyBrief,
    weeklyBrief,
    canWait: lowPriority.slice(0, 5),
    whatsNew: generateWhatsNewSummary(),
    recentlyImproved: buildRecentlyImprovedSummary(),
    priorityCommunication,
    situationAtlas: buildSituationAtlasAnalytics(),
    situationReviewQueue: getFounderReviewQueue(),
    strategyIntelligence: buildStrategyFounderAnalytics(),
    planCompletion: buildPlanCompletionAnalytics(),
  };
}

export function getCursorPromptForPriority(item: FounderPriorityItem): string {
  return generateFounderFixPrompt(item).markdown;
}
