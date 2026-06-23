/**
 * Early Warning System™ — detect companion issues before users complain.
 */

import { getBehaviorEvents } from "./closedLoopLearning";
import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import {
  detectExplicitCorrection,
  detectFrustrationSignal,
  getMistakeRecords,
} from "./companionMistakeRecovery";
import { ecosystemEventTracker } from "./ecosystem/eventTrackingEngine";

export type WarningSeverity = "critical" | "high" | "medium" | "emerging";

export type FounderWarning = {
  id: string;
  category: WarningSeverity;
  title: string;
  summary: string;
  metric?: string;
  deltaPercent?: number;
  interventionId?: string;
  detectedAt: string;
  trustImpact: number;
  confidenceImpact: number;
  retentionImpact: number;
  businessImpact: number;
  usersAffected: number;
};

export type CompanionMisfireProfile = {
  explicitSignals: number;
  behavioralSignals: number;
  trustSignals: number;
  topMisfiringCapabilities: { id: string; label: string; misfireCount: number }[];
  recentExplicitPhrases: string[];
  evaluatedAt: string;
};

const DAY_MS = 86_400_000;

function recentBehavior(days: number) {
  const cutoff = Date.now() - days * DAY_MS;
  return getBehaviorEvents().filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

function rateMetric(recent: number, prior: number): number | undefined {
  if (prior === 0) return recent > 0 ? 100 : undefined;
  return Math.round(((recent - prior) / prior) * 100);
}

export function getCompanionMisfireProfile(): CompanionMisfireProfile {
  const mistakes = getMistakeRecords();
  const cutoff = Date.now() - 14 * DAY_MS;
  const recent = mistakes.filter((m) => new Date(m.recordedAt).getTime() >= cutoff);

  const explicit = recent.filter((m) => m.signalKind === "explicit_correction");
  const behavioral = recent.filter((m) => m.signalKind === "behavioral_correction");
  const trust = recent.filter(
    (m) => m.signalKind === "frustration" || m.signalKind === "trust_damage",
  );

  const byCap = new Map<string, number>();
  for (const m of recent) {
    if (!m.interventionId) continue;
    byCap.set(m.interventionId, (byCap.get(m.interventionId) ?? 0) + 1);
  }

  const interventions = getUserInterventionEffectiveness();
  const topMisfiringCapabilities = [...byCap.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, misfireCount]) => ({
      id,
      label: interventions.find((e) => String(e.id) === id)?.label ?? id,
      misfireCount,
    }));

  return {
    explicitSignals: explicit.length,
    behavioralSignals: behavioral.length,
    trustSignals: trust.length,
    topMisfiringCapabilities,
    recentExplicitPhrases: explicit.map((m) => m.userTextSnippet).slice(0, 5),
    evaluatedAt: new Date().toISOString(),
  };
}

export function detectEmergingProblems(): FounderWarning[] {
  const warnings: FounderWarning[] = [];
  const recent7 = recentBehavior(7);
  const prior7 = getBehaviorEvents().filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t < Date.now() - 7 * DAY_MS && t >= Date.now() - 14 * DAY_MS;
  });

  const recentDismiss = recent7.filter((e) => e.eventType === "offer_dismissed").length;
  const priorDismiss = prior7.filter((e) => e.eventType === "offer_dismissed").length;
  const dismissDelta = rateMetric(recentDismiss, priorDismiss);
  if (dismissDelta != null && dismissDelta >= 15) {
    warnings.push(makeWarning({
      category: "emerging",
      title: "Offer dismissals trending up",
      summary: `Dismissals increased ${dismissDelta}% vs prior week — users may be rejecting companion routing.`,
      metric: "offer_dismissed",
      deltaPercent: dismissDelta,
      trustImpact: 18,
      confidenceImpact: 12,
      retentionImpact: 20,
      businessImpact: 8,
      usersAffected: recentDismiss,
    }));
  }

  const recentAbandon = recent7.filter((e) => e.eventType === "workspace_abandoned").length;
  const priorAbandon = prior7.filter((e) => e.eventType === "workspace_abandoned").length;
  const abandonDelta = rateMetric(recentAbandon, priorAbandon);
  if (abandonDelta != null && abandonDelta >= 20) {
    warnings.push(makeWarning({
      category: "emerging",
      title: "Workspace abandonment rising",
      summary: `Abandonment up ${abandonDelta}% — friction or wrong routing may be increasing.`,
      metric: "workspace_abandoned",
      deltaPercent: abandonDelta,
      trustImpact: 15,
      confidenceImpact: 14,
      retentionImpact: 22,
      businessImpact: 10,
      usersAffected: recentAbandon,
    }));
  }

  const recentMistakes = getMistakeRecords().filter(
    (m) => Date.now() - new Date(m.recordedAt).getTime() < 7 * DAY_MS,
  ).length;
  const priorMistakes = getMistakeRecords().filter((m) => {
    const t = new Date(m.recordedAt).getTime();
    return t < Date.now() - 7 * DAY_MS && t >= Date.now() - 14 * DAY_MS;
  }).length;
  const mistakeDelta = rateMetric(recentMistakes, priorMistakes);
  if (mistakeDelta != null && mistakeDelta >= 10) {
    warnings.push(makeWarning({
      category: "emerging",
      title: "Companion misunderstandings increasing",
      summary: `Correction signals up ${mistakeDelta}% — accuracy may be slipping.`,
      metric: "misunderstandings",
      deltaPercent: mistakeDelta,
      trustImpact: 22,
      confidenceImpact: 18,
      retentionImpact: 16,
      businessImpact: 6,
      usersAffected: recentMistakes,
    }));
  }

  for (const entry of getUserInterventionEffectiveness()) {
    if (entry.counts.recommended < 5) continue;
    const dismissRate = entry.counts.dismissed / entry.counts.recommended;
    const completionRate = entry.counts.accepted
      ? entry.counts.completed / entry.counts.accepted
      : 0;
    if (dismissRate >= 0.7 && completionRate === 0) {
      warnings.push(makeWarning({
        category: "emerging",
        title: `${entry.label} repeatedly failing`,
        summary: `Recommended ${entry.counts.recommended}×, dismissed ${entry.counts.dismissed}×, completed 0 — stop pushing this intervention.`,
        interventionId: String(entry.id),
        metric: "intervention_failure",
        trustImpact: 20,
        confidenceImpact: 15,
        retentionImpact: 18,
        businessImpact: 12,
        usersAffected: entry.counts.recommended,
      }));
    }
  }

  return warnings;
}

