import { describe, expect, it } from "vitest";

import {
  COORDINATED_SYSTEMS,
  EXECUTIVE_OPERATING_LOOP,
  ONE_RECOMMENDATION_PRINCIPLE,
  composeAttention,
  composeCompanyState,
  composeExecutiveContext,
  composeExecutiveState,
  composeLeverage,
  composeOperatingHealth,
  executiveOSService,
} from "./index";

describe("Executive Operating System™", () => {
  it("defines the full executive operating loop", () => {
    expect(EXECUTIVE_OPERATING_LOOP[0]).toBe("observe");
    expect(EXECUTIVE_OPERATING_LOOP.at(-1)).toBe("repeat");
    expect(EXECUTIVE_OPERATING_LOOP.length).toBe(17);
  });

  it("coordinates all completed systems without duplication", () => {
    const state = composeExecutiveState({ missionId: "listening-rooms" });
    expect(state.product).toBe("founder");
    expect(state.coordinatedSystems.length).toBeGreaterThanOrEqual(10);
    expect(COORDINATED_SYSTEMS).toContain("continuous_improvement");
    expect(state.mission.id).toBe("listening-rooms");
  });

  it("routes attention with one primary and three supporting max", () => {
    const attention = composeAttention("listening-rooms");
    expect(attention.primary).toBeTruthy();
    expect(attention.supporting.length).toBeLessThanOrEqual(3);
    expect(attention.principle).toBe(ONE_RECOMMENDATION_PRINCIPLE);
    expect(attention.deferredCount).toBe(attention.library.length);
  });

  it("composeExecutiveContext adapts to company mode", () => {
    const ctx = composeExecutiveContext({ missionId: "listening-rooms", mode: "building" });
    expect(ctx.mode).toBe("building");
    expect(ctx.label).toBe("Building");
  });

  it("composeOperatingHealth covers company health dimensions", () => {
    const health = composeOperatingHealth("listening-rooms");
    expect(health.dimensions.length).toBeGreaterThanOrEqual(8);
    expect(health.dimensions.some((d) => d.dimension === "founder")).toBe(true);
    expect(health.dimensions.some((d) => d.dimension === "customer")).toBe(true);
    expect(health.balance.simplification.length).toBeGreaterThan(0);
  });

  it("composeCompanyState represents one connected company", () => {
    const company = composeCompanyState({ missionId: "listening-rooms" });
    expect(company.missions.length).toBeGreaterThan(0);
    expect(company.health.departments.length).toBeGreaterThan(0);
    expect(company.primaryRecommendation?.tier).toBe("primary");
  });

  it("composeLeverage estimates executive leverage", () => {
    const leverage = composeLeverage("listening-rooms");
    expect(leverage.founderTimeSavedHours).toBeGreaterThanOrEqual(0);
    expect(leverage.summary.length).toBeGreaterThan(0);
  });

  it("executive state includes execution and improvement without competing recommendations", () => {
    const state = composeExecutiveState({ missionId: "listening-rooms" });
    expect(state.execution.recommendedNextAction.length).toBeGreaterThan(0);
    expect(state.recommendations.competingFiltered).toBeGreaterThanOrEqual(0);
    expect(state.improvement.topOpportunity).toBeTruthy();
  });

  it("public API surfaces through executiveOSService", () => {
    expect(executiveOSService.sampleRepository().operatingLoop().length).toBe(17);
  });
});
