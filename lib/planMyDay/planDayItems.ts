import { getDayDesignerStore } from "@/lib/day-designer/dayStore";
import {
  formatPrefsClockTime,
  getTimeBlocks,
  saveTimeBlock,
  todayStr,
  type TimeBlock,
} from "@/lib/companionStore";
import type { PlanDayItem, PlanItemColumn, PlanItemPriority, PlanDayItemSource } from "./types";
import type { PlanLifeDomain } from "./types";
import { resolvePlanItemLifeAreaName, classifyTaskLifeArea } from "./lifeAreaBridge";
import {
  completePlanItem,
  type CompletePlanItemResult,
  type PlanTaskSourceWorkspace,
} from "./planTaskCompletion";
import { recordPlanBehaviorEvent } from "./planBehaviorLearning";
import {
  filterPlanItemsForOwner,
  getPlanDayOwnerUserId,
  planDayDeferredStoreKey,
  planDayItemsStoreKey,
} from "./planDayOwner";

const LEGACY_STORE_KEY = "companion-plan-my-day-items-v1";
const LEGACY_DEFERRED_STORE_KEY = "companion-plan-my-day-deferred-v1";

export const PLAN_MY_DAY_UPDATED = "companion-plan-my-day-updated";

let planUpdateNotifyQueued = false;

function notifyPlanUpdated(): void {
  if (!hasBrowserStorage()) return;
  if (planUpdateNotifyQueued) return;
  planUpdateNotifyQueued = true;
  queueMicrotask(() => {
    planUpdateNotifyQueued = false;
    window.dispatchEvent(new Event(PLAN_MY_DAY_UPDATED));
  });
}

type StoredDay = {
  date: string;
  items: PlanDayItem[];
};

function hasBrowserStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

