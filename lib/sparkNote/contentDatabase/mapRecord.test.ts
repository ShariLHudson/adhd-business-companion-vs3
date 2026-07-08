import { describe, expect, it } from "vitest";

import { SPARK_NOTE_CATALOG } from "../catalog";
import { catalogEntryToRecord, recordToCatalogEntry } from "./mapRecord";
import { loadSparkLibrary } from "./loadSparkLibrary";

describe("spark content database", () => {
  it("round-trips catalog entries through SparkContentRecord", () => {
    const entry = SPARK_NOTE_CATALOG[0]!;
    const record = catalogEntryToRecord(entry);
    const restored = recordToCatalogEntry(record);
    expect(restored?.id).toBe(entry.id);
    expect(restored?.whatHappened).toBe(entry.whatHappened);
    expect(restored?.whyItMatters).toBe(entry.whyItMatters);
  });

  it("loadSparkLibrary returns active sparks from manifest", () => {
    const loaded = loadSparkLibrary();
    expect(loaded.length).toBeGreaterThanOrEqual(29);
    expect(loaded.some((e) => e.id === "SPARK-INV-001")).toBe(true);
    expect(loaded.some((e) => e.id === "SPARK-ADHD-008")).toBe(true);
  });
});
