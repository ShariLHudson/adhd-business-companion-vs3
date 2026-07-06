import { describe, expect, it } from "vitest";

import { getTodayBrief } from "./briefs";
import { searchFounderMemory } from "./memory";
import { getTeamHubSections } from "./teamhub";
import { getReports } from "./research";

describe("founder intelligence OS", () => {
  it("getTodayBrief returns capped executive brief", () => {
    const brief = getTodayBrief();
    expect(brief.greeting).toContain("Shari");
    expect(brief.priorities.length).toBeLessThanOrEqual(3);
    expect(brief.customerSignals.length).toBeLessThanOrEqual(3);
    expect(brief.ignoreItems.length).toBeLessThanOrEqual(3);
    expect(brief.bestIdea.summary.length).toBeGreaterThan(10);
  });

  it("memory search finds tagged entries", () => {
    const results = searchFounderMemory("founder");
    expect(results.length).toBeGreaterThan(0);
  });

  it("team hub sections load from service", () => {
    const sections = getTeamHubSections();
    expect(sections.some((s) => s.id === "active-projects")).toBe(true);
    expect(sections.some((s) => s.id === "completed")).toBe(true);
  });

  it("knowledge library lists sample reports", () => {
    expect(getReports().length).toBeGreaterThan(0);
  });
});
