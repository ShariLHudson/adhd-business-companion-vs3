/**
 * P0.54 — Activity timeline helpers for Outcome Goals™.
 */

import {
  formatMetricProgressLabel,
  getActiveGoalMetrics,
  getGoalMetrics,
  goalProgressPercent,
  metricProgressPercent,
  type OutcomeGoal,
  type OutcomeGoalProgressLog,
  type OutcomeGoalSubMetric,
} from "./outcomeGoals";

export type ActivityTimelineEntry = {
  goalId: string;
  metricId: string;
  metricLabel: string;
  log: OutcomeGoalProgressLog;
  logId: string;
};

export type ActivityDayGroup = {
  label: string;
  sortKey: string;
  entries: ActivityTimelineEntry[];
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function activityDayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const today = startOfDay(now).getTime();
  const target = startOfDay(date).getTime();
  const diff = Math.round((today - target) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatActivityAmount(
  metric: OutcomeGoalSubMetric,
  amount: number,
): string {
  const sign = amount >= 0 ? "+" : "";
  if (metric.metricKind === "revenue") {
    return `${sign}$${Math.abs(amount).toLocaleString()}`;
  }
  const unit = metric.label.trim();
  return `${sign}${Math.abs(amount)} ${unit}`;
}

export function collectGoalActivityEntries(goal: OutcomeGoal): ActivityTimelineEntry[] {
  return getGoalMetrics(goal).flatMap((metric) =>
    metric.progressLogs.map((log) => ({
      goalId: goal.id,
      metricId: metric.id,
      metricLabel: metric.label,
      log,
      logId: log.id ?? `${metric.id}-${log.loggedAt}`,
    })),
  );
}

export function groupActivityByDay(
  entries: ActivityTimelineEntry[],
  now = new Date(),
): ActivityDayGroup[] {
  const sorted = [...entries].sort((a, b) =>
    b.log.loggedAt.localeCompare(a.log.loggedAt),
  );
  const map = new Map<string, ActivityDayGroup>();
  for (const entry of sorted) {
    const label = activityDayLabel(entry.log.loggedAt, now);
    const sortKey = entry.log.loggedAt.slice(0, 10);
    const group = map.get(sortKey) ?? { label, sortKey, entries: [] };
    group.entries.push(entry);
    map.set(sortKey, group);
  }
  return [...map.values()].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

export function formatActivityTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function goalActivitySummary(goal: OutcomeGoal): {
  title: string;
  percent: number;
  primaryLabel: string;
} {
  const metrics = getActiveGoalMetrics(goal);
  const primary = metrics[0];
  return {
    title: goal.statement,
    percent: goalProgressPercent(goal),
    primaryLabel: primary ? formatMetricProgressLabel(primary) : "",
  };
}

export function miniProgressBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export function metricMiniPercent(metric: OutcomeGoalSubMetric): number {
  return metricProgressPercent(metric);
}
