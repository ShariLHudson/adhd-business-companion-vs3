import type { FounderEvent } from "@/lib/ecosystem/events";

import type { HealthMetricsBundle, HealthWarning } from "./types";

const MS_PER_DAY = 86_400_000;

function withinDays(ts: string, days: number, now: Date): boolean {
  return now.getTime() - new Date(ts).getTime() <= days * MS_PER_DAY;
}

function betweenDays(ts: string, min: number, max: number, now: Date): boolean {
  const age = now.getTime() - new Date(ts).getTime();
  return age > min * MS_PER_DAY && age <= max * MS_PER_DAY;
}

export function detectHealthWarnings(
  metrics: HealthMetricsBundle,
  events: FounderEvent[],
  now: Date = new Date(),
): HealthWarning[] {
  const warnings: HealthWarning[] = [];
  const week = events.filter((e) => withinDays(e.ts, 7, now));
  const prevWeek = events.filter((e) => betweenDays(e.ts, 7, 14, now));

  if (metrics.user.retentionTrend === "down") {
    warnings.push({
      id: "warn-retention",
      severity: "high",
      message: "User retention dropping",
      monitor: "Returning users vs active users week over week",
    });
  }

  const createAbandon =
    week.filter((e) => e.refs?.workspace === "create").length -
    week.filter((e) => e.type === "document.created").length;
  const prevAbandon =
    prevWeek.filter((e) => e.refs?.workspace === "create").length -
    prevWeek.filter((e) => e.type === "document.created").length;
  if (createAbandon > prevAbandon && createAbandon >= 2) {
    warnings.push({
      id: "warn-create-abandon",
      severity: "medium",
      message: "Create workflow abandonment increasing",
      monitor: "Create opens without document completion",
    });
  }

  const tbWeek = week.filter((e) => e.type === "timeblock.created").length;
  const tbPrev = prevWeek.filter((e) => e.type === "timeblock.created").length;
  if (tbPrev > 0 && tbWeek < tbPrev * 0.7) {
    warnings.push({
      id: "warn-timeblock",
      severity: "medium",
      message: "Time Block usage declining",
      monitor: "Time blocks created per week",
    });
  }

  const supportWeek = week.filter((e) => e.type === "painpoint.observed").length;
  const supportPrev = prevWeek.filter((e) => e.type === "painpoint.observed").length;
  if (supportWeek > supportPrev + 1) {
    warnings.push({
      id: "warn-support",
      severity: "high",
      message: "Support / friction requests increasing",
      monitor: "Pain point observations in coaching",
    });
  }

  const exportFails = week.filter(
    (e) =>
      e.type === "painpoint.observed" &&
      /export.*(fail|error)|google.*(fail|error)/i.test(String(e.data?.text ?? "")),
  ).length;
  if (exportFails >= 1) {
    warnings.push({
      id: "warn-google-export",
      severity: exportFails >= 2 ? "high" : "medium",
      message: "Google export failures rising",
      monitor: "Document export pain points",
    });
  }

  if (metrics.business.dataConnected && metrics.business.churnRate >= 8) {
    warnings.push({
      id: "warn-churn",
      severity: "high",
      message: "Churn rate elevated",
      monitor: "Paying user retention",
    });
  }

  return warnings;
}
