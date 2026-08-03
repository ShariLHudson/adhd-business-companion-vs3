import { describe, expect, it } from "vitest";
import { SPARK_NOTE_CATALOG } from "../catalog";
import { catalogEntryToRecord } from "../contentDatabase/mapRecord";
import { validateSparkRecords } from "../contentDatabase/validateRecord";
import { normalizeSchedule } from "../scheduling/normalizedSchedule";
import {
  IOWA_WINTER_ENTRIES,
  VOLUME_3_CORE_ENTRIES,
  VOLUME_3_ENTRIES,
  VOLUME_3_METADATA,
} from "./volume3";

const VALID_CATEGORIES = new Set([
  "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012",
]);

describe("Volume 3 + Iowa Winter — counts", () => {
  it("has 96 core + 12 Iowa Winter = 108 entries, matching metadata", () => {
    expect(VOLUME_3_CORE_ENTRIES).toHaveLength(96);
    expect(IOWA_WINTER_ENTRIES).toHaveLength(12);
    expect(VOLUME_3_ENTRIES).toHaveLength(108);
    expect(VOLUME_3_METADATA.cardCount).toBe(108);
  });
});

describe("Volume 3 + Iowa Winter — duplicate IDs", () => {
  it("has unique IDs within the volume", () => {
    const ids = VOLUME_3_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the full integrated catalog (incl. Volume 3) has no duplicate IDs", () => {
    const ids = SPARK_NOTE_CATALOG.map((e) => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("Volume 3 + Iowa Winter — duplicate titles", () => {
  it("has unique titles within the volume", () => {
    const titles = VOLUME_3_ENTRIES.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });

  it("the full integrated catalog (incl. Volume 3) has no duplicate titles", () => {
    const titles = SPARK_NOTE_CATALOG.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("Volume 3 + Iowa Winter — categories", () => {
  it("every card uses an approved 001–012 category", () => {
    for (const e of VOLUME_3_ENTRIES) {
      expect(VALID_CATEGORIES.has(e.category), `${e.id}:${e.category}`).toBe(true);
    }
  });
});

describe("Volume 3 + Iowa Winter — scheduling", () => {
  const byId = (id: string) => VOLUME_3_ENTRIES.find((e) => e.id === id)!;

  it("core cards are displayRule core and normalize to the core tier", () => {
    for (const e of VOLUME_3_CORE_ENTRIES) {
      expect(e.displayRule).toBe("core");
      expect(normalizeSchedule(e).kind).toBe("core");
    }
  });

  it("New Year's Day is exact-date Jan 1", () => {
    const e = byId("SPARK-IOWA-WINTER-011");
    expect(e.displayRule).toBe("exact-date");
    expect(e.month).toBe(1);
    expect(e.day).toBe(1);
    expect(normalizeSchedule(e)).toMatchObject({ kind: "exact-date", month: 1, day: 1 });
  });

  it("Winter Solstice is calculated-date winter-solstice", () => {
    const e = byId("SPARK-IOWA-WINTER-010");
    expect(e.displayRule).toBe("calculated-date");
    expect(e.dateRule).toBe("winter-solstice");
    expect(normalizeSchedule(e)).toMatchObject({
      kind: "calculated-date",
      dateRule: "winter-solstice",
    });
  });

  it("Martin Luther King Jr. Day is calculated-date mlk-day-us", () => {
    const e = byId("SPARK-IOWA-WINTER-012");
    expect(e.displayRule).toBe("calculated-date");
    expect(e.dateRule).toBe("mlk-day-us");
    expect(normalizeSchedule(e)).toMatchObject({
      kind: "calculated-date",
      dateRule: "mlk-day-us",
    });
  });

  it("Iowa Winter seasonal cards carry [12,1,2] months and the US-IA region", () => {
    const seasonal = IOWA_WINTER_ENTRIES.filter((e) => e.displayRule === "seasonal");
    expect(seasonal.length).toBe(9);
    for (const e of seasonal) {
      expect(e.months).toEqual([12, 1, 2]);
      expect(e.region).toBe("US-IA");
      expect(e.collection).toBe("iowa-seasons");
    }
  });

  it("produces no scheduling validation errors", () => {
    const records = VOLUME_3_ENTRIES.map(catalogEntryToRecord);
    const { errors } = validateSparkRecords(records);
    const schedulingErrors = errors.filter((e) =>
      ["display_rule", "date_rule", "volume", "spark_id"].includes(e.field),
    );
    expect(schedulingErrors).toEqual([]);
  });
});
