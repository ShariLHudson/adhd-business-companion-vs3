import { describe, expect, it } from "vitest";
import { SPARK_NOTE_CATALOG } from "../catalog";
import { catalogEntryToRecord } from "../contentDatabase/mapRecord";
import { validateSparkRecords } from "../contentDatabase/validateRecord";
import { normalizeSchedule } from "../scheduling/normalizedSchedule";
import {
  IOWA_SPRING_ENTRIES,
  VOLUME_4_CORE_ENTRIES,
  VOLUME_4_ENTRIES,
  VOLUME_4_METADATA,
} from "./volume4";

const VALID_CATEGORIES = new Set([
  "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012",
]);

describe("Volume 4 + Iowa Spring — counts", () => {
  it("has 96 core + 12 Iowa Spring = 108 entries, matching metadata", () => {
    expect(VOLUME_4_CORE_ENTRIES).toHaveLength(96);
    expect(IOWA_SPRING_ENTRIES).toHaveLength(12);
    expect(VOLUME_4_ENTRIES).toHaveLength(108);
    expect(VOLUME_4_METADATA.cardCount).toBe(108);
  });
});

describe("Volume 4 + Iowa Spring — duplicate IDs", () => {
  it("has unique IDs within the volume", () => {
    const ids = VOLUME_4_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the full integrated catalog (incl. Volume 4) has no duplicate IDs", () => {
    const ids = SPARK_NOTE_CATALOG.map((e) => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("Volume 4 + Iowa Spring — duplicate titles", () => {
  it("has unique titles within the volume", () => {
    const titles = VOLUME_4_ENTRIES.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });

  it("the full integrated catalog (incl. Volume 4) has no duplicate titles", () => {
    const titles = SPARK_NOTE_CATALOG.map((e) => e.title.trim().toLowerCase());
    const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("Volume 4 + Iowa Spring — categories", () => {
  it("every card uses an approved 001–012 category", () => {
    for (const e of VOLUME_4_ENTRIES) {
      expect(VALID_CATEGORIES.has(e.category), `${e.id}:${e.category}`).toBe(true);
    }
  });
});

describe("Volume 4 + Iowa Spring — scheduling", () => {
  const byId = (id: string) => VOLUME_4_ENTRIES.find((e) => e.id === id)!;

  it("core cards are displayRule core and normalize to the core tier", () => {
    for (const e of VOLUME_4_CORE_ENTRIES) {
      expect(e.displayRule).toBe("core");
      expect(normalizeSchedule(e).kind).toBe("core");
    }
  });

  it("Spring Equinox is calculated-date spring-equinox", () => {
    const e = byId("SPARK-IOWA-SPRING-010");
    expect(e.displayRule).toBe("calculated-date");
    expect(e.dateRule).toBe("spring-equinox");
    expect(normalizeSchedule(e)).toMatchObject({
      kind: "calculated-date",
      dateRule: "spring-equinox",
    });
  });

  it("Mother's Day is calculated-date mothers-day-us", () => {
    const e = byId("SPARK-IOWA-SPRING-011");
    expect(e.displayRule).toBe("calculated-date");
    expect(e.dateRule).toBe("mothers-day-us");
    expect(normalizeSchedule(e)).toMatchObject({
      kind: "calculated-date",
      dateRule: "mothers-day-us",
    });
  });

  it("Memorial Day is calculated-date memorial-day-us", () => {
    const e = byId("SPARK-IOWA-SPRING-012");
    expect(e.displayRule).toBe("calculated-date");
    expect(e.dateRule).toBe("memorial-day-us");
    expect(normalizeSchedule(e)).toMatchObject({
      kind: "calculated-date",
      dateRule: "memorial-day-us",
    });
  });

  it("Iowa Spring seasonal cards carry [3,4,5] months and the US-IA region", () => {
    const seasonal = IOWA_SPRING_ENTRIES.filter((e) => e.displayRule === "seasonal");
    expect(seasonal.length).toBe(9);
    for (const e of seasonal) {
      expect(e.months).toEqual([3, 4, 5]);
      expect(e.region).toBe("US-IA");
      expect(e.collection).toBe("iowa-seasons");
    }
  });

  it("produces no scheduling validation errors", () => {
    const records = VOLUME_4_ENTRIES.map(catalogEntryToRecord);
    const { errors } = validateSparkRecords(records);
    const schedulingErrors = errors.filter((e) =>
      ["display_rule", "date_rule", "volume", "spark_id"].includes(e.field),
    );
    expect(schedulingErrors).toEqual([]);
  });
});
