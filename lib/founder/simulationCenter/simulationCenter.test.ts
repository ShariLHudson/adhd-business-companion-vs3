import { describe, expect, it } from "vitest";

import { getSimulationCenterBootstrap } from "./services/simulationCenterService";

describe("Simulation Center", () => {
  it("returns suggested decisions for entry", () => {
    const bootstrap = getSimulationCenterBootstrap();
    expect(bootstrap.suggestedDecisions.length).toBeGreaterThan(3);
    expect(bootstrap.sampleSimulationId).toBe("sim-workshop-vs-membership");
  });
});
