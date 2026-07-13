/**
 * Previous-day handling for Plan My Day.
 * Today stays focused; yesterday stays held until the member chooses.
 */

import { todayStr } from "@/lib/companionStore";
import { saveReminder } from "@/lib/reminderStore";
import { completePlanItem } from "./planTaskCompletion";
import {
  PLAN_PARKING_HOLD_KEY,
  ensurePlanningDates,
  isMeaningfulPlanItem,
  normalizePlanningDate,
  readDeferredPlanStore,
  readTodayPlanItems,
  saveTodayPlanItems,
  writeDeferredPlanStore,
  type PlanDayItem,
  type PlanItemColumn,
} from "./planDayItems";
import { getPlanDayOwnerUserId } from "./planDayOwner";

const PROMPT_STATE_KEY = "companion-plan-previous-day-prompt-v1";

export type PreviousDayPromptState = {
  /** Local day when the member chose Review or Leave Them There */
  handledForDay?: string;
  /** Past plan date currently being reviewed */
  reviewSourceDate?: string;
  /** Item ids already decided during today's review of that source date */
  resolvedItemIds?: string[];
};

export type PastPlanSnapshot = {
  date: string;
  items: PlanDayItem[];
  unfinished: PlanDayItem[];
};

function hasBrowserStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

