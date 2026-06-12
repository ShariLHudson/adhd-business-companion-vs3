import type { ProductIntelligenceReport } from "../productIntelligence/types";
import type {
  HealthDimensionScore,
  HealthMetricsBundle,
  HealthWarning,
  WeeklyHealthReport,
} from "./types";

export function generateWeeklyHealthReport(input: {
  metrics: HealthMetricsBundle;
  scores: {
    user: HealthDimensionScore;
    product: HealthDimensionScore;
    engagement: HealthDimensionScore;
    revenue: HealthDimensionScore;
    system: HealthDimensionScore;
  };
  warnings: HealthWarning[];
  productReport: ProductIntelligenceReport;
  now?: Date;
}): WeeklyHealthReport {
  const now = input.now ?? new Date();
  const weekEnd = now.toISOString();
  const weekStart = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  const wins: string[] = [];
  if (input.scores.engagement.level === "healthy") {
    wins.push(input.scores.engagement.detail);
  }
  if (input.metrics.user.retentionTrend === "up") {
    wins.push("User retention improving");
  }
  if (input.metrics.engagement.focusSessions > 0) {
    wins.push(`${input.metrics.engagement.focusSessions} focus sessions completed`);
  }
  if (input.productReport.mostLovedFeatures[0]) {
    wins.push(`Users love: ${input.productReport.mostLovedFeatures[0].feature}`);
  }
  if (!wins.length) {
    wins.push("Keep collecting signals — wins appear as usage grows.");
  }

  const risks = input.warnings.map((w) => w.message);
  if (!risks.length && input.scores.product.level !== "healthy") {
    risks.push(input.scores.product.detail);
  }

  const opportunities = input.productReport.opportunities
    .slice(0, 3)
    .map((o) => o.title);
  if (!opportunities.length) {
    opportunities.push("Review top frustrations for improvement ideas.");
  }

  const recommendations: string[] = [];
  const attention = (
    [
      ["user", input.scores.user],
      ["product", input.scores.product],
      ["engagement", input.scores.engagement],
      ["revenue", input.scores.revenue],
      ["system", input.scores.system],
    ] as const
  ).filter(([, s]) => s.level !== "healthy");

  for (const [, score] of attention.slice(0, 2)) {
    recommendations.push(score.detail);
  }
  if (input.warnings[0]) {
    recommendations.push(`Monitor: ${input.warnings[0].monitor}`);
  }
  if (!recommendations.length) {
    recommendations.push("Stay the course — focus on one high-impact improvement.");
  }

  const summary = `${wins[0] ?? "Steady week"} · ${risks.length} risk${risks.length === 1 ? "" : "s"} · ${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"}`;

  return {
    weekStart,
    weekEnd,
    wins: wins.slice(0, 4),
    risks: risks.slice(0, 4),
    opportunities: opportunities.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    summary,
  };
}
