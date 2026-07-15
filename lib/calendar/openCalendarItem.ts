/**
 * Shared calendar-item open contract.
 * Legacy Momentum Appointments (time blocks) open in Plan My Day → Calendar detail —
 * never the split-chat TimeBlockPanel.
 */
import {
  getTimeBlocks,
  saveTimeBlock,
  todayStr,
  type TimeBlock,
} from "@/lib/companionStore";
import {
  planDayItemFromTimeBlock,
  readDeferredPlanStore,
  readTodayPlanItems,
  saveTodayPlanItems,
  writeDeferredPlanStore,
  type PlanDayItem,
} from "@/lib/planMyDay";

export type CalendarItemOpenSource =
  | "planning-calendar"
  | "calendar-room"
  | "today"
  | "upcoming"
  | "flexible-planning"
  | "search"
  | "reminder"
  | "notification"
  | "project"
  | "ready-when-you-are"
  | "deep-link"
  | "legacy-redirect"
  | "conversation"
  | "tool"
  | "workspace-offer"
  | "action-bridge"
  | "recovery";

export type ResolvedCalendarItem = {
  /** Plan My Day item id (tb-{timeBlockId} for legacy appointments). */
  planItemId: string;
  /** Raw companion-time-blocks-v1 id when this is a legacy Momentum Appointment. */
  timeBlockId: string | null;
  isLegacyMomentumAppointment: boolean;
};

/** Normalize plan ids, tb- prefixed ids, and bare time-block ids. */
export function resolveCalendarItemRef(
  rawId: string | null | undefined,
): ResolvedCalendarItem | null {
  if (!rawId?.trim()) return null;
  const trimmed = rawId.trim();

  if (trimmed.startsWith("tb-")) {
    const timeBlockId = trimmed.slice(3);
    return {
      planItemId: trimmed,
      timeBlockId: timeBlockId || null,
      isLegacyMomentumAppointment: Boolean(timeBlockId),
    };
  }

  if (trimmed.startsWith("plan-") || trimmed.startsWith("day-") || trimmed.startsWith("pri-")) {
    return {
      planItemId: trimmed,
      timeBlockId: null,
      isLegacyMomentumAppointment: false,
    };
  }

  const block = getTimeBlocks().find((b) => b.id === trimmed);
  if (block) {
    return {
      planItemId: `tb-${block.id}`,
      timeBlockId: block.id,
      isLegacyMomentumAppointment: true,
    };
  }

  return {
    planItemId: trimmed,
    timeBlockId: null,
    isLegacyMomentumAppointment: false,
  };
}

function findPlanItemByIds(
  items: PlanDayItem[],
  planItemId: string,
  timeBlockId: string | null,
): PlanDayItem | undefined {
  return items.find(
    (i) =>
      i.id === planItemId ||
      (timeBlockId != null && i.sourceTimeBlockId === timeBlockId),
  );
}

function findPlanItemAnywhere(
  planItemId: string,
  timeBlockId: string | null,
): PlanDayItem | null {
  const today = findPlanItemByIds(readTodayPlanItems(), planItemId, timeBlockId);
  if (today) return today;

  for (const list of Object.values(readDeferredPlanStore())) {
    const found = findPlanItemByIds(list, planItemId, timeBlockId);
    if (found) return found;
  }
  return null;
}

/**
 * Map a legacy Momentum Appointment (TimeBlock) into the current calendar-item model
 * and ensure it is available for the Plan My Day detail experience.
 * Does not delete or rewrite the original time-block record until the member saves.
 */
export function ensureCalendarPlanItem(
  rawId: string | null | undefined,
): PlanDayItem | null {
  const resolved = resolveCalendarItemRef(rawId);
  if (!resolved) return null;

  const existing = findPlanItemAnywhere(
    resolved.planItemId,
    resolved.timeBlockId,
  );
  if (existing) return existing;

  if (!resolved.timeBlockId) return null;

  const block = getTimeBlocks().find((b) => b.id === resolved.timeBlockId);
  if (!block) return null;

  const item = planDayItemFromTimeBlock(block);
  const today = todayStr();
  const blockDate = (block.date || "").trim();

  if (!blockDate || blockDate === today) {
    const items = readTodayPlanItems();
    if (!findPlanItemByIds(items, item.id, block.id)) {
      saveTodayPlanItems([...items, item]);
    }
  } else {
    const deferred = readDeferredPlanStore();
    const bucket = deferred[blockDate] ?? [];
    if (!findPlanItemByIds(bucket, item.id, block.id)) {
      deferred[blockDate] = [...bucket, item];
      writeDeferredPlanStore(deferred);
    }
  }

  return item;
}

/** Write Plan My Day edits back to the legacy time-block store (same id — no duplicate). */
export function syncPlanItemToTimeBlock(item: PlanDayItem): TimeBlock | null {
  const blockId = item.sourceTimeBlockId;
  if (!blockId) return null;
  const existing = getTimeBlocks().find((b) => b.id === blockId);
  if (!existing) return null;

  const status: TimeBlock["status"] = item.done
    ? "completed"
    : item.column === "doing"
      ? "progress"
      : existing.status === "completed"
        ? "pending"
        : existing.status;

  const next = saveTimeBlock({
    id: blockId,
    title: item.title.trim() || existing.title,
    date: item.planningDate || item.dueDate || existing.date,
    startTime: item.startTime || existing.startTime,
    durationMin: item.durationMinutes ?? existing.durationMin,
    note: item.notes,
    projectId: item.projectId,
    status,
  });
  return next.find((b) => b.id === blockId) ?? null;
}

/**
 * Pure open intent — UI hosts call this then navigate to Plan My Day → Calendar.
 * Never opens TimeBlockPanel / Momentum Appointments split layout.
 */
export function openCalendarItemIntent(
  itemId: string | null | undefined,
  source: CalendarItemOpenSource = "planning-calendar",
): {
  planItemId: string | null;
  area: "calendar";
  source: CalendarItemOpenSource;
  item: PlanDayItem | null;
} {
  const item = itemId ? ensureCalendarPlanItem(itemId) : null;
  return {
    planItemId: item?.id ?? resolveCalendarItemRef(itemId)?.planItemId ?? null,
    area: "calendar",
    source,
    item,
  };
}
