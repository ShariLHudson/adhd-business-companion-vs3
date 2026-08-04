/**
 * Outcome Goals — measurable outcomes, not task lists.
 * Guardrails: self-reported progress only for revenue; no financial integrations.
 */

export type OutcomeGoalMetricKind = "count" | "revenue";

export type OutcomeGoalTrackingTypeId =
  | "revenue"
  | "clients"
  | "leads"
  | "members"
  | "subscribers"
  | "sales_calls"
  | "affiliates"
  | "content_pieces"
  | "videos"
  | "followers"
  | "email_subscribers"
  | "products"
  | "courses"
  | "chapters"
  | "hours"
  | "tasks"
  | "weight"
  | "percentage"
  | "custom";

export const OUTCOME_TRACKING_TYPE_PRESETS: readonly {
  id: OutcomeGoalTrackingTypeId;
  label: string;
  metricKind: OutcomeGoalMetricKind;
  unit: string;
}[] = [
  { id: "revenue", label: "Revenue", metricKind: "revenue", unit: "" },
  { id: "clients", label: "Clients", metricKind: "count", unit: "clients" },
  { id: "leads", label: "Leads", metricKind: "count", unit: "leads" },
  { id: "members", label: "Members", metricKind: "count", unit: "members" },
  { id: "subscribers", label: "Subscribers", metricKind: "count", unit: "subscribers" },
  { id: "sales_calls", label: "Sales Calls", metricKind: "count", unit: "sales calls" },
  { id: "affiliates", label: "Affiliates", metricKind: "count", unit: "affiliates" },
  { id: "content_pieces", label: "Content Pieces", metricKind: "count", unit: "content pieces" },
  { id: "videos", label: "Videos", metricKind: "count", unit: "videos" },
  { id: "followers", label: "Followers", metricKind: "count", unit: "followers" },
  { id: "email_subscribers", label: "Email Subscribers", metricKind: "count", unit: "email subscribers" },
  { id: "products", label: "Products", metricKind: "count", unit: "products" },
  { id: "courses", label: "Courses", metricKind: "count", unit: "courses" },
  { id: "chapters", label: "Chapters", metricKind: "count", unit: "chapters" },
  { id: "hours", label: "Hours", metricKind: "count", unit: "hours" },
  { id: "tasks", label: "Tasks", metricKind: "count", unit: "tasks" },
  { id: "weight", label: "Weight", metricKind: "count", unit: "lbs" },
  { id: "percentage", label: "Percentage", metricKind: "count", unit: "%" },
  { id: "custom", label: "Custom", metricKind: "count", unit: "" },
] as const;

export type OutcomeGoalHealthStatus =
  | "on_track"
  | "needs_attention"
  | "stalled"
  | "complete"
  | "archived";

export const OUTCOME_GOAL_HEALTH_LABELS: Record<OutcomeGoalHealthStatus, string> = {
  on_track: "On Track",
  needs_attention: "Needs Attention",
  stalled: "Stalled",
  complete: "Complete",
  archived: "Archived",
};

export type OutcomeGoalProgressLog = {
  id?: string;
  amount: number;
  metricId?: string;
  note?: string;
  linkedWinText?: string;
  linkedEvidenceId?: string;
  isMilestone?: boolean;
  loggedAt: string;
};

export type OutcomeGoalCompletionRule =
  | "all_metrics"
  | "primary_metric"
  | "custom";

export const OUTCOME_COMPLETION_RULE_LABELS: Record<
  OutcomeGoalCompletionRule,
  string
> = {
  all_metrics: "All metrics complete",
  primary_metric: "Primary metric complete",
  custom: "Manual completion",
};

/** One trackable metric on a goal — Multi-Metric Goal Tracking™ */
export type OutcomeGoalSubMetric = {
  id: string;
  label: string;
  trackingTypeId: OutcomeGoalTrackingTypeId;
  metricKind: OutcomeGoalMetricKind;
  targetValue: number;
  currentValue: number;
  isPrimary?: boolean;
  archived?: boolean;
  notes?: string;
  progressLogs: OutcomeGoalProgressLog[];
};

export type OutcomeGoalStatus = "active" | "paused" | "achieved" | "archived";

