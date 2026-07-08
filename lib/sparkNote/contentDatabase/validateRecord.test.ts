import { describe, expect, it } from "vitest";

import { SPARK_NOTE_CATALOG } from "../catalog";
import { catalogEntryToRecord } from "./mapRecord";
import { analyzeSparkLibraryBalance } from "./libraryBalance";
import { validateSparkRecord } from "./validateRecord";

describe("spark library admin validation", () => {
  it("validates seed catalog entries as publishable records", () => {
    const record = catalogEntryToRecord(SPARK_NOTE_CATALOG[0]!);
    const issues = validateSparkRecord(record);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
  });

  it("reports library balance for active sparks", () => {
    const records = SPARK_NOTE_CATALOG.map(catalogEntryToRecord).map((r) => ({
      ...r,
      status: "active" as const,
    }));
    const balance = analyzeSparkLibraryBalance(records);
    expect(balance.length).toBeGreaterThan(0);
    expect(balance.reduce((sum, row) => sum + row.count, 0)).toBe(records.length);
  });
});
