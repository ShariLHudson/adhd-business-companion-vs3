/**
 * P0.54 — Insights dashboard and export for Outcome Goals™.
 */

import {
  buildGrowthProgressFraming,
  sanitizeIntelligenceInsight,
} from "../emotionalSafetyIntelligence";
import { getSavedGrowthWins } from "../growthWinsStore";
import {
  buildOutcomeGoalDashboard,
  getActiveGoalMetrics,
  getPrimaryGoalMetric,
  goalHealthStatus,
  goalProgressPercent,
  listArchivedOutcomeGoals,
  listCompletedOutcomeGoals,
  listOutcomeGoals,
  metricProgressPercent,
  progressInDateRange,
  type OutcomeGoal,
} from "./outcomeGoals";
import { collectGoalActivityEntries, groupActivityByDay } from "./outcomeGoalActivity";

export type OutcomeInsightsCard = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type OutcomeInsightsExportIncludes = {
  summary: boolean;
  charts: boolean;
  activity: boolean;
  milestones: boolean;
  evidence: boolean;
  wins: boolean;
  notes: boolean;
  portfolio: boolean;
  projects: boolean;
  strategies: boolean;
  documents: boolean;
};

export const DEFAULT_INSIGHTS_EXPORT_INCLUDES: OutcomeInsightsExportIncludes = {
  summary: true,
  charts: true,
  activity: true,
  milestones: true,
  evidence: false,
  wins: true,
  notes: false,
  portfolio: false,
  projects: false,
  strategies: false,
  documents: false,
};

export function buildOutcomeInsightsCards(now = new Date()): OutcomeInsightsCard[] {
  const active = listOutcomeGoals();
  const completed = listCompletedOutcomeGoals();
  const archived = listArchivedOutcomeGoals();
  const dash = buildOutcomeGoalDashboard(
    getSavedGrowthWins().map((w) => ({
      whatHappened: w.whatHappened,
      ts: w.createdAt,
    })),
    now,
  );

  const closest = [...active].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  )[0];

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const goalsMoved = active.filter((g) =>
    getActiveGoalMetrics(g).some(
      (m) => progressInDateRange(g, weekStart, now, m.id) > 0,
    ),
  ).length;

  const revenueGoals = active.flatMap((g) =>
    getActiveGoalMetrics(g)
      .filter((m) => m.metricKind === "revenue")
      .map((m) => ({ goal: g, metric: m })),
  );
  const revenuePct =
    revenueGoals.length > 0
      ? Math.round(
          revenueGoals.reduce((s, { metric }) => s + metricProgressPercent(metric), 0) /
            revenueGoals.length,
        )
      : 0;

  const overallPct =
    active.length > 0
      ? Math.round(
          active.reduce((s, g) => s + goalProgressPercent(g), 0) / active.length,
        )
      : 0;

  const milestones = active.flatMap((g) =>
    collectGoalActivityEntries(g).filter((e) => e.log.isMilestone),
  );

  return [
    { id: "active", label: "Active Goals", value: String(active.length) },
    { id: "completed", label: "Completed Goals", value: String(completed.length) },
    {
      id: "closest",
      label: "Closest Deadline",
      value: closest?.statement ?? "—",
      hint: closest
        ? new Date(`${closest.deadline}T12:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : undefined,
    },
    {
      id: "biggest-win",
      label: "Biggest Win This Week",
      value: dash.biggestWinThisPeriod ?? "—",
    },
    {
      id: "most-improved",
      label: "Most Improved Goal",
      value: dash.mostImprovedMetric
        ? `${dash.mostImprovedMetric.goalStatement} · +${dash.mostImprovedMetric.delta} ${dash.mostImprovedMetric.metricLabel}`
        : "—",
    },
    {
      id: "revenue",
      label: "Revenue Progress",
      value: revenueGoals.length > 0 ? `${revenuePct}%` : "—",
    },
    { id: "overall", label: "Overall Completion", value: `${overallPct}%` },
    {
      id: "milestones",
      label: "Recent Milestones",
      value: String(milestones.length),
    },
    {
      id: "streak",
      label: "Goals Moved This Week",
      value: String(goalsMoved),
    },
    {
      id: "upcoming",
      label: "Upcoming Deadlines",
      value: String(
        active.filter((g) => goalHealthStatus(g, now) === "needs_attention").length,
      ),
      hint: "Due soon",
    },
    { id: "archived", label: "Archived", value: String(archived.length) },
  ];
}

export function buildOutcomeMotivationMessages(now = new Date()): string[] {
  const active = listOutcomeGoals();
  const messages: string[] = [];
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const goalsMoved = active.filter((g) =>
    getActiveGoalMetrics(g).some(
      (m) => progressInDateRange(g, weekStart, now, m.id) > 0,
    ),
  ).length;
  if (goalsMoved > 0) {
    messages.push(
      buildGrowthProgressFraming(
        `moved ${goalsMoved} goal${goalsMoved === 1 ? "" : "s"} forward`,
        "this week",
      ),
    );
  }

  const wins = getSavedGrowthWins().filter((w) => {
    const ts = w.createdAt;
    return ts && new Date(ts).getTime() >= weekStart.getTime();
  });
  let memberGain = 0;
  for (const goal of active) {
    for (const metric of getActiveGoalMetrics(goal)) {
      if (/member/i.test(metric.label)) {
        memberGain += progressInDateRange(goal, weekStart, now, metric.id);
      }
    }
  }
  if (wins.length > 0 || memberGain > 0) {
    const parts: string[] = [];
    if (wins.length > 0) {
      parts.push(`recorded ${wins.length} win${wins.length === 1 ? "" : "s"}`);
    }
    if (memberGain > 0) {
      parts.push(`gained ${memberGain} new member${memberGain === 1 ? "" : "s"}`);
    }
    messages.push(
      sanitizeIntelligenceInsight(`You ${parts.join(" and ")}.`),
    );
  }

  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);
  for (const goal of active) {
    const primary = getPrimaryGoalMetric(goal);
    const monthDelta = progressInDateRange(goal, monthStart, now, primary.id);
    if (monthDelta > 0 && primary.targetValue > 0) {
      const pct = Math.round((monthDelta / primary.targetValue) * 100);
      if (pct >= 5) {
        messages.push(
          sanitizeIntelligenceInsight(
            `Your ${goal.statement.toLowerCase()} goal increased by ${pct}% this month.`,
          ),
        );
        break;
      }
    }
  }

  for (const goal of active) {
    const primary = getPrimaryGoalMetric(goal);
    const remaining = primary.targetValue - primary.currentValue;
    if (remaining > 0 && remaining <= 15 && /member/i.test(primary.label)) {
      messages.push(
        sanitizeIntelligenceInsight(
          `You're only ${remaining} members away from your next milestone.`,
        ),
      );
      break;
    }
  }

  if (messages.length === 0) {
    messages.push(
      sanitizeIntelligenceInsight(
        "Every small update counts — record progress when something moves forward.",
      ),
    );
  }

  return messages.slice(0, 3).map(sanitizeIntelligenceInsight);
}

