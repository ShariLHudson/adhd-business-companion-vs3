import { describe, expect, it, beforeEach } from "vitest";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { evaluateDailySparkNote } from "./evaluateDailySparkNote";
import { resolvePersonalSpark } from "./personalSparks";
import {
  dayKey,
  getStoredDailySparkId,
  readSparkNoteStore,
  recordDailySparkSelection,
  recordSparkNoteViewed,
  resetSparkNoteStoreForTests,
} from "./persistence";

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

  it("uses deterministic day key for storage", () => {
    const now = new Date("2026-05-01T08:00:00");
    evaluateDailySparkNote({ now, forceRefresh: true });
    expect(getStoredDailySparkId(now)).toBeTruthy();
    expect(dayKey(now)).toBe("2026-05-01");
  });
});
