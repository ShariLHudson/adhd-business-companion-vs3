import { jsPDF } from "jspdf";

import type { FounderAnalyticsReport } from "./types";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportAnalyticsCsv(report: FounderAnalyticsReport): void {
  const lines: string[] = [
    "Founder Analytics Export",
    `Generated,${report.generatedAt}`,
    `Timeframe,${report.filters.timeframe}`,
    "",
    "KPI,Value,Sublabel",
    ...report.kpis.map(
      (k) => `${csvEscape(k.label)},${csvEscape(k.value)},${csvEscape(k.sublabel ?? "")}`,
    ),
    "",
    "Activity,Timestamp,Title,Detail",
    ...report.recentActivity.map(
      (a) =>
        `${csvEscape(a.kind)},${csvEscape(a.ts)},${csvEscape(a.title)},${csvEscape(a.detail ?? "")}`,
    ),
    "",
    "API Endpoint,Model,Tokens,Timestamp",
    ...report.drillDownLists.apiUsage.map(
      (r) =>
        `${csvEscape(r.endpoint)},${csvEscape(r.model)},${r.totalTokens},${csvEscape(r.ts)}`,
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `founder-analytics-${report.generatedAt.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAnalyticsPdf(report: FounderAnalyticsReport): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;
  const line = (text: string, size = 11) => {
    doc.setFontSize(size);
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    doc.text(text, margin, y);
    y += size + 6;
  };

  line("Founder Analytics Summary", 16);
  line(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  line(`Timeframe: ${report.filters.timeframe}`);
  y += 8;

  line("Key metrics", 13);
  for (const k of report.kpis) {
    line(`${k.label}: ${k.value}${k.sublabel ? ` (${k.sublabel})` : ""}`);
  }
  y += 8;

  line("Recent activity", 13);
  for (const a of report.recentActivity.slice(0, 12)) {
    line(`• ${a.title} — ${a.detail ?? a.kind} (${new Date(a.ts).toLocaleString()})`, 10);
  }

  doc.save(`founder-analytics-${report.generatedAt.slice(0, 10)}.pdf`);
}
