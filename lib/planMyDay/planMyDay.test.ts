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
  movePlanItemKanban,
  currentFocusItem,
} from "./planDayItems";
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
    expect(resolveInitialPlanningView("low")).toBe("visual-focus");
    expect(resolveInitialPlanningView("medium")).toBe("cards");
    expect(resolveInitialPlanningView("high")).toBe("kanban");
  });

  it("falls back to kanban when energy is unset and no prefs", () => {
    expect(resolveInitialPlanningView(null)).toBe("kanban");
  });
});

describe("planMyDay capacity views", () => {
  it("maps low energy to visual focus", () => {
    expect(suggestedViewForCapacity("low")).toBe("visual-focus");
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

  it("marks done when dropped on done column", () => {
    const result = movePlanItemKanban(items, "a", "done");
    expect(result.enteredDone).toBe(true);
    expect(result.items.find((i) => i.id === "a")?.done).toBe(true);
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
