// User Health Intelligence — engagement & retention signals (no conversation text).

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";

import type { EcosystemTrackEventType } from "./eventTrackingEngine";

export type UserHealthStatus =
  | "healthy"
  | "needs_attention"
  | "at_risk"
  | "critical";

export const USER_HEALTH_STATUSES: UserHealthStatus[] = [
  "healthy",
  "needs_attention",
  "at_risk",
  "critical",
];

export type UserHealthRecord = {
  userId: string;
  lastActivityAt: string;
  lastLoginAt?: string;
  loginCount: number;
  featureUsageCount: number;
  companionUsageCount: number;
  sessionCount: number;
  cancelledAt?: string;
  recoveredAt?: string;
  healthScore: number;
  healthStatus: UserHealthStatus;
  daysSinceLastActivity: number;
  updatedAt: string;
};

/** GHL-ready contact fields (future integration). */
export type GhlUserHealthContactFields = {
  userHealthScore: number;
  userHealthStatus: UserHealthStatus;
  lastActivityDate: string;
  daysInactive: number;
};

export type UserHealthDashboardMetrics = {
  activeUsers: number;
  inactive7Days: number;
  inactive14Days: number;
  inactive30Days: number;
  recoveredUsers: number;
  atRiskUsers: number;
  criticalUsers: number;
  cancelledUsers: number;
};

export type UserHealthAtRiskRef = {
  userRef: string;
  daysSinceLastActivity: number;
  healthScore: number;
  healthStatus: UserHealthStatus;
  loginFrequency: number;
  featureUsageFrequency: number;
  companionUsage: number;
  sessionFrequency: number;
};

export type FounderUserHealthInputs = {
  topAtRiskUsers: UserHealthAtRiskRef[];
  retentionTrend: "up" | "down" | "stable";
  healthDistribution: Record<UserHealthStatus, number>;
  dashboardMetrics: UserHealthDashboardMetrics;
  generatedAt: string;
};

const MS_PER_DAY = 86_400_000;

export function daysSinceLastActivity(
  lastActivityAt: string,
  now: Date = new Date(),
): number {
  const diff = now.getTime() - new Date(lastActivityAt).getTime();
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
}

export type UserHealthScoreInput = Pick<
  UserHealthRecord,
  | "daysSinceLastActivity"
  | "cancelledAt"
  | "loginCount"
  | "featureUsageCount"
  | "companionUsageCount"
  | "sessionCount"
>;

