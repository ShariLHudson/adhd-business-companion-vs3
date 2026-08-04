"use client";

/** @deprecated P0.56 — Not mounted. Dashboard metrics live in Outcome Goals™ → Insights tab. */

import {
  buildOutcomeGoalDashboard,
  OUTCOME_GOAL_HEALTH_LABELS,
  type OutcomeGoalDashboard,
} from "@/lib/goals/outcomeGoals";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";

function formatDelta(dashboard: OutcomeGoalDashboard): string | null {
  const m = dashboard.mostImprovedMetric;
  if (!m) return null;
  const prefix = m.delta > 0 ? "+" : "";
  return `${m.metricLabel} on "${m.goalStatement}" (${prefix}${m.delta})`;
}

export function OutcomeGoalDashboardStrip() {
  const dashboard = buildOutcomeGoalDashboard(getSavedGrowthWins());
  const improved = formatDelta(dashboard);

  return (
    <section
      className="rounded-2xl border border-[#1e4f4f]/20 bg-[#f0f8f8]/60 p-4"
      data-testid="outcome-goal-dashboard"
      aria-label="Outcome progress snapshot"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
        Outcome Intelligence™
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Goals" value={dashboard.activeGoals} />
        <Stat label="On Track" value={dashboard.onTrack} />
        <Stat label="Needs Attention" value={dashboard.needsAttention} />
        <Stat label="Completed" value={dashboard.completed} />
      </div>
      {improved ? (
        <p className="mt-3 text-sm text-[#2d2926]">
          <span className="font-semibold text-[#1e4f4f]">Most improved: </span>
          {improved}
        </p>
      ) : null}
      {dashboard.biggestWinThisPeriod ? (
        <p className="mt-1 text-sm text-[#6b635a]">
          <span className="font-semibold">Biggest win: </span>
          {dashboard.biggestWinThisPeriod}
        </p>
      ) : null}
      {dashboard.stalledGoalAlerts.length > 0 ? (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          <span className="font-semibold">Stalled: </span>
          {dashboard.stalledGoalAlerts.join(" · ")}
        </p>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#e7dfd4] bg-white/80 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums text-[#1e4f4f]">{value}</p>
    </div>
  );
}

export { OUTCOME_GOAL_HEALTH_LABELS };
