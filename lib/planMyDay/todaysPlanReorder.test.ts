/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { todayStr } from "@/lib/companionStore";
import type { PlanDayItem } from "./types";
import {
  clearPlanSchedulePreferencesForTests,
  dismissReshapeAskForToday,
  ensureSortOrders,
  isPlanItemLocked,
  lockPlanItemPosition,
  movePlanItemRelative,
  optimizeDayAroundLocks,
  pinPlanItemToTop,
  planItemPrimaryIndicator,
  reorderFlexiblePlanItems,
  shouldAskReshapeToday,
} from "./todaysPlanReorder";

function item(
  partial: Partial<PlanDayItem> & { id: string; title: string },
): PlanDayItem {
  return {
    column: "today",
    done: false,
    flexible: true,
    ...partial,
  };
}

describe("todaysPlanReorder", () => {
  beforeEach(() => {
    clearPlanSchedulePreferencesForTests();
  });

  it("locks appointments and positionLocked items", () => {
    expect(
      isPlanItemLocked(
        item({ id: "a", title: "Standup", sourceTimeBlockId: "tb1" }),
      ),
    ).toBe(true);
    expect(
      isPlanItemLocked(item({ id: "b", title: "Write", positionLocked: true })),
    ).toBe(true);
    expect(isPlanItemLocked(item({ id: "c", title: "Write proposal" }))).toBe(
      false,
    );
  });

  it("reorders flexible around locked and renumbers", () => {
    const items = ensureSortOrders([
      item({ id: "1", title: "A" }),
      item({
        id: "lock",
        title: "Meeting",
        sourceTimeBlockId: "tb",
        startTime: "10:00",
        flexible: false,
      }),
      item({ id: "3", title: "C" }),
    ]);
    const next = reorderFlexiblePlanItems(items, "3", 0);
    expect(next.map((i) => i.id)).toEqual(["3", "lock", "1"]);
    expect(next.map((i) => i.sortOrder)).toEqual([1, 2, 3]);
    expect(next.find((i) => i.id === "lock")?.title).toBe("Meeting");
  });

  it("move up/down skips locked slots", () => {
    const items = ensureSortOrders([
      item({ id: "1", title: "A" }),
      item({
        id: "lock",
        title: "Appt",
        sourceTimeBlockId: "tb",
        startTime: "11:00",
      }),
      item({ id: "3", title: "C" }),
    ]);
    const up = movePlanItemRelative(items, "3", "up");
    expect(up.map((i) => i.id)).toEqual(["3", "lock", "1"]);
  });

  it("pin flexible to top before first lock when needed", () => {
    const items = ensureSortOrders([
      item({
        id: "lock",
        title: "Appt",
        sourceTimeBlockId: "tb",
        startTime: "09:00",
      }),
      item({ id: "2", title: "Write proposal" }),
      item({ id: "3", title: "Email" }),
    ]);
    const next = pinPlanItemToTop(items, "2");
    // First flexible slot is index 1 (after lock)
    expect(next[0]?.id).toBe("lock");
    expect(next[1]?.id).toBe("2");
  });

  it("lockPlanItemPosition marks positionLocked", () => {
    const next = lockPlanItemPosition(
      [item({ id: "1", title: "Task" })],
      "1",
    );
    expect(next[0]?.positionLocked).toBe(true);
    expect(isPlanItemLocked(next[0]!)).toBe(true);
  });

  it("optimizeDayAroundLocks preserves locked order", () => {
    const items = ensureSortOrders([
      item({ id: "q", title: "Water plants" }),
      item({
        id: "lock",
        title: "Client call",
        sourceTimeBlockId: "tb",
        startTime: "14:00",
      }),
      item({ id: "d", title: "Write quarterly report", priority: "high" }),
    ]);
    const next = optimizeDayAroundLocks(items);
    expect(next.find((i) => i.id === "lock")?.sortOrder).toBe(
      items.find((i) => i.id === "lock")?.sortOrder,
    );
    expect(next.some((i) => i.id === "lock")).toBe(true);
  });

  it("don't ask again today persists for calendar day", () => {
    expect(shouldAskReshapeToday()).toBe(true);
    dismissReshapeAskForToday();
    expect(shouldAskReshapeToday()).toBe(false);
    expect(shouldAskReshapeToday(todayStr())).toBe(false);
  });

  it("infers at most one primary indicator", () => {
    const ind = planItemPrimaryIndicator(
      item({ id: "1", title: "Write proposal", priority: "high" }),
    );
    expect(ind?.id).toBe("highest-priority");
    expect(
      planItemPrimaryIndicator(item({ id: "2", title: "Pick up groceries" }))
        ?.id,
    ).toBe("errand");
  });
});
