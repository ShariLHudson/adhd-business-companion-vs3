/**
 * Today's Plan reorder helpers — locked appointments stay fixed;
 * flexible tasks fill around them. Preference signals stay lightweight.
 */

import { todayStr } from "@/lib/companionStore";
import {
  detectDeepFocusWork,
  detectErrandTask,
  detectQuickTask,
  estimateTaskMinutes,
} from "./completePlanWorkflow";
import type { PlanDayItem, PlanItemPriority } from "./types";

export type PlanItemIndicatorId =
  | "highest-priority"
  | "high-energy"
  | "time-sensitive"
  | "errand"
  | "deep-focus"
  | "quick-win"
  | "celebration";

export type PlanItemPrimaryIndicator = {
  id: PlanItemIndicatorId;
  label: string;
  emoji: string;
};

export type PlanSchedulePreferences = {
  deepFocusMorning?: number;
  errandsAfternoon?: number;
  quickWinsFirst?: number;
  observationDays: string[];
  preferredStyle?: "gentle" | "balanced" | "focused";
  reshapeAskDismissedDate?: string;
  manualMoveCountToday?: number;
  manualMoveCountDate?: string;
};

const PREFS_KEY = "companion-plan-schedule-prefs-v1";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage != null;
  } catch {
    return false;
  }
}

export function isPlanItemLocked(item: PlanDayItem): boolean {
  if (item.positionLocked) return true;
  if (item.sourceTimeBlockId) return true;
  if (item.flexible === false && Boolean(item.startTime)) return true;
  if (
    item.startTime &&
    (item.source === "time-block" ||
      /\b(appointment|meeting|call with|doctor|dentist)\b/i.test(item.title))
  ) {
    return true;
  }
  return false;
}

export function ensureSortOrders(items: PlanDayItem[]): PlanDayItem[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: item.sortOrder ?? index + 1,
  }));
}

function renumber(items: PlanDayItem[]): PlanDayItem[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function bySortOrder(items: PlanDayItem[]): PlanDayItem[] {
  return [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title),
  );
}

/**
 * Move a flexible item to targetIndex. Locked items keep absolute slots;
 * flexible items fill the remaining positions.
 */
export function reorderFlexiblePlanItems(
  items: PlanDayItem[],
  draggedId: string,
  targetIndex: number,
): PlanDayItem[] {
  const ordered = bySortOrder(ensureSortOrders(items));
  const dragged = ordered.find((i) => i.id === draggedId);
  if (!dragged || isPlanItemLocked(dragged)) return ordered;

  const lockedSlots = new Map<number, PlanDayItem>();
  const flexible: PlanDayItem[] = [];
  ordered.forEach((item, index) => {
    if (isPlanItemLocked(item)) lockedSlots.set(index, item);
    else if (item.id !== draggedId) flexible.push(item);
  });

  const clamped = Math.max(0, Math.min(targetIndex, ordered.length - 1));
  // Build result length = ordered.length; place locked first, then insert dragged among flex slots.
  const result: (PlanDayItem | null)[] = Array.from(
    { length: ordered.length },
    () => null,
  );
  for (const [slot, item] of lockedSlots) {
    result[slot] = item;
  }

  // Preferred placement: if target is locked, place just before that lock (or after if at end).
  let placeAt = clamped;
  if (lockedSlots.has(placeAt)) {
    // Find nearest open slot at or before target, else after.
    let found = -1;
    for (let i = placeAt; i >= 0; i--) {
      if (!result[i]) {
        found = i;
        break;
      }
    }
    if (found < 0) {
      for (let i = placeAt; i < result.length; i++) {
        if (!result[i]) {
          found = i;
          break;
        }
      }
    }
    placeAt = found >= 0 ? found : clamped;
  }

  if (!result[placeAt]) {
    result[placeAt] = dragged;
  } else {
    // Fallback: first open slot
    const open = result.findIndex((x) => x == null);
    if (open >= 0) result[open] = dragged;
  }

  let flexIdx = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] != null) continue;
    result[i] = flexible[flexIdx++] ?? null;
  }

  // Append any leftovers (shouldn't happen)
  const leftover = flexible.slice(flexIdx);
  const compacted = [
    ...(result.filter(Boolean) as PlanDayItem[]),
    ...leftover,
  ];
  return renumber(compacted);
}