function makeWarning(
  input: Omit<FounderWarning, "id" | "detectedAt">,
): FounderWarning {
  return {
    ...input,
    id: `warn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    detectedAt: new Date().toISOString(),
  };
}

export function buildEarlyWarnings(): FounderWarning[] {
  const warnings: FounderWarning[] = [];
  const eco = ecosystemEventTracker.query({ limit: 200 });
  const dayAgo = Date.now() - DAY_MS;

  const criticalTypes = [
    "user.cancelled",
  ] as const;

  for (const event of eco.filter((e) => new Date(e.timestamp).getTime() >= dayAgo)) {
    if ((criticalTypes as readonly string[]).includes(event.eventType)) {
      warnings.push(makeWarning({
        category: "critical",
        title: "User cancellation detected",
        summary: "A user cancellation event was recorded — investigate retention immediately.",
        metric: event.eventType,
        trustImpact: 30,
        confidenceImpact: 25,
        retentionImpact: 35,
        businessImpact: 30,
        usersAffected: 1,
      }));
    }
  }

  const mistakes = getMistakeRecords().filter(
    (m) => Date.now() - new Date(m.recordedAt).getTime() < DAY_MS,
  );
  const frustrationToday = mistakes.filter(
    (m) => m.signalKind === "frustration" || m.signalKind === "trust_damage",
  ).length;
  if (frustrationToday >= 2) {
    warnings.push(makeWarning({
      category: "high",
      title: "Trust damage signals spiking",
      summary: `${frustrationToday} frustration/trust damage signals today — companion may be missing user needs.`,
      metric: "trust_damage",
      trustImpact: 28,
      confidenceImpact: 22,
      retentionImpact: 25,
      businessImpact: 10,
      usersAffected: frustrationToday,
    }));
  }

  const recentBehavior14 = recentBehavior(14);
  const dismissSpike = recentBehavior14.filter((e) => e.eventType === "offer_dismissed").length;
  if (dismissSpike >= 8) {
    warnings.push(makeWarning({
      category: "high",
      title: "High offer dismissal volume",
      summary: `${dismissSpike} dismissals in 14 days — routing or timing may be off.`,
      metric: "offer_dismissed",
      trustImpact: 18,
      confidenceImpact: 12,
      retentionImpact: 20,
      businessImpact: 8,
      usersAffected: dismissSpike,
    }));
  }

  const interventions = getUserInterventionEffectiveness();
  for (const entry of interventions) {
    if (entry.counts.recommended < 4) continue;
    const priorCompletion = entry.rates.completionRate;
    if (priorCompletion > 0 && priorCompletion < 25) {
      warnings.push(makeWarning({
        category: "medium",
        title: `${entry.label} completion rate low`,
        summary: `Completion at ${priorCompletion}% — investigate friction or fit.`,
        interventionId: String(entry.id),
        metric: "completion_rate",
        trustImpact: 10,
        confidenceImpact: 12,
        retentionImpact: 14,
        businessImpact: 15,
        usersAffected: entry.counts.recommended,
        deltaPercent: -Math.round(100 - priorCompletion),
      }));
    }
  }

  warnings.push(...detectEmergingProblems());

  const misfire = getCompanionMisfireProfile();
  if (misfire.explicitSignals >= 3) {
    warnings.push(makeWarning({
      category: "high",
      title: "Explicit user corrections rising",
      summary: `Users are saying "that's not it" — ${misfire.explicitSignals} explicit corrections in 14 days.`,
      metric: "explicit_correction",
      trustImpact: 24,
      confidenceImpact: 20,
      retentionImpact: 18,
      businessImpact: 8,
      usersAffected: misfire.explicitSignals,
    }));
  }

  return warnings.sort((a, b) => severityRank(b.category) - severityRank(a.category));
}

function severityRank(s: WarningSeverity): number {
  switch (s) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "emerging":
      return 1;
    default:
      return 0;
  }
}

/** Scan user text for misfire signals (for live monitoring hooks). */
export function scanTextForMisfireSignals(text: string): {
  explicit: boolean;
  frustration: boolean;
} {
  return {
    explicit: detectExplicitCorrection(text),
    frustration: detectFrustrationSignal(text),
  };
}

export function resetFounderEarlyWarningForTests(): void {
  /* uses shared stores cleared by other reset helpers */
}
