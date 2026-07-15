import { describe, expect, it } from "vitest";
import {
  JOURNAL_INTENTION_OPTIONS,
  JOURNAL_INTENTION_WATERMARKS,
  resolveJournalIntention,
  resolveShowPageWatermarks,
} from "./journalIntentions";

describe("journalIntentions", () => {
  it("offers six calm choices", () => {
    expect(JOURNAL_INTENTION_OPTIONS).toHaveLength(6);
  });

  it("defaults unknown intention to journey", () => {
    expect(resolveJournalIntention(undefined)).toBe("journey");
    expect(resolveJournalIntention(null)).toBe("journey");
  });

  it("keeps topic watermark sets (not Estate places) for every intention", () => {
    for (const option of JOURNAL_INTENTION_OPTIONS) {
      const set = JOURNAL_INTENTION_WATERMARKS[option.id];
      expect(set.length).toBeGreaterThanOrEqual(4);
      expect(set).toContain(option.previewWatermark);
      for (const id of set) {
        expect(id).toMatch(
          /^(prayer|gratitude|health|creative|business|journey)-/,
        );
      }
    }
  });

  it("defaults page images on, and respects an explicit off", () => {
    expect(resolveShowPageWatermarks(undefined)).toBe(true);
    expect(resolveShowPageWatermarks(true)).toBe(true);
    expect(resolveShowPageWatermarks(false)).toBe(false);
  });
});
