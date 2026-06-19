import { describe, expect, it } from "vitest";
import {
  buildWeeklyWins,
  isInWeek,
  startOfWeekMonday,
  weekKeyForDate,
} from "./weeklyWins";

describe("weeklyWins", () => {
  it("uses Monday as week start", () => {
    const wed = new Date("2026-06-10T12:00:00.000Z");
    const monday = startOfWeekMonday(wed);
    expect(monday.getDay()).toBe(1);
    expect(weekKeyForDate(wed)).toBe(monday.toISOString().slice(0, 10));
  });

  it("filters events to the requested week only", () => {
    const weekKey = weekKeyForDate(new Date("2026-06-10T12:00:00.000Z"));
    expect(isInWeek("2026-06-10T10:00:00.000Z", weekKey)).toBe(true);
    expect(isInWeek("2026-06-01T10:00:00.000Z", weekKey)).toBe(false);
  });

  it("returns empty stats when nothing happened this week", () => {
    const snapshot = buildWeeklyWins(new Date("2026-06-10T12:00:00.000Z"));
    expect(snapshot.stats).toEqual([]);
    expect(snapshot.weekKey).toBeTruthy();
  });
});
