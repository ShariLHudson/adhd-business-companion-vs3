import { beforeEach, describe, expect, it } from "vitest";
import { getFireExecutivePortfolio } from "./firePortfolio";
import { clearFirePortfolioStorageForTests } from "./firePortfolioStorage";
import { toFounderLocalDateKey } from "./founderLocalDate";

describe("getFireExecutivePortfolio — daily slice", () => {
  beforeEach(() => {
    clearFirePortfolioStorageForTests();
  });

  it("composes and stores when absent, then returns stored on repeat", () => {
    const now = new Date(2026, 6, 23, 9, 0, 0);
    const first = getFireExecutivePortfolio({ now });
    expect(first.date).toBe("2026-07-23");
    expect(first.id).toBe("fire-2026-07-23");
    expect(first.dateDisplay).toMatch(/July 23, 2026/);

    const mutatedAttempt = {
      ...first,
      primaryFocus: "Mutated focus should not appear",
    };
    // Re-get should ignore any desire to regenerate
    const second = getFireExecutivePortfolio({ now });
    expect(second.primaryFocus).toBe(first.primaryFocus);
    expect(second.id).toBe(first.id);
    expect(second.primaryFocus).not.toBe(mutatedAttempt.primaryFocus);
  });

  it("does not return yesterday’s portfolio as today’s", () => {
    const yesterday = new Date(2026, 6, 22, 12, 0, 0);
    const today = new Date(2026, 6, 23, 12, 0, 0);
    const y = getFireExecutivePortfolio({ now: yesterday });
    const t = getFireExecutivePortfolio({ now: today });
    expect(y.date).toBe("2026-07-22");
    expect(t.date).toBe("2026-07-23");
    expect(t.id).not.toBe(y.id);
  });

  it("respects existing cap contract", () => {
    const portfolio = getFireExecutivePortfolio({
      now: new Date(2026, 0, 5, 12, 0, 0),
    });
    expect(portfolio.executiveSummary.length).toBeLessThanOrEqual(6);
    expect(portfolio.priorities.length).toBeLessThanOrEqual(3);
    expect(portfolio.alerts.length).toBeLessThanOrEqual(3);
    expect(portfolio.decisions.length).toBeLessThanOrEqual(3);
    expect(portfolio.dashboardPanels.length).toBeLessThanOrEqual(6);
  });

  it("defaults to the runtime local today", () => {
    const portfolio = getFireExecutivePortfolio();
    expect(portfolio.date).toBe(toFounderLocalDateKey(new Date()));
    expect(portfolio.id).toBe(`fire-${portfolio.date}`);
  });

  it("keeps daily storage compatible and preserves full brief detail", () => {
    const now = new Date(2026, 6, 23, 9, 0, 0);
    const portfolio = getFireExecutivePortfolio({ now });
    expect(portfolio.id).toBe("fire-2026-07-23");
    expect(portfolio.executiveBriefDetail?.sections.length).toBe(16);
    const again = getFireExecutivePortfolio({ now });
    expect(again.executiveBriefDetail?.sections.length).toBe(16);
    expect(again.executiveBriefDetail?.reportName).toBe(
      portfolio.executiveBriefDetail?.reportName,
    );
  });
});
