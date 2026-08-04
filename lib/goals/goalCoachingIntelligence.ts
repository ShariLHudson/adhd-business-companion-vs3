/**
 * P0.54 — Goal Intelligence™ coaching layer for Outcome Goals™.
 * Interprets existing goal data without adding UI complexity.
 */

import {
  buildPatternObservationFraming,
  sanitizeIntelligenceInsight,
} from "../emotionalSafetyIntelligence";
import {
  getActiveGoalMetrics,
  goalHealthStatus,
  goalProgressPercent,
  lastProgressDate,
  progressInDateRange,
  type OutcomeGoal,
  type OutcomeGoalSubMetric,
} from "./outcomeGoals";
import { buildGoalSupportingActivity, calculateGoalMomentum } from "./goalIntelligence";

export type MetricChangeDirection = "up" | "down" | "flat";

export type MetricChangeIndicator = {
  direction: MetricChangeDirection;
  label: string;
  delta: number;
};

export type GoalCoachingIntelligence = {
  progressSummary: string;
  whatsWorking: string[];
  whatsBlocking: string[];
  suggestedActions: string[];
  patternInsight: string | null;
  nextBestAction: string;
  metricChanges: Record<string, MetricChangeIndicator>;
};

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}

function formatDeltaAmount(metric: OutcomeGoalSubMetric, amount: number): string {
  const abs = Math.abs(amount);
  if (metric.metricKind === "revenue") {
    return `$${abs.toLocaleString()}`;
  }
  return String(abs);
}

export function metricChangeIndicator(
  metric: OutcomeGoalSubMetric,
): MetricChangeIndicator {
  const logs = [...metric.progressLogs].sort((a, b) =>
    b.loggedAt.localeCompare(a.loggedAt),
  );
  const last = logs[0];
  if (!last) {
    return {
      direction: "flat",
      label: "→ no change yet",
      delta: 0,
    };
  }
  const amount = last.amount;
  if (amount > 0) {
    return {
      direction: "up",
      label: `↑ +${formatDeltaAmount(metric, amount)} since last update`,
      delta: amount,
    };
  }
  if (amount < 0) {
    return {
      direction: "down",
      label: `↓ ${amount} adjustment`,
      delta: amount,
    };
  }
  return {
    direction: "flat",
    label: "→ no change",
    delta: 0,
  };
}

function averageDaysBetweenLogs(metric: OutcomeGoalSubMetric): number | null {
  const logs = [...metric.progressLogs]
    .map((l) => new Date(l.loggedAt).getTime())
    .sort((a, b) => a - b);
  if (logs.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 1; i < logs.length; i++) {
    gaps.push((logs[i]! - logs[i - 1]!) / 86_400_000);
  }
  return gaps.reduce((s, g) => s + g, 0) / gaps.length;
}

function buildProgressSummary(goal: OutcomeGoal, now: Date): string {
  const lastIso = lastProgressDate(goal) ?? goal.createdAt;
  const daysSince = daysBetween(new Date(lastIso), now);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recent = progressInDateRange(goal, twoWeeksAgo, now);
  const prior = progressInDateRange(goal, fourWeeksAgo, twoWeeksAgo);

  if (daysSince === 0) {
    return "Updated today — progress is current.";
  }
  if (recent > 0 && recent >= prior) {
    return "Progress has increased steadily over the past 2 weeks.";
  }
  if (recent > 0 && prior > recent) {
    return "Progress is still moving, though the pace has eased a little.";
  }
  if (daysSince >= 6) {
    return `No updates in ${daysSince} days — momentum may be easing.`;
  }
  if (recent === 0 && daysSince < 6) {
    return "This goal is quiet so far — a small update could help when you're ready.";
  }
  return "Progress is steady — keep updating when something moves.";
}

function buildWhatsWorking(goal: OutcomeGoal, now: Date): string[] {
  const lines: string[] = [];
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const progressDelta = progressInDateRange(goal, twoWeeksAgo, now);
  const activity = buildGoalSupportingActivity(goal);
  const momentum = calculateGoalMomentum(goal, now);

  if (progressDelta > 0 && activity.evidence > 0) {
    lines.push(
      "Recording evidence alongside progress updates may be supporting momentum.",
    );
  }
  if (progressDelta > 0 && activity.wins > 0) {
    lines.push("Recent wins align with movement on this goal.");
  }
  if (momentum.level === "strong") {
    lines.push("Regular activity on this goal is correlating with steady progress.");
  }

  const metrics = getActiveGoalMetrics(goal);
  const weeklyTrackers = metrics.filter((m) => {
    const avg = averageDaysBetweenLogs(m);
    return avg !== null && avg <= 8 && m.progressLogs.length >= 2;
  });
  if (weeklyTrackers.length > 0 && progressDelta > 0) {
    lines.push("Weekly tracking updates correlate with faster progress.");
  }

  if (lines.length === 0 && progressDelta > 0) {
    lines.push("Any forward movement counts — progress is happening.");
  }

  return lines.slice(0, 2).map(sanitizeIntelligenceInsight);
}

