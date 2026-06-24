/**
 * Outcome Goals — measurable outcomes, not task lists.
 * Guardrails: self-reported progress only for revenue; no financial integrations.
 */

export type OutcomeGoalMetricKind = "count" | "revenue";

export type OutcomeGoalProgressLog = {
  amount: number;
  note?: string;
  loggedAt: string;
};

export type OutcomeGoalStatus = "active" | "paused" | "achieved";

export type OutcomeGoal = {
  id: string;
  statement: string;
  metric: string;
  metricKind: OutcomeGoalMetricKind;
  targetValue: number;
  /** YYYY-MM-DD */
  deadline: string;
  definitionOfDone: string;
  supportingActivities: string[];
  manualProgress: number;
  progressLogs: OutcomeGoalProgressLog[];
  /** North Star — one primary outcome for Plan My Day alignment */
  isPrimary?: boolean;
  status?: OutcomeGoalStatus;
  whyItMatters?: string;
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

function readAll(): OutcomeGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OutcomeGoal[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((g) => ({
      ...g,
      status: g.status ?? "active",
    }));
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
    .filter((g) => g.status !== "achieved")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export function listAllOutcomeGoals(): OutcomeGoal[] {
  return readAll().sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );
}

export function activeOutcomeCount(): number {
  return readAll().filter((g) => g.status === "active" || !g.status).length;
}

export function getPrimaryOutcomeGoal(): OutcomeGoal | null {
  const all = readAll().filter((g) => g.status !== "achieved");
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

export function formatOutcomeProgressLabel(goal: OutcomeGoal): string {
  const unit = goal.metric.trim();
  if (goal.metricKind === "revenue") {
    return `$${goal.manualProgress.toLocaleString()} / $${goal.targetValue.toLocaleString()}`;
  }
  const unitSuffix = unit ? ` ${unit.toLowerCase()}` : "";
  return `${goal.manualProgress} / ${goal.targetValue}${unitSuffix}`;
}

export function getOutcomeGoal(id: string): OutcomeGoal | null {
  return readAll().find((g) => g.id === id) ?? null;
}

export type CreateOutcomeGoalInput = {
  statement: string;
  metric: string;
  metricKind?: OutcomeGoalMetricKind;
  targetValue: number;
  deadline: string;
  definitionOfDone: string;
  supportingActivities?: string[];
  whyItMatters?: string;
};

export function createOutcomeGoal(input: CreateOutcomeGoalInput): OutcomeGoal {
  const now = new Date().toISOString();
  const existing = readAll();
  const hasPrimary = existing.some((g) => g.isPrimary);
  const goal: OutcomeGoal = {
    id: uid(),
    statement: input.statement.trim(),
    metric: input.metric.trim(),
    metricKind: input.metricKind ?? inferMetricKind(input.metric, input.statement),
    targetValue: input.targetValue,
    deadline: input.deadline,
    definitionOfDone: input.definitionOfDone.trim(),
    supportingActivities: input.supportingActivities ?? [],
    manualProgress: 0,
    progressLogs: [],
    isPrimary: !hasPrimary,
    status: "active",
    whyItMatters: input.whyItMatters?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...existing, goal]);
  return goal;
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

export function deleteOutcomeGoal(id: string): void {
  writeAll(readAll().filter((g) => g.id !== id));
}

/** Self-reported progress — not linked to banks or invoices. */
export function logOutcomeGoalProgress(
  id: string,
  amount: number,
  note?: string,
): OutcomeGoal | null {
  const goal = getOutcomeGoal(id);
  if (!goal || amount <= 0) return null;
  const loggedAt = new Date().toISOString();
  return updateOutcomeGoal(id, {
    manualProgress: goal.manualProgress + amount,
    progressLogs: [
      ...goal.progressLogs,
      { amount, note: note?.trim() || undefined, loggedAt },
    ].slice(-50),
  });
}

export function goalProgressPercent(goal: OutcomeGoal): number {
  if (goal.targetValue <= 0) return 0;
  return Math.min(100, Math.round((goal.manualProgress / goal.targetValue) * 100));
}

export function inferMetricKind(
  metric: string,
  statement: string,
): OutcomeGoalMetricKind {
  const text = `${metric} ${statement}`.toLowerCase();
  if (/\$|revenue|income|sales \$|dollar/.test(text)) return "revenue";
  return "count";
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