export type OutcomeGoal = {
  id: string;
  statement: string;
  metric: string;
  metricKind: OutcomeGoalMetricKind;
  trackingTypeId?: OutcomeGoalTrackingTypeId;
  targetValue: number;
  /** YYYY-MM-DD */
  deadline: string;
  definitionOfDone: string;
  supportingActivities: string[];
  manualProgress: number;
  progressLogs: OutcomeGoalProgressLog[];
  /** Multi-Metric Goal Tracking™ — each metric has its own target and progress */
  metrics?: OutcomeGoalSubMetric[];
  completionRule?: OutcomeGoalCompletionRule;
  customCompletionRule?: string;
  /** North Star — one primary outcome for Plan My Day alignment */
  isPrimary?: boolean;
  status?: OutcomeGoalStatus;
  whyItMatters?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const OUTCOME_GOALS_UPDATED = "companion-outcome-goals-updated";

/** Soft guidance — not a hard block */
export const RECOMMENDED_ACTIVE_OUTCOMES = 3;

const STORE_KEY = "companion-outcome-goals-v1";
const MAX_GOALS = 8;

function uid(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function metricUid(): string {
  return `metric-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function logUid(): string {
  return `plog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeProgressLog(log: OutcomeGoalProgressLog): OutcomeGoalProgressLog {
  return {
    ...log,
    id: log.id ?? logUid(),
    note: log.note?.trim() || undefined,
    linkedWinText: log.linkedWinText?.trim() || undefined,
  };
}

function metricValueFromLogs(logs: OutcomeGoalProgressLog[]): number {
  return Math.max(0, logs.reduce((sum, log) => sum + log.amount, 0));
}

function applyMetricsWithLogs(
  goalId: string,
  metrics: OutcomeGoalSubMetric[],
): OutcomeGoal | null {
  const recalculated = metrics.map((m) => ({
    ...m,
    progressLogs: m.progressLogs.map(normalizeProgressLog),
    currentValue: metricValueFromLogs(m.progressLogs),
  }));
  return updateOutcomeGoal(goalId, {
    metrics: recalculated,
    ...syncLegacyFromMetrics(recalculated),
    progressLogs: recalculated.flatMap((m) => m.progressLogs).slice(-100),
  });
}

function normalizeSubMetric(
  raw: OutcomeGoalSubMetric,
  fallbackLogs: OutcomeGoalProgressLog[] = [],
): OutcomeGoalSubMetric {
  const logs =
    raw.progressLogs?.length > 0
      ? raw.progressLogs
      : fallbackLogs.filter((l) => !l.metricId || l.metricId === raw.id);
  return {
    ...raw,
    label: raw.label?.trim() || "Progress",
    currentValue: Math.max(0, raw.currentValue ?? 0),
    targetValue: raw.targetValue > 0 ? raw.targetValue : 1,
    progressLogs: logs.map(normalizeProgressLog),
  };
}

function syncLegacyFromMetrics(
  metrics: OutcomeGoalSubMetric[],
): Pick<
  OutcomeGoal,
  "metric" | "trackingTypeId" | "metricKind" | "targetValue" | "manualProgress"
> {
  const primary = getPrimaryGoalMetricFromList(metrics);
  return {
    metric: primary.label,
    trackingTypeId: primary.trackingTypeId,
    metricKind: primary.metricKind,
    targetValue: primary.targetValue,
    manualProgress: primary.currentValue,
  };
}

function getPrimaryGoalMetricFromList(
  metrics: OutcomeGoalSubMetric[],
): OutcomeGoalSubMetric {
  return metrics.find((m) => m.isPrimary) ?? metrics[0]!;
}

function normalizeGoal(raw: OutcomeGoal): OutcomeGoal {
  const status = raw.status ?? "active";
  let metrics: OutcomeGoalSubMetric[];

  if (raw.metrics && raw.metrics.length > 0) {
    metrics = raw.metrics.map((m) => normalizeSubMetric(m));
  } else {
    const id = metricUid();
    const trackingTypeId =
      raw.trackingTypeId ??
      inferTrackingTypeId(raw.metric ?? "", raw.statement, raw.metricKind);
    const preset = OUTCOME_TRACKING_TYPE_PRESETS.find((p) => p.id === trackingTypeId);
    metrics = [
      normalizeSubMetric(
        {
          id,
          label: raw.metric?.trim() || "Progress",
          trackingTypeId,
          metricKind:
            raw.metricKind ??
            preset?.metricKind ??
            inferMetricKind(raw.metric ?? "", raw.statement),
          targetValue: raw.targetValue > 0 ? raw.targetValue : 1,
          currentValue: raw.manualProgress ?? 0,
          isPrimary: true,
          progressLogs: (raw.progressLogs ?? []).map((l) => ({
            ...l,
            metricId: l.metricId ?? id,
          })),
        },
        raw.progressLogs ?? [],
      ),
    ];
  }

  if (!metrics.some((m) => m.isPrimary)) {
    metrics = metrics.map((m, i) => ({ ...m, isPrimary: i === 0 }));
  }

  const legacy = syncLegacyFromMetrics(metrics);
  const allLogs = metrics.flatMap((m) =>
    m.progressLogs.map((l) => ({ ...l, metricId: l.metricId ?? m.id })),
  );

  return {
    ...raw,
    ...legacy,
    status,
    metrics,
    completionRule: raw.completionRule ?? "primary_metric",
    customCompletionRule: raw.customCompletionRule?.trim() || undefined,
    progressLogs: allLogs.slice(-100),
  };
}

function readAll(): OutcomeGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OutcomeGoal[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((g) => normalizeGoal(g));
  } catch {
    return [];
  }
}

function writeAll(goals: OutcomeGoal[]): OutcomeGoal[] {
  if (typeof window === "undefined") return goals;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(goals.slice(0, MAX_GOALS)));
    window.dispatchEvent(new Event(OUTCOME_GOALS_UPDATED));
  } catch {
    /* ignore */
  }
  return goals;
}