function buildWhatsBlocking(goal: OutcomeGoal, now: Date): string[] {
  const lines: string[] = [];
  const lastIso = lastProgressDate(goal) ?? goal.createdAt;
  const daysSince = daysBetween(new Date(lastIso), now);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  if (daysSince >= 7) {
    lines.push("This goal hasn't been updated recently.");
  }

  const quietMetrics = getActiveGoalMetrics(goal).filter((m) => {
    const recentLogs = m.progressLogs.filter(
      (l) => new Date(l.loggedAt).getTime() >= twoWeeksAgo.getTime(),
    );
    return recentLogs.length === 0;
  });
  if (quietMetrics.length >= 2) {
    lines.push("Several trackers haven't had recent activity.");
  }

  const health = goalHealthStatus(goal, now);
  if (health === "needs_attention") {
    lines.push(
      "The target date is approaching — a small update could clarify where things stand.",
    );
  }

  return lines.slice(0, 2).map(sanitizeIntelligenceInsight);
}

function buildSuggestedActions(goal: OutcomeGoal, now: Date): string[] {
  const actions: string[] = [];
  const lastIso = lastProgressDate(goal) ?? goal.createdAt;
  const daysSince = daysBetween(new Date(lastIso), now);
  const activity = buildGoalSupportingActivity(goal);
  const metrics = getActiveGoalMetrics(goal);

  if (daysSince >= 3) {
    actions.push("Record progress");
  }
  if (activity.evidence === 0 && goalProgressPercent(goal) > 0) {
    actions.push("Add evidence");
  }
  if (metrics.length > 1) {
    const quietest = [...metrics].sort(
      (a, b) => a.progressLogs.length - b.progressLogs.length,
    )[0];
    if (quietest && quietest.progressLogs.length === 0) {
      actions.push(`Update ${quietest.label.toLowerCase()} tracker`);
    }
  }
  if (metrics.some((m) => m.progressLogs.some((l) => l.isMilestone))) {
    actions.push("Review last milestone");
  }
  actions.push("Focus on one metric today");

  return [...new Set(actions)].slice(0, 4).map(sanitizeIntelligenceInsight);
}

function buildPatternInsight(goal: OutcomeGoal, now: Date): string | null {
  const metrics = getActiveGoalMetrics(goal);
  const totalLogs = metrics.reduce((s, m) => s + m.progressLogs.length, 0);
  if (totalLogs < 3) return null;

  const weeklyMetrics = metrics.filter((m) => {
    const avg = averageDaysBetweenLogs(m);
    return avg !== null && avg <= 8;
  });
  if (weeklyMetrics.length >= 1 && weeklyMetrics.length === metrics.length) {
    return sanitizeIntelligenceInsight(
      "This goal tends to progress faster when updated weekly.",
    );
  }

  const activity = buildGoalSupportingActivity(goal);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const progressDelta = progressInDateRange(goal, twoWeeksAgo, now);
  if (activity.wins > 0 && progressDelta > 0) {
    return sanitizeIntelligenceInsight(
      "Most momentum on this goal follows recorded wins and updates.",
    );
  }

  if (activity.projects >= 3 && goalHealthStatus(goal, now) !== "on_track") {
    return buildPatternObservationFraming(
      "several projects are active at the same time",
    );
  }

  const gaps = metrics
    .map((m) => averageDaysBetweenLogs(m))
    .filter((v): v is number => v !== null);
  if (gaps.length > 0) {
    const avgGap = gaps.reduce((s, v) => s + v, 0) / gaps.length;
    if (avgGap <= 7 && totalLogs >= 4) {
      return sanitizeIntelligenceInsight(
        "This goal progresses faster when updated weekly.",
      );
    }
  }

  return null;
}

function pickNextBestAction(actions: string[]): string {
  if (actions.length === 0) {
    return sanitizeIntelligenceInsight(
      "You might consider recording progress when something moves forward.",
    );
  }
  const first = actions[0]!;
  const labels: Record<string, string> = {
    "Record progress": "Record today's progress",
    "Add evidence": "Add one piece of evidence",
    "Review last milestone": "Review last milestone",
    "Focus on one metric today": "Focus on one metric today",
  };
  if (first.startsWith("Update ")) {
    return sanitizeIntelligenceInsight(first);
  }
  return sanitizeIntelligenceInsight(labels[first] ?? first);
}

export function buildGoalCoachingIntelligence(
  goal: OutcomeGoal,
  now = new Date(),
): GoalCoachingIntelligence {
  const metrics = getActiveGoalMetrics(goal);
  const metricChanges: Record<string, MetricChangeIndicator> = {};
  for (const metric of metrics) {
    metricChanges[metric.id] = metricChangeIndicator(metric);
  }

  const suggestedActions = buildSuggestedActions(goal, now);

  return {
    progressSummary: sanitizeIntelligenceInsight(buildProgressSummary(goal, now)),
    whatsWorking: buildWhatsWorking(goal, now),
    whatsBlocking: buildWhatsBlocking(goal, now),
    suggestedActions,
    patternInsight: buildPatternInsight(goal, now),
    nextBestAction: pickNextBestAction(suggestedActions),
    metricChanges,
  };
}
