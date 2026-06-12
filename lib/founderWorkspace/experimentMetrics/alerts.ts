import type { ExperimentCustomKpi } from "./kpiStore";
import type { ExperimentMetricAlert, ExperimentMetricRow } from "./types";

export function buildExperimentMetricAlerts(
  experiments: ExperimentMetricRow[],
  customKpis: ExperimentCustomKpi[],
): ExperimentMetricAlert[] {
  const alerts: ExperimentMetricAlert[] = [];

  for (const e of experiments) {
    if (e.completionRate < 30 && e.status === "testing") {
      alerts.push({
        id: `low-completion-${e.id}`,
        severity: "medium",
        experimentId: e.id,
        experimentTitle: e.title,
        message: `${e.title}: completion below 30% while testing`,
        category: "completion",
      });
    }

    if (e.apiTokens >= 5000) {
      alerts.push({
        id: `api-high-${e.id}`,
        severity: "high",
        experimentId: e.id,
        experimentTitle: e.title,
        message: `${e.title}: high API usage (${e.apiTokens.toLocaleString()} tokens)`,
        category: "api",
      });
    }

    if (e.projectDelayed) {
      alerts.push({
        id: `project-delay-${e.id}`,
        severity: "high",
        experimentId: e.id,
        experimentTitle: e.title,
        message: `Linked project delayed for ${e.title}`,
        category: "project",
      });
    }

    if (e.insightsFlagged >= 2) {
      alerts.push({
        id: `insights-${e.id}`,
        severity: "medium",
        experimentId: e.id,
        experimentTitle: e.title,
        message: `${e.title}: ${e.insightsFlagged} insights flagged — review bottlenecks`,
        category: "insight",
      });
    }
  }

  for (const k of customKpis) {
    if (k.threshold !== undefined && k.value > k.threshold) {
      const exp = experiments.find((e) => e.id === k.experimentId);
      alerts.push({
        id: `kpi-${k.id}`,
        severity: "high",
        experimentId: k.experimentId,
        experimentTitle: exp?.title ?? k.experimentId,
        message: `KPI "${k.label}" exceeded threshold (${k.value}${k.unit ?? ""} > ${k.threshold})`,
        category: "kpi",
      });
    }
  }

  return alerts.slice(0, 12);
}

export function detectAnomalies(experiments: ExperimentMetricRow[]): string[] {
  const notes: string[] = [];
  if (!experiments.length) return notes;

  const avgTokens =
    experiments.reduce((s, e) => s + e.apiTokens, 0) / experiments.length;
  const tokenOutliers = experiments.filter(
    (e) => e.apiTokens > avgTokens * 2 && e.apiTokens > 1000,
  );
  if (tokenOutliers.length) {
    notes.push(
      `Unusual API usage on ${tokenOutliers.map((e) => e.title).join(", ")} (${Math.round(avgTokens)} avg tokens).`,
    );
  }

  const fastFails = experiments.filter(
    (e) => e.success === false && e.durationDays <= 2,
  );
  if (fastFails.length >= 2) {
    notes.push(
      `${fastFails.length} experiments failed within 2 days — check hypothesis quality.`,
    );
  }

  const highCompletionLowSuccess = experiments.filter(
    (e) => e.completionRate >= 80 && e.success === false,
  );
  if (highCompletionLowSuccess.length) {
    notes.push(
      `${highCompletionLowSuccess[0]?.title} reached high completion but failed — outcome metrics may differ from task progress.`,
    );
  }

  return notes.slice(0, 5);
}
