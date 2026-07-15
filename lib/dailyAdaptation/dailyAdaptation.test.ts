/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTodaysAdaptationCheckInForTests,
  guidanceForPosture,
  hasActivePlanForToday,
  loadTodaysAdaptationCheckIn,
  proposeAdaptedDay,
  resolveAdaptationPosture,
  resolvePlanOrAdaptChoices,
  saveTodaysAdaptationCheckIn,
  shouldAskWhatChanged,
} from "./index";
import { saveTodayPlanItems } from "@/lib/planMyDay/planDayItems";
import { todayStr } from "@/lib/companionStore";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { resolveDailyOpeningChoiceAction, resolveGlobalDailyOpening } from "@/lib/dailyOpening";
import { clearDailyOpeningPresentedForTests } from "@/lib/dailyOpening/dailyOpeningDay";

function item(partial: Partial<PlanDayItem> & { id: string; title: string }): PlanDayItem {
  return {
    column: "today",
    done: false,
    ...partial,
  };
}

describe("Plan or Adapt choice", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTodaysAdaptationCheckInForTests();
    clearDailyOpeningPresentedForTests();
    saveTodayPlanItems([]);
  });

  it("Welcome Card action opens the Plan-or-Adapt choice step", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    const action = resolveDailyOpeningChoiceAction(
      "plan-or-adapt-my-day",
      opening,
    );
    expect(action).toEqual({ kind: "show-plan-or-adapt" });
  });

  it("recommends Plan My Day when no plan exists", () => {
    const choices = resolvePlanOrAdaptChoices({ hasPlanToday: false });
    expect(choices).toHaveLength(2);
    expect(choices.map((c) => c.id)).toEqual(["plan-my-day", "adapt-my-day"]);
    expect(choices.find((c) => c.id === "plan-my-day")?.recommended).toBe(true);
    expect(choices.find((c) => c.id === "adapt-my-day")?.recommended).toBe(false);
  });

  it("recommends Adapt My Day when a plan exists — both remain available", () => {
    const choices = resolvePlanOrAdaptChoices({ hasPlanToday: true });
    expect(choices.find((c) => c.id === "adapt-my-day")?.recommended).toBe(true);
    expect(choices.find((c) => c.id === "plan-my-day")?.recommended).toBe(false);
    expect(choices).toHaveLength(2);
  });

  it("detects an active plan for today", () => {
    expect(hasActivePlanForToday()).toBe(false);
    saveTodayPlanItems([
      item({ id: "a", title: "Client email", column: "today" }),
    ]);
    expect(hasActivePlanForToday()).toBe(true);
  });
});

describe("Energy and motivation", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTodaysAdaptationCheckInForTests();
  });

  it("stores energy and motivation separately", () => {
    const saved = saveTodaysAdaptationCheckIn({
      date: todayStr(),
      capturedAt: new Date().toISOString(),
      energyLevel: "high",
      motivationLevel: "none",
    });
    const loaded = loadTodaysAdaptationCheckIn();
    expect(loaded?.energyLevel).toBe("high");
    expect(loaded?.motivationLevel).toBe("none");
    expect(saved.energyLevel).not.toBe(saved.motivationLevel as never);
  });

  it("low energy does not imply low motivation", () => {
    expect(resolveAdaptationPosture("low", "very-motivated")).toBe(
      "low-energy-high-motivation",
    );
  });

  it("high energy does not imply high motivation", () => {
    expect(resolveAdaptationPosture("high", "none")).toBe(
      "high-energy-low-motivation",
    );
  });
});

describe("Adaptation guidance postures", () => {
  const cases = [
    ["very-low", "none", "low-energy-low-motivation"],
    ["low", "very-motivated", "low-energy-high-motivation"],
    ["high", "a-little", "high-energy-low-motivation"],
    ["steady", "enough-to-start", "steady"],
    ["high", "very-motivated", "high-energy-high-motivation"],
  ] as const;

  it.each(cases)(
    "%s energy + %s motivation → %s",
    (energy, motivation, posture) => {
      expect(resolveAdaptationPosture(energy, motivation)).toBe(posture);
      const guidance = guidanceForPosture(posture);
      expect(guidance.length).toBeGreaterThan(40);
      expect(guidance).not.toMatch(/behind|you should|must/i);
    },
  );

  it("proposes different shapes for low/low vs high/high", () => {
    const plan = [
      item({ id: "1", title: "Client email", priority: "high" }),
      item({ id: "2", title: "Proposal outline", priority: "high" }),
      item({ id: "3", title: "Marketing ideas", priority: "low" }),
      item({ id: "4", title: "Admin cleanup", priority: "low" }),
    ];
    const low = proposeAdaptedDay(
      {
        date: todayStr(),
        capturedAt: new Date().toISOString(),
        energyLevel: "very-low",
        motivationLevel: "none",
      },
      plan,
    );
    const high = proposeAdaptedDay(
      {
        date: todayStr(),
        capturedAt: new Date().toISOString(),
        energyLevel: "high",
        motivationLevel: "very-motivated",
      },
      plan,
    );
    expect(low.posture).not.toBe(high.posture);
    expect(low.guidance).not.toBe(high.guidance);
    expect(low.items.filter((i) => i.bucket === "move-later").length).toBeGreaterThan(
      high.items.filter((i) => i.bucket === "move-later").length - 1,
    );
    expect(low.items.some((i) => i.bucket === "start-with-this")).toBe(true);
    expect(high.items.some((i) => i.bucket === "add-a-break")).toBe(true);
  });

  it("asks what changed when energy is variable", () => {
    expect(shouldAskWhatChanged("variable", "motivated", false)).toBe(true);
    expect(shouldAskWhatChanged("steady", "enough-to-start", false)).toBe(false);
    expect(shouldAskWhatChanged("steady", "enough-to-start", true)).toBe(true);
  });
});
