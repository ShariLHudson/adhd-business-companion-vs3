/**
 * Founder Intelligence™ — Companion Health Dashboard™
 *
 * Aggregates companion learning signals into founder-actionable health views.
 * Founder-only — never user-facing.
 */

import { getBehaviorEvents } from "./closedLoopLearning";
import { countConfidenceWinsSince } from "./companionConfidenceEngine";
import { getUserOutcomeProfile } from "./companionEffectiveness";
import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import {
  buildTrustRepairProfile,
  computeRecoveryEffectivenessScore,
  getMistakeRecords,
  getMistakeRecoveryDashboardSlice,
  getRecoveryOutcomes,
} from "./companionMistakeRecovery";
import { ecosystemEventTracker } from "./ecosystem/eventTrackingEngine";
import {
  buildEarlyWarnings,
  getCompanionMisfireProfile,
  type FounderWarning,
} from "./founderEarlyWarning";
import { prioritizeFounderIssues, type FounderPriorityItem } from "./founderCopilot";

export type HealthTrend = "improving" | "stable" | "declining" | "unknown";

export type TrustHealthMetrics = {
  score: number;
  trend: HealthTrend;
  trustGains: number;
  trustLosses: number;
  trustRepairs: number;
  repairSuccessRate: number;
  conversationRecoveryRate: number;
  isImproving: boolean;
  isDeclining: boolean;
};

export type CompanionAccuracyMetrics = {
  score: number;
  trend: HealthTrend;
  misunderstandings: number;
  explicitCorrections: number;
  softCorrections: number;
  behavioralCorrections: number;
  clarificationLoops: number;
  routingReversals: number;
  topMisunderstandingTypes: { type: string; count: number }[];
};

export type ConfidenceHealthMetrics = {
  score: number;
  trend: HealthTrend;
  confidenceImprovements: number;
  confidenceCrashes: number;
  recoverySuccessRate: number;
  winsLast7Days: number;
  usersLeavingMoreConfident: boolean;
};

export type MomentumHealthMetrics = {
  score: number;
  trend: HealthTrend;
  completions: number;
  abandonments: number;
  returns: number;
  completionTrend: number;
  stalledSignals: number;
};

export type RetentionHealthMetrics = {
  score: number;
  trend: HealthTrend;
  returnBehavior: number;
  sessionFrequency: number;
  abandonedWorkflows: number;
  reEngagementSuccess: number;
  onboardingSignals: number;
};

export type RetentionRiskProfile = {
  usersAtRisk: number;
  onboardingFriction: number;
  confidenceDeclines: number;
  repeatedAbandonment: number;
  disappearingAfterAgreement: number;
  churnPredictors: string[];
  retentionPredictors: string[];
};

export type SelfImprovementCategory =
  | "recommendation_weighting"
  | "intervention_ranking"
  | "confidence_thresholds"
  | "alert_thresholds"
  | "billing"
  | "onboarding"
  | "pricing"
  | "trust_systems"
  | "routing_logic"
  | "system_prompts";

export type SelfImprovementReadiness = {
  safeForAutoOptimization: SelfImprovementCategory[];
  founderApprovalRequired: SelfImprovementCategory[];
};

export type InterventionTrend = {
  id: string;
  label: string;
  acceptanceRate: number;
  completionRate: number;
  adaptiveWeight: number;
  direction: HealthTrend;
};

export type FounderIntelligenceDashboard = {
  evaluatedAt: string;
  ecosystemHealthScore: number;
  trustScore: number;
  retentionScore: number;
  confidenceScore: number;
  companionAccuracyScore: number;
  momentumScore: number;
  trustHealth: TrustHealthMetrics;
  companionAccuracy: CompanionAccuracyMetrics;
  confidenceHealth: ConfidenceHealthMetrics;
  momentumHealth: MomentumHealthMetrics;
  retentionHealth: RetentionHealthMetrics;
  topEmergingIssues: FounderWarning[];
  topFailingCapabilities: { id: string; label: string; dismissRate: number }[];
  topSuccessfulCapabilities: { id: string; label: string; completionRate: number }[];
  interventionTrends: InterventionTrend[];
  retentionRisks: RetentionRiskProfile;
  founderPriorities: FounderPriorityItem[];
  misfireProfile: ReturnType<typeof getCompanionMisfireProfile>;
  selfImprovementReadiness: SelfImprovementReadiness;
  earlyWarnings: FounderWarning[];
};