/** 0–100 score from activity and engagement signals only. */
export function computeHealthScore(
  record: UserHealthScoreInput,
  _now: Date = new Date(),
): number {
  if (record.cancelledAt) return 0;

  let score = 100;
  const days = record.daysSinceLastActivity;

  if (days >= 30) score -= 70;
  else if (days >= 14) score -= 45;
  else if (days >= 7) score -= 25;
  else if (days >= 3) score -= 10;

  const engagement =
    record.loginCount * 2 +
    record.featureUsageCount +
    record.companionUsageCount +
    record.sessionCount;

  if (days >= 3 && engagement < 2) score -= 15;
  else if (engagement >= 12) score = Math.min(100, score + 5);
  else if (engagement >= 6) score = Math.min(100, score + 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function healthStatusFromScore(score: number): UserHealthStatus {
  if (score >= 90) return "healthy";
  if (score >= 70) return "needs_attention";
  if (score >= 40) return "at_risk";
  return "critical";
}

export function classifyUserHealth(
  record: UserHealthScoreInput,
  now: Date = new Date(),
): UserHealthStatus {
  const score = computeHealthScore(record, now);
  return healthStatusFromScore(score);
}

export function toGhlUserHealthFields(
  record: UserHealthRecord,
  now: Date = new Date(),
): GhlUserHealthContactFields {
  const days = daysSinceLastActivity(record.lastActivityAt, now);
  const score = computeHealthScore({ ...record, daysSinceLastActivity: days }, now);
  return {
    userHealthScore: score,
    userHealthStatus: healthStatusFromScore(score),
    lastActivityDate: record.lastActivityAt,
    daysInactive: days,
  };
}

export function enrichUserHealthRecord(
  record: UserHealthRecord,
  now: Date = new Date(),
): UserHealthRecord {
  const days = daysSinceLastActivity(record.lastActivityAt, now);
  const score = computeHealthScore({ ...record, daysSinceLastActivity: days }, now);
  return {
    ...record,
    daysSinceLastActivity: days,
    healthScore: score,
    healthStatus: healthStatusFromScore(score),
  };
}

export function anonymizeUserRef(userId: string): string {
  const tail = userId.slice(-6);
  return `user-…${tail}`;
}

export function computeUserHealthDashboardMetrics(
  records: UserHealthRecord[],
  now: Date = new Date(),
): UserHealthDashboardMetrics {
  let activeUsers = 0;
  let inactive7Days = 0;
  let inactive14Days = 0;
  let inactive30Days = 0;
  let recoveredUsers = 0;
  let atRiskUsers = 0;
  let criticalUsers = 0;
  let cancelledUsers = 0;

  const weekAgo = now.getTime() - 7 * MS_PER_DAY;

  for (const row of records) {
    const enriched = enrichUserHealthRecord(row, now);
    if (row.cancelledAt) {
      cancelledUsers += 1;
      criticalUsers += 1;
      continue;
    }
    if (row.recoveredAt && new Date(row.recoveredAt).getTime() >= weekAgo) {
      recoveredUsers += 1;
    }

    if (enriched.healthStatus === "at_risk") atRiskUsers += 1;
    if (enriched.healthStatus === "critical") criticalUsers += 1;

    const days = enriched.daysSinceLastActivity;
    if (days < 7) activeUsers += 1;
    else if (days < 14) inactive7Days += 1;
    else if (days < 30) inactive14Days += 1;
    else inactive30Days += 1;
  }

  return {
    activeUsers,
    inactive7Days,
    inactive14Days,
    inactive30Days,
    recoveredUsers,
    atRiskUsers,
    criticalUsers,
    cancelledUsers,
  };
}

export function computeHealthDistribution(
  records: UserHealthRecord[],
  now: Date = new Date(),
): Record<UserHealthStatus, number> {
  const dist: Record<UserHealthStatus, number> = {
    healthy: 0,
    needs_attention: 0,
    at_risk: 0,
    critical: 0,
  };

  for (const row of records) {
    const status = enrichUserHealthRecord(row, now).healthStatus;
    dist[status] += 1;
  }

  return dist;
}

export function computeRetentionTrend(
  records: UserHealthRecord[],
  now: Date = new Date(),
): "up" | "down" | "stable" {
  const weekAgo = now.getTime() - 7 * MS_PER_DAY;
  const twoWeeksAgo = now.getTime() - 14 * MS_PER_DAY;

  let activeThisWeek = 0;
  let activePriorWeek = 0;

  for (const row of records) {
    const last = new Date(row.lastActivityAt).getTime();
    if (last >= weekAgo) activeThisWeek += 1;
    else if (last >= twoWeeksAgo && last < weekAgo) activePriorWeek += 1;
  }

  if (activeThisWeek > activePriorWeek) return "up";
  if (activeThisWeek < activePriorWeek) return "down";
  return "stable";
}

export function buildTopAtRiskUsers(
  records: UserHealthRecord[],
  limit = 5,
  now: Date = new Date(),
): UserHealthAtRiskRef[] {
  return records
    .map((row) => {
      const enriched = enrichUserHealthRecord(row, now);
      return {
        userRef: anonymizeUserRef(row.userId),
        daysSinceLastActivity: enriched.daysSinceLastActivity,
        healthScore: enriched.healthScore,
        healthStatus: enriched.healthStatus,
        loginFrequency: row.loginCount,
        featureUsageFrequency: row.featureUsageCount,
        companionUsage: row.companionUsageCount,
        sessionFrequency: row.sessionCount,
      };
    })
    .filter(
      (r) =>
        r.healthStatus === "at_risk" ||
        r.healthStatus === "critical" ||
        r.healthStatus === "needs_attention",
    )
    .sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity)
    .slice(0, limit);
}

export function buildFounderUserHealthInputs(
  records: UserHealthRecord[],
  now: Date = new Date(),
): FounderUserHealthInputs {
  const withFreshDays = records.map((r) => enrichUserHealthRecord(r, now));

  return {
    topAtRiskUsers: buildTopAtRiskUsers(withFreshDays, 5, now),
    retentionTrend: computeRetentionTrend(withFreshDays, now),
    healthDistribution: computeHealthDistribution(withFreshDays, now),
    dashboardMetrics: computeUserHealthDashboardMetrics(withFreshDays, now),
    generatedAt: now.toISOString(),
  };
}

export async function loadUserHealthIntelligence(): Promise<FounderUserHealthInputs> {
  const records = await refreshUserHealthStatuses();
  return buildFounderUserHealthInputs(records);
}

export function answerUserHealthFounderQuestion(
  question: string,
  inputs: FounderUserHealthInputs,
): { answer: string; nextStep: string } {
  const q = question.toLowerCase();
  const m = inputs.dashboardMetrics;

  if (q.includes("need attention") || q.includes("which users")) {
    const list = inputs.topAtRiskUsers
      .slice(0, 3)
      .map((u) => `${u.userRef} (score ${u.healthScore}, ${u.daysSinceLastActivity}d inactive)`)
      .join("; ");
    return {
      answer: list
        ? `${inputs.topAtRiskUsers.length} users need attention. Top: ${list}.`
        : "No users flagged for attention right now.",
      nextStep: "Send a short re-engagement touchpoint to the highest-risk cohort.",
    };
  }

  if (q.includes("less engaged") || q.includes("engagement")) {
    const trend =
      inputs.retentionTrend === "down"
        ? "Users are becoming less engaged — active count dropped week over week."
        : inputs.retentionTrend === "up"
          ? "Engagement is stable or improving week over week."
          : "Engagement is flat week over week.";
    return {
      answer: `${trend} ${m.inactive7Days} users inactive 7+ days.`,
      nextStep: "Focus on users inactive 7–14 days before they reach at-risk.",
    };
  }

  if (q.includes("retention risk")) {
    return {
      answer: `${m.atRiskUsers} at-risk and ${m.criticalUsers} critical users. Retention trend: ${inputs.retentionTrend}.`,
      nextStep: "Review at-risk users in Business Snapshot and prioritize outreach.",
    };
  }

  if (q.includes("what should we do") || q.includes("what should i do")) {
    if (m.criticalUsers > 0) {
      return {
        answer: `${m.criticalUsers} critical users need immediate attention.`,
        nextStep: "Personal check-in for critical users this week.",
      };
    }
    if (m.atRiskUsers > 0) {
      return {
        answer: `${m.atRiskUsers} users are at risk — act before they churn.`,
        nextStep: "Launch a re-engagement email or workshop invite for at-risk cohort.",
      };
    }
    return {
      answer: `User health looks stable. ${m.activeUsers} active users.`,
      nextStep: "Keep publishing content that matches top user struggle signals.",
    };
  }

  return {
    answer: `Health distribution: ${inputs.healthDistribution.healthy} healthy, ${inputs.healthDistribution.needs_attention} need attention, ${inputs.healthDistribution.at_risk} at risk, ${inputs.healthDistribution.critical} critical.`,
    nextStep: "Open Business Snapshot for full user health counts.",
  };
}

// ---- Persistence (anonymous user ids only) --------------------------------

const HEALTH_TABLE = "ecosystem_user_health";
const healthMemory = new Map<string, UserHealthRecord>();

export type UserHealthActivityKind =
  | "active"
  | "login"
  | "feature"
  | "companion"
  | "cancelled";

function rowToHealthRecord(row: Record<string, unknown>): UserHealthRecord {
  const base: UserHealthRecord = {
    userId: String(row.user_id),
    lastActivityAt: String(row.last_activity_at),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : undefined,
    loginCount: Number(row.login_count ?? 0),
    featureUsageCount: Number(row.feature_usage_count ?? 0),
    companionUsageCount: Number(row.companion_usage_count ?? 0),
    sessionCount: Number(row.session_count ?? 0),
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : undefined,
    recoveredAt: row.recovered_at ? String(row.recovered_at) : undefined,
    healthScore: Number(row.health_score ?? 100),
    healthStatus: (row.health_status as UserHealthStatus) ?? "healthy",
    daysSinceLastActivity: Number(row.days_since_last_activity ?? 0),
    updatedAt: String(row.updated_at),
  };
  return enrichUserHealthRecord(base);
}

async function saveHealthRecord(record: UserHealthRecord): Promise<UserHealthRecord> {
  healthMemory.set(record.userId, record);
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return record;

  const { error } = await supabase.from(HEALTH_TABLE).upsert({
    user_id: record.userId,
    last_activity_at: record.lastActivityAt,
    last_login_at: record.lastLoginAt ?? null,
    login_count: record.loginCount,
    feature_usage_count: record.featureUsageCount,
    companion_usage_count: record.companionUsageCount,
    session_count: record.sessionCount,
    cancelled_at: record.cancelledAt ?? null,
    recovered_at: record.recoveredAt ?? null,
    health_score: record.healthScore,
    health_status: record.healthStatus,
    days_since_last_activity: record.daysSinceLastActivity,
    updated_at: record.updatedAt,
  });

  if (error) console.error("ecosystem_user_health save", error);
  return record;
}

export async function loadAllUserHealthRecords(): Promise<UserHealthRecord[]> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return [...healthMemory.values()];

  const { data, error } = await supabase.from(HEALTH_TABLE).select("*");
  if (error) {
    console.error("ecosystem_user_health load", error);
    return [...healthMemory.values()];
  }

  return (data ?? []).map((row) => rowToHealthRecord(row as Record<string, unknown>));
}