function readStored(): StoredDay | null {
  if (!hasBrowserStorage()) return null;
  try {
    const key = planDayItemsStoreKey();
    let raw = localStorage.getItem(key);
    // One-time migrate from legacy device key into the signed-in member key.
    // Delete legacy after copy so a second account cannot inherit the same day.
    if (!raw && key !== LEGACY_STORE_KEY) {
      const legacy = localStorage.getItem(LEGACY_STORE_KEY);
      if (legacy) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(LEGACY_STORE_KEY);
        raw = legacy;
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDay;
    if (!parsed?.date || !Array.isArray(parsed.items)) return null;
    const items = filterPlanItemsForOwner(parsed.items);
    return { ...parsed, items };
  } catch {
    return null;
  }
}

function writeStored(data: StoredDay): void {
  if (!hasBrowserStorage()) return;
  try {
    const key = planDayItemsStoreKey();
    const owner = getPlanDayOwnerUserId();
    const items = data.items.map((item) =>
      owner && !item.ownerUserId ? { ...item, ownerUserId: owner } : item,
    );
    const payload = JSON.stringify({ ...data, items });
    const existing = localStorage.getItem(key);
    if (existing === payload) return;
    localStorage.setItem(key, payload);
    notifyPlanUpdated();
  } catch {
    /* storage unavailable */
  }
}

function readDeferred(): Record<string, PlanDayItem[]> {
  if (typeof window === "undefined") return {};
  try {
    const key = planDayDeferredStoreKey();
    let raw = localStorage.getItem(key);
    if (!raw && key !== LEGACY_DEFERRED_STORE_KEY) {
      const legacy = localStorage.getItem(LEGACY_DEFERRED_STORE_KEY);
      if (legacy) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(LEGACY_DEFERRED_STORE_KEY);
        raw = legacy;
      }
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PlanDayItem[]>;
    if (!parsed || typeof parsed !== "object") return {};
    const next: Record<string, PlanDayItem[]> = {};
    for (const [date, list] of Object.entries(parsed)) {
      if (!Array.isArray(list)) continue;
      next[date] = filterPlanItemsForOwner(list);
    }
    return next;
  } catch {
    return {};
  }
}

/** Ideas waiting in the parking lot — deferred to future days. */
export function readParkingLotPlanItems(): PlanDayItem[] {
  const deferred = readDeferred();
  return Object.values(deferred).flat().filter((i) => !i.done);
}

/** Move a parked idea onto today's plan. */
export function bringParkingLotItemToToday(itemId: string): PlanDayItem[] {
  const deferred = readDeferred();
  let found: PlanDayItem | null = null;
  const nextDeferred: Record<string, PlanDayItem[]> = {};

  for (const [date, list] of Object.entries(deferred)) {
    const kept: PlanDayItem[] = [];
    for (const item of list) {
      if (item.id === itemId) {
        found = {
          ...item,
          column: "ready",
          done: false,
        };
      } else {
        kept.push(item);
      }
    }
    if (kept.length > 0) nextDeferred[date] = kept;
  }

  if (!found) return readTodayPlanItems();
  writeDeferred(nextDeferred);
  return saveTodayPlanItems([...readTodayPlanItems(), found]);
}

function writeDeferred(data: Record<string, PlanDayItem[]>): void {
  if (typeof window === "undefined") return;
  try {
    const key = planDayDeferredStoreKey();
    const payload = JSON.stringify(data);
    const existing = localStorage.getItem(key);
    if (existing === payload) return;
    localStorage.setItem(key, payload);
    notifyPlanUpdated();
  } catch {
    /* storage unavailable */
  }
}

function consumeDeferredForDate(date: string): PlanDayItem[] {
  const all = readDeferred();
  const forDate = all[date];
  if (!forDate?.length) return [];
  const next = { ...all };
  delete next[date];
  writeDeferred(next);
  return forDate;
}

/**
 * Normalize a Date or YYYY-MM-DD string to the member's local calendar day.
 * Prefer this over UTC `toISOString().slice(0, 10)`.
 */
export function normalizePlanningDate(input?: Date | string | null): string {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    return input.trim();
  }
  const d =
    input instanceof Date
      ? input
      : typeof input === "string" && input.trim()
        ? new Date(input)
        : new Date();
  if (Number.isNaN(d.getTime())) return todayStr();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Resolve which local day an item belongs to. */
export function planItemPlanningDate(
  item: PlanDayItem,
  envelopeDate?: string | null,
): string {
  if (item.planningDate && /^\d{4}-\d{2}-\d{2}$/.test(item.planningDate)) {
    return item.planningDate;
  }
  if (envelopeDate && /^\d{4}-\d{2}-\d{2}$/.test(envelopeDate)) {
    return envelopeDate;
  }
  return todayStr();
}

/** A saved item with a real title counts as meaningful plan data for its day. */
export function isMeaningfulPlanItem(item: PlanDayItem): boolean {
  return Boolean(item.title?.trim());
}

/**
 * True when the member already has one or more saved Plan My Day items
 * for the given local calendar date (no seeding, no writes).
 */
export function hasMeaningfulPlanItemsForDate(date = todayStr()): boolean {
  const day = normalizePlanningDate(date);
  const stored = readStored();
  if (!stored || stored.date !== day) return false;
  return stored.items.some(
    (item) =>
      isMeaningfulPlanItem(item) &&
      planItemPlanningDate(item, stored.date) === day,
  );
}

export function hasMeaningfulPlanItemsForToday(): boolean {
  return hasMeaningfulPlanItemsForDate(todayStr());
}

/** Stamp planningDate onto items missing it (in-memory; caller persists). */
export function ensurePlanningDates(
  items: PlanDayItem[],
  date = todayStr(),
): PlanDayItem[] {
  const day = normalizePlanningDate(date);
  let changed = false;
  const next = items.map((item) => {
    if (item.planningDate === day) return item;
    if (item.planningDate && item.planningDate !== day) return item;
    changed = true;
    return { ...item, planningDate: day };
  });
  return changed ? next : items;
}

export function dateStrFromOffset(days: number, from = todayStr()): string {
  const d = new Date(`${from}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function tomorrowStr(): string {
  return dateStrFromOffset(1);
}

export function formatPlanDueDate(dueDate?: string): string {
  if (!dueDate) return "—";
  const today = todayStr();
  if (dueDate === today) return "Today";
  if (dueDate === tomorrowStr()) return "Tomorrow";
  try {
    const d = new Date(`${dueDate}T12:00:00`);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dueDate;
  }
}

const PRIORITY_WEIGHT: Record<PlanItemPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function planItemPriorityWeight(item: PlanDayItem): number {
  return PRIORITY_WEIGHT[item.priority ?? "medium"];
}

function sanitizeActiveItems(items: PlanDayItem[]): PlanDayItem[] {
  return items
    .filter((i) => !i.done && i.column !== "done")
    .map((i) => {
      if (i.column === "parked") {
        return { ...i, column: "ready" as PlanItemColumn };
      }
      return i;
    });
}

export function finishPlanItem(
  items: PlanDayItem[],
  id: string,
  options?: { sourceWorkspace?: PlanTaskSourceWorkspace },
): CompletePlanItemResult | null {
  const result = completePlanItem(items, id, options);
  if (!result) return null;
  return {
    ...result,
    items: saveTodayPlanItems(result.items),
  };
}

function uid(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function columnFromBlock(b: TimeBlock): PlanItemColumn {
  if (b.status === "completed") return "done";
  if (b.status === "progress" || b.status === "triggered") return "doing";
  return "ready";
}

/** Map a legacy Momentum Appointment (TimeBlock) into the current PlanDayItem model. */
export function planDayItemFromTimeBlock(b: TimeBlock): PlanDayItem {
  const planningDate = normalizePlanningDate(b.date || todayStr());
  return {
    id: `tb-${b.id}`,
    title: b.title,
    durationMinutes: b.durationMin,
    flexible: b.durationFlexible,
    startTime: b.startTime || undefined,
    planningDate,
    column: columnFromBlock(b),
    done: b.status === "completed",
    projectId: b.projectId,
    notes: b.note,
    createdAt: b.createdAt,
    sourceTimeBlockId: b.id,
    source: "time-block",
  };
}

/** @deprecated Prefer planDayItemFromTimeBlock */
function itemFromTimeBlock(b: TimeBlock): PlanDayItem {
  return planDayItemFromTimeBlock(b);
}

/** Build items from today’s time blocks + adaptive day plan. */
export function seedPlanItemsFromSources(): PlanDayItem[] {
  const today = todayStr();
  const seen = new Set<string>();
  const items: PlanDayItem[] = [];

  const blocks = getTimeBlocks().filter(
    (b) => b.date === today && b.status !== "not-today" && b.status !== "completed",
  );
  for (const b of blocks) {
    const key = b.title.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push(itemFromTimeBlock(b));
  }

  const dayPlan = getDayDesignerStore().plans.find((p) => p.date === today);
  if (dayPlan) {
    for (const block of dayPlan.suggestedBlocks) {
      if (block.title.toLowerCase().includes("margin")) continue;
      const key = block.title.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: `day-${block.id}`,
        title: block.title,
        durationMinutes: block.durationMinutes,
        flexible: block.durationMinutes <= 15,
        planningDate: today,
        column: "ready",
        done: false,
        createdAt: new Date().toISOString(),
        source: "day-designer",
      });
    }
    for (const p of dayPlan.priorities) {
      const key = p.label.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: `pri-${p.id}`,
        title: p.label,
        durationMinutes: p.estimatedMinutes,
        flexible: !p.estimatedMinutes,
        planningDate: today,
        column: "ready",
        done: false,
        createdAt: new Date().toISOString(),
        source: "day-designer",
      });
    }
  }

  return assignDefaultTimes(items);
}

/** Spread default start times when missing (9:00, +1h each). */
export function assignDefaultTimes(items: PlanDayItem[]): PlanDayItem[] {
  let hour = 9;
  let minute = 0;
  return items.map((item) => {
    if (item.startTime) return item;
    const startTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    hour += 1;
    if (hour > 17) hour = 9;
    return { ...item, startTime };
  });
}

export function loadTodayPlanItems(): PlanDayItem[] {
  const today = todayStr();
  const stored = readStored();
  let items: PlanDayItem[];
  let shouldPersist = false;

  if (stored?.date === today) {
    items = sanitizeActiveItems(stored.items);
    if (items.length !== stored.items.length) {
      shouldPersist = true;
    }
  } else {
    // New local day: preserve previous plan history. Do NOT carry unfinished into today.
    if (stored?.date && stored.items.length > 0) {
      archivePlanEnvelope(stored);
    }
    items = seedPlanItemsFromSources();
    shouldPersist = true;
  }

  // Intentional dated deferrals / one-time “remind me” holds for today only.
  const deferred = consumeDeferredForDate(today);
  if (deferred.length > 0) {
    items = assignDefaultTimes([...items, ...deferred]);
    shouldPersist = true;
  }

  const stamped = ensurePlanningDates(items, today);
  if (stamped !== items) {
    items = stamped;
    shouldPersist = true;
  }

  if (shouldPersist) {
    writeStored({ date: today, items });
  }

  return items;
}

/**
 * Preserve a day's plan in deferred history without adding it to today.
 * Idempotent per item id for the same date key.
 */
export function archivePlanEnvelope(envelope: {
  date: string;
  items: PlanDayItem[];
}): string {
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(envelope.date)
    ? envelope.date
    : todayStr();
  if (!envelope.items.length) return dateKey;
  const deferred = readDeferred();
  const existing = deferred[dateKey] ?? [];
  const existingIds = new Set(existing.map((i) => i.id));
  const incoming = envelope.items.filter((i) => !existingIds.has(i.id));
  if (incoming.length > 0) {
    deferred[dateKey] = [...existing, ...incoming];
    writeDeferred(deferred);
  }
  return dateKey;
}

/** Read-only access to deferred / archive buckets (Parking Lot, past days, dated holds). */
export function readDeferredPlanStore(): Record<string, PlanDayItem[]> {
  return readDeferred();
}

export function writeDeferredPlanStore(
  data: Record<string, PlanDayItem[]>,
): void {
  writeDeferred(data);
}

/** Read today's plan from storage only — no seeding, writes, or events. */
export function readTodayPlanItems(): PlanDayItem[] {
  const today = todayStr();
  const stored = readStored();
  if (stored?.date === today) {
    return stored.items;
  }
  return [];
}

/** Reset Day — clear today's active plan and start again (same calendar day). */
export function resetPlanDayView(): PlanDayItem[] {
  return saveTodayPlanItems([]);
}

/** Remove completed items from today's active plan list. */
export function clearCompletedPlanItems(): PlanDayItem[] {
  return saveTodayPlanItems(
    readTodayPlanItems().filter((i) => !i.done && i.column !== "done"),
  );
}

/** New Day — keep unfinished tasks, drop completed from active view. */
export function carryForwardUnfinishedPlanItems(): PlanDayItem[] {
  const unfinished = sanitizeActiveItems(readTodayPlanItems()).map((i) => ({
    ...i,
    done: false,
    column:
      i.column === "doing"
        ? ("today" as PlanItemColumn)
        : i.column === "done"
          ? ("ready" as PlanItemColumn)
          : i.column,
  }));
  return saveTodayPlanItems(unfinished);
}

/** Archive today's plan snapshot and clear the planning view. */
export function archiveTodayPlan(): void {
  resetTodayPlanForNewDay();
}

/** Archive the current plan snapshot and clear today's planning view for a new-day reset. */
export function resetTodayPlanForNewDay(): void {
  const today = todayStr();
  const stored = readStored();
  if (stored?.items?.length) {
    const deferred = readDeferred();
    const archiveKey =
      stored.date === today ? `archived-${today}` : stored.date;
    deferred[archiveKey] = [...(deferred[archiveKey] ?? []), ...stored.items];
    writeDeferred(deferred);
  }
  writeStored({ date: today, items: [] });
}

export function saveTodayPlanItems(items: PlanDayItem[]): PlanDayItem[] {
  const today = todayStr();
  const stamped = ensurePlanningDates(items, today);
  writeStored({ date: today, items: stamped });
  return stamped;
}

function syncLegacyTimeBlockFromPlanItem(item: PlanDayItem): void {
  const blockId = item.sourceTimeBlockId;
  if (!blockId) return;
  const existing = getTimeBlocks().find((b) => b.id === blockId);
  if (!existing) return;
  const status: TimeBlock["status"] = item.done
    ? "completed"
    : item.column === "doing"
      ? "progress"
      : existing.status === "completed"
        ? "pending"
        : existing.status;
  saveTimeBlock({
    id: blockId,
    title: item.title.trim() || existing.title,
    date: item.planningDate || item.dueDate || existing.date,
    startTime: item.startTime || existing.startTime,
    durationMin: item.durationMinutes ?? existing.durationMin,
    note: item.notes,
    projectId: item.projectId,
    status,
  });
}

export function updatePlanItem(
  items: PlanDayItem[],
  id: string,
  patch: Partial<PlanDayItem>,
): PlanDayItem[] {
  const now = new Date().toISOString();
  const next = saveTodayPlanItems(
    items.map((it) =>
      it.id === id ? { ...it, ...patch, updatedAt: now } : it,
    ),
  );
  const updated = next.find((it) => it.id === id);
  if (updated?.sourceTimeBlockId) {
    syncLegacyTimeBlockFromPlanItem(updated);
  }
  return next;
}

export function movePlanItemColumn(
  items: PlanDayItem[],
  id: string,
  column: PlanItemColumn,
): PlanDayItem[] {
  return movePlanItemKanban(items, id, column).items;
}

export type KanbanMoveResult = {
  items: PlanDayItem[];
  enteredDoing: boolean;
  completed: CompletePlanItemResult | null;
  itemTitle: string;
};

/** Kanban drag — column moves only (completion is separate). */
export function movePlanItemKanban(
  items: PlanDayItem[],
  id: string,
  column: PlanItemColumn,
): KanbanMoveResult {
  const item = items.find((i) => i.id === id);
  if (!item) {
    return {
      items,
      enteredDoing: false,
      completed: null,
      itemTitle: "",
    };
  }

  if (column === "done") {
    const completed = finishPlanItem(items, id, { sourceWorkspace: "kanban" });
    return {
      items: completed?.items ?? items,
      enteredDoing: false,
      completed,
      itemTitle: item.title,
    };
  }

  const prevColumn = item.column;
  const patch: Partial<PlanDayItem> = { column, done: false };

  if (column === "doing") {
    patch.snoozedUntil = undefined;
    patch.focusRank = Date.now();
  }

  if (column === "parked" || column === "ready" || column === "today") {
    patch.snoozedUntil = undefined;
  }

  const next = saveTodayPlanItems(
    items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
  );

  return {
    items: next,
    enteredDoing: column === "doing" && prevColumn !== "doing",
    completed: null,
    itemTitle: item.title,
  };
}

export function togglePlanItemDone(
  items: PlanDayItem[],
  id: string,
): CompletePlanItemResult | { items: PlanDayItem[]; completed: null } {
  const item = items.find((i) => i.id === id);
  if (!item) return { items, completed: null };
  if (item.done) {
    return {
      items: updatePlanItem(items, id, {
        done: false,
        column: item.column === "done" ? "ready" : item.column,
      }),
      completed: null,
    };
  }
  const completed = finishPlanItem(items, id, { sourceWorkspace: "plan-my-day" });
  if (!completed) return { items, completed: null };
  return completed;
}

/** Active in today's working list — not completed, parked, or snoozed. */
export function isPlanItemActive(item: PlanDayItem): boolean {
  if (item.column === "parked") return false;
  if (item.done && !item.keptForReference) return false;
  if (item.snoozedUntil && new Date(item.snoozedUntil) > new Date()) {
    return false;
  }
  return true;
}

export function deletePlanItem(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  return saveTodayPlanItems(items.filter((i) => i.id !== id));
}

export function duplicatePlanItem(
  items: PlanDayItem[],
  id: string,
): PlanDayItem[] {
  const source = items.find((i) => i.id === id);
  if (!source) return items;
  const copy: PlanDayItem = {
    ...source,
    id: uid(),
    title: `${source.title} (copy)`,
    column: "ready",
    done: false,
    keptForReference: false,
    snoozedUntil: undefined,
    createdAt: new Date().toISOString(),
  };
  return saveTodayPlanItems([...items, copy]);
}

export function snoozePlanItem(
  items: PlanDayItem[],
  id: string,
  minutes = 30,
): PlanDayItem[] {
  const until = new Date(Date.now() + minutes * 60_000).toISOString();
  return snoozePlanItemUntil(items, id, until);
}

export function snoozePlanItemUntil(
  items: PlanDayItem[],
  id: string,
  until: string,
): PlanDayItem[] {
  const item = items.find((i) => i.id === id);
  if (item) {
    recordPlanBehaviorEvent({
      kind: "snoozed",
      planItemId: item.id,
      title: item.title,
    });
  }
  return updatePlanItem(items, id, { snoozedUntil: until });
}

/** Intentional parking — not tied to a calendar day. */
export const PLAN_PARKING_HOLD_KEY = "someday";

/** Move an item into the Planning Parking Lot (intentional set-aside). */
export function parkPlanItem(items: PlanDayItem[], id: string): PlanDayItem[] {
  return deferPlanItemToDate(items, id, PLAN_PARKING_HOLD_KEY);
}

/**
 * Park free-form text in the intentional Parking Lot (deferred someday hold).
 * Reuses companion-plan-my-day-deferred-v1 — does not create a second store.
 */
export function addParkingLotItem(input: {
  title: string;
  source?: PlanDayItemSource;
  notes?: string;
}): PlanDayItem | null {
  const title = input.title.trim();
  if (!title) return null;
  const now = new Date().toISOString();
  const owner = getPlanDayOwnerUserId();
  const item: PlanDayItem = {
    id: uid(),
    title,
    column: "ready",
    done: false,
    notes: input.notes?.trim() || undefined,
    source: input.source ?? "manual",
    createdAt: now,
    updatedAt: now,
    ownerUserId: owner ?? undefined,
  };
  const deferred = readDeferred();
  deferred[PLAN_PARKING_HOLD_KEY] = [
    ...(deferred[PLAN_PARKING_HOLD_KEY] ?? []),
    item,
  ];
  writeDeferred(deferred);
  return item;
}

/** Member-facing source label when provenance is known. */
export function parkingLotSourceLabel(
  source: PlanDayItemSource | undefined,
): string | null {
  if (!source) return null;
  if (source === "clear-my-mind") return "Clear My Mind";
  if (source === "manual") return "Added directly";
  if (
    source === "time-block" ||
    source === "day-designer" ||
    source === "rhythm"
  ) {
    return "Plan My Day";
  }
  return null;
}

/** Intentional Parking Lot only (not dated “send later” holds). */
export function readPlanningParkingLotItems(): PlanDayItem[] {
  const deferred = readDeferred();
  return (deferred[PLAN_PARKING_HOLD_KEY] ?? []).filter((i) => !i.done);
}

/** Deferred items keyed by date (excludes intentional someday parking). */
export function readDatedDeferredPlanItems(): {
  date: string;
  items: PlanDayItem[];
}[] {
  const deferred = readDeferred();
  return Object.entries(deferred)
    .filter(
      ([date]) =>
        date !== PLAN_PARKING_HOLD_KEY && !date.startsWith("archived-"),
    )
    .filter(([, list]) => list.some((i) => !i.done))
    .map(([date, list]) => ({
      date,
      items: list.filter((i) => !i.done),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Update a deferred / parked item in place. */
export function updateDeferredPlanItem(
  itemId: string,
  patch: Partial<
    Pick<PlanDayItem, "title" | "notes" | "durationMinutes" | "priority">
  >,
): void {
  const deferred = readDeferred();
  let changed = false;
  const next: Record<string, PlanDayItem[]> = {};
  for (const [date, list] of Object.entries(deferred)) {
    next[date] = list.map((item) => {
      if (item.id !== itemId) return item;
      changed = true;
      return {
        ...item,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
    });
  }
  if (changed) writeDeferred(next);
}

/** Permanently remove a deferred / parked item. */
export function deleteDeferredPlanItem(itemId: string): void {
  const deferred = readDeferred();
  const next: Record<string, PlanDayItem[]> = {};
  for (const [date, list] of Object.entries(deferred)) {
    const kept = list.filter((i) => i.id !== itemId);
    if (kept.length > 0) next[date] = kept;
  }
  writeDeferred(next);
}

/** Remove from today and schedule for a future date. */
export function deferPlanItemToDate(
  items: PlanDayItem[],
  id: string,
  targetDate: string,
): PlanDayItem[] {
  const item = items.find((i) => i.id === id);
  if (!item || targetDate === todayStr()) return items;

  recordPlanBehaviorEvent({
    kind: "deferred",
    planItemId: item.id,
    title: item.title,
  });

  const moved: PlanDayItem = {
    ...item,
    column: "ready",
    done: false,
    dueDate: targetDate,
    snoozedUntil: undefined,
    focusRank: undefined,
    keptForReference: false,
  };

  const deferred = readDeferred();
  deferred[targetDate] = [...(deferred[targetDate] ?? []), moved];
  writeDeferred(deferred);

  return saveTodayPlanItems(items.filter((i) => i.id !== id));
}

export function formatPlanItemCreated(item: PlanDayItem): string {
  if (!item.createdAt) return "Today";
  try {
    const d = new Date(item.createdAt);
    const today = todayStr();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (day === today) return "Today";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Today";
  }
}

export function currentFocusItem(items: PlanDayItem[]): PlanDayItem | null {
  const doing = items.filter(
    (i) => i.column === "doing" && isPlanItemActive(i),
  );
  if (doing.length > 0) {
    return [...doing].sort((a, b) => {
      const priorityDiff =
        planItemPriorityWeight(b) - planItemPriorityWeight(a);
      if (priorityDiff !== 0) return priorityDiff;
      const rankDiff = (b.focusRank ?? 0) - (a.focusRank ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    })[0]!;
  }
  return (
    items.find(
      (i) =>
        isPlanItemActive(i) &&
        i.column !== "done" &&
        i.column !== "parked",
    ) ?? null
  );
}

export function nextFocusOptions(
  items: PlanDayItem[],
  excludeId?: string,
): PlanDayItem[] {
  return items
    .filter(
      (i) =>
        isPlanItemActive(i) &&
        i.column !== "parked" &&
        i.id !== excludeId,
    )
    .slice(0, 4);
}

export function formatPlanTime(startTime?: string): string {
  if (!startTime) return "Flexible";
  const [h, m] = startTime.split(":").map(Number);
  if (Number.isNaN(h)) return startTime;
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return formatPrefsClockTime(d);
}

export function durationLabel(item: PlanDayItem): string {
  if (item.flexible && !item.durationMinutes) return "Flexible";
  if (item.durationMinutes) return `${item.durationMinutes} min`;
  return "—";
}

export function planItemMetaLabel(
  item: PlanDayItem,
  colorCoding = true,
): string {
  const parts: string[] = [];
  if (item.startTime) parts.push(formatPlanTime(item.startTime));
  const dur = durationLabel(item);
  if (dur !== "—") parts.push(dur);
  if (colorCoding) {
    parts.push(resolvePlanItemLifeAreaName(item));
  }
  const joined = parts.join(" · ");
  return joined || (colorCoding ? "Flexible" : "Anytime");
}

export type QuickPlanItemInput = {
  title: string;
  /** Explicit Life Area — omit for companion detection */
  lifeAreaId?: string | "auto";
  /** @deprecated Prefer lifeAreaId */
  category?: PlanLifeDomain | "auto";
  startTime?: string;
  durationMinutes?: number;
  /** Optional details / why today */
  notes?: string;
  /** Day area — defaults to Considering Today */
  column?: Extract<PlanItemColumn, "ready" | "today" | "doing">;
  /** Provenance — defaults to manual */
  source?: PlanDayItemSource;
};

export function countActivePlanItems(): number {
  return readTodayPlanItems().filter(isPlanItemActive).length;
}

export function addQuickPlanItem(
  input: string | QuickPlanItemInput,
  existingItems?: PlanDayItem[],
): PlanDayItem[] {
  const parsed: QuickPlanItemInput =
    typeof input === "string" ? { title: input } : input;
  const trimmed = parsed.title.trim();
  const stored = readTodayPlanItems();
  const items =
    existingItems && existingItems.length >= stored.length
      ? existingItems
      : stored;
  if (!trimmed) return items;

  const hasTime = Boolean(parsed.startTime?.trim());
  const explicitLifeAreaId =
    parsed.lifeAreaId && parsed.lifeAreaId !== "auto"
      ? parsed.lifeAreaId
      : undefined;
  const explicitCategory =
    parsed.category && parsed.category !== "auto" ? parsed.category : undefined;

  let resolvedLifeAreaId = explicitLifeAreaId;
  if (!resolvedLifeAreaId && !explicitCategory) {
    const classification = classifyTaskLifeArea(trimmed);
    if (classification && !classification.needsConfirmation) {
      resolvedLifeAreaId = classification.primaryLifeAreaId;
    }
  }

  const column: PlanItemColumn = parsed.column ?? "ready";
  const now = new Date().toISOString();
  const ownerUserId = getPlanDayOwnerUserId();

  const next: PlanDayItem = {
    id: uid(),
    title: trimmed,
    column,
    done: false,
    lifeAreaId: resolvedLifeAreaId,
    category: explicitCategory,
    startTime: hasTime ? parsed.startTime!.trim() : undefined,
    flexible: !parsed.durationMinutes,
    durationMinutes: parsed.durationMinutes,
    notes: parsed.notes?.trim() || undefined,
    source: parsed.source ?? "manual",
    planningDate: todayStr(),
    createdAt: now,
    updatedAt: now,
    ownerUserId: ownerUserId ?? undefined,
    focusRank: column === "doing" ? Date.now() : undefined,
  };
  return saveTodayPlanItems([...items, next]);
}
