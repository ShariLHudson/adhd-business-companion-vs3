import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStrategyChamberStoresForTests,
  applyStrategyContributionReturn,
  assumptionsAreNotFacts,
  canCaptureStrategicDecisionMemory,
  captureStrategicDecisionMemory,
  confirmStrategyDecisionRecord,
  createStrategyWorkItem,
  getContinuityBriefForWorkItem,
  getStrategicDecisionMemoryByWorkItem,
  getStrategyWorkItem,
  listDecisionJourneysForResume,
  recordStrategicOutcome,
  resumeDecisionJourney,
  reviseStrategicDecision,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";

function seedConfirmedDecision() {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement: "Should I raise the membership price for new members?",
    currentReality: "Delivery load is high and the fee is unchanged.",
    desiredDirection: "A sustainable price with clear boundaries.",
    constraints: ["Protect current members"],
    assumptions: ["Some people may leave if I raise the price"],
    knownFacts: ["Delivery takes more time than two years ago"],
    unknowns: ["Whether new members will accept a higher price"],
    tradeoffs: ["Revenue per member versus conversion"],
    risks: ["Changing price without enough evidence"],
    optionsConsidered: [
      {
        id: "opt_raise",
        title: "Raise price for new members only",
        whyItMayFit: "Protects current members",
      },
      {
        id: "opt_scope",
        title: "Keep price and reduce scope",
      },
    ],
    chosenDirection: "Raise price for new members only",
    decisionRationale: "Gives evidence without disrupting current members.",
    notChosen: ["Raise price for everyone immediately"],
    experiments: ["Test the new price with five prospects"],
    successSignals: ["New members still convert"],
    reviewDate: "2026-08-23",
    confidenceLevel: "medium",
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 6 — Strategic Memory", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
  });

  it("does not capture before Decision Record confirmation", () => {
    const item = seedConfirmedDecision();
    expect(canCaptureStrategicDecisionMemory(item)).toBe(false);
    expect(captureStrategicDecisionMemory(item.id)).toBeNull();
  });

  it("captures reasoning snapshot on confirmation without duplicating Work Item", () => {
    const item = seedConfirmedDecision();
    const result = confirmStrategyDecisionRecord(item.id);
    expect(result?.memory).toBeTruthy();
    expect(result?.memory?.strategyWorkItemId).toBe(item.id);
    expect(result?.memory?.strategicQuestion).toMatch(/raise the membership price/i);
    expect(result?.memory?.chosenDirection?.direction).toMatch(/new members/i);
    expect(result?.memory?.chosenDirection?.userConfirmed).toBe(true);
    expect(result?.memory?.assumptionsAtDecisionTime[0]?.truthStatus).toBe(
      "assumed",
    );
    if (result?.memory?.recommendationAtDecisionTime) {
      expect(result.memory.recommendationAtDecisionTime.isDecision).toBe(false);
    }
    expect(assumptionsAreNotFacts(result!.memory!)).toBe(true);
    // One memory per work item — not a second work item
    expect(getStrategicDecisionMemoryByWorkItem(item.id)?.id).toBe(
      result?.memory?.id,
    );
  });

  it("records outcomes without overwriting the decision", () => {
    const item = seedConfirmedDecision();
    confirmStrategyDecisionRecord(item.id);
    const memory = recordStrategicOutcome({
      strategyWorkItemId: item.id,
      whatHappened: "Three of five prospects accepted the new price.",
      truthStatus: "reported",
    });
    expect(memory?.outcomes).toHaveLength(1);
    expect(memory?.chosenDirection?.direction).toMatch(/new members/i);
    const work = getStrategyWorkItem(item.id)!;
    expect(work.chosenDirection).toMatch(/new members/i);
  });

  it("contribution return attaches outcome when memory exists", () => {
    const item = seedConfirmedDecision();
    confirmStrategyDecisionRecord(item.id);
    applyStrategyContributionReturn({
      strategyWorkItemId: item.id,
      from: "project",
      conciseContribution: "Pilot pages shipped for the new price test.",
      sourceId: "proj_test_1",
    });
    const memory = getStrategicDecisionMemoryByWorkItem(item.id);
    expect(memory?.outcomes.some((o) => /Pilot pages/i.test(o.whatHappened))).toBe(
      true,
    );
  });

  it("revision keeps prior direction in history", () => {
    const item = seedConfirmedDecision();
    confirmStrategyDecisionRecord(item.id);
    const revised = reviseStrategicDecision({
      strategyWorkItemId: item.id,
      newDirection: "Keep price and reduce scope instead",
      reason: "Conversion felt softer than expected.",
    });
    expect(revised?.revisions).toHaveLength(1);
    expect(revised?.revisions[0]?.previousDirection).toMatch(/new members/i);
    expect(revised?.chosenDirection?.direction).toMatch(/reduce scope/i);
  });

  it("continuity brief helps resume without treating memory as permanent fact", () => {
    const item = seedConfirmedDecision();
    confirmStrategyDecisionRecord(item.id);
    recordStrategicOutcome({
      strategyWorkItemId: item.id,
      whatHappened: "Early conversion looks steady.",
    });
    const brief = getContinuityBriefForWorkItem(item.id);
    expect(brief?.memberFacingResume).toMatch(/You were deciding/i);
    expect(brief?.epistemicCaution).toMatch(/may have changed/i);
    expect(brief?.openAssumptions[0]).toMatch(/leave/i);
    const journeys = listDecisionJourneysForResume();
    expect(journeys.length).toBeGreaterThan(0);
    const resumed = resumeDecisionJourney(brief!.memoryId);
    expect(resumed?.workItemId).toBe(item.id);
  });

  it("unknowns remain unknown — not promoted to evidence", () => {
    const item = seedConfirmedDecision();
    const memory = confirmStrategyDecisionRecord(item.id)?.memory;
    expect(memory?.unknownsAtDecisionTime[0]?.truthStatus).toBe("unknown");
    expect(memory?.knownContextAtDecisionTime.every((e) => e.truthStatus !== "assumed")).toBe(
      true,
    );
  });
});
