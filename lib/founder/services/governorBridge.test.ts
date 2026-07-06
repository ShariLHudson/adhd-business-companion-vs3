import { describe, expect, it } from "vitest";

import {
  prepareFounderGovernor,
  prepareFounderGovernorCoordination,
  prepareFounderGovernorPrimary,
} from "./governorBridge";

describe("Founder Governor bridge", () => {
  it("prepareFounderGovernor composes coordinated intelligence view", () => {
    const view = prepareFounderGovernor("listening-rooms");
    expect(view.architectureOnly).toBe(true);
    expect(view.attentionProtected).toBe(true);
    expect(view.primary).toBeTruthy();
  });

  it("prepareFounderGovernorPrimary returns one best recommendation", () => {
    const primary = prepareFounderGovernorPrimary("listening-rooms");
    expect(primary.primary?.reasoning.length).toBeGreaterThan(0);
    expect(primary.attentionProtected).toBe(true);
  });

  it("prepareFounderGovernorCoordination lists coordinated systems", () => {
    const coord = prepareFounderGovernorCoordination();
    expect(coord.coordinatedSystems.length).toBeGreaterThanOrEqual(12);
    expect(coord.questions.length).toBe(7);
  });
});