export function formatInsightsExportHtml(
  goals: OutcomeGoal[],
  includes: OutcomeInsightsExportIncludes,
): string {
  const cards = buildOutcomeInsightsCards();
  const motivation = buildOutcomeMotivationMessages();
  const sections: string[] = [
    "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Outcome Goals Insights</title>",
    "<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;color:#1f1c19}",
    "h1{color:#1e4f4f}h2{margin-top:1.5rem;font-size:1rem;text-transform:uppercase;color:#6b635a}",
    ".card{border:1px solid #e7dfd4;border-radius:12px;padding:12px;margin:8px 0}",
    ".muted{color:#6b635a;font-size:0.9rem}</style></head><body>",
    "<h1>Outcome Goals™ Insights</h1>",
  ];

  if (includes.summary) {
    sections.push("<h2>Summary</h2>");
    for (const msg of motivation) {
      sections.push(`<p class='card'>${msg}</p>`);
    }
    for (const card of cards.slice(0, 8)) {
      sections.push(
        `<div class='card'><strong>${card.label}</strong><br>${card.value}${card.hint ? ` <span class='muted'>(${card.hint})</span>` : ""}</div>`,
      );
    }
  }

  if (includes.activity) {
    sections.push("<h2>Activity</h2>");
    for (const goal of goals) {
      const groups = groupActivityByDay(collectGoalActivityEntries(goal));
      if (groups.length === 0) continue;
      sections.push(`<h3>${goal.statement}</h3>`);
      for (const group of groups) {
        sections.push(`<p><strong>${group.label}</strong></p><ul>`);
        for (const entry of group.entries) {
          const note = entry.log.note ? ` — ${entry.log.note}` : "";
          sections.push(
            `<li>${entry.metricLabel}: ${entry.log.amount > 0 ? "+" : ""}${entry.log.amount}${note}</li>`,
          );
        }
        sections.push("</ul>");
      }
    }
  }

  if (includes.milestones) {
    sections.push("<h2>Milestones</h2><ul>");
    for (const goal of goals) {
      for (const entry of collectGoalActivityEntries(goal).filter(
        (e) => e.log.isMilestone,
      )) {
        sections.push(
          `<li>${goal.statement} · ${entry.metricLabel}: ${entry.log.note ?? "Milestone"}</li>`,
        );
      }
    }
    sections.push("</ul>");
  }

  sections.push("</body></html>");
  return sections.join("");
}

export function printOutcomeInsights(html: string): void {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export function downloadOutcomeInsightsCsv(goals: OutcomeGoal[]): void {
  if (typeof window === "undefined") return;
  const rows = ["Goal,Tracker,Amount,Note,Date,Milestone"];
  for (const goal of goals) {
    for (const entry of collectGoalActivityEntries(goal)) {
      const cols = [
        goal.statement,
        entry.metricLabel,
        String(entry.log.amount),
        entry.log.note ?? "",
        entry.log.loggedAt,
        entry.log.isMilestone ? "yes" : "no",
      ].map((c) => `"${c.replace(/"/g, '""')}"`);
      rows.push(cols.join(","));
    }
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "outcome-goals-activity.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadOutcomeInsightsHtml(html: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "outcome-goals-insights.html";
  a.click();
  URL.revokeObjectURL(url);
}
