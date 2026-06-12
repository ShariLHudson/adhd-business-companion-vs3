// Founder Ecosystem — Phase 15 Learning Module.
// Adjusts recommendation scores, priorities, and sequences from analytics.

import type { FounderAction } from "../actions/actionTypes";
import type { FounderEvent } from "../events";
import type { Level } from "../dashboardTypes";
import type { ID } from "../models";
import type { CompanionProfile } from "../companion/companionTypes";
import {
  automationSuccessMetrics,
  feedbackLoopEngagement,
  workflowEfficiencyPatterns,
} from "./ecosystemAnalytics";
import type {
  AutomationScore,
  LearningAdjustment,
  PersonalizedSequence,
} from "./learningTypes";

const IGNORE_THRESHOLD = 40;
const HIGH_SUCCESS_THRESHOLD = 70;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function scoreToPriority(score: number): Level {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function actionAutomationKey(action: FounderAction): string {
  const tool = action.workspace.ecosystemKind ?? action.workspace.section;
  return `${tool}::${action.actionType}`;
}

export function computeAutomationScores(
  events: FounderEvent[],
  founderId: ID,
): AutomationScore[] {
  const metrics = automationSuccessMetrics(events, founderId);
  const loops = feedbackLoopEngagement(events, founderId);
  const loopByTitle = new Map(loops.map((l) => [l.suggestion, l.rate]));

  return metrics.map((m) => {
    const ignoreRate =
      m.suggested > 0 ? Math.round(((m.dismissed + m.rejected) / m.suggested) * 100) : 0;
    const engagementBoost = loopByTitle.get(m.title) ?? 0;
    const raw =
      m.executionRate * 0.45 +
      m.approvalRate * 0.25 +
      engagementBoost * 0.2 +
      Math.min(m.avgTimeSavedMinutes, 30) +
      (ignoreRate > IGNORE_THRESHOLD ? -15 : 0);

    const score = clamp(Math.round(raw));
    let trend: AutomationScore["trend"] = "steady";
    if (score >= HIGH_SUCCESS_THRESHOLD) trend = "rising";
    if (ignoreRate > IGNORE_THRESHOLD) trend = "falling";

    return {
      key: m.key,
      title: m.title,
      score,
      approvalRate: m.approvalRate,
      executionRate: m.executionRate,
      ignoreRate,
      avgTimeSavedMinutes: m.avgTimeSavedMinutes,
      trend,
    };
  });
}

export function learningAdjustments(
  events: FounderEvent[],
  founderId: ID,
): LearningAdjustment[] {
  return computeAutomationScores(events, founderId).map((s) => {
    let delta = 0;
    let reason = "steady performance";
    if (s.score >= HIGH_SUCCESS_THRESHOLD) {
      delta = 10;
      reason = "high execution and approval";
    } else if (s.ignoreRate > IGNORE_THRESHOLD) {
      delta = -20;
      reason = "frequently ignored or rejected";
    } else if (s.executionRate < 30 && s.approvalRate < 30) {
      delta = -10;
      reason = "low follow-through";
    }
    return { key: s.key, delta, reason };
  });
}

export function adjustActionPriority(
  actions: FounderAction[],
  scores: AutomationScore[],
): FounderAction[] {
  const byKey = new Map(scores.map((s) => [s.key, s.score]));
  const priorityOrder: Record<Level, number> = { high: 0, medium: 1, low: 2 };
  return [...actions]
    .map((a) => {
      const key = actionAutomationKey(a);
      const boost = byKey.get(key) ?? 50;
      const penalty = scores.find((s) => s.title === a.title && s.ignoreRate > IGNORE_THRESHOLD);
      let priority = scoreToPriority(boost);
      if (penalty && priority !== "low") priority = "low";
      return { ...a, priority };
    })
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function suggestEfficiencySequences(
  events: FounderEvent[],
  founderId: ID,
): PersonalizedSequence[] {
  const patterns = workflowEfficiencyPatterns(events, founderId);
  return patterns.map((p, i) => ({
    id: `seq-${i + 1}` as ID,
    label: p.sequence.join(" → "),
    steps: p.sequence,
    confidence: clamp(p.count * 15, 0, 95),
    basis: `Executed together ${p.count} time(s)`,
  }));
}

export function deprioritizeIgnoredKeys(scores: AutomationScore[]): Set<string> {
  return new Set(scores.filter((s) => s.ignoreRate > IGNORE_THRESHOLD).map((s) => s.key));
}

export function refineAssistantGuidance(
  profile: CompanionProfile | null,
  scores: AutomationScore[],
): string[] {
  const hints: string[] = [];
  const top = [...scores].sort((a, b) => b.score - a.score).slice(0, 3);
  const avoid = deprioritizeIgnoredKeys(scores);

  if (top.length > 0) {
    hints.push(
      `Prioritize automations with high success: ${top.map((t) => `${t.title} (${t.score}%)`).join(", ")}.`,
    );
  }
  if (avoid.size > 0) {
    hints.push(`Avoid re-suggesting ignored patterns (${avoid.size} low performers).`);
  }
  if (profile?.supportStyle.value === "encouragement") {
    hints.push("Offer one automation at a time; confirm before executing.");
  }
  if (profile?.decisionStyle.value === "decisive") {
    hints.push("Lead with the highest-scoring action card; minimize preamble.");
  }
  return hints;
}

export function adaptiveRecommendationPolicy(
  events: FounderEvent[],
  founderId: ID,
  actions: FounderAction[],
  profile?: CompanionProfile | null,
): {
  actions: FounderAction[];
  scores: AutomationScore[];
  guidance: string[];
  sequences: PersonalizedSequence[];
} {
  const scores = computeAutomationScores(events, founderId);
  const ignored = deprioritizeIgnoredKeys(scores);
  const filtered = actions.filter((a) => !ignored.has(actionAutomationKey(a)));
  const prioritized = adjustActionPriority(filtered.length > 0 ? filtered : actions, scores);
  return {
    actions: prioritized,
    scores,
    guidance: refineAssistantGuidance(profile ?? null, scores),
    sequences: suggestEfficiencySequences(events, founderId),
  };
}
