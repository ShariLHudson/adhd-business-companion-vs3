import { describe, expect, it } from "vitest";

import {
  prepareAutomation,
  prepareExecutiveInitiative,
  prepareLaunch,
  prepareMarketingCampaign,
  prepareMissionExecution,
  prepareWorkshop,
  prepareInitiativeFromDecision,
} from "./executiveOrchestratorBridge";

describe("Founder Executive Orchestrator bridge", () => {
  it("prepareExecutiveInitiative assembles full bundle", () => {
    const bundle = prepareExecutiveInitiative("init-voice-companion");
    expect(bundle?.product).toBe("founder");
    expect(bundle?.implementation?.executivePlan).toBeTruthy();
    expect(bundle?.checklist?.items.length).toBeGreaterThan(0);
    expect(bundle?.roi?.roi).toBeTruthy();
    expect(bundle?.approval?.blocked).toBe(true);
    expect(bundle?.decision?.id).toBe("ed-voice-companion");
  });

  it("prepareMissionExecution scopes by mission", () => {
    const bundle = prepareMissionExecution("listening-rooms");
    expect(bundle?.initiative.missionId).toBe("listening-rooms");
  });

  it("category bridges resolve sample initiatives", () => {
    expect(prepareWorkshop()?.initiative.category).toBe("workshop");
    expect(prepareMarketingCampaign()?.initiative.category).toBe("marketing");
    expect(prepareAutomation()?.initiative.title.toLowerCase()).toContain("onboarding");
  });

  it("prepareLaunch finds launch-related initiative or decision link", () => {
    const bundle = prepareLaunch("listening-rooms");
    expect(bundle?.initiative).toBeTruthy();
  });

  it("prepareInitiativeFromDecision links executive decision lifecycle", () => {
    const bundle = prepareInitiativeFromDecision("ed-voice-companion");
    expect(bundle?.decision?.id).toBe("ed-voice-companion");
  });
});
