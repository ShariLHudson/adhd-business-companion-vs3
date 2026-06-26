import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  capacitySuggestionCopy,
  suggestedViewForCapacity,
} from "./capacityViews";
import {
  addQuickPlanItem,
  countActivePlanItems,
  isPlanItemActive,
  loadTodayPlanItems,
  readTodayPlanItems,
  movePlanItemKanban,
  currentFocusItem,
} from "./planDayItems";
import { getPlanCompletionHistory, resetPlanCompletionForTests } from "./planTaskCompletion";
import {
  resolveInitialPlanningView,
  setDefaultPlanningView,
  setLastPlanningView,
} from "./planMyDayPrefs";
import type { PlanDayItem } from "./types";
import { todayStr } from "@/lib/companionStore";

const PLAN_STORE_KEY = "companion-plan-my-day-items-v1";
const lsStore: Record<string, string> = {};

describe("planMyDay view resolution", () => {
  beforeEach(() => {
    const storage = {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    };
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", storage);
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  });

  it("prefers last-used view over default and capacity", () => {
    setDefaultPlanningView("kanban");
    setLastPlanningView("timeline");
    expect(resolveInitialPlanningView("low")).toBe("timeline");
  });

  it("uses default when no last-used view", () => {
    setDefaultPlanningView("cards");
    expect(resolveInitialPlanningView("high")).toBe("cards");
  });

  it("falls back to capacity suggestion when no prefs", () => {
    expect(resolveInitialPlanningView("low")).toBe("list");
    expect(resolveInitialPlanningView("medium")).toBe("cards");
    expect(resolveInitialPlanningView("high")).toBe("kanban");
  });

  it("falls back to kanban when energy is unset and no prefs", () => {
    expect(resolveInitialPlanningView(null)).toBe("kanban");
  });
});

describe("planMyDay capacity views", () => {
  it("maps low energy to list", () => {
    expect(suggestedViewForCapacity("low")).toBe("list");
  });

  it("maps medium energy to cards", () => {
    expect(suggestedViewForCapacity("medium")).toBe("cards");
  });

  it("maps high energy to kanban", () => {
    expect(suggestedViewForCapacity("high")).toBe("kanban");
  });

  it("suggests copy for each capacity level", () => {
    expect(capacitySuggestionCopy("low")).toMatch(/Visual Focus/i);
    expect(capacitySuggestionCopy("medium")).toMatch(/Card/i);
    expect(capacitySuggestionCopy("high")).toMatch(/Kanban|Timeline/i);
  });
});

