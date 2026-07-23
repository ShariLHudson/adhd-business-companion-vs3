import { describe, expect, it } from "vitest";
import { composeTodayFirePortfolio } from "./composeTodayFirePortfolio";
import {
  firePortfolioIdForDateKey,
  formatFounderLocalDateDisplay,
  founderLocalDateFromKey,
  toFounderLocalDateKey,
} from "./founderLocalDate";

describe("composeTodayFirePortfolio", () => {
  it("produces a valid FireExecutivePortfolio for a supplied date", () => {
    const now = new Date(2026, 6, 23, 10, 0, 0);
    const portfolio = composeTodayFirePortfolio({ now });
    const dateKey = toFounderLocalDateKey(now);

    expect(portfolio.date).toBe(dateKey);
    expect(portfolio.id).toBe(firePortfolioIdForDateKey(dateKey));
    expect(portfolio.dateDisplay).toBe(
      formatFounderLocalDateDisplay(founderLocalDateFromKey(dateKey)),
    );
    expect(portfolio.preparedFor).toContain("Shari");
    expect(portfolio.status).toBe("draft");
    expect(portfolio.primaryFocus.length).toBeGreaterThan(10);
    expect(portfolio.executiveSummary.length).toBeGreaterThan(0);
    expect(portfolio.priorities.length).toBeGreaterThan(0);
    expect(portfolio.alerts.length).toBeGreaterThan(0);
    expect(portfolio.decisions.length).toBeGreaterThan(0);
    expect(portfolio.dashboardPanels.length).toBeGreaterThan(0);
    expect(portfolio.opportunities.top.length).toBeGreaterThan(0);
    expect(portfolio.executiveBriefDetail?.sections.length).toBe(16);
    expect(portfolio.executiveBriefDetail?.reportName).toContain(
      "Executive Intelligence Brief",
    );
  });

  it("uses a stable daily ID and deterministic structure for the same date", () => {
    const a = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
    const b = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
    expect(a.id).toBe("fire-2026-07-23");
    expect(b.id).toBe("fire-2026-07-23");
    expect(a.issueNumber).toBe(b.issueNumber);
    expect(a.dateDisplay).toBe(b.dateDisplay);
    expect(a.primaryFocus).toBe(b.primaryFocus);
    expect(a.executiveSummary.map((x) => x.id)).toEqual(
      b.executiveSummary.map((x) => x.id),
    );
  });

  it("does not claim overnight automation in status", () => {
    const portfolio = composeTodayFirePortfolio({ dateKey: "2026-01-01" });
    expect(portfolio.status).toBe("draft");
    expect(
      portfolio.alerts.some((a) =>
        /available Founder intelligence|Founder Workspace/i.test(
          `${a.title} ${a.explanation}`,
        ),
      ),
    ).toBe(true);
    expect(portfolio.preparedAt).toBeTruthy();
  });
});
