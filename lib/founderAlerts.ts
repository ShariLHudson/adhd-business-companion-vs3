/**
 * Founder Alerts — proactive surfacing of what needs founder attention.
 *
 * Philosophy: answer "what needs attention?" not "what happened?"
 * Batches non-critical items; escalates meaningful risks only.
 */

import { ecosystemEventTracker } from "./ecosystem/eventTrackingEngine";
import type { FounderWarning } from "./founderEarlyWarning";
import { buildEarlyWarnings } from "./founderEarlyWarning";
import {
  diagnoseWarning,
  buildFounderCopilotOutput,
  computeSeverityScore,
  priorityFromSeverity,
  type FounderPriorityItem,
  prioritizeFounderIssues,
} from "./founderCopilot";

export type FounderAlertLevel = "critical" | "high" | "medium" | "low";

export type FounderAlertTrend = "worsening" | "stable" | "improving" | "new";

export type FounderAlert = {
  id: string;
  level: FounderAlertLevel;
  issue: string;
  severity: FounderAlertLevel;
  impact: string;
  trend: FounderAlertTrend;
  confidencePercent: number;
  recommendation: string;
  consequenceIfIgnored?: string;
  filesToReview: string[];
  cursorPromptAvailable: boolean;
  warningId?: string;
  interventionId?: string;
  deltaPercent?: number;
  detectedAt: string;
  batched: boolean;
  batchLabel?: string;
};

export type FounderAlertBatch = {
  level: FounderAlertLevel;
  label: string;
  count: number;
  alerts: FounderAlert[];
};

export type FounderAlertsSummary = {
  evaluatedAt: string;
  critical: FounderAlert[];
  high: FounderAlert[];
  medium: FounderAlert[];
  low: FounderAlert[];
  batches: FounderAlertBatch[];
  topAlert: FounderAlert | null;
  totalActionable: number;
};

/** Future notification channel registration (email, SMS, Slack, etc.) */
export type FounderAlertChannel = "email" | "sms" | "push" | "slack" | "voice";

export type FounderAlertChannelHandler = (payload: {
  summary: FounderAlertsSummary;
  alerts: FounderAlert[];
  level: FounderAlertLevel;
}) => void | Promise<void>;

const channelRegistry = new Map<FounderAlertChannel, FounderAlertChannelHandler>();

export function registerFounderAlertChannel(
  channel: FounderAlertChannel,
  handler: FounderAlertChannelHandler,
): void {
  channelRegistry.set(channel, handler);
}

export function getRegisteredAlertChannels(): FounderAlertChannel[] {
  return [...channelRegistry.keys()];
}

export async function dispatchFounderAlerts(
  summary: FounderAlertsSummary,
  channels?: FounderAlertChannel[],
): Promise<void> {
  const targets = channels ?? getRegisteredAlertChannels();
  for (const channel of targets) {
    const handler = channelRegistry.get(channel);
    if (!handler) continue;
    const level: FounderAlertLevel =
      summary.critical.length > 0
        ? "critical"
        : summary.high.length > 0
          ? "high"
          : summary.medium.length > 0
            ? "medium"
            : "low";
    const alerts =
      level === "critical"
        ? summary.critical
        : level === "high"
          ? summary.high
          : level === "medium"
            ? summary.medium
            : summary.low;
    await handler({ summary, alerts, level });
  }
}

const DAY_MS = 86_400_000;

function warningToAlertLevel(warning: FounderWarning, severityScore: number): FounderAlertLevel {
  if (warning.category === "critical" || severityScore >= 80) return "critical";
  if (warning.category === "high" || severityScore >= 60) return "high";
  if (warning.category === "emerging" || warning.category === "medium" || severityScore >= 35) {
    return "medium";
  }
  return "low";
}

function trendFromWarning(warning: FounderWarning): FounderAlertTrend {
  if (warning.deltaPercent != null && warning.deltaPercent >= 15) return "worsening";
  if (warning.deltaPercent != null && warning.deltaPercent <= -10) return "improving";
  if (warning.category === "emerging") return "worsening";
  return "stable";
}

function impactSummary(warning: FounderWarning): string {
  const parts: string[] = [];
  if (warning.trustImpact >= 15) parts.push("trust");
  if (warning.confidenceImpact >= 15) parts.push("confidence");
  if (warning.retentionImpact >= 15) parts.push("retention");
  if (warning.businessImpact >= 10) parts.push("business outcomes");
  return parts.length
    ? `Affects ${parts.join(", ")}${warning.usersAffected ? ` · ~${warning.usersAffected} signal(s)` : ""}`
    : "Companion experience quality";
}