const DAY_MS = 86_400_000;

function eventsInWindow<T extends { timestamp?: string; recordedAt?: string }>(
  items: T[],
  days: number,
  now = Date.now(),
): T[] {
  const cutoff = now - days * DAY_MS;
  return items.filter((e) => {
    const t = e.timestamp ?? e.recordedAt;
    return t ? new Date(t).getTime() >= cutoff : false;
  });
}

function trendFromDelta(delta: number): HealthTrend {
  if (delta > 0.08) return "improving";
  if (delta < -0.08) return "declining";
  return "stable";
}

function clampScore(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function buildTrustHealth(): TrustHealthMetrics {
  const trust = buildTrustRepairProfile();
  const recovery = getRecoveryOutcomes();
  const recentRecovery = eventsInWindow(recovery, 14);
  const continued = recentRecovery.filter((r) => r.conversationContinued).length;
  const conversationRecoveryRate = recentRecovery.length
    ? Math.round((continued / recentRecovery.length) * 100)
    : 0;
  const repairTotal = trust.recentRepairsSuccessful + trust.recentRepairsFailed;
  const repairSuccessRate = repairTotal
    ? Math.round((trust.recentRepairsSuccessful / repairTotal) * 100)
    : 0;

  const netTrust = trust.trustGains - trust.trustLosses;
  const score = clampScore(
    trust.relationshipResilience * 0.5 +
      repairSuccessRate * 0.25 +
      conversationRecoveryRate * 0.25 +
      netTrust * 2,
  );

  return {
    score,
    trend: netTrust >= 0 ? "improving" : trust.trustLosses > trust.trustGains ? "declining" : "stable",
    trustGains: trust.trustGains,
    trustLosses: trust.trustLosses,
    trustRepairs: trust.trustRepairs,
    repairSuccessRate,
    conversationRecoveryRate,
    isImproving: netTrust > 0 && repairSuccessRate >= 50,
    isDeclining: trust.trustLosses > trust.trustGains + 2,
  };
}

export function buildCompanionAccuracyHealth(): CompanionAccuracyMetrics {
  const mistakes = getMistakeRecords();
  const recent = eventsInWindow(mistakes, 14);
  const prior = mistakes.filter((m) => {
    const t = new Date(m.recordedAt).getTime();
    const now = Date.now();
    return t < now - 14 * DAY_MS && t >= now - 28 * DAY_MS;
  });

  const explicit = recent.filter((m) => m.signalKind === "explicit_correction").length;
  const soft = recent.filter((m) => m.signalKind === "soft_correction").length;
  const behavioral = recent.filter((m) => m.signalKind === "behavioral_correction").length;
  const frustration = recent.filter(
    (m) => m.signalKind === "frustration" || m.signalKind === "trust_damage",
  ).length;

  const behaviorEvents = getBehaviorEvents();
  const recentBehavior = eventsInWindow(behaviorEvents, 14);
  const offers = recentBehavior.filter((e) => e.eventType === "offer_shown").length;
  const dismissed = recentBehavior.filter((e) => e.eventType === "offer_dismissed").length;
  const routingReversals = recentBehavior.filter(
    (e) => e.eventType === "workspace_abandoned" || e.eventType === "offer_dismissed",
  ).length;

  const misunderstandingRate = offers ? recent.length / offers : recent.length * 0.1;
  const score = clampScore(100 - misunderstandingRate * 35 - frustration * 4);

  const slice = getMistakeRecoveryDashboardSlice();

  return {
    score,
    trend: trendFromDelta(prior.length ? (prior.length - recent.length) / prior.length : 0),
    misunderstandings: recent.length,
    explicitCorrections: explicit,
    softCorrections: soft,
    behavioralCorrections: behavioral,
    clarificationLoops: soft + explicit,
    routingReversals,
    topMisunderstandingTypes: slice.topMisunderstandingTypes.map((t) => ({
      type: t.type,
      count: t.count,
    })),
  };
}

export function buildConfidenceHealth(): ConfidenceHealthMetrics {
  const outcomes = getUserOutcomeProfile().outcomes;
  const recentOutcomes = eventsInWindow(outcomes, 14);
  const improvements = recentOutcomes.filter((o) => o.category === "confidence").length;
  const crashes = getMistakeRecords().filter(
    (m) =>
      m.misunderstanding === "wrong_confidence" ||
      m.signalKind === "trust_damage",
  ).length;
  const winsLast7Days = countConfidenceWinsSince(7);
  const recoverySuccessRate = computeRecoveryEffectivenessScore();
  const score = clampScore(
    40 + winsLast7Days * 8 + improvements * 5 + recoverySuccessRate * 0.3 - crashes * 6,
  );

  return {
    score,
    trend: winsLast7Days >= 2 ? "improving" : crashes > improvements ? "declining" : "stable",
    confidenceImprovements: improvements,
    confidenceCrashes: crashes,
    recoverySuccessRate,
    winsLast7Days,
    usersLeavingMoreConfident: winsLast7Days >= 1 && crashes <= improvements,
  };
}

export function buildMomentumHealth(): MomentumHealthMetrics {
  const events = eventsInWindow(getBehaviorEvents(), 14);
  const completions = events.filter((e) => e.eventType === "workspace_completed").length;
  const abandonments = events.filter((e) => e.eventType === "workspace_abandoned").length;
  const returns = events.filter((e) => e.eventType === "workspace_returned").length;
  const total = completions + abandonments || 1;
  const completionTrend = Math.round((completions / total) * 100);
  const score = clampScore(completionTrend * 0.6 + returns * 5 + completions * 3);

  const interventions = getUserInterventionEffectiveness();
  const stalledSignals = interventions.filter(
    (e) => e.counts.opened >= 3 && e.counts.completed === 0,
  ).length;

  return {
    score,
    trend: completionTrend >= 55 ? "improving" : completionTrend < 35 ? "declining" : "stable",
    completions,
    abandonments,
    returns,
    completionTrend,
    stalledSignals,
  };
}

export function buildRetentionHealth(): RetentionHealthMetrics {
  const eco = ecosystemEventTracker.query({ limit: 500 });
  const recent = eco.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 14 * DAY_MS,
  );
  const activeSessions = recent.filter((e) => e.eventType === "user.active").length;
  const cancelled = recent.filter((e) => e.eventType === "user.cancelled").length;
  const events = eventsInWindow(getBehaviorEvents(), 14);
  const returns = events.filter((e) => e.eventType === "workspace_returned").length;
  const abandoned = events.filter((e) => e.eventType === "workspace_abandoned").length;
  const reEngagementSuccess = returns;
  const score = clampScore(
    50 + activeSessions * 3 + returns * 4 - cancelled * 10 - abandoned * 3,
  );

  return {
    score,
    trend: cancelled > activeSessions ? "declining" : returns > abandoned ? "improving" : "stable",
    returnBehavior: returns,
    sessionFrequency: activeSessions,
    abandonedWorkflows: abandoned,
    reEngagementSuccess,
    onboardingSignals: recent.filter((e) => e.eventType === "user.registered").length,
  };
}

