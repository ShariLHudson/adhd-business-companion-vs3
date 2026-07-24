import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  __resetStrategyChamberStoresForTests,
  applyGuidedJourneyAnswer,
  buildConversationTurnView,
  createStrategyWorkItem,
  getStrategyWorkItem,
  shouldShowDecisionRecord,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";
import {
  analyzeStrategyWorkItem,
  assessDecisionReadiness,
  assessJudgmentStage,
  classifyStrategicInput,
  conversationQualityIssues,
  generateStrategicOptions,
  identifyStrategicQuestion,
  listStrategyTypes,
  optionsAreMeaningfullyDifferent,
  selectNextQuestion,
  STRATEGIC_JUDGMENT_STAGE_ORDER,
  strategyQualityIssues,
} from "@/lib/strategyChamber/intelligence";

describe("Strategy Intelligence Phase 1", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("registers eleven strategy types", () => {
    expect(listStrategyTypes()).toHaveLength(11);
  });

  it("identifies pricing from a membership price statement", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(
        item,
        "I need to decide if I should raise the price of my membership or not.",
      ),
    );
    const current = getStrategyWorkItem(item.id)!;
    const analysis = identifyStrategicQuestion(current);
    expect(analysis.strategyTypeId).toBe("pricing");
    expect(analysis.questionType).toBe("pricing_decision");
    expect(shouldShowDecisionRecord(current)).toBe(false);
    const turn = buildConversationTurnView(current);
    expect(conversationQualityIssues(turn.question)).toEqual([]);
    expect(turn.question.includes("?")).toBe(true);
  });

  it("does not treat “more customers” as a finished strategic question", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "I need more customers."),
    );
    const current = getStrategyWorkItem(item.id)!;
    const analysis = identifyStrategicQuestion(current);
    expect(analysis.needsClarification).toBe(true);
    expect(analysis.alternateQuestions.length).toBeGreaterThan(0);
    const next = selectNextQuestion(current);
    expect(next.priority).toBe(1);
  });

  it("classifies assumptions without treating them as facts", () => {
    const classified = classifyStrategicInput(
      "I think everyone will leave if I raise the price.",
    );
    expect(classified.classifications).toContain("assumption");
    expect(classified.safeToTreatAsFact).toBe(false);
  });

  it("generates at most three meaningfully different pricing options", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise the price of my membership?",
      currentReality: "Costs are up and pricing has stayed the same.",
      memberStatements: [
        "Costs are up",
        "I need more revenue",
        "I worry members will leave",
      ],
    });
    const options = generateStrategicOptions(getStrategyWorkItem(item.id)!);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(optionsAreMeaningfullyDifferent(options)).toBe(true);
    expect(strategyQualityIssues(options)).toEqual([]);
  });

  it("honors Adaptive fewer choices when selecting questions", () => {
    patchAdaptiveCompanionExplicitPrefs({
      instructionPacing: "one_at_a_time",
      choiceLoad: "one",
    });
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "I need clearer direction for Q3."),
    );
    const plan = selectNextQuestion(
      getStrategyWorkItem(item.id)!,
      resolveAdaptivePresentation(),
    );
    expect(plan.choices.length).toBeLessThanOrEqual(1);
  });

  it("analyzeStrategyWorkItem returns a pure judgment turn", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I hire a VA?",
      currentReality: "Admin work is crowding out client work.",
      memberStatements: ["Admin work is crowding out client work", "I am tired"],
    });
    const turn = analyzeStrategyWorkItem(getStrategyWorkItem(item.id)!);
    expect(turn.nextQuestion.question.length).toBeGreaterThan(0);
    expect(turn.strategicQuestion.strategyTypeId).toBe("hiring_delegation");
    expect(turn.judgmentStage).toBeTruthy();
    expect(turn.readiness).toBeTruthy();
  });

  it("uses the Strategy Domain Model judgment backbone", () => {
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER[0]).toBe("clarify_question");
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER.at(-1)).toBe("review_results");
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    expect(item.currentStage).toBe("clarify_question");
    expect(assessJudgmentStage(item)).toBe("clarify_question");
    expect(assessDecisionReadiness(item).readiness).toBe(
      "problem_not_yet_clear",
    );
  });

  it("softens after I do not know", () => {
    const item = createStrategyWorkItem({ entryReason: "unsure" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "What should I focus on?",
      currentReality: "Everything feels scattered.",
    });
    const plan = selectNextQuestion(getStrategyWorkItem(item.id)!, undefined, {
      lastAnswer: "I don't know",
    });
    expect(plan.question.toLowerCase()).toMatch(/closest|okay/);
    expect(plan.choices.length).toBeGreaterThan(0);
  });
});
