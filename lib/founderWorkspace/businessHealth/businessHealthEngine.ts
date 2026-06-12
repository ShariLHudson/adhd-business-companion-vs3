import type { FounderEvent } from "@/lib/ecosystem/events";

import type { ProductIntelligenceReport } from "../productIntelligence/types";
import type { BusinessMetricsSnapshot } from "./businessSnapshot";
import type {
  BusinessHealthMetrics,
  BusinessHealthReport,
  EngagementHealthMetrics,
  ProductHealthMetrics,
  SystemHealthMetrics,
  UserHealthMetrics,
} from "./types";
import { scoreBusinessHealth } from "./healthScoringEngine";
import { detectHealthWarnings } from "./warningEngine";
import { generateWeeklyHealthReport } from "./weeklyHealthReport";

const MS_PER_DAY = 86_400_000;

function withinDays(ts: string, days: number, now: Date): boolean {
  return now.getTime() - new Date(ts).getTime() <= days * MS_PER_DAY;
}

function betweenDays(ts: string, min: number, max: number, now: Date): boolean {
  const age = now.getTime() - new Date(ts).getTime();
  return age > min * MS_PER_DAY && age <= max * MS_PER_DAY;
}

function countType(events: FounderEvent[], type: string): number {
  return events.filter((e) => e.type === type).length;
}

function uniqueUsers(events: FounderEvent[]): Set<string> {
  return new Set(events.map((e) => e.founderId));
}

function activeDaysForUser(events: FounderEvent[], userId: string): Set<string> {
  const days = new Set<string>();
  for (const e of events) {
    if (e.founderId === userId) days.add(e.ts.slice(0, 10));
  }
  return days;
}

export function computeUserHealth(
  events: FounderEvent[],
  now: Date = new Date(),
): UserHealthMetrics {
  const week = events.filter((e) => withinDays(e.ts, 7, now));
  const prevWeek = events.filter((e) => betweenDays(e.ts, 7, 14, now));

  const activeUsers = uniqueUsers(week).size;
  const prevActive = uniqueUsers(prevWeek).size;

  const firstSeen = new Map<string, string>();
  for (const e of events) {
    const prev = firstSeen.get(e.founderId);
    if (!prev || e.ts < prev) firstSeen.set(e.founderId, e.ts);
  }

  const newUsers = [...firstSeen.entries()].filter(([, ts]) =>
    withinDays(ts, 7, now),
  ).length;

  let returningUsers = 0;
  for (const userId of uniqueUsers(week)) {
    const days = activeDaysForUser(week, userId);
    const historicalDays = activeDaysForUser(events, userId);
    if (days.size >= 1 && historicalDays.size >= 2) returningUsers += 1;
  }

  const retentionRate =
    activeUsers > 0 ? Math.round((returningUsers / activeUsers) * 100) : 0;

  let retentionTrend: UserHealthMetrics["retentionTrend"] = "stable";
  const prevReturning = [...uniqueUsers(prevWeek)].filter(
    (id) => activeDaysForUser(prevWeek, id).size >= 1,
  ).length;
  const prevRetention =
    prevActive > 0 ? (prevReturning / prevActive) * 100 : retentionRate;
  if (retentionRate > prevRetention + 5) retentionTrend = "up";
  else if (retentionRate < prevRetention - 5) retentionTrend = "down";

  return {
    newUsers,
    activeUsers,
    returningUsers,
    retentionRate,
    retentionTrend,
  };
}

function workspaceUsage(events: FounderEvent[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "workspace.opened") continue;
    const ws =
      (typeof e.refs?.workspace === "string" && e.refs.workspace) || "unknown";
    map.set(ws, (map.get(ws) ?? 0) + 1);
  }
  return map;
}

export function computeProductHealth(
  events: FounderEvent[],
  productReport: ProductIntelligenceReport,
  now: Date = new Date(),
): ProductHealthMetrics {
  const week = events.filter((e) => withinDays(e.ts, 7, now));
  const usage = workspaceUsage(week);
  const sorted = [...usage.entries()].sort((a, b) => b[1] - a[1]);

  const errorSignals = week.filter(
    (e) =>
      e.type === "painpoint.observed" &&
      /\b(error|broken|fail|crash|bug)\b/i.test(String(e.data?.text ?? "")),
  ).length;

  const createOpens = countType(week, "workspace.opened");
  const docsCreated = countType(week, "document.created");
  const abandonedWorkflows = Math.max(0, createOpens - docsCreated);

  return {
    topFeature: sorted[0]?.[0] ?? null,
    leastUsedFeature: sorted[sorted.length - 1]?.[0] ?? null,
    errorSignals,
    abandonedWorkflows,
    topFriction: productReport.topFrustrations[0]?.text ?? null,
  };
}

