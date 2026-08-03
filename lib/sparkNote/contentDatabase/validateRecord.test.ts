import { describe, expect, it } from "vitest";

import { SPARK_NOTE_CATALOG } from "../catalog";
import type { SparkNoteCatalogEntry } from "../types";
import { catalogEntryToRecord } from "./mapRecord";
import { analyzeSparkLibraryBalance } from "./libraryBalance";
import { validateSparkRecord } from "./validateRecord";

function recordFor(overrides: Partial<SparkNoteCatalogEntry> & { id: string }) {
  return catalogEntryToRecord({
    category: "004",
    categoryLabel: "Nature & Places",
    title: overrides.id,
    teaser: "a teaser that is long enough to open the card nicely",
    whatHappened:
      "what happened here, described with enough conversational detail to pass",
    whyItMatters: "why this matters, meaningful and inspiring enough to keep",
    sparkApplication: "what could you try today?",
    tags: ["Nature & Places"],
    ...overrides,
  });
}

const schedulingErrors = (id: string, o: Partial<SparkNoteCatalogEntry>) =>
  validateSparkRecord(recordFor({ id, ...o })).filter(
    (i) => i.severity === "error",
  );

describe("spark library admin validation", () => {
  it("validates seed catalog entries as publishable records", () => {
    const record = catalogEntryToRecord(SPARK_NOTE_CATALOG[0]!);
    const issues = validateSparkRecord(record);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
  });

  it("legacy records (no display_rule) get no new-scheduling errors", () => {
    expect(schedulingErrors("SPARK-LEG", { monthDay: { month: 5, day: 30 } })).toEqual(
      [],
    );
  });

  it("exact-date without month/day is an error; with them is valid", () => {
    expect(
      schedulingErrors("SPARK-EX-BAD", { displayRule: "exact-date" }).some((e) =>
        e.field === "display_rule",
      ),
    ).toBe(true);
    expect(
      schedulingErrors("SPARK-EX-OK", {
        displayRule: "exact-date",
        month: 11,
        day: 11,
      }),
    ).toEqual([]);
  });

  it("calculated-date requires a date_rule", () => {
    expect(
      schedulingErrors("SPARK-CA-BAD", { displayRule: "calculated-date" }).some(
        (e) => e.field === "date_rule",
      ),
    ).toBe(true);
    expect(
      schedulingErrors("SPARK-CA-OK", {
        displayRule: "calculated-date",
        dateRule: "thanksgiving-us",
      }),
    ).toEqual([]);
  });

  it("seasonal requires months and/or a season", () => {
    expect(
      schedulingErrors("SPARK-SE-BAD", { displayRule: "seasonal" }).some((e) =>
        e.field === "display_rule",
      ),
    ).toBe(true);
    expect(
      schedulingErrors("SPARK-SE-OK", {
        displayRule: "seasonal",
        months: [9, 10, 11],
        season: "autumn",
      }),
    ).toEqual([]);
  });

  it("volume must be a positive integer", () => {
    expect(
      schedulingErrors("SPARK-VOL-BAD", {
        displayRule: "core",
        volume: 0,
      }).some((e) => e.field === "volume"),
    ).toBe(true);
  });

  it("non-structured region is a warning, not an error", () => {
    const issues = validateSparkRecord(
      recordFor({ id: "SPARK-REG", displayRule: "core", region: "Iowa" }),
    );
    expect(issues.some((i) => i.field === "region" && i.severity === "warning")).toBe(
      true,
    );
    expect(issues.some((i) => i.field === "region" && i.severity === "error")).toBe(
      false,
    );
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