export function listOutcomeGoals(): OutcomeGoal[] {
  return readAll()
    .filter((g) => g.status !== "achieved" && g.status !== "archived")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export function listCompletedOutcomeGoals(): OutcomeGoal[] {
  return readAll()
    .filter((g) => g.status === "achieved")
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.updatedAt).getTime() -
        new Date(a.completedAt ?? a.updatedAt).getTime(),
    );
}

export function listArchivedOutcomeGoals(): OutcomeGoal[] {
  return readAll()
    .filter((g) => g.status === "archived")
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export function listAllOutcomeGoals(): OutcomeGoal[] {
  return readAll().sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );
}

export function activeOutcomeCount(): number {
  return readAll().filter((g) => !g.status || g.status === "active").length;
}

function promoteNextPrimary(goals: OutcomeGoal[], excludeId?: string): OutcomeGoal[] {
  const active = goals.filter(
    (g) => g.id !== excludeId && (!g.status || g.status === "active"),
  );
  if (active.length === 0) {
    return goals.map((g) => ({ ...g, isPrimary: false }));
  }
  const nextId = active[0]!.id;
  return goals.map((g) => ({
    ...g,
    isPrimary: g.id === nextId,
  }));
}

export function getPrimaryOutcomeGoal(): OutcomeGoal | null {
  const all = readAll().filter(
    (g) => g.status !== "achieved" && g.status !== "archived",
  );
  const primary = all.find((g) => g.isPrimary);
  if (primary) return primary;
  return all[0] ?? null;
}

export function setPrimaryOutcomeGoal(id: string): OutcomeGoal | null {
  const goals = readAll();
  if (!goals.some((g) => g.id === id)) return null;
  writeAll(
    goals.map((g) => ({
      ...g,
      isPrimary: g.id === id,
      updatedAt: g.id === id ? new Date().toISOString() : g.updatedAt,
    })),
  );
  return getOutcomeGoal(id);
}

export function getGoalMetrics(goal: OutcomeGoal): OutcomeGoalSubMetric[] {
  return goal.metrics?.length ? goal.metrics : [];
}

/** Visible metrics — excludes archived. */
export function getActiveGoalMetrics(goal: OutcomeGoal): OutcomeGoalSubMetric[] {
  return getGoalMetrics(goal).filter((m) => !m.archived);
}

export function getPrimaryGoalMetric(goal: OutcomeGoal): OutcomeGoalSubMetric {
  const metrics = getGoalMetrics(goal);
  return getPrimaryGoalMetricFromList(metrics);
}

export function isMultiMetricGoal(goal: OutcomeGoal): boolean {
  return getGoalMetrics(goal).length > 1;
}

export function resolveMetricTrackingPreset(metric: OutcomeGoalSubMetric): {
  id: OutcomeGoalTrackingTypeId;
  label: string;
  metricKind: OutcomeGoalMetricKind;
  unit: string;
} {
  const preset = OUTCOME_TRACKING_TYPE_PRESETS.find(
    (p) => p.id === metric.trackingTypeId,
  );
  if (preset) return preset;
  if (metric.metricKind === "revenue") {
    return OUTCOME_TRACKING_TYPE_PRESETS.find((p) => p.id === "revenue")!;
  }
  return {
    id: "custom",
    label: "Custom",
    metricKind: metric.metricKind,
    unit: metric.label.trim().toLowerCase(),
  };
}

