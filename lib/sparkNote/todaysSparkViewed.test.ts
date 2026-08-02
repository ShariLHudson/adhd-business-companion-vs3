import { beforeEach, describe, expect, it } from "vitest";
import {
  isTodaysSparkViewed,
  markTodaysSparkViewed,
  resetSparkNoteStoreForTests,
} from "./persistence";

describe("Today's Spark viewed-state", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  it("marks and reads viewed for the same local day", () => {
    const now = new Date("2026-08-01T10:00:00");
    expect(isTodaysSparkViewed("SPARK-INV-001", now)).toBe(false);
    markTodaysSparkViewed("SPARK-INV-001", now);
    expect(isTodaysSparkViewed("SPARK-INV-001", now)).toBe(true);
  });

  it("resets ONLY when the local date changes", () => {
    const day1 = new Date("2026-08-01T23:00:00");
    markTodaysSparkViewed("SPARK-INV-001", day1);
    // Same day, later time — still viewed (not dismissed by time).
    expect(
      isTodaysSparkViewed("SPARK-INV-001", new Date("2026-08-01T23:59:00")),
    ).toBe(true);
    // Next local day — viewed resets.
    expect(
      isTodaysSparkViewed("SPARK-INV-001", new Date("2026-08-02T00:30:00")),
    ).toBe(false);
  });

  it("is tracked per card within a day", () => {
    const now = new Date("2026-08-01T10:00:00");
    markTodaysSparkViewed("SPARK-INV-001", now);
    expect(isTodaysSparkViewed("SPARK-INV-002", now)).toBe(false);
  });
});
