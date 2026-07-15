import { describe, expect, it } from "vitest";
import {
  journalPrintedCoverImageUrls,
  preloadJournalCoverImages,
} from "./preloadJournalCovers";

describe("preloadJournalCoverImages", () => {
  it("lists every printed cover plate", () => {
    const urls = journalPrintedCoverImageUrls();
    expect(urls.length).toBeGreaterThanOrEqual(3);
    expect(urls.some((url) => url.includes("gazebo-cover"))).toBe(true);
    expect(urls.some((url) => url.includes("celebrations-garden"))).toBe(true);
  });

  it("is safe to call without a window Image (module side only)", () => {
    expect(() => preloadJournalCoverImages()).not.toThrow();
  });
});