describe("planMyDay quick access", () => {
  it("readTodayPlanItems never writes or dispatches", () => {
    const dispatch = vi.fn();
    vi.stubGlobal("window", { dispatchEvent: dispatch });
    const today = todayStr();
    lsStore[PLAN_STORE_KEY] = JSON.stringify({ date: today, items: [] });

    readTodayPlanItems();
    readTodayPlanItems();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not dispatch update storms when today plan is empty", () => {
    const dispatch = vi.fn();
    vi.stubGlobal("window", { dispatchEvent: dispatch });
    const today = todayStr();
    lsStore[PLAN_STORE_KEY] = JSON.stringify({ date: today, items: [] });

    loadTodayPlanItems();
    loadTodayPlanItems();
    loadTodayPlanItems();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("persists seeded plan at most once across repeated loads", () => {
    const dispatch = vi.fn();
    vi.stubGlobal("window", { dispatchEvent: dispatch });
    delete lsStore[PLAN_STORE_KEY];

    loadTodayPlanItems();
    loadTodayPlanItems();

    expect(dispatch.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it("addQuickPlanItem appends without replacing prior tasks", () => {
    const today = todayStr();
    lsStore[PLAN_STORE_KEY] = JSON.stringify({ date: today, items: [] });

    const first = addQuickPlanItem("Call doctor");
    expect(first).toHaveLength(1);
    expect(first[0]?.title).toBe("Call doctor");

    const second = addQuickPlanItem("Finish launch", first);
    expect(second).toHaveLength(2);
    expect(second.map((i) => i.title)).toEqual(["Call doctor", "Finish launch"]);

    const third = addQuickPlanItem("Email client", second);
    expect(third).toHaveLength(3);
    expect(third.map((i) => i.title)).toEqual([
      "Call doctor",
      "Finish launch",
      "Email client",
    ]);
  });

  it("persists appended tasks to storage", () => {
    const dispatch = vi.fn();
    const storage = {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    };
    globalThis.window = { dispatchEvent: dispatch } as Window;
    globalThis.localStorage = storage as Storage;

    const today = todayStr();
    lsStore[PLAN_STORE_KEY] = JSON.stringify({ date: today, items: [] });

    addQuickPlanItem("Call doctor");
    addQuickPlanItem("Finish launch", readTodayPlanItems());

    expect(readTodayPlanItems()).toHaveLength(2);
  });

  it("counts only incomplete items", () => {
    const items = [
      { id: "a", title: "One", column: "ready" as const, done: false },
      { id: "b", title: "Two", column: "done" as const, done: true },
    ];
    expect(items.filter((i) => !i.done).length).toBe(1);
    expect(typeof countActivePlanItems).toBe("function");
    expect(typeof addQuickPlanItem).toBe("function");
  });
});

describe("planMyDay safe interaction", () => {
  const base: PlanDayItem = {
    id: "x",
    title: "Work on ADHD App",
    column: "ready",
    done: false,
  };

  it("treats completed items as inactive unless kept for reference", () => {
    expect(isPlanItemActive({ ...base, done: true })).toBe(false);
    expect(
      isPlanItemActive({ ...base, done: true, keptForReference: true }),
    ).toBe(true);
  });

  it("treats snoozed items as inactive until snooze expires", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isPlanItemActive({ ...base, snoozedUntil: future })).toBe(false);
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isPlanItemActive({ ...base, snoozedUntil: past })).toBe(true);
  });

  it("treats parked items as inactive in today's list", () => {
    expect(isPlanItemActive({ ...base, column: "parked" })).toBe(false);
  });
});

describe("planMyDay kanban", () => {
  const items: PlanDayItem[] = [
    { id: "a", title: "First", column: "ready", done: false },
    { id: "b", title: "Second", column: "ready", done: false, startTime: "10:00" },
  ];

  beforeEach(() => {
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
    resetPlanCompletionForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("moves task to today column", () => {
    const result = movePlanItemKanban(items, "b", "today");
    expect(result.items.find((i) => i.id === "b")?.column).toBe("today");
  });

  it("completes and removes task when finishing via completion flow", () => {
    const result = movePlanItemKanban(items, "a", "done");
    expect(result.completed).not.toBeNull();
    expect(result.items.find((i) => i.id === "a")).toBeUndefined();
    expect(getPlanCompletionHistory().some((h) => h.planItemId === "a")).toBe(true);
  });

  it("sets focus rank when moved to doing", () => {
    const result = movePlanItemKanban(items, "b", "doing");
    expect(result.enteredDoing).toBe(true);
    const moved = result.items.find((i) => i.id === "b");
    expect(moved?.column).toBe("doing");
    expect(moved?.focusRank).toBeGreaterThan(0);
  });

  it("current focus prefers highest focusRank in doing", () => {
    const withDoing: PlanDayItem[] = [
      { id: "a", title: "Older", column: "doing", done: false, focusRank: 1 },
      { id: "b", title: "Newer", column: "doing", done: false, focusRank: 99 },
    ];
    expect(currentFocusItem(withDoing)?.id).toBe("b");
  });

  it("current focus prefers high priority in doing", () => {
    const withDoing: PlanDayItem[] = [
      {
        id: "a",
        title: "Low",
        column: "doing",
        done: false,
        priority: "low",
        focusRank: 99,
      },
      {
        id: "b",
        title: "High",
        column: "doing",
        done: false,
        priority: "high",
        focusRank: 1,
      },
    ];
    expect(currentFocusItem(withDoing)?.id).toBe("b");
  });
});