export function movePlanItemRelative(
  items: PlanDayItem[],
  id: string,
  direction: "up" | "down",
): PlanDayItem[] {
  const ordered = bySortOrder(ensureSortOrders(items));
  const index = ordered.findIndex((i) => i.id === id);
  if (index < 0) return ordered;
  const item = ordered[index]!;
  if (isPlanItemLocked(item)) return ordered;

  const delta = direction === "up" ? -1 : 1;
  let target = index + delta;
  while (target >= 0 && target < ordered.length && isPlanItemLocked(ordered[target]!)) {
    target += delta;
  }
  if (target < 0 || target >= ordered.length) return ordered;
  return reorderFlexiblePlanItems(ordered, id, target);
}

export function pinPlanItemToTop(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  const ordered = bySortOrder(ensureSortOrders(items));
  const item = ordered.find((i) => i.id === id);
  if (!item || isPlanItemLocked(item)) return ordered;
  const withPin = ordered.map((i) =>
    i.id === id ? { ...i, pinnedToTop: true } : i,
  );
  // First non-locked slot
  const firstFlex = withPin.findIndex((i) => !isPlanItemLocked(i));
  const target = firstFlex >= 0 ? firstFlex : 0;
  return reorderFlexiblePlanItems(withPin, id, target);
}

export function lockPlanItemPosition(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  return ensureSortOrders(items).map((item) =>
    item.id === id ? { ...item, positionLocked: true, flexible: false } : item,
  );
}

function priorityWeight(p?: PlanItemPriority): number {
  if (p === "high") return 0;
  if (p === "medium") return 1;
  if (p === "low") return 2;
  return 1;
}

function scoreFlexible(
  item: PlanDayItem,
  prefs: PlanSchedulePreferences,
  indexHint: number,
): number {
  let score = priorityWeight(item.priority) * 10;
  const mins = item.durationMinutes ?? estimateTaskMinutes(item.title);
  const deep = detectDeepFocusWork(item.title);
  const errand = detectErrandTask(item.title);
  const quick = detectQuickTask(item.title);

  if (item.pinnedToTop) score -= 50;
  if (prefs.deepFocusMorning && deep) score -= prefs.deepFocusMorning * 3;
  if (prefs.errandsAfternoon && errand) score += Math.max(0, 8 - indexHint);
  if (prefs.quickWinsFirst && quick) score -= prefs.quickWinsFirst * 2;
  if (deep) score -= 2;
  if (quick) score -= 1;
  if (mins >= 45 && deep) score -= 1;
  return score;
}

/** Keep locks fixed; reorder flexible by priority / heuristics / learned prefs. */
export function optimizeDayAroundLocks(items: PlanDayItem[]): PlanDayItem[] {
  const ordered = bySortOrder(ensureSortOrders(items));
  const prefs = readPlanSchedulePreferences();
  const lockedSlots = new Map<number, PlanDayItem>();
  const flexible: PlanDayItem[] = [];
  ordered.forEach((item, index) => {
    if (isPlanItemLocked(item)) lockedSlots.set(index, item);
    else flexible.push(item);
  });

  flexible.sort(
    (a, b) =>
      scoreFlexible(a, prefs, 0) - scoreFlexible(b, prefs, 0) ||
      a.title.localeCompare(b.title),
  );

  const result: (PlanDayItem | null)[] = Array.from(
    { length: ordered.length },
    () => null,
  );
  for (const [slot, item] of lockedSlots) result[slot] = item;
  let f = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] != null) continue;
    result[i] = flexible[f++] ?? null;
  }
  return renumber([
    ...(result.filter(Boolean) as PlanDayItem[]),
    ...flexible.slice(f),
  ]);
}

export function buildManualMoveReshapeOffer(input: {
  movedTitle: string;
  toTop: boolean;
}): { message: string; actions: ["reshape", "keep", "dismiss-today"] } {
  const title = input.movedTitle.trim() || "that task";
  const where = input.toTop ? "to the top" : "in your list";
  return {
    message: `I see you moved '${title}' ${where}. Would you like me to adjust the rest of today's schedule around that?`,
    actions: ["reshape", "keep", "dismiss-today"],
  };
}

export function emptyPlanSchedulePreferences(): PlanSchedulePreferences {
  return { observationDays: [] };
}