export function resolveTrackingPreset(goal: OutcomeGoal): {
  id: OutcomeGoalTrackingTypeId;
  label: string;
  metricKind: OutcomeGoalMetricKind;
  unit: string;
} {
  return resolveMetricTrackingPreset(getPrimaryGoalMetric(goal));
}

export function formatMetricProgressLabel(metric: OutcomeGoalSubMetric): string {
  const preset = resolveMetricTrackingPreset(metric);
  if (preset.metricKind === "revenue") {
    return `$${metric.currentValue.toLocaleString()} / $${metric.targetValue.toLocaleString()}`;
  }
  const unit = preset.unit || metric.label.trim().toLowerCase();
  const unitSuffix = unit ? ` ${unit}` : "";
  return `${metric.currentValue} / ${metric.targetValue}${unitSuffix}`;
}

export function formatOutcomeProgressLabel(goal: OutcomeGoal): string {
  const metrics = getGoalMetrics(goal);
  if (metrics.length > 1) {
    const primary = getPrimaryGoalMetric(goal);
    return `${formatMetricProgressLabel(primary)} (+${metrics.length - 1} more)`;
  }
  return formatMetricProgressLabel(getPrimaryGoalMetric(goal));
}

export function metricProgressPercent(metric: OutcomeGoalSubMetric): number {
  if (metric.targetValue <= 0) return 0;
  return Math.min(
    100,
    Math.round((metric.currentValue / metric.targetValue) * 100),
  );
}

export function metricIsComplete(metric: OutcomeGoalSubMetric): boolean {
  return metric.currentValue >= metric.targetValue;
}

export function goalSatisfiesCompletionRule(goal: OutcomeGoal): boolean {
  const metrics = getGoalMetrics(goal);
  const rule = goal.completionRule ?? "primary_metric";
  if (rule === "all_metrics") {
    return metrics.every((m) => metricIsComplete(m));
  }
  if (rule === "primary_metric") {
    return metricIsComplete(getPrimaryGoalMetric(goal));
  }
  return false;
}

export function lastProgressDate(goal: OutcomeGoal): string | null {
  const dates = getGoalMetrics(goal)
    .flatMap((m) => m.progressLogs.map((l) => l.loggedAt))
    .sort();
  return dates[dates.length - 1] ?? null;
}

