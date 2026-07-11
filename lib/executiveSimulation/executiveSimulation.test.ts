import { describe, expect, it } from "vitest";

import {
  composeSimulationSession,
  getComparisonRows,
  SIMULATION_STUDIO_PRINCIPLE,
} from "./index";

describe("Executive Simulation Studio engine", () => {
  it("exposes simulation principle", () => {
    expect(SIMULATION_STUDIO_PRINCIPLE).toContain("futures");
  });

  it("composeSimulationSession returns scenarios with full analysis", () => {
    const session = composeSimulationSession(
      "Should we launch the restart workshop before a membership tier?",
    );
    expect(session).not.toBeNull();
    expect(session!.simulation.scenarios.length).toBeGreaterThanOrEqual(3);
    const first = session!.simulation.scenarios[0]!;
    expect(first.whatChanges.becomesEasier.length).toBeGreaterThan(0);
    expect(first.opportunityCost.notChoosing.length).toBeGreaterThan(0);
    expect(session!.simulation.ifIWereYou.recommendedPath).toBeTruthy();
  });

  it("getComparisonRows builds executive comparison table", () => {
    const session = composeSimulationSession("Founder vs Companion");
    const rows = getComparisonRows(session!.simulation);
    expect(rows.length).toBeGreaterThan(3);
    expect(Object.keys(rows[0]!.values).length).toBe(session!.simulation.scenarios.length);
  });
});