export function readPlanSchedulePreferences(): PlanSchedulePreferences {
  if (!canUseStorage()) return emptyPlanSchedulePreferences();
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return emptyPlanSchedulePreferences();
    const parsed = JSON.parse(raw) as Partial<PlanSchedulePreferences>;
    return {
      ...emptyPlanSchedulePreferences(),
      ...parsed,
      observationDays: Array.isArray(parsed.observationDays)
        ? parsed.observationDays
        : [],
    };
  } catch {
    return emptyPlanSchedulePreferences();
  }
}

function writePrefs(prefs: PlanSchedulePreferences): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function recordPlanReorderPreference(signal: {
  kind: "deep-focus-morning" | "errands-afternoon" | "quick-wins-first" | "manual-move";
  itemTitle?: string;
  toTop?: boolean;
}): PlanSchedulePreferences {
  const prefs = readPlanSchedulePreferences();
  const today = todayStr();
  const days = new Set(prefs.observationDays);
  days.add(today);
  const next: PlanSchedulePreferences = {
    ...prefs,
    observationDays: [...days].sort().slice(-60),
  };

  if (signal.kind === "manual-move") {
    const count =
      prefs.manualMoveCountDate === today
        ? (prefs.manualMoveCountToday ?? 0) + 1
        : 1;
    next.manualMoveCountToday = count;
    next.manualMoveCountDate = today;
    if (signal.toTop && signal.itemTitle && detectDeepFocusWork(signal.itemTitle)) {
      next.deepFocusMorning = (next.deepFocusMorning ?? 0) + 1;
    }
    if (
      !signal.toTop &&
      signal.itemTitle &&
      detectErrandTask(signal.itemTitle)
    ) {
      next.errandsAfternoon = (next.errandsAfternoon ?? 0) + 1;
    }
  }
  if (signal.kind === "deep-focus-morning") {
    next.deepFocusMorning = (next.deepFocusMorning ?? 0) + 1;
  }
  if (signal.kind === "errands-afternoon") {
    next.errandsAfternoon = (next.errandsAfternoon ?? 0) + 1;
  }
  if (signal.kind === "quick-wins-first") {
    next.quickWinsFirst = (next.quickWinsFirst ?? 0) + 1;
  }

  writePrefs(next);
  return next;
}

export function shouldAskReshapeToday(date = todayStr()): boolean {
  const prefs = readPlanSchedulePreferences();
  return prefs.reshapeAskDismissedDate !== date;
}

export function dismissReshapeAskForToday(date = todayStr()): void {
  const prefs = readPlanSchedulePreferences();
  writePrefs({ ...prefs, reshapeAskDismissedDate: date });
}

export function clearPlanSchedulePreferencesForTests(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(PREFS_KEY);
}

export function planItemPrimaryIndicator(
  item: PlanDayItem,
): PlanItemPrimaryIndicator | null {
  const title = item.title;
  if (item.priority === "high" || item.pinnedToTop) {
    return {
      id: "highest-priority",
      label: "Highest Priority",
      emoji: "⭐",
    };
  }
  if (/\b(celebrat|birthday|anniversary|launch day|congrats)\b/i.test(title)) {
    return {
      id: "celebration",
      label: "Celebration Opportunity",
      emoji: "🎉",
    };
  }
  if (
    item.dueDate === todayStr() ||
    /\b(urgent|deadline|due today|asap)\b/i.test(title)
  ) {
    return { id: "time-sensitive", label: "Time Sensitive", emoji: "⏱️" };
  }
  if (detectErrandTask(title)) {
    return { id: "errand", label: "Errand", emoji: "📍" };
  }
  if (detectDeepFocusWork(title) && (item.durationMinutes ?? 45) >= 30) {
    return { id: "deep-focus", label: "Deep Focus", emoji: "🧠" };
  }
  if (
    detectQuickTask(title) ||
    (item.durationMinutes != null && item.durationMinutes <= 15)
  ) {
    return { id: "quick-win", label: "Quick Win", emoji: "☕" };
  }
  if (/\b(workout|exercise|run|energy)\b/i.test(title)) {
    return { id: "high-energy", label: "High Energy", emoji: "🔥" };
  }
  return null;
}

export function tomorrowDateStr(from = todayStr()): string {
  const d = new Date(`${from}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
