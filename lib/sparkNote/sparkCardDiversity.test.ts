import { describe, expect, it, beforeEach } from "vitest";

import { SPARK_NOTE_CATALOG } from "./catalog";
import {
  filterLibraryCandidatePool,
  shouldYieldCalendarSparkForVariety,
} from "./librarySelection";
import {
  recordDailySparkSelection,
  resetSparkNoteStoreForTests,
} from "./persistence";
import {
  getRecentDiversityCategories,
  VARIETY_DIVERSITY_CATEGORY_LOOKBACK,
} from "./selectionIntelligence";
import {
  SPARK_CARD_DIVERSITY_CATEGORY_IDS,
  SPARK_CARD_DIVERSITY_CATEGORY_LABELS,
  SPARK_CARD_LENGTH,
  SPARK_CARD_TONE,
  diversityCategoryForEntry,
  resolveSparkCardCategoryRibbon,
  resolveSparkCardDiversityCategory,
  sparkCardStoryWithinLength,
} from "./sparkCardDiversity";

describe("sparkCardDiversity", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
  });

  it("exposes the approved diversity catalog", () => {
    expect(SPARK_CARD_DIVERSITY_CATEGORY_IDS).toHaveLength(13);
    expect(SPARK_CARD_DIVERSITY_CATEGORY_LABELS.fun_celebrations).toBe(
      "Fun & Celebrations",
    );
    expect(SPARK_CARD_DIVERSITY_CATEGORY_LABELS.remarkable_people).toBe(
      "Remarkable People",
    );
    expect(SPARK_CARD_DIVERSITY_CATEGORY_LABELS.science_technology).toBe(
      "Science & Technology",
    );
  });

  it("maps legacy invention cards to Innovation ribbon", () => {
    expect(
      resolveSparkCardDiversityCategory({
        category: "invention",
        categoryLabel: "Invention",
        title: "The Post-it® Note",
      }),
    ).toBe("innovation");
    expect(
      resolveSparkCardCategoryRibbon({
        category: "invention",
        categoryLabel: "Invention",
      }),
    ).toBe("Innovation");
  });

  it("maps holidays to Fun & Celebrations", () => {
    expect(
      resolveSparkCardDiversityCategory({
        category: "holiday",
        categoryLabel: "Holiday",
        tags: ["national-day"],
      }),
    ).toBe("fun_celebrations");
  });

  it("uses tags to refine science vs innovation", () => {
    expect(
      resolveSparkCardDiversityCategory({
        category: "invention",
        categoryLabel: "Invention",
        tags: ["science", "radar"],
        title: "Microwave",
      }),
    ).toBe("science_technology");
  });

  it("defines tone and 1–2 minute length constraints", () => {
    expect(SPARK_CARD_TONE.required).toContain("warm");
    expect(SPARK_CARD_TONE.forbidden).toContain("preachy");
    expect(SPARK_CARD_LENGTH.minMinutes).toBe(1);
    expect(SPARK_CARD_LENGTH.maxMinutes).toBe(2);
    expect(
      sparkCardStoryWithinLength(
        "A short story about curiosity that fits a daily treasure.",
      ),
    ).toBe(true);
  });

  it("tracks recent diversity categories for variety lookback", () => {
    recordDailySparkSelection("SPARK-INV-001", new Date("2026-04-08T10:00:00"));
    recordDailySparkSelection("SPARK-BIZ-004", new Date("2026-04-09T10:00:00"));
    recordDailySparkSelection("SPARK-FACT-001", new Date("2026-04-10T10:00:00"));

    const recent = getRecentDiversityCategories();
    expect(recent.length).toBeGreaterThan(0);
    expect(recent.length).toBeLessThanOrEqual(
      VARIETY_DIVERSITY_CATEGORY_LOOKBACK,
    );
    expect(recent).toContain("innovation");
    expect(recent).toContain("fun_facts");
  });

  it("avoids repeating yesterday's diversity ribbon when alternatives exist", () => {
    const now = new Date("2026-04-12T10:00:00");
    recordDailySparkSelection("SPARK-INV-001", new Date("2026-04-11T10:00:00"));

    const libraryOnly = SPARK_NOTE_CATALOG.filter(
      (e) => !e.monthDay && !e.months && !e.seasons?.length,
    );
    const filtered = filterLibraryCandidatePool(libraryOnly, now);
    expect(
      filtered.every(
        (e) => diversityCategoryForEntry(e) !== "innovation",
      ),
    ).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("yields calendar celebrations when they would dominate", () => {
    const holiday = SPARK_NOTE_CATALOG.find((e) => e.category === "holiday");
    expect(holiday).toBeTruthy();
    if (!holiday) return;

    recordDailySparkSelection(
      holiday.id,
      new Date("2026-04-09T10:00:00"),
    );
    // Second celebration-ish recent entry via another holiday if available
    const otherHoliday = SPARK_NOTE_CATALOG.find(
      (e) => e.category === "holiday" && e.id !== holiday.id,
    );
    if (otherHoliday) {
      recordDailySparkSelection(
        otherHoliday.id,
        new Date("2026-04-10T10:00:00"),
      );
    } else {
      recordDailySparkSelection(
        holiday.id,
        new Date("2026-04-10T10:00:00"),
      );
    }

    expect(shouldYieldCalendarSparkForVariety(holiday)).toBe(true);
  });
});
