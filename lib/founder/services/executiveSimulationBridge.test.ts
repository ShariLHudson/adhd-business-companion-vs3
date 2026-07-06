import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveSimulation,
  prepareFounderSimulationSession,
} from "./executiveSimulationBridge";

describe("Founder Executive Simulation bridge", () => {
  it("prepareFounderExecutiveSimulation returns bootstrap", () => {
    const sim = prepareFounderExecutiveSimulation();
    expect(sim.bootstrap.suggestedDecisions.length).toBeGreaterThan(3);
    expect(sim.principle).toContain("futures");
  });

  it("prepareFounderSimulationSession returns scenarios and recommendation", () => {
    const result = prepareFounderSimulationSession(
      "Should we build Founder Studio features before Companion polish?",
    );
    expect(result.session?.simulation.scenarios.length).toBe(3);
    expect(result.session?.simulation.ifIWereYou.recommendedPath).toBeTruthy();
    expect(result.session?.simulation.boardSummary).toBeTruthy();
  });
});