export function goalHealthStatus(
  goal: OutcomeGoal,
  now = new Date(),
): OutcomeGoalHealthStatus {
  if (goal.status === "achieved") return "complete";
  if (goal.status === "archived") return "archived";

  const pct = goalProgressPercent(goal);
  const deadline = new Date(`${goal.deadline}T23:59:59`);
  const daysLeft =
    (deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  const lastIso = lastProgressDate(goal) ?? goal.createdAt;
  const daysSinceProgress =
    (now.getTime() - new Date(lastIso).getTime()) / (24 * 60 * 60 * 1000);

  if (daysSinceProgress >= 14 && pct < 70) return "stalled";
  if (daysLeft <= 7 && pct < 80) return "needs_attention";
  return "on_track";
}

export function progressInDateRange(
  goal: OutcomeGoal,
  from: Date,
  to: Date,
  metricId?: string,
): number {
  const metrics = metricId
    ? getGoalMetrics(goal).filter((m) => m.id === metricId)
    : getGoalMetrics(goal);
  return metrics
    .flatMap((m) => m.progressLogs)
    .filter((log) => {
      const t = new Date(log.loggedAt).getTime();
      return t >= from.getTime() && t <= to.getTime();
    })
    .reduce((sum, log) => sum + log.amount, 0);
}

export function getOutcomeGoal(id: string): OutcomeGoal | null {
  return readAll().find((g) => g.id === id) ?? null;
}

export type CreateOutcomeGoalInput = {
  statement: string;
  metric: string;
  metricKind?: OutcomeGoalMetricKind;
  trackingTypeId?: OutcomeGoalTrackingTypeId;
  targetValue: number;
  deadline: string;
  definitionOfDone: string;
  supportingActivities?: string[];
  whyItMatters?: string;
  metrics?: Omit<
    OutcomeGoalSubMetric,
    "id" | "currentValue" | "progressLogs"
  >[];
  completionRule?: OutcomeGoalCompletionRule;
  customCompletionRule?: string;
};

function buildMetricsFromInput(
  input: CreateOutcomeGoalInput,
): OutcomeGoalSubMetric[] {
  if (input.metrics && input.metrics.length > 0) {
    return input.metrics.map((m, i) => {
      const trackingTypeId =
        m.trackingTypeId ??
        inferTrackingTypeId(m.label, input.statement, m.metricKind);
      const preset = OUTCOME_TRACKING_TYPE_PRESETS.find(
        (p) => p.id === trackingTypeId,
      );
      return {
        id: metricUid(),
        label: m.label.trim(),
        trackingTypeId,
        metricKind:
          m.metricKind ??
          preset?.metricKind ??
          inferMetricKind(m.label, input.statement),
        targetValue: m.targetValue,
        currentValue: 0,
        isPrimary: m.isPrimary ?? i === 0,
        progressLogs: [],
      };
    });
  }

  const trackingTypeId =
    input.trackingTypeId ??
    inferTrackingTypeId(input.metric, input.statement, input.metricKind);
  const preset = OUTCOME_TRACKING_TYPE_PRESETS.find((p) => p.id === trackingTypeId);
  return [
    {
      id: metricUid(),
      label: input.metric.trim(),
      trackingTypeId,
      metricKind:
        input.metricKind ??
        preset?.metricKind ??
        inferMetricKind(input.metric, input.statement),
      targetValue: input.targetValue,
      currentValue: 0,
      isPrimary: true,
      progressLogs: [],
    },
  ];
}

export function createOutcomeGoal(input: CreateOutcomeGoalInput): OutcomeGoal {
  const now = new Date().toISOString();
  const existing = readAll();
  const hasPrimary = existing.some((g) => g.isPrimary);
  const metrics = buildMetricsFromInput(input);
  if (!metrics.some((m) => m.isPrimary)) {
    metrics[0]!.isPrimary = true;
  }
  const legacy = syncLegacyFromMetrics(metrics);
  const goal: OutcomeGoal = {
    id: uid(),
    statement: autoCapitalizeGoalTitle(input.statement),
    ...legacy,
    deadline: input.deadline,
    definitionOfDone: input.definitionOfDone.trim(),
    supportingActivities: input.supportingActivities ?? [],
    manualProgress: 0,
    progressLogs: [],
    metrics,
    completionRule: input.completionRule ?? "primary_metric",
    customCompletionRule: input.customCompletionRule?.trim() || undefined,
    isPrimary: !hasPrimary,
    status: "active",
    whyItMatters: input.whyItMatters?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...existing, normalizeGoal(goal)]);
  return getOutcomeGoal(goal.id)!;
}

export function updateOutcomeGoal(
  id: string,
  patch: Partial<Omit<OutcomeGoal, "id" | "createdAt">>,
): OutcomeGoal | null {
  const goals = readAll();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx < 0) return null;
  const next = {
    ...goals[idx]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  goals[idx] = next;
  writeAll(goals);
  return next;
}

export type EditOutcomeGoalInput = {
  statement?: string;
  definitionOfDone?: string;
  metric?: string;
  metricKind?: OutcomeGoalMetricKind;
  trackingTypeId?: OutcomeGoalTrackingTypeId;
  targetValue?: number;
  manualProgress?: number;
  deadline?: string;
  notes?: string;
  metrics?: OutcomeGoalSubMetric[];
  completionRule?: OutcomeGoalCompletionRule;
  customCompletionRule?: string;
};

