/**
 * Plan task completion — ADHD-friendly: remove from view, preserve history.
 */

import { captureBehaviorEvent } from "../closedLoopLearning";
import { getProjectItems, saveProjectItem, todayStr } from "../companionStore";
import { createEvidenceEntry } from "../evidenceBankStore";
import type { PlanDayItem, PlanLifeDomain } from "./types";
import { inferPlanLifeDomain } from "./planItemColors";
import { recordPlanBehaviorEvent } from "./planBehaviorLearning";
import { gentleCompletionAcknowledgement } from "./companionPlanRefinement";

export type PlanTaskSourceWorkspace =
  | "plan-my-day"
  | "kanban"
  | "timeline"
  | "list"
  | "cards"
  | "project";

export type PlanTaskCompletionRecord = {
  id: string;
  taskName: string;
  completedAt: string;
  category: PlanLifeDomain;
  sourceWorkspace: PlanTaskSourceWorkspace;
  projectId?: string;
  planItemId: string;
  elevatedToEvidence: boolean;
};

const HISTORY_KEY = "companion-plan-completion-history-v1";
const PROJECT_LOG_KEY = "companion-project-plan-completions-v1";
const MAX_HISTORY = 1000;

export const PLAN_COMPLETION_TOAST = gentleCompletionAcknowledgement();

function readHistory(): PlanTaskCompletionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PlanTaskCompletionRecord[];
  } catch {
    return [];
  }
}

function writeHistory(records: PlanTaskCompletionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
  } catch {
    /* storage full */
  }
}

type ProjectCompletionLog = Record<
  string,
  { title: string; completedAt: string; planItemId: string }[]
>;

function readProjectLog(): ProjectCompletionLog {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROJECT_LOG_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProjectCompletionLog;
  } catch {
    return {};
  }
}

function writeProjectLog(log: ProjectCompletionLog): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECT_LOG_KEY, JSON.stringify(log));
  } catch {
    /* storage full */
  }
}

export function getPlanCompletionHistory(): PlanTaskCompletionRecord[] {
  return readHistory();
}

/** Completions whose local calendar day matches the given YYYY-MM-DD. */
export function getPlanCompletionsForDate(
  date = todayStr(),
): PlanTaskCompletionRecord[] {
  const day = date;
  return readHistory().filter((r) => {
    const d = new Date(r.completedAt);
    if (Number.isNaN(d.getTime())) return false;
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return local === day;
  });
}

export function getProjectPlanCompletions(
  projectId: string,
): { title: string; completedAt: string }[] {
  return readProjectLog()[projectId] ?? [];
}

export function shouldElevateToEvidenceBank(item: PlanDayItem): boolean {
  if (item.projectId) return true;

  const category = item.category ?? inferPlanLifeDomain(item.title);
  if (category === "business") return true;

  const title = item.title.toLowerCase();
  const significance =
    /\b(launch|client|revenue|sales|publish|post|invoice|contract|campaign|milestone|follow.?up|conversation|breakthrough)\b/i;

  return significance.test(title);
}

function syncProjectCompletion(item: PlanDayItem, completedAt: string): void {
  if (!item.projectId) return;

  const projectItems = getProjectItems(item.projectId);
  const titleKey = item.title.trim().toLowerCase();
  const match = projectItems.find(
    (pi) =>
      pi.kind !== "section" &&
      pi.title.trim().toLowerCase() === titleKey &&
      !pi.done,
  );
  if (match) {
    saveProjectItem({ ...match, done: true });
  } else {
    saveProjectItem({
      projectId: item.projectId,
      kind: "task",
      title: item.title,
      done: true,
    });
  }

  const log = readProjectLog();
  const entries = log[item.projectId] ?? [];
  log[item.projectId] = [
    { title: item.title, completedAt, planItemId: item.id },
    ...entries,
  ].slice(0, 200);
  writeProjectLog(log);
}

function recordFounderAnalytics(
  record: PlanTaskCompletionRecord,
  item: PlanDayItem,
): void {
  captureBehaviorEvent({
    capability: "plan_my_day",
    eventType: "workspace_completed",
    metadata: {
      taskName: record.taskName,
      category: record.category,
      hasProject: Boolean(record.projectId),
      elevatedToEvidence: record.elevatedToEvidence,
      hourOfDay: new Date(record.completedAt).getHours(),
      durationMin: item.durationMinutes ?? 0,
    },
  });
}

function maybeElevateToEvidence(item: PlanDayItem): boolean {
  if (!shouldElevateToEvidenceBank(item)) return false;
  const category =
    item.category === "business" || inferPlanLifeDomain(item.title) === "business"
      ? "Business Growth"
      : item.projectId
        ? "Client Impact"
        : "Personal Growth";

  createEvidenceEntry({
    category,
    whatHappened: `Completed: ${item.title}`,
    whatImproved: "Moved forward on something that mattered.",
    whatMovedForward: item.projectId
      ? "Progress recorded on a tracked initiative."
      : "A planned task is done.",
    whatProblemSolved: "Reduced open-loop pressure for today.",
    whoBenefited: item.projectId ? "Your client or project stakeholders" : "You",
    whyItMattered: "Follow-through builds trust and momentum.",
    whatThisProves: "You finish what you start — even when ADHD makes it hard.",
    attachments: [],
  });
  return true;
}

export type CompletePlanItemResult = {
  items: PlanDayItem[];
  record: PlanTaskCompletionRecord;
  toast: string;
  elevatedToEvidence: boolean;
};

/** Complete a plan item: archive history, sync project, remove from active list. */
export function completePlanItem(
  items: PlanDayItem[],
  id: string,
  options?: { sourceWorkspace?: PlanTaskSourceWorkspace },
): CompletePlanItemResult | null {
  const item = items.find((i) => i.id === id);
  if (!item) return null;

  const completedAt = new Date().toISOString();
  const category = item.category ?? inferPlanLifeDomain(item.title);
  const elevatedToEvidence = maybeElevateToEvidence(item);

  const record: PlanTaskCompletionRecord = {
    id: `completion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    taskName: item.title,
    completedAt,
    category,
    sourceWorkspace: options?.sourceWorkspace ?? "plan-my-day",
    projectId: item.projectId,
    planItemId: item.id,
    elevatedToEvidence,
  };

  writeHistory([record, ...readHistory()]);
  syncProjectCompletion(item, completedAt);
  recordFounderAnalytics(record, item);
  recordPlanBehaviorEvent({
    kind: "completed",
    planItemId: item.id,
    title: item.title,
  });

  const nextItems = items.filter((i) => i.id !== id);

  return {
    items: nextItems,
    record,
    toast: gentleCompletionAcknowledgement(item.title),
    elevatedToEvidence,
  };
}

export type PlanCompletionAnalytics = {
  totalCompletions: number;
  last7Days: number;
  withProject: number;
  businessCategory: number;
  byHour: Record<number, number>;
};

export function buildPlanCompletionAnalytics(): PlanCompletionAnalytics {
  const history = readHistory();
  const weekAgo = Date.now() - 7 * 86_400_000;
  const byHour: Record<number, number> = {};

  for (const r of history) {
    const h = new Date(r.completedAt).getHours();
    byHour[h] = (byHour[h] ?? 0) + 1;
  }

  return {
    totalCompletions: history.length,
    last7Days: history.filter((r) => new Date(r.completedAt).getTime() >= weekAgo)
      .length,
    withProject: history.filter((r) => r.projectId).length,
    businessCategory: history.filter((r) => r.category === "business").length,
    byHour,
  };
}

export function resetPlanCompletionForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(PROJECT_LOG_KEY);
}
