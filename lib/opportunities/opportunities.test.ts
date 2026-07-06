import { describe, expect, it } from "vitest";

import {
  discoverOpportunities,
  findEmerging,
  findHidden,
  findRecurring,
  getOpportunity,
  group,
  listMissionOpportunities,
  listOpportunities,
  listQuickWins,
  listStrategicBets,
  opportunityDiscoveryService,
  prepareExecutiveSummary,
  relationshipsForOpportunity,
  listOpportunityRelationships,
} from "./index";

describe("Opportunity Discovery Engine™", () => {
  it("sample catalog includes spec examples with mission connections", () => {
    expect(listOpportunities().length).toBeGreaterThanOrEqual(10);
    const lr = getOpportunity("opp-listening-rooms-expansion");
    expect(lr?.missions.some((m) => m.missionId === "listening-rooms")).toBe(true);
    expect(lr?.missionIds).toContain("marketing-launch");
    expect(lr?.reasoning.missionBenefit).toContain("GHL");
  });

  it("scores normalize 0–100 across dimensions", () => {
    const opp = getOpportunity("opp-listening-rooms-expansion")!;
    expect(opp.score.composite).toBeGreaterThanOrEqual(0);
    expect(opp.score.composite).toBeLessThanOrEqual(100);
    expect(opp.score.strategicValue).toBeLessThanOrEqual(100);
    expect(opp.score.customerNeed).toBeGreaterThan(80);
  });

  it("relationships connect opportunities across mission chain", () => {
    const rels = relationshipsForOpportunity("opp-listening-rooms-expansion");
    expect(rels.length).toBeGreaterThan(0);
    expect(rels.some((r) => r.relationship === "feeds")).toBe(true);
  });

  it("discover and rank order by composite score", () => {
    const discovered = discoverOpportunities();
    expect(discovered.length).toBe(listOpportunities().length);
    for (let i = 1; i < discovered.length; i++) {
      expect(discovered[i - 1].score.composite).toBeGreaterThanOrEqual(
        discovered[i].score.composite,
      );
    }
  });

  it("findEmerging, findHidden, findRecurring, findIgnored", () => {
    expect(findEmerging().length).toBeGreaterThan(0);
    expect(findRecurring().some((o) => o.id === "opp-listening-rooms-expansion")).toBe(true);
    expect(opportunityDiscoveryService.findIgnored().length).toBeGreaterThan(0);
    expect(findHidden().length).toBeGreaterThan(0);
  });

  it("group by category and executive filter", () => {
    const all = listOpportunities();
    const byCategory = group(all, "category");
    expect(byCategory.length).toBeGreaterThan(3);
    const byFilter = group(all, "executive-filter");
    expect(byFilter.some((g) => g.id === "group-quick-win")).toBe(true);
  });

  it("executive filters: quick wins and strategic bets", () => {
    const quickWins = listQuickWins();
    expect(quickWins.some((o) => o.id === "opp-customer-onboarding")).toBe(true);
    const bets = listStrategicBets();
    expect(bets.length).toBeGreaterThan(0);
  });

  it("listMissionOpportunities scopes to mission", () => {
    const lr = listMissionOpportunities("listening-rooms");
    expect(lr.some((o) => o.id === "opp-listening-rooms-expansion")).toBe(true);
    expect(lr.every((o) => o.missionIds.includes("listening-rooms"))).toBe(true);
  });

  it("prepareExecutiveSummary answers board-style orientation", () => {
    const summary = prepareExecutiveSummary();
    expect(summary.headline).toBeTruthy();
    expect(summary.topOpportunities.length).toBeGreaterThan(0);
    expect(summary.emergingCount).toBeGreaterThan(0);
    expect(summary.topOpportunities[0].reasoning.whyItMatters).toBeTruthy();
    expect(summary.topOpportunities[0].reasoning.nextStep).toBeTruthy();
  });

  it("discovered opportunity assembles signals and evidence", () => {
    const opp = getOpportunity("opp-decision-fatigue-workshop")!;
    expect(opp.signals.length).toBeGreaterThan(0);
    expect(opp.evidence.length).toBeGreaterThan(0);
    expect(opp.recommendations.length).toBeGreaterThan(0);
  });
});
