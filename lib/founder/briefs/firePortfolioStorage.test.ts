/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { composeTodayFirePortfolio } from "./composeTodayFirePortfolio";
import {
  FIRE_PORTFOLIO_STORAGE_KEY,
  clearFirePortfolioStorageForTests,
  getStoredFirePortfolioForDate,
  listStoredFirePortfolioDateKeys,
  storeFirePortfolioForDate,
} from "./firePortfolioStorage";

describe("firePortfolioStorage", () => {
  beforeEach(() => {
    clearFirePortfolioStorageForTests();
  });

  it("stores once per date and retrieves today’s record", () => {
    const portfolio = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
    const first = storeFirePortfolioForDate(portfolio);
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.stored).toBe(true);

    const second = storeFirePortfolioForDate({
      ...portfolio,
      primaryFocus: "Should not overwrite",
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.stored).toBe(false);

    const loaded = getStoredFirePortfolioForDate("2026-07-23");
    expect(loaded?.primaryFocus).toBe(portfolio.primaryFocus);
    expect(loaded?.id).toBe("fire-2026-07-23");
  });

  it("preserves prior dates", () => {
    const a = composeTodayFirePortfolio({ dateKey: "2026-07-22" });
    const b = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
    storeFirePortfolioForDate(a);
    storeFirePortfolioForDate(b);
    expect(getStoredFirePortfolioForDate("2026-07-22")?.id).toBe(
      "fire-2026-07-22",
    );
    expect(getStoredFirePortfolioForDate("2026-07-23")?.id).toBe(
      "fire-2026-07-23",
    );
    expect(listStoredFirePortfolioDateKeys()).toEqual([
      "2026-07-23",
      "2026-07-22",
    ]);
  });

  it("malformed storage does not crash", () => {
    window.localStorage.setItem(FIRE_PORTFOLIO_STORAGE_KEY, "{not-json");
    expect(getStoredFirePortfolioForDate("2026-07-23")).toBeNull();
    window.localStorage.setItem(
      FIRE_PORTFOLIO_STORAGE_KEY,
      JSON.stringify({ "2026-07-23": { id: "broken" } }),
    );
    expect(getStoredFirePortfolioForDate("2026-07-23")).toBeNull();
  });

  it("unavailable localStorage does not crash (memory still works)", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    try {
      const portfolio = composeTodayFirePortfolio({ dateKey: "2026-07-24" });
      const result = storeFirePortfolioForDate(portfolio);
      expect(result.ok).toBe(true);
      expect(getStoredFirePortfolioForDate("2026-07-24")?.id).toBe(
        "fire-2026-07-24",
      );
    } finally {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  });
});
