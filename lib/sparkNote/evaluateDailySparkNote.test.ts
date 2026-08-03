import { describe, expect, it, beforeEach } from "vitest";
import { SPARK_NOTE_CATALOG } from "./catalog";
import {
  evaluateDailySparkNote,
  findCatalogCardById,
  resolveDailySparkFromCatalogForTests,
} from "./evaluateDailySparkNote";
import { resolvePersonalSpark } from "./personalSparks";
import {
  dayKey,
  getStoredDailySparkId,
  readSparkNoteStore,
  recordDailySparkSelection,
  recordSparkNoteViewed,
  resetSparkNoteStoreForTests,
} from "./persistence";
import type { SparkNoteCatalogEntry } from "./types";

/** Fixture catalog entry for injected-catalog selector tests. */
function fx(
  overrides: Partial<SparkNoteCatalogEntry> & { id: string },
): SparkNoteCatalogEntry {
  return {
    category: "001",
    categoryLabel: "Discovery",
    title: overrides.id,
    teaser: `${overrides.id} teaser`,
    whatHappened: "story",
    whyItMatters: "matters",
    sparkApplication: "action",
    ...overrides,
  };
}

const pick = (
  catalog: SparkNoteCatalogEntry[],
  now: Date,
  region: string = "US",
) => resolveDailySparkFromCatalogForTests({ now, region, catalog });

