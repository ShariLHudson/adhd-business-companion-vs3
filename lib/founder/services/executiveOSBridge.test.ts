import { describe, expect, it } from "vitest";

import {
  prepareCompany,
  prepareExecutiveOperatingState,
  prepareMission,
  prepareOffice,
  prepareToday,
} from "./executiveOSBridge";

describe("Founder Executive OS bridge", () => {
  it("prepareExecutiveOperatingState composes full OS", () => {
    const state = prepareExecutiveOperatingState("listening-rooms");
    expect(state.architectureOnly).toBe(true);
    expect(state.executive.coordinatedSystems.length).toBeGreaterThanOrEqual(10);
    expect(state.company.primaryRecommendation).toBeTruthy();
  });

  it("prepareOffice connects command center with OS attention", () => {
    const office = prepareOffice("listening-rooms");
    expect(office.primaryRecommendation?.tier).toBe("primary");
    expect(office.commandCenter.desk).toBeTruthy();
  });

  it("prepareToday delivers coordinated daily state", () => {
    const today = prepareToday("listening-rooms");
    expect(today.recommendations.primary).toBeTruthy();
    expect(today.commandCenterToday.morning.greeting.length).toBeGreaterThan(0);
  });

  it("prepareMission scopes mission operating state", () => {
    const mission = prepareMission("listening-rooms");
    expect(mission.mission.id).toBe("listening-rooms");
    expect(mission.attention.primary).toBeTruthy();
  });

  it("prepareCompany returns connected company health", () => {
    const company = prepareCompany("listening-rooms");
    expect(company.health.dimensions.length).toBeGreaterThanOrEqual(8);
  });
});
