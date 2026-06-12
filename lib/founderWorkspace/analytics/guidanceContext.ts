import type { FounderAnalyticsReport } from "./types";

export function formatAnalyticsForGuidance(report: FounderAnalyticsReport): string {
  const s = report.summary;
  const lines = [
    "FOUNDER ANALYTICS DASHBOARD (private metrics):",
    "",
    `Timeframe: ${report.filters.timeframe}`,
    `Project filter: ${report.filters.projectId ?? "all"}`,
    `Workspace filter: ${report.filters.workspace ?? "all"}`,
    "",
    "SUMMARY:",
    `- Projects completed: ${s.projectsCompleted} / ${s.projectsTotal} (${s.completionRate}% completion rate)`,
    `- Experiments: ${s.experimentsSuccessful} successful, ${s.experimentsFailed} failed`,
    `- Retest queue: ${s.retestPending} pending, ${s.retestFailed} failed`,
    `- API: ${s.apiCalls} calls, ~${s.apiTokens.toLocaleString()} estimated tokens`,
    `- Focus minutes: ${s.focusMinutes}`,
    `- Google exports: ${s.googleExports}`,
    `- Templates saved: ${s.templateCount}, Snippets saved: ${s.snippetCount}`,
    "",
    "KPIs:",
    ...report.kpis.map((k) => `- ${k.label}: ${k.value}${k.sublabel ? ` (${k.sublabel})` : ""}`),
    "",
  ];

  if (report.experimentOutcomes.length) {
    lines.push("EXPERIMENT OUTCOMES:");
    for (const b of report.experimentOutcomes) {
      lines.push(`- ${b.label}: ${b.value}`);
    }
    lines.push("");
  }

  if (report.workspaceUsage.length) {
    lines.push("WORKSPACE USAGE (opens):");
    for (const w of report.workspaceUsage) {
      lines.push(`- ${w.label}: ${w.value}`);
    }
    lines.push("");
  }

  if (report.alerts.length) {
    lines.push("ALERTS:");
    for (const a of report.alerts) {
      lines.push(`- [${a.severity}] ${a.message}`);
    }
    lines.push("");
  }

  if (report.projectProgress.length) {
    lines.push("PROJECT PROGRESS:");
    for (const p of report.projectProgress.slice(0, 10)) {
      lines.push(
        `- ${p.title} [${p.projectId}]: ${p.percentComplete}% complete, ${p.velocityPerWeek} tasks/week${p.behindSchedule ? " — BEHIND SCHEDULE" : ""}${p.upcomingDeadline ? `, deadline ${p.upcomingDeadline}` : ""}`,
      );
    }
    lines.push("");
  }

  const failedExps = report.experimentInsights.filter((e) => e.success === false);
  if (failedExps.length) {
    lines.push("FAILED EXPERIMENTS (this period):");
    for (const e of failedExps) {
      lines.push(`- ${e.title} [${e.id}] ended ${e.endDate ?? "unknown"}`);
    }
    lines.push("");
  }

  if (report.experimentInsights.length) {
    lines.push("EXPERIMENTS (status, dates):");
    for (const e of report.experimentInsights.slice(0, 12)) {
      lines.push(
        `- ${e.title} | ${e.status} | start ${e.startDate.slice(0, 10)}${e.endDate ? ` | end ${e.endDate.slice(0, 10)}` : ""}`,
      );
    }
    lines.push("");
  }

  if (report.recentActivity.length) {
    lines.push("RECENT ACTIVITY:");
    for (const a of report.recentActivity.slice(0, 10)) {
      lines.push(`- ${a.title} (${a.kind}) ${a.detail ?? ""}`);
    }
  }

  return lines.join("\n");
}
