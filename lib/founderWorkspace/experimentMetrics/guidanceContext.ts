import type { ExperimentMetricsReport } from "./types";

export function formatExperimentMetricsForGuidance(
  report: ExperimentMetricsReport,
): string {
  const a = report.aggregate;
  const lines = [
    "EXPERIMENT METRICS (founder-only — do not expose to users):",
    "",
    `Filters: timeframe=${report.filters.timeframe}, project=${report.filters.projectId ?? "all"}, status=${report.filters.status}, tag=${report.filters.tag ?? "all"}`,
    `Last updated: ${report.generatedAt}`,
    "",
    "AGGREGATE:",
    `- ${a.total} experiments | ${a.successful} successful | ${a.failed} failed | ${a.inProgress} in progress`,
    `- Avg completion rate: ${a.avgCompletionRate}% | Success rate: ${a.successRate}%`,
    `- API: ${a.totalApiCalls} calls, ~${a.totalApiTokens.toLocaleString()} tokens, ~$${a.totalEstimatedCostUsd.toFixed(3)} est. cost`,
    `- Time invested: ~${a.totalTimeInvestedMinutes} minutes`,
    "",
  ];

  if (report.alerts.length) {
    lines.push("METRIC ALERTS:");
    for (const alert of report.alerts) {
      lines.push(`- [${alert.severity}] ${alert.message} [${alert.experimentId}]`);
    }
    lines.push("");
  }

  if (report.anomalies.length) {
    lines.push("ANOMALIES / TRENDS:");
    for (const n of report.anomalies) lines.push(`- ${n}`);
    lines.push("");
  }

  lines.push("SUGGESTED KPIs FOR NEW EXPERIMENTS (advisory only):");
  for (const k of report.suggestedKpis) lines.push(`- ${k}`);
  lines.push("");

  const topByCompletion = [...report.experiments]
    .sort((x, y) => y.completionRate - x.completionRate)
    .slice(0, 5);
  if (topByCompletion.length) {
    lines.push("TOP BY COMPLETION RATE:");
    for (const e of topByCompletion) {
      lines.push(
        `- ${e.title} [${e.id}]: ${e.completionRate}% | tasks ${e.tasksCompleted}/${e.taskCount} | ${e.insightsFlagged} insights flagged | ${e.apiTokens} tokens`,
      );
    }
    lines.push("");
  }

  if (report.experiments.length) {
    lines.push("PER-EXPERIMENT METRICS:");
    for (const e of report.experiments.slice(0, 15)) {
      lines.push(
        `- ${e.title} [${e.id}] | ${e.status} | ${e.completionRate}% complete | tasks ${e.tasksCompleted}/${e.taskCount} | ${e.timeInvestedMinutes} min | ${e.apiCalls} API calls, ${e.apiTokens} tokens (~$${e.estimatedCostUsd}) | ${e.insightsFlagged} insights${e.relatedProjectTitle ? ` | project: ${e.relatedProjectTitle}` : ""}${e.bottleneck ? ` | bottleneck: ${e.bottleneck}` : ""}`,
      );
      if (e.customKpis.length) {
        lines.push(
          `  Custom KPIs: ${e.customKpis.map((k) => `${k.label}=${k.value}${k.unit ?? ""}`).join(", ")}`,
        );
      }
      if (e.googleDocLinks.length) {
        lines.push(
          `  Google/saved refs: ${e.googleDocLinks.map((l) => l.label).join(", ")}`,
        );
      }
    }
    lines.push("");
  }

  if (report.bottlenecks.length) {
    lines.push("BOTTLENECKS:");
    for (const b of report.bottlenecks) lines.push(`- ${b}`);
    lines.push("");
  }

  if (report.pendingActions.length) {
    lines.push("PENDING ACTIONS:");
    for (const p of report.pendingActions) {
      lines.push(`- ${p.experimentTitle} [${p.experimentId}]: ${p.action}`);
    }
    lines.push("");
  }

  if (report.recommendations.length) {
    lines.push("SUGGESTED NEXT EXPERIMENTS (advisory only — do not auto-create or change metrics):");
    for (const r of report.recommendations) {
      lines.push(`- [${r.priority}] ${r.title}: ${r.rationale}`);
    }
  }

  return lines.join("\n");
}
