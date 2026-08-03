import { describe, expect, it } from "vitest";
import { SPARK_NOTE_CATALOG } from "../catalog";
import { catalogEntryToRecord } from "../contentDatabase/mapRecord";
import { validateSparkRecords } from "../contentDatabase/validateRecord";
import { normalizeSchedule } from "../scheduling/normalizedSchedule";
import {
  IOWA_FALL_ENTRIES,
  VOLUME_2_CORE_ENTRIES,
  VOLUME_2_ENTRIES,
  VOLUME_2_METADATA,
} from "./volume2";

const VALID_CATEGORIES = new Set([
  "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012",
]);

describe("Volume 2 + Iowa Fall — counts", () => {
  it("has 96 core + 12 Iowa Fall = 108 entries, matching metadata", () => {
    expect(VOLUME_2_CORE_ENTRIES).toHaveLength(96);
    expect(IOWA_FALL_ENTRIES).toHaveLength(12);
    expect(VOLUME_2_ENTRIES).toHaveLength(108);
    expect(VOLUME_2_METADATA.cardCount).toBe(108);
  });
});

describe("Volume 2 + Iowa Fall — duplicate IDs", () => {
  it("has unique IDs within the volume", () => {
    const ids = VOLUME_2_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the full integrated catalog (incl. Volume 2) has no duplicate IDs", () => {
    const ids = SPARK_NOTE_CATALOG.map((e) => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("Volume 2 + Iowa Fall — duplicate titles", () => {
  it("has unique titles within the volume", () => {
    const titles = VOLUME_2_ENTRIES.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });

  it("the full integrated catalog (incl. Volume 2) has no duplicate titles", () => {
    const titles = SPARK_NOTE_CATALOG.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("Volume 2 + Iowa Fall — categories", () => {
  it("every card uses an approved 001–012 category", () => {
    for (const e of VOLUME_2_ENTRIES) {
      expect(VALID_CATEGORIES.has(e.category), `${e.id}:${e.category}`).toBe(true);
    }
  });
});

describe("Volume 2 + Iowa Fall — scheduling", () => {
  const byId = (id: string) => VOLUME_2_ENTRIES.find((e) => e.id === id)!;

  it("core cards are displayRule core and normalize to the core tier", () => {
    for (const e of VOLUME_2_CORE_ENTRIES) {
      expect(e.displayRule).toBe("core");
      expect(normalizeSchedule(e).kind).toBe("core");
    }
  });

  it("Veterans Day is exact-date Nov 11", () => {
    const e = byId("SPARK-IOWA-FALL-010");
    expect(e.displayRule).toBe("exact-date");
    expect(e.month).toBe(11);
    expect(e.day).toBe(11);
    expect(normalizeSchedule(e)).toMatchObject({ kind: "exact-date", month: 11, day: 11 });
  });

  it("Halloween is exact-date Oct 31", () => {
    const e = byId("SPARK-IOWA-FALL-012");
    expect(e.displayRule).toBe("exact-date");
    expect(e.month).toBe(10);
    expect(e.day).toBe(31);
  });

  it("Thanksgiving is calculated-date thanksgiving-us", () => {
    const e = byId("SPARK-IOWA-FALL-011");
    expect(e.displayRule).toBe("calculated-date");
    expect(e.dateRule).toBe("thanksgiving-us");
    expect(normalizeSchedule(e)).toMatchObject({
      kind: "calculated-date",
      dateRule: "thanksgiving-us",
    });
  });

  it("Iowa Fall seasonal cards carry autumn months and the US-IA region", () => {
    const seasonal = IOWA_FALL_ENTRIES.filter((e) => e.displayRule === "seasonal");
    expect(seasonal.length).toBe(9);
    for (const e of seasonal) {
      expect(e.months).toEqual([9, 10, 11]);
      expect(e.region).toBe("US-IA");
      expect(e.collection).toBe("iowa-seasons");
    }
  });

  it("produces no scheduling validation errors", () => {
    const records = VOLUME_2_ENTRIES.map(catalogEntryToRecord);
    const { errors } = validateSparkRecords(records);
    const schedulingErrors = errors.filter((e) =>
      ["display_rule", "date_rule", "volume", "spark_id"].includes(e.field),
    );
    expect(schedulingErrors).toEqual([]);
  });
});
