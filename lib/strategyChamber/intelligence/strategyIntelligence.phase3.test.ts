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
import { decisionRecordSectionHasContent } from "@/lib/strategyChamber/decisionRecord";
import {
  analyzeStrategyWorkItem,
  buildIntelligentDecisionRecord,
  compareFullStrategicOptions,
  compareStrategicOptions,
  designDefaultExperiment,
  evaluateExperimentTriggers,
  fullOptionQualityIssues,
  generateFullStrategicOptions,
  generateStrategicOptions,
  helpMeChoose,
  normalizeOptionPattern,
  optionPatternMemberLabel,
  optionsAreMeaningfullyDifferent,
  recommendStrategicOption,
  reversibilityDepth,
  riskCopyIsCalm,
  buildStrategicRisks,
  selectNextThinkingMove,
  shouldOfferStrategicOptions,
  shouldPreferExperiment,
  strategicOptionsAreDistinct,
  strategyQualityIssues,
  validateOptionDiversity,
  STRATEGIC_JUDGMENT_STAGE_ORDER,
  DECISION_READINESS_LABEL,
  REVERSIBILITY_LABEL,
} from "@/lib/strategyChamber/intelligence";
import type { StrategicInputClassification } from "@/lib/strategyChamber/domainModel";

function seedReadyForOptions(
  decisionStatement: string,
  extras?: Record<string, unknown>,
) {
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

  it("never exposes technical pattern ids as member-facing labels", () => {
    expect(optionPatternMemberLabel("protect_current_base")).not.toMatch(/_/);
    expect(optionPatternMemberLabel("increase_price")).not.toBe("increase_price");
    expect(normalizeOptionPattern("raise_price")).toBe("increase_price");
    expect(normalizeOptionPattern("protect_base")).toBe("protect_current_base");
  });

  it("builds StrategicOption contract with trade-offs, risk, and reversibility", () => {
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const full = generateFullStrategicOptions(item);
    expect(full.length).toBeGreaterThan(0);
    expect(full.length).toBeLessThanOrEqual(3);
    for (const o of full) {
      expect(o.name).toBeTruthy();
      expect(o.summary).toBeTruthy();
      expect(o.optionPattern).toBeTruthy();
      expect(o.benefits.length).toBeGreaterThan(0);
      expect(o.tradeoffs.length).toBeGreaterThan(0);
      expect(o.risksDetailed.length).toBeGreaterThan(0);
      expect(o.risksDetailed[0]!.warningSigns?.length ?? 0).toBeGreaterThan(0);
      expect(o.risksDetailed[0]!.mitigations?.length ?? 0).toBeGreaterThan(0);
      expect(o.reversibility).toBeTruthy();
      expect(o.capacityRequirements.length).toBeGreaterThan(0);
      expect(o.opportunityCosts.length).toBeGreaterThan(0);
      expect(o.smallestUsefulTest || o.experiment?.smallAction).toBeTruthy();
    }
    expect(fullOptionQualityIssues(full)).toEqual([]);
  });

  it("withholds options before readiness — even if user asks what to do", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "What should I do?",
      memberStatements: ["What should I do?"],
    });
    expect(shouldOfferStrategicOptions(getStrategyWorkItem(item.id)!)).toBe(
      false,
    );
    expect(generateStrategicOptions(getStrategyWorkItem(item.id)!)).toEqual([]);
  });

  it("generates at most three meaningfully different options", () => {
    const item = seedReadyForOptions(
      "I need clearer business direction for the next season.",
    );
    const full = generateFullStrategicOptions(item);
    const enriched = generateStrategicOptions(item);
    expect(full.length).toBeLessThanOrEqual(3);
    expect(strategicOptionsAreDistinct(full)).toBe(true);
    expect(optionsAreMeaningfullyDifferent(enriched)).toBe(true);
    expect(
      strategyQualityIssues(enriched).filter((i) => i === "options_too_similar"),
    ).toEqual([]);
    const diversity = validateOptionDiversity(full);
    expect(diversity.kept.length).toBeGreaterThan(0);
    expect(diversity.kept.length).toBeLessThanOrEqual(3);
  });

  it("rejects cosmetic price-percentage diversity", () => {
    const item = seedReadyForOptions("Should I raise the price?");
    const base = generateFullStrategicOptions(item)[0]!;
    const fake = [
      {
        ...base,
        id: "a",
        title: "Raise the price by 10%",
        summary: "Raise the price by 10%",
        optionPattern: "increase_price" as const,
        patternId: "increase_price" as const,
      },
      {
        ...base,
        id: "b",
        title: "Raise the price by 15%",
        summary: "Raise the price by 15%",
        optionPattern: "expand" as const,
        patternId: "expand" as const,
      },
      {
        ...base,
        id: "c",
        title: "Raise the price by 20%",
        summary: "Raise the price by 20%",
        optionPattern: "restructure_price" as const,
        patternId: "restructure_price" as const,
      },
    ];
    const result = validateOptionDiversity(fake);
    expect(
      result.issues.some(
        (i) => i.code === "cosmetic_variant" || i.code === "not_materially_different",
      ),
    ).toBe(true);
    expect(result.kept.length).toBeLessThan(3);
  });

  it("pricing scenario — protect base, restructure/value, or test", () => {
    const item = seedReadyForOptions(
      "I’m considering raising the price of my membership.",
    );
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(patterns.every((p) => p === "increase_price")).toBe(false);
    expect(
      patterns.some((p) =>
        [
          "protect_current_base",
          "restructure_price",
          "test",
          "add_value",
          "increase_price",
        ].includes(p),
      ),
    ).toBe(true);
    const rec = recommendStrategicOption(item);
    expect(rec?.isDecision).toBe(false);
    expect(item.chosenDirection).toBeFalsy();
  });

  it("more customers — does not produce three marketing tactics as strategy", () => {
    const early = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(early.id, {
      decisionStatement: "I need more customers.",
    });
    expect(shouldOfferStrategicOptions(getStrategyWorkItem(early.id)!)).toBe(
      false,
    );

    const item = seedReadyForOptions("I need more customers.", {
      constraints: ["I am already at capacity"],
      currentReality: "Delivery is strained.",
    });
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(patterns.every((p) => p === "expand")).toBe(false);
  });

  it("too many ideas — capacity and preserve paths matter", () => {
    const item = seedReadyForOptions("I have ten things I want to build.");
    const full = generateFullStrategicOptions(item);
    expect(
      full.some((o) =>
        ["narrow", "test", "stabilize", "simplify", "maintain_current_direction"].includes(
          o.optionPattern,
        ),
      ),
    ).toBe(true);
    expect(full.some((o) => o.opportunityCosts.length > 0)).toBe(true);
  });

  it("hiring — trial / simplify / automate before assuming hire", () => {
    const item = seedReadyForOptions("Should I hire a virtual assistant?");
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(
      patterns.some((p) =>
        ["delegate", "automate", "simplify", "test", "delay"].includes(p),
      ),
    ).toBe(true);
  });

  it("partnership — pilot / delay / decline-style paths", () => {
    const item = seedReadyForOptions("Someone wants to collaborate with me.");
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(
      patterns.some((p) => ["test", "delay", "partner", "pause"].includes(p)),
    ).toBe(true);
  });

  it("pivot — full restart is not the default", () => {
    const item = seedReadyForOptions("What I’m doing isn’t working.");
    const patterns = generateFullStrategicOptions(item).map((o) => o.optionPattern);
    expect(patterns.includes("expand")).toBe(false);
    expect(
      patterns.some((p) =>
        ["improve", "narrow", "reposition", "pause", "stop", "test"].includes(p),
      ),
    ).toBe(true);
  });

  it("easy experiment — weekly email gets a bounded test without a project", () => {
    const item = seedReadyForOptions("I’m thinking about trying a weekly email.");
    const exp = designDefaultExperiment(item);
    expect(exp?.duration).toBeTruthy();
    expect(exp?.successSignal || exp?.successSignals?.length).toBeTruthy();
    expect(exp?.stopSignal || exp?.stopSignals?.length).toBeTruthy();
    expect(exp?.recommendedDestination).toBeFalsy();
    expect(evaluateExperimentTriggers(item).prefer).toBe(true);
  });

  it("difficult close — deeper reversibility, no rushed casual experiment", () => {
    const item = seedReadyForOptions("I’m thinking about closing the business.");
    const depth = reversibilityDepth("difficult_to_reverse");
    expect(depth.exploreMultipleOptions).toBe(true);
    expect(depth.confirmReadinessCarefully).toBe(true);
    expect(evaluateExperimentTriggers(item).skipReason).toBeTruthy();
  });

  it("trade-offs use only material dimensions", () => {
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const full = generateFullStrategicOptions(item);
    const comparison = compareFullStrategicOptions(full);
    expect(comparison.dimensions.length).toBeGreaterThan(0);
    expect(comparison.dimensions.length).toBeLessThanOrEqual(3);
    expect(comparison.cards[0]?.primaryBenefit).toBeTruthy();
    expect(comparison.cards[0]?.primaryTradeoff).toBeTruthy();
  });

  it("risk is proportionate and calm", () => {
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const risks = buildStrategicRisks(item);
    expect(risks.length).toBeLessThanOrEqual(2);
    for (const r of risks) {
      expect(riskCopyIsCalm(r.description)).toBe(true);
      expect(r.warningSigns.length).toBeGreaterThan(0);
      expect(r.mitigations.length).toBeGreaterThan(0);
      expect(REVERSIBILITY_LABEL[r.reversibility]).toBeTruthy();
    }
  });

  it("easily reversible gets lighter depth; difficult gets deeper", () => {
    expect(reversibilityDepth("easily_reversible").avoidOveranalysis).toBe(true);
    expect(reversibilityDepth("difficult_to_reverse").identifySecondOrder).toBe(
      true,
    );
  });

  it("Adaptive Companion changes comparison format only", () => {
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
    expect(comparison.mode).toBe("one_criterion");
    patchAdaptiveCompanionExplicitPrefs({ comparisonStyle: "side_by_side" });
    const side = compareStrategicOptions(
      generateStrategicOptions(item, resolveAdaptivePresentation()),
      resolveAdaptivePresentation(),
    );
    expect(["side_by_side", "leading_plus_alternatives", "one_at_a_time"]).toContain(
      side.mode,
    );
    const move = selectNextThinkingMove(item, presentation);
    expect(move.move).toBeTruthy();
  });

  it("recommendation is distinct from decision; help-me-choose preserves agency", () => {
    const item = seedReadyForOptions(
      "Should I raise the price of my membership?",
    );
    const rec = recommendStrategicOption(item);
    expect(rec).toBeTruthy();
    expect(rec!.isDecision).toBe(false);
    expect(rec!.memberCopy).toMatch(/recommendation|you still choose/i);
    const help = helpMeChoose(item);
    expect(help?.isDecision).toBe(false);
    expect(getStrategyWorkItem(item.id)!.chosenDirection).toBeFalsy();
  });

  it("Decision Record summarizes options without treating recommendation as chosen", () => {
    const item = seedReadyForOptions(
      "Should I hire a VA to reclaim focus?",
    );
    updateStrategyWorkItem(item.id, { optionsOffered: true });
    const record = buildIntelligentDecisionRecord(getStrategyWorkItem(item.id)!);
    expect(record.directionYouChose).toBeFalsy();
    if (record.companionRecommendation) {
      expect(record.companionRecommendation).not.toBe(record.directionYouChose);
    }
    if (record.optionsConsideredSummary) {
      expect(record.optionsConsideredSummary.length).toBeLessThanOrEqual(3);
    }
    expect(
      decisionRecordSectionHasContent("whatYouWereDeciding", record),
    ).toBe(true);
  });

  it("analyzeStrategyWorkItem exposes recommendation and reversibility depth", () => {
    const item = seedReadyForOptions("Should I hire a VA to reclaim focus?");
    updateStrategyWorkItem(item.id, { optionsOffered: true });
    const turn = analyzeStrategyWorkItem(getStrategyWorkItem(item.id)!);
    expect(turn.fullOptions?.length).toBeLessThanOrEqual(3);
    if (turn.recommendation) {
      expect(turn.recommendation.isDecision).toBe(false);
    }
    expect(turn.reversibilityDepth?.level).toBeTruthy();
  });

  it("simplify, wait, stop, and maintain-current-direction can appear", () => {
    const waitItem = seedReadyForOptions(
      "I am not sure yet — maybe I should wait before changing anything.",
    );
    expect(
      generateFullStrategicOptions(waitItem).some((o) =>
        ["delay", "pause", "test", "simplify", "continue", "maintain_current_direction"].includes(
          o.optionPattern,
        ),
      ),
    ).toBe(true);

    const stopItem = seedReadyForOptions(
      "I may need to stop this path and sunset the offer.",
    );
    expect(
      generateFullStrategicOptions(stopItem).map((o) => o.optionPattern),
    ).toContain("stop");
  });

  it("prefers experiment when useful; shouldPreferExperiment for hard commits", () => {
    expect(
      shouldPreferExperiment({
        ...seedReadyForOptions("Should I permanently rebrand and announce publicly?"),
        chosenDirection: "Permanent public rebrand for everyone",
      }),
    ).toBe(true);
  });
});