export function buildRetentionRiskProfile(): RetentionRiskProfile {
  const mistakes = eventsInWindow(getMistakeRecords(), 14);
  const events = eventsInWindow(getBehaviorEvents(), 14);
  const repeatedAbandonment = events.filter((e) => e.eventType === "workspace_abandoned").length;
  const dismissed = events.filter((e) => e.eventType === "offer_dismissed").length;
  const confidenceDeclines = mistakes.filter(
    (m) => m.misunderstanding === "wrong_confidence" || m.signalKind === "frustration",
  ).length;
  const disappearingAfterAgreement = events.filter(
    (e) =>
      e.eventType === "workspace_abandoned" &&
      e.metadata?.afterAccept === true,
  ).length;

  const churnPredictors: string[] = [];
  const retentionPredictors: string[] = [];

  if (repeatedAbandonment >= 3) churnPredictors.push("repeated workspace abandonment");
  if (dismissed >= 5) churnPredictors.push("high offer dismissal rate");
  if (confidenceDeclines >= 2) churnPredictors.push("confidence damage signals");
  if (events.filter((e) => e.eventType === "workspace_returned").length >= 2) {
    retentionPredictors.push("users return to workspaces");
  }
  if (countConfidenceWinsSince(14) >= 2) {
    retentionPredictors.push("confidence wins in last 14 days");
  }
  if (computeRecoveryEffectivenessScore() >= 60) {
    retentionPredictors.push("successful mistake recovery");
  }

  return {
    usersAtRisk: Math.max(confidenceDeclines, Math.floor(repeatedAbandonment / 2)),
    onboardingFriction: dismissed >= 3 ? dismissed : 0,
    confidenceDeclines,
    repeatedAbandonment,
    disappearingAfterAgreement,
    churnPredictors,
    retentionPredictors,
  };
}

