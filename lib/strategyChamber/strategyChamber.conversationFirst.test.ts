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
  buildQuestionChoices,
  buildStrategyDecisionRecord,
  buildThinkingSummary,
  createStrategyWorkItem,
  decisionRecordSectionHasContent,
  getStrategyWorkItem,
  shouldOfferEmergingOptions,
  shouldShowContinueJourney,
  shouldShowDecisionRecord,
  suggestEmergingOptions,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";

describe("Strategy Chamber conversation-first guidance", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("keeps the Decision Record hidden after the opening statement", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(
        item,
        "I need to decide if I should raise the price of my membership.",
      ),
    );
    const current = getStrategyWorkItem(item.id)!;
    expect(current.decisionStatement).toMatch(/raise the price/i);
    expect(current.currentReality).toBeFalsy();
    expect(shouldShowDecisionRecord(current)).toBe(false);
    const turn = buildConversationTurnView(current);
    expect(turn.showDecisionRecord).toBe(false);
    expect(turn.question.split("?").length).toBeLessThanOrEqual(2);
  });

  it("does not repeat the opening statement as current situation", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Should I raise my membership price?"),
    );
    const current = getStrategyWorkItem(item.id)!;
    const record = buildStrategyDecisionRecord(current);
    expect(record.whatYouWereDeciding).toMatch(/membership price/i);
    expect(record.whatIsHappeningNow).toBe("");
    expect(
      decisionRecordSectionHasContent("whatIsHappeningNow", record),
    ).toBe(false);
  });

  it("organizes a follow-up answer into situation without requiring fields", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Should I raise my membership price?"),
    );
    let current = getStrategyWorkItem(item.id)!;
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(
        current,
        "Costs have increased, but membership pricing has stayed the same.",
      ),
    );
    current = getStrategyWorkItem(item.id)!;
    expect(current.currentReality).toMatch(/Costs have increased/i);
    expect(current.decisionStatement).not.toBe(current.currentReality);
  });

  it("offers question choices from the work item and keeps free response", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "I need clearer direction for Q3."),
    );
    const choices = buildQuestionChoices(getStrategyWorkItem(item.id)!);
    expect(choices.length).toBeGreaterThan(0);
    expect(choices.length).toBeLessThanOrEqual(3);
    const turn = buildConversationTurnView(getStrategyWorkItem(item.id)!);
    expect(turn.showFreeResponse).toBe(true);
  });

  it("builds thinking summary with only meaningful sections", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Raise membership price?",
      currentReality: "Costs rose this year",
      memberStatements: ["I am worried people will leave"],
      assumptions: ["Members may accept a small increase"],
    });
    const sections = buildThinkingSummary(getStrategyWorkItem(item.id)!);
    const labels = sections.map((s) => s.id);
    expect(labels).toContain("decide");
    expect(labels).toContain("happening");
    expect(labels).not.toContain("options");
  });

  it("emerges at most three options from context without a blank options field", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise the price of my membership?",
      currentReality: "Costs are up",
      memberStatements: [
        "Costs are up",
        "I need more revenue",
        "I worry members will leave",
      ],
    });
    const current = getStrategyWorkItem(item.id)!;
    expect(shouldOfferEmergingOptions(current)).toBe(true);
    const options = suggestEmergingOptions(current);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(shouldShowContinueJourney(current)).toBe(false);
  });

  it("shows Decision Record only once enough meaningful thinking exists", () => {
    const thin = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(thin.id, {
      decisionStatement: "Where should marketing go?",
    });
    expect(shouldShowDecisionRecord(getStrategyWorkItem(thin.id)!)).toBe(false);

    const ready = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(ready.id, {
      decisionStatement: "Raise price?",
      currentReality: "Costs increased",
      memberStatements: ["Costs increased", "Need revenue", "Fear churn"],
      risks: ["Members may leave"],
      assumptions: ["Value still holds"],
      optionsConsidered: [
        { id: "a", title: "Raise for everyone" },
        { id: "b", title: "Grandfather current members" },
      ],
    });
    expect(shouldShowDecisionRecord(getStrategyWorkItem(ready.id)!)).toBe(true);
  });

  it("honors adaptive one-question and reduced-choice preferences", () => {
    patchAdaptiveCompanionExplicitPrefs({
      instructionPacing: "one_at_a_time",
      choiceLoad: "one",
    });
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "I need direction."),
    );
    const turn = buildConversationTurnView(
      getStrategyWorkItem(item.id)!,
      resolveAdaptivePresentation(),
    );
    expect(turn.questionChoices.length).toBeLessThanOrEqual(1);
    expect(turn.question.includes("?")).toBe(true);
  });
});
