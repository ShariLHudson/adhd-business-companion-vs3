/**
 * Full integration audit (beta certification) — Phase 8.
 *
 * Certifies the complete integrated Spark catalog (seed + Volumes 2–4 + Iowa
 * seasonal): counts, no duplicate IDs/titles, valid categories, manifest parity,
 * per-volume metadata parity, full scheduling validation, and that every
 * calculated-date rule resolves. Adds no card data.
 */
import { describe, expect, it } from "vitest";
import manifestJson from "@/spark-library/manifest.json";
import { SPARK_NOTE_CATALOG } from "../catalog";
import { SEED_SPARK_NOTE_CATALOG } from "../catalogSeed";
import { catalogEntryToRecord } from "../contentDatabase/mapRecord";
import { validateSparkRecords } from "../contentDatabase/validateRecord";
import {
  matchesCalculatedDate,
  resolveCalculatedDate,
} from "../scheduling/calculatedDates";
import type { SparkCalculatedDateRule } from "../types";
import {
  INTEGRATED_VOLUME_ENTRIES,
  VOLUME_2_ENTRIES,
  VOLUME_2_METADATA,
  VOLUME_3_ENTRIES,
  VOLUME_3_METADATA,
  VOLUME_4_ENTRIES,
  VOLUME_4_METADATA,
} from "./index";

const CATALOG = SPARK_NOTE_CATALOG;
const NUMBERED = new Set([
  "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012",
]);
const manifest = manifestJson as Array<{
  spark_id: string;
  runtime_category?: string;
}>;

describe("catalog audit — counts & sources", () => {
  it("total is 436 (seed 112 + 324 integrated volume entries)", () => {
    expect(SEED_SPARK_NOTE_CATALOG).toHaveLength(112);
    expect(INTEGRATED_VOLUME_ENTRIES).toHaveLength(324);
    expect(CATALOG).toHaveLength(436);
    expect(manifest).toHaveLength(436);
  });

  it("every seed id and every integrated volume id is present in the catalog", () => {
    const ids = new Set(CATALOG.map((e) => e.id));
    for (const s of SEED_SPARK_NOTE_CATALOG) expect(ids.has(s.id)).toBe(true);
    for (const v of INTEGRATED_VOLUME_ENTRIES) expect(ids.has(v.id)).toBe(true);
  });
});

describe("catalog audit — duplicate IDs & titles (catalog-wide)", () => {
  it("no duplicate IDs across the full catalog", () => {
    const ids = CATALOG.map((e) => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });

  it("no duplicate titles across the full catalog", () => {
    const titles = CATALOG.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("catalog audit — categories", () => {
  it("every card uses an approved 001–012 category", () => {
    for (const e of CATALOG) {
      expect(NUMBERED.has(e.category), `${e.id}:${e.category}`).toBe(true);
    }
  });
});

describe("catalog audit — manifest parity", () => {
  it("manifest and runtime catalog describe the same id set", () => {
    const manifestIds = new Set(manifest.map((r) => r.spark_id));
    const catalogIds = new Set(CATALOG.map((e) => e.id));
    expect(manifestIds.size).toBe(manifest.length); // no dup manifest ids
    expect(manifestIds.size).toBe(catalogIds.size);
    for (const id of catalogIds) expect(manifestIds.has(id)).toBe(true);
    for (const r of manifest) {
      expect(NUMBERED.has(r.runtime_category ?? "")).toBe(true);
    }
  });
});

describe("catalog audit — per-volume metadata parity", () => {
  it("each volume's metadata cardCount matches its entries (108 each)", () => {
    expect(VOLUME_2_METADATA.cardCount).toBe(VOLUME_2_ENTRIES.length);
    expect(VOLUME_3_METADATA.cardCount).toBe(VOLUME_3_ENTRIES.length);
    expect(VOLUME_4_METADATA.cardCount).toBe(VOLUME_4_ENTRIES.length);
    expect(VOLUME_2_ENTRIES).toHaveLength(108);
    expect(VOLUME_3_ENTRIES).toHaveLength(108);
    expect(VOLUME_4_ENTRIES).toHaveLength(108);
  });

  it("each volume's collection counts sum to its total, all marked passed", () => {
    for (const meta of [VOLUME_2_METADATA, VOLUME_3_METADATA, VOLUME_4_METADATA]) {
      const sum = meta.collections.reduce((n, c) => n + c.cardCount, 0);
      expect(sum).toBe(meta.cardCount);
      expect(meta.validationStatus).toBe("passed");
      expect(meta.sourceAuthoringFiles.length).toBeGreaterThan(0);
    }
  });
});

describe("catalog audit — scheduling validation", () => {
  it("the full manifest produces no record validation errors", () => {
    const records = CATALOG.map(catalogEntryToRecord);
    const { errors } = validateSparkRecords(records);
    expect(errors).toEqual([]);
  });

  it("every integrated calculated-date rule resolves and matches its date", () => {
    const calc = INTEGRATED_VOLUME_ENTRIES.filter(
      (e) => e.displayRule === "calculated-date",
    );
    expect(calc.length).toBeGreaterThan(0);
    for (const e of calc) {
      const rule = e.dateRule as SparkCalculatedDateRule;
      const { month, day } = resolveCalculatedDate(rule, 2026);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
      expect(matchesCalculatedDate(rule, new Date(2026, month - 1, day))).toBe(true);
    }
  });

  it("all six calculated-date rules are present across the integrated volumes", () => {
    const rules = new Set(
      INTEGRATED_VOLUME_ENTRIES.filter((e) => e.displayRule === "calculated-date")
        .map((e) => e.dateRule),
    );
    for (const rule of [
      "thanksgiving-us", "memorial-day-us", "mothers-day-us",
      "mlk-day-us", "winter-solstice", "spring-equinox",
    ]) {
      expect(rules.has(rule as SparkCalculatedDateRule), rule).toBe(true);
    }
  });
});

describe("catalog audit — regional seasonal cards", () => {
  it("Iowa seasonal cards are region US-IA (36 across fall/winter/spring)", () => {
    const iowa = INTEGRATED_VOLUME_ENTRIES.filter(
      (e) => e.collection === "iowa-seasons",
    );
    expect(iowa).toHaveLength(36);
    for (const e of iowa) expect(e.region).toBe("US-IA");
  });
});