export function warningToFounderAlert(
  item: FounderPriorityItem,
  opts?: { batched?: boolean; batchLabel?: string },
): FounderAlert {
  const { warning, diagnosis, copilot, severityScore } = item;
  const level = warningToAlertLevel(warning, severityScore);
  return {
    id: `alert-${warning.id}`,
    level,
    issue: warning.title,
    severity: level,
    impact: impactSummary(warning),
    trend: trendFromWarning(warning),
    confidencePercent: diagnosis.confidencePercent,
    recommendation: copilot.recommendation,
    consequenceIfIgnored: diagnosis.consequenceOfInaction,
    filesToReview: copilot.filesToReview,
    cursorPromptAvailable: true,
    warningId: warning.id,
    interventionId: warning.interventionId,
    deltaPercent: warning.deltaPercent,
    detectedAt: warning.detectedAt,
    batched: opts?.batched ?? false,
    batchLabel: opts?.batchLabel,
  };
}

function buildCriticalInfrastructureAlerts(): FounderAlert[] {
  const alerts: FounderAlert[] = [];
  const recent = ecosystemEventTracker.query({ limit: 200 }).filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < DAY_MS,
  );

  const cancelled = recent.filter((e) => e.eventType === "user.cancelled").length;
  if (cancelled >= 1) {
    alerts.push({
      id: `alert-critical-cancellation-${Date.now()}`,
      level: "critical",
      issue: "User cancellation detected",
      severity: "critical",
      impact: "Affects retention and revenue",
      trend: "new",
      confidencePercent: 90,
      recommendation: "Review cancellation context and reach out if appropriate.",
      consequenceIfIgnored: "Churn may compound without understanding root cause.",
      filesToReview: ["lib/ecosystem/eventTrackingEngine.ts", "lib/founderIntelligence.ts"],
      cursorPromptAvailable: true,
      detectedAt: new Date().toISOString(),
      batched: false,
    });
  }

  const failurePatterns = [
    { pattern: /fail|error|crash/i, label: "System error signal" },
    { pattern: /payment|billing/i, label: "Payment or billing signal" },
    { pattern: /login|signup|auth/i, label: "Authentication signal" },
  ];
  for (const { pattern, label } of failurePatterns) {
    const hits = recent.filter((e) => pattern.test(String(e.eventType)));
    if (hits.length >= 2) {
      alerts.push({
        id: `alert-critical-${label.replace(/\s/g, "-").toLowerCase()}`,
        level: "critical",
        issue: `${label} — ${hits.length} events in 24h`,
        severity: "critical",
        impact: "Affects trust and platform reliability",
        trend: "worsening",
        confidencePercent: 75,
        recommendation: `Investigate ${label.toLowerCase()} events in ecosystem logs.`,
        filesToReview: ["lib/ecosystem/eventTrackingEngine.ts"],
        cursorPromptAvailable: true,
        detectedAt: new Date().toISOString(),
        batched: false,
      });
    }
  }

  return alerts;
}

export function rankAlertsBySeverity(alerts: FounderAlert[]): FounderAlert[] {
  const order: Record<FounderAlertLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...alerts].sort((a, b) => {
    const levelDiff = order[a.level] - order[b.level];
    if (levelDiff !== 0) return levelDiff;
    return b.confidencePercent - a.confidencePercent;
  });
}

/** Batch medium/low alerts to avoid overwhelming the founder. */
export function batchNonCriticalAlerts(alerts: FounderAlert[]): FounderAlertBatch[] {
  const batches: FounderAlertBatch[] = [];
  for (const level of ["medium", "low"] as const) {
    const grouped = alerts.filter((a) => a.level === level);
    if (grouped.length === 0) continue;
    const batched = grouped.map((a) => ({
      ...a,
      batched: true,
      batchLabel: `${grouped.length} ${level} insight(s)`,
    }));
    batches.push({
      level,
      label:
        level === "medium"
          ? `Weekly review (${grouped.length})`
          : `Monthly insights (${grouped.length})`,
      count: grouped.length,
      alerts: batched,
    });
  }
  return batches;
}

export function buildFounderAlerts(
  warnings = buildEarlyWarnings(),
): FounderAlertsSummary {
  const priorities = prioritizeFounderIssues(warnings);
  const warningAlerts = priorities.map((item) => warningToFounderAlert(item));
  const infraAlerts = buildCriticalInfrastructureAlerts();
  const all = rankAlertsBySeverity([...infraAlerts, ...warningAlerts]);

  const critical = all.filter((a) => a.level === "critical");
  const high = all.filter((a) => a.level === "high");
  const medium = all.filter((a) => a.level === "medium");
  const low = all.filter((a) => a.level === "low");
  const batches = batchNonCriticalAlerts([...medium, ...low]);

  return {
    evaluatedAt: new Date().toISOString(),
    critical,
    high,
    medium,
    low,
    batches,
    topAlert: all[0] ?? null,
    totalActionable: critical.length + high.length + Math.min(medium.length, 5),
  };
}

export function alertFromWarning(warning: FounderWarning): FounderAlert {
  const diagnosis = diagnoseWarning(warning);
  const copilot = buildFounderCopilotOutput(warning, diagnosis);
  const severityScore = computeSeverityScore(warning);
  const item: FounderPriorityItem = {
    warning,
    diagnosis,
    severityScore,
    priority: priorityFromSeverity(severityScore),
    copilot,
  };
  return warningToFounderAlert(item);
}