function uid(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isUnfinishedPlanItem(item: PlanDayItem): boolean {
  return (
    isMeaningfulPlanItem(item) && !item.done && item.column !== "done"
  );
}

export function unfinishedPlanItems(items: PlanDayItem[]): PlanDayItem[] {
  return items.filter(isUnfinishedPlanItem);
}

/** Normalize archive bucket keys to YYYY-MM-DD. */
export function normalizeArchiveDateKey(key: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
  const archived = /^archived-(\d{4}-\d{2}-\d{2})$/.exec(key);
  return archived?.[1] ?? null;
}

export function readPreviousDayPromptState(): PreviousDayPromptState {
  if (!hasBrowserStorage()) return {};
  try {
    const raw = localStorage.getItem(PROMPT_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PreviousDayPromptState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writePreviousDayPromptState(
  state: PreviousDayPromptState,
): void {
  if (!hasBrowserStorage()) return;
  try {
    localStorage.setItem(PROMPT_STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function wasPreviousDayPromptHandledToday(
  day = todayStr(),
): boolean {
  return readPreviousDayPromptState().handledForDay === day;
}

/** Leave Them There — close prompt; do not ask again today. */
export function leavePreviousDayItemsThere(day = todayStr()): void {
  writePreviousDayPromptState({
    handledForDay: day,
    reviewSourceDate: undefined,
    resolvedItemIds: undefined,
  });
}

/** Begin Review — prompt handled for today; open review for source date. */
export function beginPreviousDayReview(
  sourceDate: string,
  day = todayStr(),
): void {
  writePreviousDayPromptState({
    handledForDay: day,
    reviewSourceDate: sourceDate,
    resolvedItemIds: [],
  });
}

export function markPreviousDayItemResolved(itemId: string): void {
  const state = readPreviousDayPromptState();
  const resolved = new Set(state.resolvedItemIds ?? []);
  resolved.add(itemId);
  writePreviousDayPromptState({
    ...state,
    resolvedItemIds: [...resolved],
  });
}

export function clearPreviousDayReviewSession(): void {
  const state = readPreviousDayPromptState();
  writePreviousDayPromptState({
    handledForDay: state.handledForDay,
    reviewSourceDate: undefined,
    resolvedItemIds: undefined,
  });
}

export function readPastPlanSnapshots(): PastPlanSnapshot[] {
  const today = todayStr();
  const deferred = readDeferredPlanStore();
  const byDate = new Map<string, PlanDayItem[]>();

  for (const [key, list] of Object.entries(deferred)) {
    if (key === PLAN_PARKING_HOLD_KEY) continue;
    const date = normalizeArchiveDateKey(key);
    if (!date || date >= today) continue;
    const merged = [...(byDate.get(date) ?? []), ...list];
    byDate.set(date, merged);
  }

  return [...byDate.entries()]
    .map(([date, items]) => ({
      date,
      items,
      unfinished: unfinishedPlanItems(items),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Most recent past plan day that still has unfinished items
 * worth gently offering for review.
 */
export function findHeldPreviousDayUnfinished(): PastPlanSnapshot | null {
  const past = readPastPlanSnapshots();
  return past.find((snap) => snap.unfinished.length > 0) ?? null;
}

export function readArchiveItemsForDate(date: string): PlanDayItem[] {
  const day = normalizePlanningDate(date);
  const deferred = readDeferredPlanStore();
  const primary = deferred[day] ?? [];
  const archived = deferred[`archived-${day}`] ?? [];
  const byId = new Map<string, PlanDayItem>();
  for (const item of [...primary, ...archived]) {
    byId.set(item.id, item);
  }
  return [...byId.values()];
}

export function getReviewablePreviousDayItems(
  sourceDate: string,
): PlanDayItem[] {
  const state = readPreviousDayPromptState();
  const resolved = new Set(state.resolvedItemIds ?? []);
  return unfinishedPlanItems(readArchiveItemsForDate(sourceDate)).filter(
    (item) => !resolved.has(item.id),
  );
}

/** Should the small previous-day banner show on Today? */
export function shouldShowPreviousDayPrompt(day = todayStr()): boolean {
  if (wasPreviousDayPromptHandledToday(day)) return false;
  const held = findHeldPreviousDayUnfinished();
  return Boolean(held && held.unfinished.length > 0);
}

export function previousDayPromptCopy(count: number): {
  message: string;
  reviewLabel: string;
  leaveLabel: string;
} {
  const message =
    count === 1
      ? "One thing is still safely held from yesterday."
      : "A few things are still safely held from yesterday.";
  return {
    message,
    reviewLabel: "Review",
    leaveLabel: "Leave Them There",
  };
}

/**
 * Bring to Today — working copy for today; yesterday's record stays.
 */
export function bringArchivedItemToToday(
  sourceDate: string,
  itemId: string,
): PlanDayItem[] {
  const source = readArchiveItemsForDate(sourceDate).find((i) => i.id === itemId);
  if (!source) return readTodayPlanItems();

  const today = todayStr();
  const column: PlanItemColumn =
    source.column === "doing" || source.column === "today"
      ? source.column
      : "ready";
  const ownerUserId = getPlanDayOwnerUserId();
  const copy: PlanDayItem = {
    ...source,
    id: uid(),
    planningDate: today,
    dueDate: undefined,
    column,
    done: false,
    snoozedUntil: undefined,
    focusRank: column === "doing" ? Date.now() : undefined,
    keptForReference: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerUserId: ownerUserId ?? source.ownerUserId,
  };

  markPreviousDayItemResolved(itemId);
  const stamped = ensurePlanningDates(
    [...readTodayPlanItems(), copy],
    today,
  );
  return saveTodayPlanItems(stamped);
}

/** Leave With Yesterday — keep history; remove from today's review queue. */
export function leaveItemWithYesterday(itemId: string): void {
  markPreviousDayItemResolved(itemId);
}

/**
 * Move to Parking Lot — keep yesterday's history; add a parking copy.
 */
export function parkArchivedItemCopy(sourceDate: string, itemId: string): void {
  const source = readArchiveItemsForDate(sourceDate).find((i) => i.id === itemId);
  if (!source) return;

  const deferred = readDeferredPlanStore();
  const parked: PlanDayItem = {
    ...source,
    id: uid(),
    column: "ready",
    done: false,
    dueDate: undefined,
    snoozedUntil: undefined,
    focusRank: undefined,
    keptForReference: false,
    updatedAt: new Date().toISOString(),
  };
  deferred[PLAN_PARKING_HOLD_KEY] = [
    ...(deferred[PLAN_PARKING_HOLD_KEY] ?? []),
    parked,
  ];
  writeDeferredPlanStore(deferred);
  markPreviousDayItemResolved(itemId);
}

/**
 * Mark Complete — existing completion history; yesterday archive untouched.
 */
export function completeArchivedPlanItem(
  sourceDate: string,
  itemId: string,
): { toast: string } | null {
  const source = readArchiveItemsForDate(sourceDate).find((i) => i.id === itemId);
  if (!source) return null;
  const result = completePlanItem([source], itemId, {
    sourceWorkspace: "plan-my-day",
  });
  if (!result) return null;
  markPreviousDayItemResolved(itemId);
  return { toast: result.toast };
}

/**
 * Remind Me — one-time future reminder (not a Rhythm).
 * Yesterday's record stays; item leaves the review queue.
 */
export function remindArchivedItemOnce(input: {
  sourceDate: string;
  itemId: string;
  date: string;
  time?: string;
}): { scheduledAt: string } | null {
  const source = readArchiveItemsForDate(input.sourceDate).find(
    (i) => i.id === input.itemId,
  );
  if (!source) return null;

  const day = normalizePlanningDate(input.date);
  const time = input.time?.trim();
  const local = time
    ? new Date(`${day}T${time}:00`)
    : new Date(`${day}T09:00:00`);
  if (Number.isNaN(local.getTime())) return null;
  const scheduledAt = local.toISOString();

  saveReminder({
    title: source.title,
    message: source.notes?.trim() || "Worth revisiting when you're ready.",
    reminderType: "one_time",
    scheduledAt,
    source: "task",
  });

  markPreviousDayItemResolved(input.itemId);
  return { scheduledAt };
}

export function resetPreviousDayPromptForTests(): void {
  if (!hasBrowserStorage()) return;
  try {
    localStorage.removeItem(PROMPT_STATE_KEY);
  } catch {
    /* ignore */
  }
}
