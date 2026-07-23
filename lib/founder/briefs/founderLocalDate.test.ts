import { describe, expect, it } from "vitest";
import {
  firePortfolioIdForDateKey,
  formatFounderLocalDateDisplay,
  founderLocalDateFromKey,
  stableFireIssueNumberForDateKey,
  toFounderLocalDateKey,
} from "./founderLocalDate";

describe("founderLocalDate", () => {
  it("formats a normal local date key and display", () => {
    const now = new Date(2026, 6, 23, 15, 30, 0); // Jul 23 local
    expect(toFounderLocalDateKey(now)).toBe("2026-07-23");
    expect(formatFounderLocalDateDisplay(now)).toMatch(/July 23, 2026/);
    expect(firePortfolioIdForDateKey("2026-07-23")).toBe("fire-2026-07-23");
  });

  it("handles month boundary without UTC slip", () => {
    const now = new Date(2026, 6, 31, 23, 30, 0); // Jul 31 local evening
    expect(toFounderLocalDateKey(now)).toBe("2026-07-31");
    const next = new Date(2026, 7, 1, 0, 15, 0); // Aug 1 local
    expect(toFounderLocalDateKey(next)).toBe("2026-08-01");
  });

  it("handles year boundary", () => {
    const eve = new Date(2026, 11, 31, 22, 0, 0);
    expect(toFounderLocalDateKey(eve)).toBe("2026-12-31");
    const day = new Date(2027, 0, 1, 1, 0, 0);
    expect(toFounderLocalDateKey(day)).toBe("2027-01-01");
    expect(formatFounderLocalDateDisplay(day)).toMatch(/January 1, 2027/);
  });

  it("repeated reads on the same date match", () => {
    const a = new Date(2026, 2, 15, 8, 0, 0);
    const b = new Date(2026, 2, 15, 20, 0, 0);
    expect(toFounderLocalDateKey(a)).toBe(toFounderLocalDateKey(b));
    expect(firePortfolioIdForDateKey(toFounderLocalDateKey(a))).toBe(
      "fire-2026-03-15",
    );
    expect(stableFireIssueNumberForDateKey("2026-03-15")).toBe(
      stableFireIssueNumberForDateKey("2026-03-15"),
    );
  });

  it("founderLocalDateFromKey stays on the same calendar day", () => {
    const d = founderLocalDateFromKey("2026-07-23");
    expect(toFounderLocalDateKey(d)).toBe("2026-07-23");
  });
});
