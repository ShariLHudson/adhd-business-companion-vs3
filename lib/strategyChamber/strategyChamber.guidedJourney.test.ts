import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  __resetPendingStrategyHandoffForTests,
  __resetStrategyChamberStoresForTests,
  applyGuidedJourneyAnswer,
  applyStrategyContributionReturn,
  buildStrategyResumeSummary,
  chooseEmergingOption,
  consumePendingStrategyHandoff,
  createStrategyWorkItem,
  executeApprovedStrategyHandoff,
  getStrategyWorkItem,
  guidedJourneyIsComplete,
  guidedPromptForWorkItem,
  listStrategyConnections,
  peekPendingStrategyHandoff,
  skipGuidedJourneyStage,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";

describe("Strategy Chamber guided journey + handoffs", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
    __resetPendingStrategyHandoffForTests();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("treats the first answer as the strategic question only", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Too many offers, unclear focus"),
    );
    const current = getStrategyWorkItem(item.id)!;
    expect(current.decisionStatement).toMatch(/offers/i);
    expect(current.currentReality).toBeFalsy();
  });

  it("builds situational context from later answers and can complete a choice", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Where should marketing focus?"),
    );
    let current = getStrategyWorkItem(item.id)!;
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(
        current,
        "I am stretched across three offers and none feel finished.",
      ),
    );
    current = getStrategyWorkItem(item.id)!;
    expect(current.currentReality).toMatch(/stretched/i);

    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(current, "I want to know which offer to grow"),
    );
    current = getStrategyWorkItem(item.id)!;
    expect(current.desiredDirection).toBeTruthy();

    updateStrategyWorkItem(item.id, {
      optionsConsidered: [
        { id: "opt_1", title: "Focus on one offer" },
        { id: "opt_2", title: "Keep both lightly" },
      ],
    });
    current = getStrategyWorkItem(item.id)!;
    updateStrategyWorkItem(
      item.id,
      chooseEmergingOption(current, "opt_1"),
    );
    current = getStrategyWorkItem(item.id)!;
    expect(current.chosenDirection).toMatch(/Focus on one/i);
    expect(guidedJourneyIsComplete(current)).toBe(true);
  });

  it("builds adaptive resume summaries", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Pricing change",
      currentReality: "Clients hesitate at checkout",
      chosenDirection: "Test a simpler offer first",
      status: "direction_chosen",
      currentStage: "prepare_handoff",
    });
    patchAdaptiveCompanionExplicitPrefs({ resumeSummaryPreference: "brief" });
    const brief = buildStrategyResumeSummary(
      getStrategyWorkItem(item.id)!,
      resolveAdaptivePresentation(),
    );
    expect(brief).toMatch(/Pricing change/);
    expect(brief.split("\n").length).toBe(1);
  });

  it("skips a question without wiping the strategic question", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Capacity is the real issue"),
    );
    const afterOpen = getStrategyWorkItem(item.id)!;
    expect(afterOpen.decisionStatement).toMatch(/Capacity/i);
    const skipped = skipGuidedJourneyStage(afterOpen);
    updateStrategyWorkItem(item.id, skipped);
    const next = getStrategyWorkItem(item.id)!;
    expect(next.decisionStatement).toMatch(/Capacity/i);
    expect(next.currentStage).not.toBe(afterOpen.currentStage);
  });

  it("records approved Talk It Out handoff with pending context", () => {
    const item = createStrategyWorkItem({ entryReason: "unsure" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Feeling stuck on direction",
      currentReality: "Too many competing priorities",
      status: "understanding",
    });
    const result = executeApprovedStrategyHandoff({
      strategyWorkItemId: item.id,
      destinationId: "talk_it_out",
    });
    expect(result.section).toBe("talk-it-out");
    expect(peekPendingStrategyHandoff()?.strategyWorkItemId).toBe(item.id);
    expect(listStrategyConnections(item.id).length).toBe(1);
    expect(listStrategyConnections(item.id)[0]!.memberApproved).toBe(true);
    const consumed = consumePendingStrategyHandoff();
    expect(consumed?.softContext).toMatch(/priorities|stuck/i);
    expect(peekPendingStrategyHandoff()).toBeNull();
  });

  it("applies contribution returns without a second work item", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    applyStrategyContributionReturn({
      strategyWorkItemId: item.id,
      from: "talk_it_out_session",
      sourceId: "tio_1",
      conciseContribution: "Clarity came from naming the fear of choosing wrong.",
    });
    const updated = getStrategyWorkItem(item.id)!;
    expect(updated.observations?.[0]).toMatch(/Clarity came/);
    expect(
      listStrategyConnections(item.id).some(
        (c) => c.syncDirection === "from_destination",
      ),
    ).toBe(true);
  });

  it("uses presentation for guided prompts", () => {
    patchAdaptiveCompanionExplicitPrefs({
      examplePreference: "prefer",
      summaryFirst: false,
    });
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Where should we focus?",
      currentReality: "Three offers competing",
    });
    const prompt = guidedPromptForWorkItem(
      getStrategyWorkItem(item.id)!,
      resolveAdaptivePresentation(),
    );
    expect(prompt.exampleHint).toBeTruthy();
    expect(prompt.question.length).toBeGreaterThan(10);
  });
});
