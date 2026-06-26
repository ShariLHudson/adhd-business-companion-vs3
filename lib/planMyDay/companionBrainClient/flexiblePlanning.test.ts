import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";
import { NORMAL_TUESDAY } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/simulations";
import { gatherFlexiblePlanningContext } from "@/lib/planMyDay/companionBrainClient/flexiblePlanning";
import {
  markPlanDayFlexible,
  markPlanDayLiving,
  markPlanDayOrienting,
  readPlanDaySession,
  resetPlanDaySessionForTests,
} from "@/lib/planMyDay/companionBrainClient/planDaySession";
import { proposalPreviewLabels } from "@/lib/planMyDay/companionBrainClient/presentJudgment";

describe("planDaySession flexible phase", () => {
  beforeEach(() => resetPlanDaySessionForTests());
  afterEach(() => resetPlanDaySessionForTests());

  it("enters flexible planning without marking living", () => {
    markPlanDayFlexible("2026-06-25");
    const session = readPlanDaySession("2026-06-25");
    expect(session.phase).toBe("flexible");
    expect(session.livingEntry).toBeUndefined();
  });

  it("records how the user entered the living board", () => {
    markPlanDayLiving("2026-06-25", "flexible-build");
    const session = readPlanDaySession("2026-06-25");
    expect(session.phase).toBe("living");
    expect(session.livingEntry).toBe("flexible-build");
  });

  it("can return to gateway orientation", () => {
    markPlanDayFlexible("2026-06-25");
    markPlanDayOrienting("2026-06-25");
    expect(readPlanDaySession("2026-06-25").phase).toBe("orienting");
  });
});

describe("gatherFlexiblePlanningContext", () => {
  it("includes companion suggestions without materializing items", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const labels = proposalPreviewLabels(judgment);
    const context = gatherFlexiblePlanningContext([], judgment);
    expect(context.suggestionCount).toBe(labels.length);
    expect(context.suggestionLabels).toEqual(labels);
  });
});
