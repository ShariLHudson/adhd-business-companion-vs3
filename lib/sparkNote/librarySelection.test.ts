import { describe, expect, it, beforeEach } from "vitest";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { filterLibraryCandidatePool } from "./librarySelection";
import {
  getYesterdaySparkId,
  recordDailySparkSelection,
  resetSparkNoteStoreForTests,
} from "./persistence";

describe("librarySelection", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
  });

  it("excludes yesterday's spark when alternatives exist", () => {
    const now = new Date("2026-04-11T10:00:00");
    const yesterday = new Date("2026-04-10T10:00:00");
    recordDailySparkSelection("SPARK-INV-001", yesterday);

    const libraryOnly = SPARK_NOTE_CATALOG.filter(
      (e) => !e.monthDay && !e.months,
    );
    const filtered = filterLibraryCandidatePool(libraryOnly, now);
    expect(filtered.some((e) => e.id === "SPARK-INV-001")).toBe(false);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("avoids repeating the most recent category when possible", () => {
    const now = new Date("2026-04-12T10:00:00");
    recordDailySparkSelection("SPARK-INV-001", new Date("2026-04-11T10:00:00"));
    recordDailySparkSelection("SPARK-INV-002", now);

    const libraryOnly = SPARK_NOTE_CATALOG.filter(
      (e) => !e.monthDay && !e.months,
    );
    const filtered = filterLibraryCandidatePool(libraryOnly, now);
    expect(filtered.every((e) => e.category !== "invention")).toBe(true);
  });

  it("getYesterdaySparkId reads prior day selection", () => {
    const now = new Date("2026-05-02T10:00:00");
    recordDailySparkSelection("SPARK-QUOTE-001", new Date("2026-05-01T10:00:00"));
    expect(getYesterdaySparkId(now)).toBe("SPARK-QUOTE-001");
  });
});