export async function recordUserHealthActivity(input: {
  userId: string;
  kind: UserHealthActivityKind;
  at?: string;
}): Promise<UserHealthRecord> {
  const userId = input.userId.trim();
  if (!userId || userId.length > 80) {
    throw new Error("Invalid user id.");
  }

  const now = input.at ?? new Date().toISOString();
  const existing =
    healthMemory.get(userId) ??
    (await loadAllUserHealthRecords()).find((r) => r.userId === userId);

  const priorDays = existing
    ? daysSinceLastActivity(existing.lastActivityAt, new Date(now))
    : 0;

  const record: UserHealthRecord = existing
    ? { ...existing }
    : {
        userId,
        lastActivityAt: now,
        loginCount: 0,
        featureUsageCount: 0,
        companionUsageCount: 0,
        sessionCount: 0,
        healthScore: 100,
        healthStatus: "healthy",
        daysSinceLastActivity: 0,
        updatedAt: now,
      };

  record.lastActivityAt = now;
  record.updatedAt = now;

  if (input.kind === "active") {
    record.sessionCount += 1;
  } else if (input.kind === "login") {
    record.loginCount += 1;
    record.lastLoginAt = now;
    record.sessionCount += 1;
  } else if (input.kind === "feature") {
    record.featureUsageCount += 1;
  } else if (input.kind === "companion") {
    record.companionUsageCount += 1;
  } else if (input.kind === "cancelled") {
    record.cancelledAt = now;
  }

  if (priorDays >= 14 && input.kind !== "cancelled") {
    record.recoveredAt = now;
  }

  const enriched = enrichUserHealthRecord(
    { ...record, daysSinceLastActivity: 0 },
    new Date(now),
  );

  return saveHealthRecord(enriched);
}

export async function refreshUserHealthStatuses(
  records?: UserHealthRecord[],
  now = new Date(),
): Promise<UserHealthRecord[]> {
  const all = records ?? (await loadAllUserHealthRecords());
  const refreshed: UserHealthRecord[] = [];

  for (const row of all) {
    const next = enrichUserHealthRecord(row, now);
    next.updatedAt = now.toISOString();
    refreshed.push(await saveHealthRecord(next));
  }

  return refreshed;
}

export function resetUserHealthStore(): void {
  healthMemory.clear();
}

export function userHealthStoreConfigured(): boolean {
  return founderSupabaseConfigured() || healthMemory.size > 0;
}

export function mapEcosystemEventToHealthKind(
  eventType: EcosystemTrackEventType,
): UserHealthActivityKind | null {
  if (eventType === "user.active") return "active";
  if (eventType === "user.login") return "login";
  if (eventType === "user.cancelled") return "cancelled";
  if (eventType.startsWith("companion.")) return "companion";
  if (
    eventType.startsWith("feature.") ||
    eventType.startsWith("document.")
  ) {
    return "feature";
  }
  return null;
}
