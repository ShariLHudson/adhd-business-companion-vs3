import { describe, expect, it } from "vitest";
import type { DayState } from "./companionStore";
import { isDayStateFromToday } from "./dayReality";

function state(setAt: string): DayState {
  return {
    energy: "medium",
    overwhelm: "medium",
    needs: [],
    setAt,
  };
}

describe("dayReality", () => {
  it("treats same-calendar-day snapshots as current", () => {
    expect(isDayStateFromToday(state(new Date().toISOString()))).toBe(true);
  });

  it("rejects snapshots from a previous day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDayStateFromToday(state(yesterday.toISOString()))).toBe(false);
  });
});