/** Edit metadata without resetting progress logs or current value. */
export function editOutcomeGoal(
  id: string,
  input: EditOutcomeGoalInput,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(id);
  if (!goal) return null;

  const patch: Partial<OutcomeGoal> = {};
  if (input.statement !== undefined) {
    patch.statement = autoCapitalizeGoalTitle(input.statement);
  }
  if (input.definitionOfDone !== undefined) {
    patch.definitionOfDone = input.definitionOfDone.trim();
  }
  if (input.metrics !== undefined) {
    const normalized = input.metrics.map((m) => normalizeSubMetric(m));
    if (!normalized.some((m) => m.isPrimary) && normalized[0]) {
      normalized[0]!.isPrimary = true;
    }
    patch.metrics = normalized;
    Object.assign(patch, syncLegacyFromMetrics(normalized));
    patch.progressLogs = normalized.flatMap((m) =>
      m.progressLogs.map((l) => ({ ...l, metricId: l.metricId ?? m.id })),
    );
  } else {
    if (input.metric !== undefined) {
      patch.metric = input.metric.trim();
    }
    if (input.trackingTypeId !== undefined) {
      patch.trackingTypeId = input.trackingTypeId;
      const preset = OUTCOME_TRACKING_TYPE_PRESETS.find(
        (p) => p.id === input.trackingTypeId,
      );
      if (preset) {
        patch.metricKind = preset.metricKind;
        if (!input.metric && preset.unit && preset.id !== "custom") {
          patch.metric = preset.label;
        }
      }
    }
    if (input.metricKind !== undefined) {
      patch.metricKind = input.metricKind;
    } else if (
      input.metric !== undefined ||
      input.statement !== undefined
    ) {
      patch.metricKind = inferMetricKind(
        input.metric ?? goal.metric,
        input.statement ?? goal.statement,
      );
    }
    if (input.targetValue !== undefined) {
      patch.targetValue = input.targetValue;
    }
    if (input.manualProgress !== undefined) {
      patch.manualProgress = Math.max(0, input.manualProgress);
    }
    if (
      input.targetValue !== undefined ||
      input.manualProgress !== undefined ||
      input.metric !== undefined ||
      input.trackingTypeId !== undefined
    ) {
      const primary = getPrimaryGoalMetric(goal);
      const metrics = getGoalMetrics(goal).map((m) =>
        m.id === primary.id
          ? {
              ...m,
              label: input.metric?.trim() ?? m.label,
              trackingTypeId: input.trackingTypeId ?? m.trackingTypeId,
              metricKind: patch.metricKind ?? m.metricKind,
              targetValue: input.targetValue ?? m.targetValue,
              currentValue: input.manualProgress ?? m.currentValue,
            }
          : m,
      );
      patch.metrics = metrics;
      patch.progressLogs = metrics.flatMap((m) => m.progressLogs);
    }
  }
  if (input.completionRule !== undefined) {
    patch.completionRule = input.completionRule;
  }
  if (input.customCompletionRule !== undefined) {
    patch.customCompletionRule = input.customCompletionRule.trim() || undefined;
  }
  if (input.deadline !== undefined) {
    patch.deadline = input.deadline;
  }
  if (input.notes !== undefined) {
    patch.notes = input.notes.trim() || undefined;
  }

  return updateOutcomeGoal(id, patch);
}

export function completeOutcomeGoal(id: string): OutcomeGoal | null {
  const goals = readAll();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return null;
  const completedAt = new Date().toISOString();
  const updated = goals.map((g) =>
    g.id === id
      ? {
          ...g,
          status: "achieved" as const,
          completedAt,
          isPrimary: false,
          updatedAt: completedAt,
        }
      : g,
  );
  writeAll(promoteNextPrimary(updated, id));
  return getOutcomeGoal(id);
}

export function archiveOutcomeGoal(id: string): OutcomeGoal | null {
  const goals = readAll();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return null;
  const now = new Date().toISOString();
  const updated = goals.map((g) =>
    g.id === id
      ? {
          ...g,
          status: "archived" as const,
          isPrimary: false,
          updatedAt: now,
        }
      : g,
  );
  writeAll(promoteNextPrimary(updated, id));
  return getOutcomeGoal(id);
}

export function deleteOutcomeGoal(id: string): void {
  const goals = readAll();
  const removed = goals.find((g) => g.id === id);
  const remaining = goals.filter((g) => g.id !== id);
  if (removed?.isPrimary) {
    writeAll(promoteNextPrimary(remaining));
    return;
  }
  writeAll(remaining);
}

export type RecordOutcomeGoalProgressInput = {
  metricId?: string;
  delta?: number;
  setValue?: number;
  note?: string;
  linkedWinText?: string;
  linkedEvidenceId?: string;
  isMilestone?: boolean;
  loggedAt?: string;
};

