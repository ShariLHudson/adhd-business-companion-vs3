import { jsPDF } from "jspdf";

import type { ExperimentMetricsReport } from "./types";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportExperimentMetricsCsv(report: ExperimentMetricsReport): void {
  const lines: string[] = [
    "Founder Experiment Metrics Export",
    `Generated,${report.generatedAt}`,
    `Timeframe,${report.filters.timeframe}`,
    "",
    "Aggregate,Value",
    `Total experiments,${report.aggregate.total}`,
    `Success rate,${report.aggregate.successRate}%`,
    `Avg completion,${report.aggregate.avgCompletionRate}%`,
    `API tokens,${report.aggregate.totalApiTokens}`,
    `Est. cost USD,${report.aggregate.totalEstimatedCostUsd}`,
    "",
    "Experiment,Status,Project,Completion%,Tasks,Time(min),Tokens,Cost,Insights",
    ...report.experiments.map(
      (e) =>
        [
          csvEscape(e.title),
          csvEscape(e.status),
          csvEscape(e.relatedProjectTitle ?? ""),
          e.completionRate,
          `${e.tasksCompleted}/${e.taskCount}`,
          e.timeInvestedMinutes,
          e.apiTokens,
          e.estimatedCostUsd,
          e.insightsFlagged,
        ].join(","),
    ),
    "",
    "Alerts",
    ...report.alerts.map((a) => `${csvEscape(a.severity)},${csvEscape(a.message)}`),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `experiment-metrics-${report.generatedAt.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportExperimentMetricsPdf(report: ExperimentMetricsReport): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;
  const line = (text: string, size = 11) => {
    doc.setFontSize(size);
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    const chunks = doc.splitTextToSize(text, 520) as string[];
    for (const chunk of chunks) {
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
      doc.text(chunk, margin, y);
      y += size + 4;
    }
  };

  line("Experiment Metrics Summary", 16);
  line(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  line(`Experiments: ${report.aggregate.total} | Success: ${report.aggregate.successRate}%`);
  y += 8;

  if (report.alerts.length) {
    line("Alerts", 13);
    for (const a of report.alerts.slice(0, 8)) {
      line(`• [${a.severity}] ${a.message}`, 10);
    }
    y += 8;
  }

  line("Experiments", 13);
  for (const e of report.experiments.slice(0, 20)) {
    line(
      `• ${e.title} — ${e.completionRate}% complete, ${e.tasksCompleted}/${e.taskCount} tasks, ${e.timeInvestedMinutes}m, ${e.insightsFlagged} insights`,
      10,
    );
  }

  doc.save(`experiment-metrics-${report.generatedAt.slice(0, 10)}.pdf`);
}
