import { describe, expect, it } from "vitest";

import {
  prepareAutomationDecision,
  prepareExecutiveDecision,
  prepareMarketingDecision,
  prepareMissionDecision,
  prepareProductDecision,
  prepareWorkshopDecision,
} from "./executiveDecisionBridge";

describe("Founder Executive Decision bridge", () => {
  it("prepareExecutiveDecision assembles full lifecycle bundle", () => {
    const bundle = prepareExecutiveDecision("ed-voice-companion");
    expect(bundle?.product).toBe("founder");
    expect(bundle?.comparison?.options.length).toBe(3);
    expect(bundle?.recommendation?.recommendedOptionId).toBe("opt-voice-limited");
    expect(bundle?.blocked).toBe(true);
    expect(bundle?.controlPrinciples.length).toBeGreaterThan(0);
  });

  it("prepareMissionDecision scopes by mission", () => {
    const bundle = prepareMissionDecision("listening-rooms");
    expect(bundle?.decision.missionId).toBe("listening-rooms");
  });

  it("category bridges return relevant decisions", () => {
    expect(prepareProductDecision("listening-rooms")?.decision.category).toBe("product");
    expect(prepareWorkshopDecision()?.decision.category).toBe("workshop");
    expect(prepareMarketingDecision()?.decision.category).toBe("launch");
    expect(prepareAutomationDecision()?.decision.category).toBe("automation");
  });
});
