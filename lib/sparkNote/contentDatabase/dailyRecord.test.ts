import { describe, expect, it, beforeEach } from "vitest";

import {
  getDailySparkRecord,
  recordDailySparkSelection,
  resetSparkNoteStoreForTests,
} from "../persistence";

describe("spark daily selection records", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
  });

  it("stores selected reason with daily record", () => {
    recordDailySparkSelection("SPARK-INV-001", new Date("2026-07-08T12:00:00Z"), "library");
    const record = getDailySparkRecord(new Date("2026-07-08T12:00:00Z"));
    expect(record?.sparkId).toBe("SPARK-INV-001");
    expect(record?.selectedReason).toBe("library");
  });
});
