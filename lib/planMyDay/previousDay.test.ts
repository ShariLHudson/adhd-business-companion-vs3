import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { todayStr } from "@/lib/companionStore";
import {
  addQuickPlanItem,
  archivePlanEnvelope,
  loadTodayPlanItems,
  readDeferredPlanStore,
  readTodayPlanItems,
  saveTodayPlanItems,
} from "./planDayItems";
import {
  beginPreviousDayReview,
  bringArchivedItemToToday,
  completeArchivedPlanItem,
  getReviewablePreviousDayItems,
  leaveItemWithYesterday,
  leavePreviousDayItemsThere,
  parkArchivedItemCopy,
  remindArchivedItemOnce,
  resetPreviousDayPromptForTests,
  shouldShowPreviousDayPrompt,
  wasPreviousDayPromptHandledToday,
} from "./previousDay";

const PLAN_STORE_KEY = "companion-plan-my-day-items-v1";
const DEFERRED_KEY = "companion-plan-my-day-deferred-v1";
const REMINDER_KEY = "companion-reminders-v1";
const lsStore: Record<string, string> = {};

describe("previous day flow", () => {
  beforeEach(() => {
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    resetPreviousDayPromptForTests();
    const storage = {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    };
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("archives yesterday on new day without carrying unfinished into today", () => {
    const yesterday = "2026-07-11";
    lsStore[PLAN_STORE_KEY] = JSON.stringify({
      date: yesterday,
      items: [
        {
          id: "y1",
          title: "Finish proposal",
          column: "today",
          done: false,
          planningDate: yesterday,
        },
      ],
    });

    const todayItems = loadTodayPlanItems();
    expect(todayItems.some((i) => i.id === "y1")).toBe(false);
    expect(todayItems.some((i) => i.title === "Finish proposal")).toBe(false);

    const deferred = readDeferredPlanStore();
    expect(deferred[yesterday]?.some((i) => i.id === "y1")).toBe(true);
    expect(shouldShowPreviousDayPrompt()).toBe(true);
  });

  it("Leave Them There suppresses the prompt for the rest of today", () => {
    const yesterday = "2026-07-11";
    archivePlanEnvelope({
      date: yesterday,
      items: [
        {
          id: "y1",
          title: "Call bank",
          column: "ready",
          done: false,
        },
      ],
    });
    expect(shouldShowPreviousDayPrompt()).toBe(true);
    leavePreviousDayItemsThere();
    expect(wasPreviousDayPromptHandledToday()).toBe(true);
    expect(shouldShowPreviousDayPrompt()).toBe(false);
  });

  it("Bring to Today copies without deleting yesterday", () => {
    const yesterday = "2026-07-11";
    archivePlanEnvelope({
      date: yesterday,
      items: [
        {
          id: "y1",
          title: "Write newsletter",
          column: "today",
          done: false,
        },
      ],
    });
    lsStore[PLAN_STORE_KEY] = JSON.stringify({
      date: todayStr(),
      items: [],
    });
    beginPreviousDayReview(yesterday);

    const next = bringArchivedItemToToday(yesterday, "y1");
    expect(next).toHaveLength(1);
    expect(next[0]?.title).toBe("Write newsletter");
    expect(next[0]?.id).not.toBe("y1");
    expect(next[0]?.planningDate).toBe(todayStr());

    const archive = readDeferredPlanStore()[yesterday] ?? [];
    expect(archive.some((i) => i.id === "y1")).toBe(true);
    expect(getReviewablePreviousDayItems(yesterday)).toHaveLength(0);
  });

  it("Remind Me creates a one-time reminder and leaves archive intact", () => {
    const yesterday = "2026-07-11";
    archivePlanEnvelope({
      date: yesterday,
      items: [
        {
          id: "y1",
          title: "Call insurance",
          column: "ready",
          done: false,
        },
      ],
    });
    beginPreviousDayReview(yesterday);

    const result = remindArchivedItemOnce({
      sourceDate: yesterday,
      itemId: "y1",
      date: "2026-07-18",
      time: "10:30",
    });
    expect(result?.scheduledAt).toBeTruthy();

    const reminders = JSON.parse(lsStore[REMINDER_KEY] ?? "[]") as {
      title: string;
      reminderType: string;
    }[];
    expect(reminders.some((r) => r.title === "Call insurance")).toBe(true);
    expect(reminders[0]?.reminderType).toBe("one_time");
    expect(readDeferredPlanStore()[yesterday]?.some((i) => i.id === "y1")).toBe(
      true,
    );
  });

  it("Move to Parking Lot keeps yesterday and adds a parking copy", () => {
    const yesterday = "2026-07-11";
    archivePlanEnvelope({
      date: yesterday,
      items: [
        {
          id: "y1",
          title: "Research software",
          column: "ready",
          done: false,
        },
      ],
    });
    beginPreviousDayReview(yesterday);
    parkArchivedItemCopy(yesterday, "y1");

    const deferred = readDeferredPlanStore();
    expect(deferred[yesterday]?.some((i) => i.id === "y1")).toBe(true);
    expect(deferred.someday?.some((i) => i.title === "Research software")).toBe(
      true,
    );
    expect(getReviewablePreviousDayItems(yesterday)).toHaveLength(0);
  });

  it("does not auto-display archived items in today's active plan", () => {
    const yesterday = "2026-07-11";
    archivePlanEnvelope({
      date: yesterday,
      items: [
        {
          id: "y1",
          title: "Old task",
          column: "doing",
          done: false,
        },
      ],
    });
    saveTodayPlanItems([
      {
        id: "t1",
        title: "Today only",
        column: "ready",
        done: false,
        planningDate: todayStr(),
      },
    ]);
    expect(readTodayPlanItems().map((i) => i.title)).toEqual(["Today only"]);
    addQuickPlanItem("Another today");
    expect(readTodayPlanItems()).toHaveLength(2);
  });

  it("Leave With Yesterday and Mark Complete resolve review without changing archive ids", () => {
    const yesterday = "2026-07-11";
    archivePlanEnvelope({
      date: yesterday,
      items: [
        { id: "y1", title: "A", column: "ready", done: false },
        { id: "y2", title: "B", column: "today", done: false },
      ],
    });
    beginPreviousDayReview(yesterday);
    leaveItemWithYesterday("y1");
    expect(getReviewablePreviousDayItems(yesterday).map((i) => i.id)).toEqual([
      "y2",
    ]);
    const done = completeArchivedPlanItem(yesterday, "y2");
    expect(done?.toast).toBeTruthy();
    expect(getReviewablePreviousDayItems(yesterday)).toHaveLength(0);
    expect(readDeferredPlanStore()[yesterday]?.map((i) => i.id).sort()).toEqual([
      "y1",
      "y2",
    ]);
  });
});