describe("evaluateDailySparkNote", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
  });

  it("returns birthday spark when birthday matches today", () => {
    const now = new Date("2026-03-15T12:00:00");
    const { card } = evaluateDailySparkNote({
      now,
      firstName: "Alex",
      birthday: { month: 3, day: 15 },
      forceRefresh: true,
    });
    expect(card?.source).toBe("personal");
    expect(card?.title).toContain("Alex");
    expect(card?.title.toLowerCase()).toContain("birthday");
  });

  it("personal birthday beats holiday on the same calendar day", () => {
    const now = new Date("2026-05-30T10:00:00");
    const holidayOnly = evaluateDailySparkNote({ now, forceRefresh: true });
    expect(holidayOnly.card?.id).toBe("SPARK-HOL-001");

    const { card } = evaluateDailySparkNote({
      now,
      firstName: "Jordan",
      birthday: { month: 5, day: 30 },
      forceRefresh: true,
    });
    expect(card?.source).toBe("personal");
    expect(card?.id).toContain("personal-birthday");
  });

  it("upcoming personal event wins when nothing meaningful happens today", () => {
    const now = new Date("2026-07-02T10:00:00");
    const { card } = evaluateDailySparkNote({
      now,
      personalDates: [
        {
          id: "summer-trip",
          label: "Summer Adventure",
          month: 1,
          day: 1,
          kind: "vacation",
          targetDate: "2026-07-05",
        },
      ],
      forceRefresh: true,
    });
    expect(card?.source).toBe("personal");
    expect(card?.shortTitle).toBe("Adventure Ahead");
  });

  it("selects date-based spark on matching calendar day", () => {
    const now = new Date("2026-05-30T10:00:00");
    const { card } = evaluateDailySparkNote({
      now,
      forceRefresh: true,
    });
    expect(card?.id).toBe("SPARK-HOL-001");
    expect(card?.source).toBe("date");
    expect(card?.title).toContain("Creativity");
  });

  it("selects legacy fun holiday on its calendar day", () => {
    const now = new Date("2026-06-06T10:00:00");
    const { card } = evaluateDailySparkNote({
      now,
      forceRefresh: true,
    });
    expect(card?.id).toBe("SPARK-HOL-010");
    expect(card?.source).toBe("date");
    expect(card?.title).toContain("Donut");
  });

  it("returns same spark for the rest of the day", () => {
    const now = new Date("2026-04-10T10:00:00");
    const first = evaluateDailySparkNote({ now, forceRefresh: true });
    const second = evaluateDailySparkNote({ now });
    expect(second.card?.id).toBe(first.card?.id);
    expect(getStoredDailySparkId(now)).toBe(first.card?.id);
  });

  it("avoids recently shown sparks in library rotation", () => {
    const now = new Date("2026-04-10T10:00:00");
    const seen = new Set<string>();
    for (let i = 0; i < 5; i += 1) {
      const day = new Date(`2026-04-${10 + i}T10:00:00`);
      const { card } = evaluateDailySparkNote({
        now: day,
        forceRefresh: true,
      });
      expect(card).not.toBeNull();
      if (card) seen.add(card.id);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("picks from library when seasonal sparks are on cooldown", () => {
    const now = new Date("2026-04-10T10:00:00");
    const cooldownDate = new Date("2026-04-09T10:00:00");
    for (const entry of SPARK_NOTE_CATALOG) {
      if (entry.seasons?.length) {
        recordDailySparkSelection(entry.id, cooldownDate);
      }
    }
    const { card } = evaluateDailySparkNote({ now, forceRefresh: true });
    expect(card).not.toBeNull();
    expect(card?.source).toBe("library");
    const entry = SPARK_NOTE_CATALOG.find((e) => e.id === card?.id);
    expect(entry?.seasons).toBeUndefined();
  });

  it("selects personal anniversary when personal date matches", () => {
    const now = new Date("2026-11-20T10:00:00");
    const { card } = evaluateDailySparkNote({
      now,
      personalDates: [
        {
          id: "biz-launch",
          label: "Business Launch Day",
          month: 11,
          day: 20,
          kind: "anniversary",
        },
      ],
      forceRefresh: true,
    });
    expect(card?.source).toBe("personal");
    expect(card?.title).toBe("Business Launch Day");
  });

  it("selects saved celebration spark for speaking engagement", () => {
    const now = new Date("2026-08-01T10:00:00");
    const { card } = evaluateDailySparkNote({
      now,
      personalDates: [
        {
          id: "keynote",
          label: "Conference Keynote",
          month: 8,
          day: 1,
          kind: "speaking",
        },
      ],
      forceRefresh: true,
    });
    expect(card?.source).toBe("personal");
    expect(card?.title).toBe("Conference Keynote");
  });

  it("tracks viewed sparks when expanded", () => {
    recordSparkNoteViewed("SPARK-INV-001");
    expect(readSparkNoteStore().viewedIds).toContain("SPARK-INV-001");
  });

  it("resolvePersonalSpark prioritizes birthday over anniversary", () => {
    const now = new Date("2026-03-15T10:00:00");
    const card = resolvePersonalSpark({
      now,
      firstName: "Sam",
      birthday: { month: 3, day: 15 },
      personalDates: [
        {
          id: "wedding",
          label: "Wedding Anniversary",
          month: 3,
          day: 15,
          kind: "anniversary",
        },
      ],
    });
    expect(card?.title.toLowerCase()).toContain("birthday");
  });

  it("selects seasonal personality spark in spring", () => {
    const now = new Date("2026-04-10T10:00:00");
    const { card } = evaluateDailySparkNote({ now, forceRefresh: true });
    expect(card?.id).toBe("SPARK-SEA-SPRING");
  });

  it("selects seasonal month-based spark in December", () => {
    const now = new Date("2026-12-15T10:00:00");
    const { card } = evaluateDailySparkNote({ now, forceRefresh: true });
    expect(card?.id).toBe("SPARK-HOL-SEASON-12");
    expect(card?.source).toBe("date");
  });

  it("uses deterministic local day key for storage", () => {
    const now = new Date("2026-05-01T08:00:00");
    evaluateDailySparkNote({ now, forceRefresh: true });
    expect(getStoredDailySparkId(now)).toBeTruthy();
    expect(dayKey(now)).toBe("2026-05-01");
  });

  it("uses local calendar date near midnight (not UTC day rollover)", () => {
    const now = new Date(2026, 4, 1, 23, 30, 0);
    expect(dayKey(now)).toBe("2026-05-01");
  });

  it("always returns a spark card for the day", () => {
    const now = new Date("2026-04-10T10:00:00");
    const { card } = evaluateDailySparkNote({ now, forceRefresh: true });
    expect(card).not.toBeNull();
    expect(card?.title).toBeTruthy();
    expect(card?.teaser).toBeTruthy();
  });

  // Reopening a saved Spark by id (My Spark Collection → full card).
  it("findCatalogCardById resolves the full card for a catalog id", () => {
    const id = SPARK_NOTE_CATALOG[0]!.id;
    const card = findCatalogCardById(id);
    expect(card).not.toBeNull();
    expect(card?.id).toBe(id);
    expect(card?.title).toBeTruthy();
    expect(card?.whatHappened).toBeTruthy();
    expect(card?.whyItMatters).toBeTruthy();
    expect(card?.sparkApplication).toBeTruthy();
  });

  it("findCatalogCardById returns null for an unknown id", () => {
    expect(findCatalogCardById("SPARK-DOES-NOT-EXIST")).toBeNull();
  });
});

describe("Phase 3 — legacy month-based compatibility (regression)", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  it("legacy months card stays in the DATE tier, outranking seasonal + core", () => {
    // Normalization maps legacy `months` to the seasonal tier conceptually; the
    // selector must NOT demote it. In December the months card must win over a
    // higher-priority seasonal card and the core card (pre-Phase-3 behavior).
    const catalog = [
      fx({ id: "L-MONTH", months: [12], priority: 50 }),
      fx({ id: "L-SEASON", seasons: ["winter"], priority: 999 }),
      fx({ id: "L-CORE" }),
    ];
    const card = pick(catalog, new Date(2024, 11, 10));
    expect(card?.id).toBe("L-MONTH");
    expect(card?.source).toBe("date");
  });
});

