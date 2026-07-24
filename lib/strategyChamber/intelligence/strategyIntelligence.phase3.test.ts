import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  __resetStrategyChamberStoresForTests,
  createStrategyWorkItem,
  getStrategyWorkItem,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";
import {
  analyzeStrategyWorkItem,
  compareFullStrategicOptions,
  compareStrategicOptions,
  fullOptionQualityIssues,
  generateFullStrategicOptions,
  generateStrategicOptions,
  optionsAreMeaningfullyDifferent,
  selectNextThinkingMove,
  shouldOfferStrategicOptions,
  shouldPreferExperiment,
  strategicOptionsAreDistinct,
  strategyQualityIssues,
  STRATEGIC_JUDGMENT_STAGE_ORDER,
  DECISION_READINESS_LABEL,
  REVERSIBILITY_LABEL,
} from "@/lib/strategyChamber/intelligence";
import type { StrategicInputClassification } from "@/lib/strategyChamber/domainModel";

function seedReadyForOptions(decisionStatement: string, extras?: Record<string, unknown>) {
  const item = createStrategyWorkItem({ entryReason: "important_decision" });
  updateStrategyWorkItem(item.id, {
    decisionStatement,
    currentReality: "Current delivery is holding, but the decision feels timely.",
    desiredDirection: "A clearer next season without burning out.",
    constraints: ["Limited weekly capacity", "Need to protect current clients"],
    assumptions: ["A small test can teach more than a full commit"],
    knownFacts: ["Costs and workload have both risen"],
    memberStatements: [
      decisionStatement,
      "I need to protect capacity",
      "I am not sure which path is right",
    ],
    ...extras,
  });
  return getStrategyWorkItem(item.id)!;
}