/** Self-reported progress — not linked to banks or invoices. */
export function recordOutcomeGoalProgress(
  id: string,
  input: RecordOutcomeGoalProgressInput,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(id);
  if (!goal) return null;

  const metricId = input.metricId ?? getPrimaryGoalMetric(goal).id;
  const targetMetric = getGoalMetrics(goal).find((m) => m.id === metricId);
  if (!targetMetric) return null;

  const loggedAt = input.loggedAt ?? new Date().toISOString();
  let newProgress = targetMetric.currentValue;
  let amount = 0;

  if (input.setValue !== undefined) {
    newProgress = Math.max(0, input.setValue);
    amount = newProgress - targetMetric.currentValue;
  } else if (input.delta !== undefined && input.delta !== 0) {
    amount = input.delta;
    newProgress = Math.max(0, targetMetric.currentValue + input.delta);
  } else {
    return null;
  }

  const logEntry: OutcomeGoalProgressLog = normalizeProgressLog({
    id: logUid(),
    amount,
    metricId,
    note: input.note?.trim() || undefined,
    linkedWinText: input.linkedWinText?.trim() || undefined,
    isMilestone: input.isMilestone,
    loggedAt,
  });

  const metrics = getGoalMetrics(goal).map((m) =>
    m.id === metricId
      ? {
          ...m,
          currentValue: newProgress,
          progressLogs: [...m.progressLogs, logEntry].slice(-50),
        }
      : m,
  );

  return updateOutcomeGoal(id, {
    metrics,
    ...syncLegacyFromMetrics(metrics),
    progressLogs: metrics.flatMap((m) => m.progressLogs).slice(-100),
  });
}

export function logOutcomeGoalProgress(
  id: string,
  amount: number,
  note?: string,
  metricId?: string,
): OutcomeGoal | null {
  if (amount <= 0) return null;
  return recordOutcomeGoalProgress(id, { delta: amount, note, metricId });
}

export type UpdateOutcomeGoalProgressInput = {
  amount?: number;
  note?: string;
  linkedWinText?: string;
  linkedEvidenceId?: string;
  isMilestone?: boolean;
  loggedAt?: string;
};

export function updateOutcomeGoalProgressEntry(
  goalId: string,
  metricId: string,
  logId: string,
  patch: UpdateOutcomeGoalProgressInput,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(goalId);
  if (!goal) return null;

  const metrics = getGoalMetrics(goal).map((m) => {
    if (m.id !== metricId) return m;
    const logs = m.progressLogs.map((log) => {
      const id = log.id ?? "";
      if (id !== logId) return normalizeProgressLog(log);
      const next = normalizeProgressLog({
        ...log,
        ...patch,
        amount: patch.amount ?? log.amount,
      });
      return next;
    });
    return { ...m, progressLogs: logs };
  });

  return applyMetricsWithLogs(goalId, metrics);
}

export function deleteOutcomeGoalProgressEntry(
  goalId: string,
  metricId: string,
  logId: string,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(goalId);
  if (!goal) return null;

  const metrics = getGoalMetrics(goal).map((m) => {
    if (m.id !== metricId) return m;
    const logs = m.progressLogs.filter((log) => (log.id ?? "") !== logId);
    return { ...m, progressLogs: logs };
  });

  return applyMetricsWithLogs(goalId, metrics);
}

export function autoCapitalizeGoalTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function goalProgressPercent(goal: OutcomeGoal): number {
  const metrics = getGoalMetrics(goal);
  if (metrics.length === 0) return 0;
  const rule = goal.completionRule ?? "primary_metric";
  if (rule === "all_metrics") {
    const sum = metrics.reduce((acc, m) => acc + metricProgressPercent(m), 0);
    return Math.round(sum / metrics.length);
  }
  return metricProgressPercent(getPrimaryGoalMetric(goal));
}

export function addOutcomeGoalMetric(
  goalId: string,
  input: Omit<OutcomeGoalSubMetric, "id" | "currentValue" | "progressLogs">,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(goalId);
  if (!goal) return null;
  const newMetricId = metricUid();
  const metrics = getGoalMetrics(goal).map((m) => ({
    ...m,
    isPrimary: input.isPrimary ? false : m.isPrimary,
  }));
  metrics.push(
    normalizeSubMetric({
      id: newMetricId,
      label: input.label,
      trackingTypeId: input.trackingTypeId,
      metricKind: input.metricKind,
      targetValue: input.targetValue,
      currentValue: 0,
      isPrimary: input.isPrimary ?? metrics.length === 0,
      progressLogs: [],
    }),
  );
  if (!metrics.some((m) => m.isPrimary)) {
    metrics[0]!.isPrimary = true;
  }
  return editOutcomeGoal(goalId, { metrics });
}

export function inferMetricKind(
  metric: string,
  statement: string,
): OutcomeGoalMetricKind {
  const text = `${metric} ${statement}`.toLowerCase();
  if (/\$|revenue|income|sales \$|dollar/.test(text)) return "revenue";
  return "count";
}