describe("Phase 3 — new-model selection priority", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  it("exact-date beats seasonal and core", () => {
    const catalog = [
      fx({ id: "N-EXACT", displayRule: "exact-date", month: 10, day: 31 }),
      fx({
        id: "N-SEASON",
        displayRule: "seasonal",
        season: "autumn",
        months: [9, 10, 11],
        priority: 999,
      }),
      fx({ id: "N-CORE", displayRule: "core" }),
    ];
    expect(pick(catalog, new Date(2024, 9, 31))?.id).toBe("N-EXACT");
  });

  it("exact-date beats calculated-date on the same day", () => {
    // Nov 28 2024 is Thanksgiving — an exact-date card that day must still win.
    const catalog = [
      fx({ id: "N-EXACT", displayRule: "exact-date", month: 11, day: 28 }),
      fx({
        id: "N-CALC",
        displayRule: "calculated-date",
        dateRule: "thanksgiving-us",
        priority: 999,
      }),
    ];
    expect(pick(catalog, new Date(2024, 10, 28))?.id).toBe("N-EXACT");
  });

  it("seasonal beats core when no dated card matches", () => {
    const catalog = [
      fx({ id: "N-SEASON", displayRule: "seasonal", months: [10] }),
      fx({ id: "N-CORE", displayRule: "core" }),
    ];
    expect(pick(catalog, new Date(2024, 9, 15))?.id).toBe("N-SEASON");
  });
});

describe("Phase 3 — calculated-date holiday selection", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  const cases = [
    { rule: "thanksgiving-us", date: new Date(2024, 10, 28), label: "Thanksgiving" },
    { rule: "memorial-day-us", date: new Date(2024, 4, 27), label: "Memorial Day" },
    { rule: "mothers-day-us", date: new Date(2024, 4, 12), label: "Mother's Day" },
    { rule: "mlk-day-us", date: new Date(2025, 0, 20), label: "MLK Day" },
    { rule: "winter-solstice", date: new Date(2024, 11, 21), label: "Winter Solstice" },
    { rule: "spring-equinox", date: new Date(2025, 2, 20), label: "Spring Equinox" },
  ] as const;

  for (const { rule, date, label } of cases) {
    it(`selects the ${label} card on its day, not the day before`, () => {
      const catalog = [
        fx({ id: `H-${rule}`, displayRule: "calculated-date", dateRule: rule }),
        fx({ id: "H-CORE", displayRule: "core" }),
      ];
      expect(pick(catalog, date)?.id).toBe(`H-${rule}`);
      const dayBefore = new Date(date);
      dayBefore.setDate(date.getDate() - 1);
      expect(pick(catalog, dayBefore)?.id).toBe("H-CORE");
    });
  }
});

describe("Phase 3 — region gating (new structured region)", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  const catalog = [
    fx({
      id: "R-IOWA",
      displayRule: "seasonal",
      season: "autumn",
      months: [9, 10, 11],
      region: "US-IA",
      priority: 999,
    }),
    fx({ id: "R-CORE", displayRule: "core" }),
  ];

  it("no matching saved region → regional card is not silently shown", () => {
    expect(pick(catalog, new Date(2024, 9, 15), "US")?.id).toBe("R-CORE");
  });

  it("member region matches → regional card becomes eligible", () => {
    expect(pick(catalog, new Date(2024, 9, 15), "US-IA")?.id).toBe("R-IOWA");
  });
});

describe("Phase 3 — repeat protection, pinning, and history", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  it("no ordinary repeats until eligible unseen cards are exhausted", () => {
    // Six evergreen cards; six consecutive days must never repeat before the
    // unseen pool is exhausted.
    const catalog = Array.from({ length: 6 }, (_, i) =>
      fx({ id: `E-${i}`, displayRule: "core" }),
    );
    const seen: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      const day = new Date(2024, 5, 1 + i);
      const card = pick(catalog, day);
      expect(card).not.toBeNull();
      // Record the selection so repeat protection can see it next day.
      recordDailySparkSelection(card!.id, day, "library");
      seen.push(card!.id);
    }
    expect(new Set(seen).size).toBe(6);
  });

  it("same card stays pinned throughout one local day", () => {
    const now = new Date("2026-04-10T09:00:00");
    const first = evaluateDailySparkNote({ now, forceRefresh: true });
    const laterSameDay = evaluateDailySparkNote({
      now: new Date("2026-04-10T21:45:00"),
    });
    expect(laterSameDay.card?.id).toBe(first.card?.id);
    expect(getStoredDailySparkId(now)).toBe(first.card?.id);
  });

  it("adding new volumes does not erase existing history", () => {
    // Prior history (a viewed spark) recorded before any new volume exists.
    recordSparkNoteViewed("SPARK-INV-001");
    recordDailySparkSelection("SPARK-INV-001", new Date(2024, 4, 1), "library");
    // Selecting against a larger (post-integration) catalog must not clear it.
    const biggerCatalog = [
      ...SPARK_NOTE_CATALOG,
      fx({ id: "V2-NEW", displayRule: "core", volume: 2 }),
    ];
    pick(biggerCatalog, new Date(2024, 5, 2));
    expect(readSparkNoteStore().viewedIds).toContain("SPARK-INV-001");
  });
});
