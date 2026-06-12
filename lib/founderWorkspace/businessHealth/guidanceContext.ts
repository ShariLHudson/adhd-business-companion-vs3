import type { BusinessHealthReport } from "./types";
import { HEALTH_LABELS } from "./types";

export function formatBusinessHealthForGuidance(
  report: BusinessHealthReport,
): string {
  const lines = [
    "BUSINESS HEALTH (founder-only — simple signals, not raw analytics):",
    "",
    `Overall: ${HEALTH_LABELS[report.overall]} — ${report.overallHeadline}`,
    "",
    `User health: ${report.user.headline} — ${report.user.detail}`,
    `Product health: ${report.product.headline} — ${report.product.detail}`,
    `Engagement health: ${report.engagement.headline} — ${report.engagement.detail}`,
    `Revenue health: ${report.revenue.headline} — ${report.revenue.detail}`,
    `System health: ${report.system.headline} — ${report.system.detail}`,
    "",
    `Active users (7d): ${report.metrics.user.activeUsers} | Returning: ${report.metrics.user.returningUsers} | Retention: ${report.metrics.user.retentionRate}%`,
    "",
  ];

  if (report.warnings.length) {
    lines.push("EARLY WARNINGS:");
    for (const w of report.warnings) {
      lines.push(`- [${w.severity}] ${w.message} — monitor ${w.monitor}`);
    }
    lines.push("");
  }

  lines.push("WEEKLY HEALTH REPORT:");
  lines.push(report.weeklyReport.summary);
  lines.push("Wins:", ...report.weeklyReport.wins.map((w) => `- ${w}`));
  lines.push("Risks:", ...report.weeklyReport.risks.map((r) => `- ${r}`));
  lines.push(
    "Recommendations:",
    ...report.weeklyReport.recommendations.map((r) => `- ${r}`),
  );

  return lines.join("\n");
}