export function computeEngagementHealth(
  events: FounderEvent[],
  now: Date = new Date(),
): EngagementHealthMetrics {
  const week = events.filter((e) => withinDays(e.ts, 7, now));
  const prevWeek = events.filter((e) => betweenDays(e.ts, 7, 14, now));

  const score = (list: FounderEvent[]) =>
    countType(list, "focus.completed") * 3 +
    countType(list, "timeblock.completed") * 2 +
    countType(list, "project.created") * 4 +
    countType(list, "document.created") * 3 +
    list.filter(
      (e) =>
        e.type === "action.completed" || e.type === "assisted_action.accepted",
    ).length * 2;

  const current = score(week);
  const previous = score(prevWeek);

  let trend: EngagementHealthMetrics["trend"] = "stable";
  if (current > previous * 1.1) trend = "up";
  else if (current < previous * 0.75) trend = "down";

  return {
    focusSessions: countType(week, "focus.completed"),
    timeBlocks: countType(week, "timeblock.created"),
    projectsCreated: countType(week, "project.created"),
    documentsCreated: countType(week, "document.created"),
    recommendationsAccepted: week.filter(
      (e) =>
        e.type === "action.completed" || e.type === "assisted_action.accepted",
    ).length,
    trend,
  };
}

export function computeBusinessMetrics(
  snapshot: BusinessMetricsSnapshot,
): BusinessHealthMetrics {
  const dataConnected =
    snapshot.source !== "placeholder" &&
    (snapshot.payingUsers > 0 || snapshot.trialUsers > 0);

  return {
    payingUsers: snapshot.payingUsers,
    trialUsers: snapshot.trialUsers,
    conversions: snapshot.conversions,
    churnRate: snapshot.churnRate,
    dataConnected,
    revenueTrend: dataConnected
      ? snapshot.churnRate > 8
        ? "down"
        : snapshot.conversions > 0
          ? "up"
          : "stable"
      : "unknown",
  };
}

export function computeSystemHealth(
  events: FounderEvent[],
  businessSnapshot: BusinessMetricsSnapshot,
  now: Date = new Date(),
): SystemHealthMetrics {
  const week = events.filter((e) => withinDays(e.ts, 7, now));

  const googleFriction = week.some(
    (e) =>
      e.type === "painpoint.observed" &&
      /google|export|doc/i.test(String(e.data?.text ?? "")),
  );
  const aiFriction = week.some(
    (e) =>
      e.type === "painpoint.observed" &&
      /openai|claude|api|model/i.test(String(e.data?.text ?? "")),
  );

  const exportFailures = week.filter(
    (e) =>
      e.type === "painpoint.observed" &&
      /export.*(fail|error)|google.*(fail|error)/i.test(String(e.data?.text ?? "")),
  ).length;

  const level = (bad: boolean, warn: boolean): SystemHealthMetrics["openAiStatus"] => {
    if (bad) return "at_risk";
    if (warn) return "needs_attention";
    return "healthy";
  };

  return {
    openAiStatus: level(aiFriction, false),
    claudeStatus: level(aiFriction, false),
    googleIntegration: level(exportFailures >= 2, googleFriction),
    ghlIntegration: level(
      false,
      businessSnapshot.source === "placeholder",
    ),
    errorLogCount: week.filter(
      (e) =>
        e.type === "painpoint.observed" &&
        /\b(error|fail|broken)\b/i.test(String(e.data?.text ?? "")),
    ).length,
  };
}

export type BusinessHealthInput = {
  events: FounderEvent[];
  productReport: ProductIntelligenceReport;
  businessSnapshot?: BusinessMetricsSnapshot;
  now?: Date;
};

export function buildBusinessHealthReport(
  input: BusinessHealthInput,
): BusinessHealthReport {
  const now = input.now ?? new Date();
  const snapshot = input.businessSnapshot ?? {
    payingUsers: 0,
    trialUsers: 0,
    conversions: 0,
    churnRate: 0,
    updatedAt: now.toISOString(),
    source: "placeholder" as const,
  };

  const metrics = {
    user: computeUserHealth(input.events, now),
    product: computeProductHealth(input.events, input.productReport, now),
    engagement: computeEngagementHealth(input.events, now),
    business: computeBusinessMetrics(snapshot),
    system: computeSystemHealth(input.events, snapshot, now),
  };

  const scores = scoreBusinessHealth(metrics, input.productReport);
  const warnings = detectHealthWarnings(metrics, input.events, now);
  const weeklyReport = generateWeeklyHealthReport({
    metrics,
    scores,
    warnings,
    productReport: input.productReport,
    now,
  });

  const levels = [
    scores.user.level,
    scores.product.level,
    scores.engagement.level,
    scores.revenue.level,
    scores.system.level,
  ];
  const overall: typeof scores.user.level = levels.includes("at_risk")
    ? "at_risk"
    : levels.includes("needs_attention")
      ? "needs_attention"
      : "healthy";

  const overallHeadline =
    overall === "healthy"
      ? "Business is moving forward — keep momentum."
      : overall === "at_risk"
        ? "A few areas need urgent attention this week."
        : "Mostly on track — watch the flagged areas.";

  return {
    generatedAt: now.toISOString(),
    overall,
    overallHeadline,
    user: scores.user,
    product: scores.product,
    engagement: scores.engagement,
    revenue: scores.revenue,
    system: scores.system,
    warnings,
    weeklyReport,
    metrics,
  };
}
