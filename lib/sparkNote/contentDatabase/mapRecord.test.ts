import { describe, expect, it } from "vitest";

import { SPARK_NOTE_CATALOG } from "../catalog";
import type { SparkNoteCatalogEntry } from "../types";
import { catalogEntryToRecord, recordToCatalogEntry } from "./mapRecord";
import { loadSparkLibrary } from "./loadSparkLibrary";

function entry(
  overrides: Partial<SparkNoteCatalogEntry> & { id: string },
): SparkNoteCatalogEntry {
  return {
    category: "004",
    categoryLabel: "Nature & Places",
    title: overrides.id,
    teaser: "a teaser that is long enough to open the card",
    whatHappened: "what happened, described with enough detail to pass",
    whyItMatters: "why it matters, meaningful and inspiring enough",
    sparkApplication: "what will you try today?",
    ...overrides,
  };
}

describe("spark content database", () => {
  it("round-trips catalog entries through SparkContentRecord", () => {
    const first = SPARK_NOTE_CATALOG[0]!;
    const record = catalogEntryToRecord(first);
    const restored = recordToCatalogEntry(record);
    expect(restored?.id).toBe(first.id);
    expect(restored?.whatHappened).toBe(first.whatHappened);
    expect(restored?.whyItMatters).toBe(first.whyItMatters);
  });

  it("loadSparkLibrary returns active sparks from manifest", () => {
    const loaded = loadSparkLibrary();
    expect(loaded.length).toBeGreaterThanOrEqual(29);
    expect(loaded.some((e) => e.id === "SPARK-INV-001")).toBe(true);
    expect(loaded.some((e) => e.id === "SPARK-ADHD-008")).toBe(true);
  });

  it("legacy entries serialize with NO new scheduling fields (manifest stays stable)", () => {
    const record = catalogEntryToRecord(
      entry({ id: "SPARK-LEG-1", monthDay: { month: 5, day: 30 } }),
    );
    expect(record.display_rule).toBeUndefined();
    expect(record.volume).toBeUndefined();
    expect(record.collection).toBeUndefined();
    expect(record.region).toBeUndefined();
    expect(record.date_rules).toEqual({ type: "specific_date", date: "05-30" });
  });

  it("round-trips a new-model seasonal record (displayRule + volume + region)", () => {
    const e = entry({
      id: "SPARK-NEW-SEA",
      displayRule: "seasonal",
      season: "autumn",
      months: [9, 10, 11],
      volume: 2,
      collection: "iowa-seasons",
      region: "US-IA",
      priority: 140,
    });
    const restored = recordToCatalogEntry(catalogEntryToRecord(e));
    expect(restored?.displayRule).toBe("seasonal");
    expect(restored?.season).toBe("autumn");
    expect(restored?.months).toEqual([9, 10, 11]);
    expect(restored?.volume).toBe(2);
    expect(restored?.collection).toBe("iowa-seasons");
    expect(restored?.region).toBe("US-IA");
  });

  it("round-trips a new-model calculated-date record", () => {
    const e = entry({
      id: "SPARK-NEW-CALC",
      displayRule: "calculated-date",
      dateRule: "thanksgiving-us",
      volume: 2,
      collection: "core",
    });
    const restored = recordToCatalogEntry(catalogEntryToRecord(e));
    expect(restored?.displayRule).toBe("calculated-date");
    expect(restored?.dateRule).toBe("thanksgiving-us");
  });

  it("round-trips a new-model exact-date record (flat month/day)", () => {
    const e = entry({
      id: "SPARK-NEW-EXACT",
      displayRule: "exact-date",
      month: 11,
      day: 11,
      volume: 2,
      collection: "iowa-seasons",
    });
    const record = catalogEntryToRecord(e);
    expect(record.display_rule).toBe("exact-date");
    expect(record.month).toBe(11);
    expect(record.day).toBe(11);
    const restored = recordToCatalogEntry(record);
    expect(restored?.month).toBe(11);
    expect(restored?.day).toBe(11);
  });
});
