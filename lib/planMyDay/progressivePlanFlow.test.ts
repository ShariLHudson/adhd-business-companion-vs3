/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyEnergyAdjustment,
  clearProgressivePlanStateForTests,
  loadProgressivePlanState,
  morningGreeting,
  saveProgressivePlanState,
  shouldAskFreshEnergy,
  shouldAskPlanningStyleDaily,
  writeEnergyBaseline,
  resolveQuietPlanningStyle,
  advanceProgressiveStage,
} from "./progressivePlanFlow";

describe("progressivePlanFlow", () => {
  beforeEach(() => {
    clearProgressivePlanStateForTests();
    localStorage.clear();
  });

  it("starts on mind stage", () => {
    expect(loadProgressivePlanState().stage).toBe("mind");
  });

  it("advances stages one at a time", () => {
    let state = loadProgressivePlanState();
    state = advanceProgressiveStage(state, "anything-else");
    expect(state.stage).toBe("anything-else");
    state = advanceProgressiveStage(state, "list");
    expect(state.stage).toBe("list");
    state = advanceProgressiveStage(state, "usable-time");
    expect(loadProgressivePlanState().stage).toBe("usable-time");
  });

  it("greets with member name", () => {
    expect(morningGreeting("Shari")).toBe("Good Morning, Shari");
  });

  it("prefers still-the-same energy when baseline exists", () => {
    writeEnergyBaseline("steady", "2026-07-21");
    expect(shouldAskFreshEnergy("2026-07-22")).toBe(false);
  });

  it("asks fresh energy when no baseline", () => {
    expect(shouldAskFreshEnergy()).toBe(true);
  });

  it("adjusts energy lower/higher from baseline", () => {
    expect(applyEnergyAdjustment("steady", "lower")).toBe("low");
    expect(applyEnergyAdjustment("steady", "higher")).toBe("high");
    expect(applyEnergyAdjustment("steady", "same")).toBe("steady");
  });

  it("never asks planning style daily", () => {
    expect(shouldAskPlanningStyleDaily()).toBe(false);
    expect(resolveQuietPlanningStyle()).toBe("balanced");
  });

  it("persists progressive state for the day", () => {
    saveProgressivePlanState({
      date: loadProgressivePlanState().date,
      stage: "today",
      usableMinutes: 120,
      energy: "steady",
    });
    expect(loadProgressivePlanState().stage).toBe("today");
    expect(loadProgressivePlanState().usableMinutes).toBe(120);
  });
});
