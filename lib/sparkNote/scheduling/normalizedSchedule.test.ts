import { describe, expect, it } from "vitest";
import type { SparkNoteCatalogEntry } from "../types";
import { normalizeSchedule } from "./normalizedSchedule";

/** Build a valid catalog entry; override only the fields under test. */
function entry(
  overrides: Partial<SparkNoteCatalogEntry> & { id: string },
): SparkNoteCatalogEntry {
  return {
    category: "001",
    categoryLabel: "Discovery",
    title: overrides.id,
    teaser: "t",
    whatHappened: "w",
    whyItMatters: "m",
    sparkApplication: "a",
    ...overrides,
  };
}

describe("normalizeSchedule — legacy shape (unchanged reading)", () => {
  it("monthDay → exact-date", () => {
    const s = normalizeSchedule(entry({ id: "a", monthDay: { month: 5, day: 30 } }));
    expect(s).toMatchObject({ kind: "exact-date", month: 5, day: 30 });
  });

  it("months → seasonal (carries months)", () => {
    const s = normalizeSchedule(entry({ id: "b", months: [12, 1, 2] }));
    expect(s).toMatchObject({ kind: "seasonal", months: [12, 1, 2] });
  });

  it("seasons → seasonal (carries seasons)", () => {
    const s = normalizeSchedule(entry({ id: "c", seasons: ["winter"] }));
    expect(s).toMatchObject({ kind: "seasonal", seasons: ["winter"] });
  });

  it("no scheduling fields → core", () => {
    const s = normalizeSchedule(entry({ id: "d" }));
    expect(s.kind).toBe("core");
  });

  it("carries legacy regions + priority + cooldown", () => {
    const s = normalizeSchedule(
      entry({
        id: "e",
        monthDay: { month: 7, day: 4 },
        regions: ["US"],
        priority: 200,
        cooldownDays: 30,
      }),
    );
    expect(s).toMatchObject({
      kind: "exact-date",
      regions: ["US"],
      priority: 200,
      cooldownDays: 30,
    });
  });
});

describe("normalizeSchedule — new shape (displayRule authoritative)", () => {
  it("displayRule core → core", () => {
    const s = normalizeSchedule(
      entry({ id: "f", volume: 2, collection: "core", displayRule: "core" }),
    );
    expect(s.kind).toBe("core");
  });

  it("displayRule exact-date + flat month/day → exact-date", () => {
    const s = normalizeSchedule(
      entry({ id: "g", displayRule: "exact-date", month: 11, day: 11 }),
    );
    expect(s).toMatchObject({ kind: "exact-date", month: 11, day: 11 });
  });

  it("displayRule calculated-date → calculated-date (carries dateRule)", () => {
    const s = normalizeSchedule(
      entry({
        id: "h",
        displayRule: "calculated-date",
        dateRule: "thanksgiving-us",
      }),
    );
    expect(s).toMatchObject({
      kind: "calculated-date",
      dateRule: "thanksgiving-us",
    });
  });

  it("displayRule seasonal + season + months → seasonal", () => {
    // `region` (e.g. "Iowa") is intentionally out of Phase 1 scope; it joins the
    // schema when the seasonal collections are transformed in a later phase.
    const s = normalizeSchedule(
      entry({
        id: "i",
        displayRule: "seasonal",
        season: "autumn",
        months: [9, 10, 11],
        priority: 140,
      }),
    );
    expect(s).toMatchObject({
      kind: "seasonal",
      season: "autumn",
      months: [9, 10, 11],
      priority: 140,
    });
  });
});

describe("normalizeSchedule — both shapes converge on one model", () => {
  it("legacy monthDay and new exact-date produce the same schedule", () => {
    const legacy = normalizeSchedule(
      entry({ id: "L", monthDay: { month: 10, day: 31 } }),
    );
    const modern = normalizeSchedule(
      entry({ id: "N", displayRule: "exact-date", month: 10, day: 31 }),
    );
    expect(legacy).toEqual(modern);
  });

  it("legacy seasons and new seasonal both land in the seasonal tier", () => {
    const legacy = normalizeSchedule(entry({ id: "L2", seasons: ["autumn"] }));
    const modern = normalizeSchedule(
      entry({ id: "N2", displayRule: "seasonal", season: "autumn" }),
    );
    expect(legacy.kind).toBe("seasonal");
    expect(modern.kind).toBe("seasonal");
  });

  it("displayRule wins even if legacy fields are also present", () => {
    // A record mid-migration: new displayRule must take precedence.
    const s = normalizeSchedule(
      entry({
        id: "M",
        displayRule: "core",
        monthDay: { month: 1, day: 1 },
      }),
    );
    expect(s.kind).toBe("core");
  });
});