export function buildSelfImprovementReadiness(): SelfImprovementReadiness {
  return {
    safeForAutoOptimization: [
      "recommendation_weighting",
      "intervention_ranking",
      "confidence_thresholds",
      "alert_thresholds",
    ],
    founderApprovalRequired: [
      "billing",
      "onboarding",
      "pricing",
      "trust_systems",
      "routing_logic",
      "system_prompts",
    ],
  };
}

function buildInterventionTrends(): InterventionTrend[] {
  const entries = getUserInterventionEffectiveness();
  return entries.slice(0, 8).map((e) => {
    const failureRate = e.counts.recommended
      ? (e.counts.dismissed + (e.counts.misread ?? 0)) / e.counts.recommended
      : 0;
    return {
      id: String(e.id),
      label: e.label,
      acceptanceRate: e.rates.acceptanceRate,
      completionRate: e.rates.completionRate,
      adaptiveWeight: e.rates.adaptiveWeight,
      direction:
        e.rates.completionRate >= 50 && failureRate < 0.4
          ? "improving"
          : failureRate > 0.6
            ? "declining"
            : "stable",
    };
  });
}

export function buildFounderIntelligenceDashboard(): FounderIntelligenceDashboard {
  const trustHealth = buildTrustHealth();
  const companionAccuracy = buildCompanionAccuracyHealth();
  const confidenceHealth = buildConfidenceHealth();
  const momentumHealth = buildMomentumHealth();
  const retentionHealth = buildRetentionHealth();
  const retentionRisks = buildRetentionRiskProfile();
  const earlyWarnings = buildEarlyWarnings();
  const emerging = earlyWarnings.filter((w) => w.category === "emerging");
  const founderPriorities = prioritizeFounderIssues(earlyWarnings);

  const interventions = getUserInterventionEffectiveness();
  const topFailing = [...interventions]
    .filter((e) => e.counts.recommended >= 2)
    .sort((a, b) => {
      const aRate = a.counts.recommended ? a.counts.dismissed / a.counts.recommended : 0;
      const bRate = b.counts.recommended ? b.counts.dismissed / b.counts.recommended : 0;
      return bRate - aRate;
    })
    .slice(0, 5)
    .map((e) => ({
      id: String(e.id),
      label: e.label,
      dismissRate: e.counts.recommended
        ? Math.round((e.counts.dismissed / e.counts.recommended) * 100)
        : 0,
    }));

  const topSuccessful = [...interventions]
    .filter((e) => e.counts.completed >= 1)
    .sort((a, b) => b.rates.completionRate - a.rates.completionRate)
    .slice(0, 5)
    .map((e) => ({
      id: String(e.id),
      label: e.label,
      completionRate: e.rates.completionRate,
    }));

  const ecosystemHealthScore = clampScore(
    trustHealth.score * 0.25 +
      companionAccuracy.score * 0.2 +
      confidenceHealth.score * 0.15 +
      momentumHealth.score * 0.2 +
      retentionHealth.score * 0.2,
  );

  return {
    evaluatedAt: new Date().toISOString(),
    ecosystemHealthScore,
    trustScore: trustHealth.score,
    retentionScore: retentionHealth.score,
    confidenceScore: confidenceHealth.score,
    companionAccuracyScore: companionAccuracy.score,
    momentumScore: momentumHealth.score,
    trustHealth,
    companionAccuracy,
    confidenceHealth,
    momentumHealth,
    retentionHealth,
    topEmergingIssues: emerging.slice(0, 5),
    topFailingCapabilities: topFailing,
    topSuccessfulCapabilities: topSuccessful,
    interventionTrends: buildInterventionTrends(),
    retentionRisks,
    founderPriorities,
    misfireProfile: getCompanionMisfireProfile(),
    selfImprovementReadiness: buildSelfImprovementReadiness(),
    earlyWarnings,
  };
}

export function resetFounderIntelligenceForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adhd-ecosystem-track-v1");
}
