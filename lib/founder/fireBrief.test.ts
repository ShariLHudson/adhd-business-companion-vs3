import { describe, expect, it } from "vitest";

import {
  getExecutiveArchive,
  getFireExecutivePortfolio,
  listExecutiveArchives,
} from "./briefs/firePortfolio";

describe("FIRE executive briefing", () => {
  it("getFireExecutivePortfolio returns capped executive portfolio", () => {
    const portfolio = getFireExecutivePortfolio();
    expect(portfolio.preparedFor).toContain("Shari");
    expect(portfolio.executiveSummary.length).toBeLessThanOrEqual(6);
    expect(portfolio.priorities.length).toBeLessThanOrEqual(3);
    expect(portfolio.alerts.length).toBeLessThanOrEqual(3);
    expect(portfolio.decisions.length).toBeLessThanOrEqual(3);
    expect(portfolio.dashboardPanels.length).toBeLessThanOrEqual(6);
    expect(portfolio.primaryFocus.length).toBeGreaterThan(20);
    expect(portfolio.readingTimeMinutes).toBe(3);
  });

  it("listExecutiveArchives excludes today and sorts by issue", () => {
    const archives = listExecutiveArchives();
    const today = getFireExecutivePortfolio();
    expect(archives.every((a) => a.id !== today.id)).toBe(true);
    expect(archives.length).toBeGreaterThan(0);
    expect(archives[0].issueNumber).toBeGreaterThan(archives[1]?.issueNumber ?? 0);
  });

  it("getExecutiveArchive opens a prior brief", () => {
    const archive = getExecutiveArchive("fire-2026-07-04");
    expect(archive).not.toBeNull();
    expect(archive?.issueNumber).toBe(147);
    expect(archive?.status).toBe("archived");
  });
});