export function inferTrackingTypeId(
  metric: string,
  statement: string,
  metricKind?: OutcomeGoalMetricKind,
): OutcomeGoalTrackingTypeId {
  const text = `${metric} ${statement}`.toLowerCase();
  if (metricKind === "revenue" || /\$|revenue|income/.test(text)) {
    return "revenue";
  }
  const rules: [RegExp, OutcomeGoalTrackingTypeId][] = [
    [/\bclient/, "clients"],
    [/\blead/, "leads"],
    [/\bsales call/, "sales_calls"],
    [/\bcontent|post|article|blog/, "content_pieces"],
    [/\bvideo/, "videos"],
    [/\bfollower/, "followers"],
    [/\bsubscriber|email list/, "email_subscribers"],
    [/\bproduct/, "products"],
    [/\bcourse/, "courses"],
    [/\bhour/, "hours"],
    [/\bmember/, "members"],
  ];
  for (const [re, id] of rules) {
    if (re.test(text)) return id;
  }
  return "custom";
}

export function suggestSupportingActivities(statement: string): string[] {
  const s = statement.toLowerCase();
  if (/\bclient|sign|sales|customer\b/.test(s)) {
    return [
      "Follow-up emails",
      "Discovery calls",
      "Proposals",
      "Networking",
      "Outreach",
    ];
  }
  if (/\bcontent|publish|post|pin|marketing\b/.test(s)) {
    return [
      "Writing drafts",
      "Scheduling posts",
      "Repurposing content",
      "Engagement replies",
    ];
  }
  if (/\blaunch|course|program|webinar\b/.test(s)) {
    return [
      "Outline modules",
      "Record lessons",
      "Sales page updates",
      "Email announcements",
    ];
  }
  return ["Focused work blocks", "Check-in reviews", "Small next steps"];
}

export function resetOutcomeGoalsForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEY);
}

export type OutcomeGoalDashboard = {
  activeGoals: number;
  onTrack: number;
  needsAttention: number;
  completed: number;
  mostImprovedMetric: {
    goalStatement: string;
    metricLabel: string;
    delta: number;
  } | null;
  biggestWinThisPeriod: string | null;
  stalledGoalAlerts: string[];
};

/** P0.33 — ADHD-friendly progress snapshot for Outcome Goals™ header */
export function buildOutcomeGoalDashboard(
  wins: { whatHappened: string; ts: string }[] = [],
  now = new Date(),
): OutcomeGoalDashboard {
  const active = listOutcomeGoals();
  const completed = listCompletedOutcomeGoals();
  const statuses = active.map((g) => goalHealthStatus(g, now));
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);

  let best: OutcomeGoalDashboard["mostImprovedMetric"] = null;
  for (const goal of active) {
    for (const metric of getActiveGoalMetrics(goal)) {
      const delta = progressInDateRange(goal, periodStart, now, metric.id);
      if (delta <= 0) continue;
      if (!best || delta > best.delta) {
        best = {
          goalStatement: goal.statement,
          metricLabel: metric.label,
          delta,
        };
      }
    }
  }

  const recentWins = [...wins].sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  );
  const biggestWin =
    recentWins.find((w) => {
      const t = new Date(w.ts).getTime();
      return t >= periodStart.getTime() && t <= now.getTime();
    })?.whatHappened ?? recentWins[0]?.whatHappened ?? null;

  const stalledGoalAlerts = active
    .filter((g) => goalHealthStatus(g, now) === "stalled")
    .map((g) => g.statement);

  return {
    activeGoals: active.length,
    onTrack: statuses.filter((s) => s === "on_track").length,
    needsAttention: statuses.filter((s) => s === "needs_attention").length,
    completed: completed.length,
    mostImprovedMetric: best,
    biggestWinThisPeriod: biggestWin,
    stalledGoalAlerts,
  };
}

export function archiveOutcomeGoalMetric(
  goalId: string,
  metricId: string,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(goalId);
  if (!goal) return null;
  const metrics = getGoalMetrics(goal).map((m) =>
    m.id === metricId ? { ...m, archived: true } : m,
  );
  const active = metrics.filter((m) => !m.archived);
  if (active.length === 0) return null;
  if (!active.some((m) => m.isPrimary)) {
    active[0]!.isPrimary = true;
  }
  return editOutcomeGoal(goalId, { metrics });
}
