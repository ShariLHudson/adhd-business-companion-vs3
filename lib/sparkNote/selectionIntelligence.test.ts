import { describe, expect, it, beforeEach } from "vitest";

import { SPARK_NOTE_CATALOG } from "./catalog";
import { filterLibraryCandidatePool } from "./librarySelection";
import {
  getRecentSelectionCategories,
  SELECTION_PRIORITY_ORDER,
  VARIETY_RECENT_CATEGORY_LOOKBACK,
} from "./selectionIntelligence";
import {
  recordDailySparkSelection,
  resetSparkNoteStoreForTests,
} from "./persistence";

describe("selectionIntelligence", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
  });

  it("defines five selection priorities in order", () => {
    expect(SELECTION_PRIORITY_ORDER).toEqual([
      "personal_meaningful",
      "personal_upcoming",
      "calendar_event",
      "user_interests",
      "general_discovery",
    ]);
  });

  it("tracks recent categories for variety lookback", () => {
    recordDailySparkSelection("SPARK-INV-001", new Date("2026-04-08T10:00:00"));
    recordDailySparkSelection("SPARK-BIZ-004", new Date("2026-04-09T10:00:00"));
    recordDailySparkSelection("SPARK-FACT-001", new Date("2026-04-10T10:00:00"));

    const categories = getRecentSelectionCategories();
    expect(categories.length).toBe(VARIETY_RECENT_CATEGORY_LOOKBACK);
    expect(categories).toContain("invention");
    expect(categories).toContain("business");
    expect(categories).toContain("fun_fact");
  });

  it("filters out multiple recent categories when alternatives exist", () => {
    const now = new Date("2026-04-11T10:00:00");
    recordDailySparkSelection("SPARK-INV-001", new Date("2026-04-08T10:00:00"));
    recordDailySparkSelection("SPARK-INV-002", new Date("2026-04-09T10:00:00"));
    recordDailySparkSelection("SPARK-INV-003", new Date("2026-04-10T10:00:00"));

    const libraryOnly = SPARK_NOTE_CATALOG.filter(
      (e) => !e.monthDay && !e.months && !e.seasons?.length,
    );
    const filtered = filterLibraryCandidatePool(libraryOnly, now);
    expect(filtered.every((e) => e.category !== "invention")).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });
});
