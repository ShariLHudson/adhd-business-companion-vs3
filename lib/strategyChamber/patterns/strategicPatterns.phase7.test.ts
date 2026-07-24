import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStrategyChamberStoresForTests,
  acceptStrategicPattern,
  confirmStrategyDecisionRecord,
  createStrategyWorkItem,
  detectStrategicPatterns,
  dismissStrategicPattern,
  getStrategyWorkItem,
  listAcceptedPatternsForFutureReasoning,
  listReliableDecisionMemories,
  listStrategicPatterns,
  patternPresentationIsSafe,
  presentStrategicPattern,
  recordStrategicOutcome,
  reviseStrategicDecision,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";

function seedConfirmed(input: {
  statement: string;
  assumption: string;
  constraint: string;
  direction: string;
  withExperiment?: boolean;
}) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement: input.statement,
    currentReality: "Context for a strategic choice.",
    desiredDirection: "A clearer path.",
    assumptions: [input.assumption],
    constraints: [input.constraint],
    knownFacts: ["Delivery takes real time"],
    chosenDirection: input.direction,
    decisionRationale: "Chosen after exploring options.",
    experiments: input.withExperiment
      ? ["Test with five prospects for 30 days"]
      : [],
    confidenceLevel: "medium",
  });
  confirmStrategyDecisionRecord(item.id);
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 7 — Strategic Pattern Recognition", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
  });

  it("does not detect patterns from fewer than two reliable memories", () => {
    seedConfirmed({
      statement: "Should I raise prices?",
      assumption: "Customers will leave if I raise the price",
      constraint: "Protect current members",
      direction: "Raise for new members only",
    });
    expect(listReliableDecisionMemories()).toHaveLength(1);
    expect(detectStrategicPatterns()).toHaveLength(0);
  });

  it("detects a recurring assumption across several confirmed decisions", () => {
    const assumption = "Customers will leave if I raise the price";
    seedConfirmed({
      statement: "Raise membership price?",
      assumption,
      constraint: "Protect current members",
      direction: "Raise for new members only",
    });
    seedConfirmed({
      statement: "Raise workshop price?",
      assumption,
      constraint: "Protect current members",
      direction: "Keep price and add clearer boundaries",
    });
    seedConfirmed({
      statement: "Raise coaching package?",
      assumption,
      constraint: "Limited weekly capacity",
      direction: "Test a higher price with new clients",
      withExperiment: true,
    });

    const patterns = detectStrategicPatterns();
    const recurring = patterns.find((p) => p.category === "recurring_assumption");
    expect(recurring).toBeTruthy();
    expect(recurring!.supportingDecisionCount).toBeGreaterThanOrEqual(3);
    expect(recurring!.status).toBe("ready_for_review");
    expect(recurring!.useInFutureReasoning).toBe(false);
    expect(recurring!.evidenceReferences.every((e) => e.decisionMemoryId)).toBe(
      true,
    );
    expect(recurring!.tentativeObservation).toMatch(/worth noticing/i);
    expect(recurring!.tentativeObservation).not.toMatch(/this is who you are/i);
  });

  it("excludes unconfirmed work items from reliable evidence", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I hire?",
      assumptions: ["I need a hire to grow"],
      chosenDirection: "Hire a VA",
      // no decisionRecordConfirmed
    });
    seedConfirmed({
      statement: "A",
      assumption: "Customers will leave if I raise the price",
      constraint: "Time is limited",
      direction: "Path A",
    });
    seedConfirmed({
      statement: "B",
      assumption: "Customers will leave if I raise the price",
      constraint: "Time is limited",
      direction: "Path B",
    });
    expect(listReliableDecisionMemories()).toHaveLength(2);
  });

  it("accept requires explicit opt-in for future reasoning", () => {
    seedConfirmed({
      statement: "1",
      assumption: "Customers will leave if I raise the price",
      constraint: "Protect trust",
      direction: "A",
    });
    seedConfirmed({
      statement: "2",
      assumption: "Customers will leave if I raise the price",
      constraint: "Protect trust",
      direction: "B",
    });
    seedConfirmed({
      statement: "3",
      assumption: "Customers will leave if I raise the price",
      constraint: "Protect trust",
      direction: "C",
    });
    const pattern = detectStrategicPatterns().find(
      (p) => p.category === "recurring_assumption",
    )!;
    const accepted = acceptStrategicPattern({
      patternId: pattern.id,
      useInFutureReasoning: false,
    });
    expect(accepted?.status).toBe("accepted");
    expect(accepted?.useInFutureReasoning).toBe(false);
    expect(listAcceptedPatternsForFutureReasoning()).toHaveLength(0);

    const optedIn = acceptStrategicPattern({
      patternId: pattern.id,
      useInFutureReasoning: true,
    });
    expect(optedIn?.useInFutureReasoning).toBe(true);
    expect(listAcceptedPatternsForFutureReasoning()).toHaveLength(1);
  });

  it("dismissed patterns are not revived by re-detection", () => {
    const assumption = "Customers will leave if I raise the price";
    for (let i = 0; i < 3; i++) {
      seedConfirmed({
        statement: `Decision ${i}`,
        assumption,
        constraint: "Protect trust",
        direction: `Path ${i}`,
      });
    }
    const pattern = detectStrategicPatterns().find(
      (p) => p.category === "recurring_assumption",
    )!;
    dismissStrategicPattern({ patternId: pattern.id });
    detectStrategicPatterns();
    const again = listStrategicPatterns().find((p) => p.id === pattern.id);
    expect(again?.status).toBe("dismissed");
    expect(again?.useInFutureReasoning).toBe(false);
  });

  it("presentation stays tentative and safe", () => {
    seedConfirmed({
      statement: "1",
      assumption: "Customers will leave if I raise the price",
      constraint: "Capacity is tight",
      direction: "A",
    });
    seedConfirmed({
      statement: "2",
      assumption: "Customers will leave if I raise the price",
      constraint: "Capacity is tight",
      direction: "B",
    });
    const pattern = detectStrategicPatterns()[0]!;
    const presentation = presentStrategicPattern(pattern);
    expect(presentation.headline).toMatch(/worth noticing/i);
    expect(patternPresentationIsSafe(presentation)).toBe(true);
    expect(presentation.caution).toMatch(/not a label/i);
  });

  it("detects revision and experiment follow-through patterns", () => {
    const a = seedConfirmed({
      statement: "Price path",
      assumption: "Need evidence first",
      constraint: "Protect members",
      direction: "Raise for new members",
      withExperiment: true,
    });
    recordStrategicOutcome({
      strategyWorkItemId: a.id,
      whatHappened: "Three of five prospects accepted.",
    });
    reviseStrategicDecision({
      strategyWorkItemId: a.id,
      newDirection: "Keep price and tighten scope",
      reason: "Conversion felt softer than hoped.",
    });

    const b = seedConfirmed({
      statement: "Offer path",
      assumption: "Need evidence first",
      constraint: "Protect members",
      direction: "Launch a premium tier",
      withExperiment: true,
    });
    recordStrategicOutcome({
      strategyWorkItemId: b.id,
      whatHappened: "Interest was clearer after the test.",
    });
    reviseStrategicDecision({
      strategyWorkItemId: b.id,
      newDirection: "Pause the premium tier",
      reason: "Capacity could not support it yet.",
    });

    const patterns = detectStrategicPatterns();
    expect(patterns.some((p) => p.category === "decision_revision")).toBe(true);
    expect(patterns.some((p) => p.category === "experiment_effectiveness")).toBe(
      true,
    );
  });

  it("patterns reference memory ids — they do not embed full decision blobs", () => {
    seedConfirmed({
      statement: "1",
      assumption: "Customers will leave if I raise the price",
      constraint: "X",
      direction: "A",
    });
    seedConfirmed({
      statement: "2",
      assumption: "Customers will leave if I raise the price",
      constraint: "X",
      direction: "B",
    });
    const pattern = detectStrategicPatterns().find(
      (p) => p.category === "recurring_assumption",
    )!;
    const serialized = JSON.stringify(pattern);
    expect(serialized).not.toMatch(/memberStatements/);
    expect(pattern.evidenceReferences[0]?.decisionMemoryId).toMatch(/^sdm_/);
  });
});