describe("Strategy Intelligence Phase 3", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("preserves Phase 2 domain vocabulary", () => {
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER).toContain("explore_options");
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER).toContain("evaluate_tradeoffs");
    expect(REVERSIBILITY_LABEL.easily_reversible).toBeTruthy();
    expect(DECISION_READINESS_LABEL.ready_for_decision).toBeTruthy();
    const roles: StrategicInputClassification[] = ["option", "risk", "assumption"];
    expect(roles).toHaveLength(3);
  });

  it("builds a StrategicOption contract with trade-offs, risk, and reversibility", () => {
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const full = generateFullStrategicOptions(item);
    expect(full.length).toBeGreaterThan(0);
    expect(full.length).toBeLessThanOrEqual(3);
    for (const o of full) {
      expect(o.name).toBeTruthy();
      expect(o.summary).toBeTruthy();
      expect(o.rationale).toBeTruthy();
      expect(o.optionPattern).toBeTruthy();
      expect(o.benefits.length).toBeGreaterThan(0);
      expect(o.tradeoffs.length).toBeGreaterThan(0);
      expect(o.risksDetailed.length).toBeGreaterThan(0);
      expect(o.reversibility).toBeTruthy();
      expect(o.capacityRequirements.length).toBeGreaterThan(0);
      expect(o.opportunityCosts.length).toBeGreaterThan(0);
      expect(o.confidence).toMatch(/low|moderate|high/);
      expect(o.smallestUsefulTest || o.experiment?.smallAction).toBeTruthy();
    }
    expect(fullOptionQualityIssues(full)).toEqual([]);
  });

  it("keeps options meaningfully different by pattern and axis", () => {
    const item = seedReadyForOptions(
      "I need clearer business direction for the next season.",
    );
    const full = generateFullStrategicOptions(item);
    const enriched = generateStrategicOptions(item);
    expect(strategicOptionsAreDistinct(full)).toBe(true);
    expect(optionsAreMeaningfullyDifferent(enriched)).toBe(true);
    expect(strategyQualityIssues(enriched).filter((i) => i === "options_too_similar")).toEqual(
      [],
    );
  });

  it("does not make growth the only default path", () => {
    const item = seedReadyForOptions("I want more customers for my offer.");
    const full = generateFullStrategicOptions(item);
    const patterns = full.map((o) => o.optionPattern);
    expect(patterns.every((p) => p === "expand")).toBe(false);
    expect(
      patterns.some((p) =>
        ["stabilize", "narrow", "test", "simplify", "protect_base"].includes(p),
      ),
    ).toBe(true);
  });

  it("treats waiting, simplifying, stopping, and continuing as valid paths", () => {
    const waitItem = seedReadyForOptions(
      "I am not sure yet — maybe I should wait before changing anything.",
    );
    const waitPatterns = generateFullStrategicOptions(waitItem).map(
      (o) => o.optionPattern,
    );
    expect(
      waitPatterns.some((p) => ["delay", "test", "simplify", "continue"].includes(p)),
    ).toBe(true);

    const stopItem = seedReadyForOptions(
      "I may need to stop this path and sunset the offer.",
    );
    const stopPatterns = generateFullStrategicOptions(stopItem).map(
      (o) => o.optionPattern,
    );
    expect(stopPatterns).toContain("stop");
  });

  it("prefers stabilize or test when capacity is tight", () => {
    const item = seedReadyForOptions("Should I grow right now?", {
      constraints: ["I am already overwhelmed and at capacity"],
      currentReality: "Delivery is strained and I am tired.",
    });
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(
      patterns.some((p) => ["stabilize", "test", "simplify", "protect_base"].includes(p)),
    ).toBe(true);
  });

  it("compares options with trade-offs, opportunity costs, and reversibility", () => {
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const full = generateFullStrategicOptions(item);
    const comparison = compareFullStrategicOptions(full);
    expect(comparison.lines.length).toBeGreaterThan(0);
    expect(comparison.lines.length).toBeLessThanOrEqual(3);
    expect(comparison.opportunityCostLines.length).toBeGreaterThan(0);
    expect(comparison.reversibilityLines.length).toBeGreaterThan(0);
    expect(comparison.distinctnessNote.length).toBeGreaterThan(10);
  });

  it("Adaptive Companion changes comparison presentation only", () => {
    patchAdaptiveCompanionExplicitPrefs({
      comparisonStyle: "one_criterion",
      choiceLoad: "one",
    });
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const presentation = resolveAdaptivePresentation();
    const options = generateStrategicOptions(item, presentation);
    expect(options.length).toBeLessThanOrEqual(1);
    const comparison = compareStrategicOptions(options, presentation);
    expect(comparison.style).toBe("one_criterion");
    const move = selectNextThinkingMove(item, presentation);
    expect(move.move).toBeTruthy();
  });

  it("recommends a small experiment when commitment is hard to reverse", () => {
    expect(
      shouldPreferExperiment({
        ...seedReadyForOptions("Should I permanently rebrand and announce publicly?"),
        chosenDirection: "Permanent public rebrand for everyone",
      }),
    ).toBe(true);
  });

  it("analyzeStrategyWorkItem exposes fullOptions and optionComparison", () => {
    const item = seedReadyForOptions(
      "Should I hire a VA to reclaim focus?",
    );
    // Push readiness far enough that options can appear
    updateStrategyWorkItem(item.id, {
      optionsOffered: true,
      optionsConsidered: undefined,
      knownFacts: ["Admin work crowds out client work"],
      assumptions: ["A VA could own inbox triage"],
      constraints: ["Limited budget for help"],
      desiredDirection: "Protect client work without burning out",
    });
    const ready = getStrategyWorkItem(item.id)!;
    const turn = analyzeStrategyWorkItem(ready);
    expect(turn.fullOptions?.length).toBeGreaterThan(0);
    expect(turn.fullOptions!.length).toBeLessThanOrEqual(3);
    if (turn.showOptions || turn.nextMove?.move === "generate_options") {
      expect(turn.optionComparison?.lines.length).toBeGreaterThan(0);
    }
    for (const o of turn.fullOptions!) {
      expect(o.protectsList?.length || o.protects).toBeTruthy();
      expect(o.delaysOrPrevents?.length).toBeGreaterThan(0);
    }
  });

  it("still withholds options when Phase 2 readiness says too early", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Something about pricing feels off.",
    });
    expect(shouldOfferStrategicOptions(getStrategyWorkItem(item.id)!)).toBe(
      false,
    );
  });

  it("hiring options include partner/test paths not only expand/hire", () => {
    const item = seedReadyForOptions("Should I hire an assistant?");
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(
      patterns.some((p) => ["test", "partner", "delay", "simplify", "stabilize"].includes(p)),
    ).toBe(true);
  });
});
