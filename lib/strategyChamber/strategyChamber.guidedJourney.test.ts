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

  it("advances stages through guided answers without creating duplicates", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    const first = applyGuidedJourneyAnswer(item, "Too many offers, no focus");
    updateStrategyWorkItem(item.id, first);
    let current = getStrategyWorkItem(item.id)!;
    expect(current.currentReality).toMatch(/offers/i);

    const second = applyGuidedJourneyAnswer(
      current,
      "Know which offer to grow",
    );
    updateStrategyWorkItem(item.id, second);
    current = getStrategyWorkItem(item.id)!;
    expect(current.desiredDirection).toMatch(/offer/i);

    const third = applyGuidedJourneyAnswer(
      current,
      "Focus on one · Keep both lightly · Pause and test",
    );
    updateStrategyWorkItem(item.id, third);
    current = getStrategyWorkItem(item.id)!;
    expect(current.optionsConsidered?.length).toBeGreaterThanOrEqual(2);

    const fourth = applyGuidedJourneyAnswer(
      current,
      "Focus on one offer for 90 days",
    );
    updateStrategyWorkItem(item.id, fourth);
    current = getStrategyWorkItem(item.id)!;
    expect(current.chosenDirection).toMatch(/Focus/i);
    expect(guidedJourneyIsComplete(current)).toBe(true);
  });

  it("builds adaptive resume summaries", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Pricing change",
      currentReality: "Clients hesitate at checkout",
      chosenDirection: "Test a simpler offer first",
      status: "direction_chosen",
      currentStage: "handoff_direction",
    });
    patchAdaptiveCompanionExplicitPrefs({ resumeSummaryPreference: "brief" });
    const brief = buildStrategyResumeSummary(
      getStrategyWorkItem(item.id)!,
      resolveAdaptivePresentation(),
    );
    expect(brief).toMatch(/Pricing change/);
    expect(brief.split("\n").length).toBe(1);
  });

  it("skips a stage without wiping prior answers", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(
      item.id,
      applyGuidedJourneyAnswer(item, "Capacity is low"),
    );
    const afterOpen = getStrategyWorkItem(item.id)!;
    const skipped = skipGuidedJourneyStage(afterOpen);
    updateStrategyWorkItem(item.id, skipped);
    const next = getStrategyWorkItem(item.id)!;
    expect(next.currentReality).toMatch(/Capacity/);
    expect(next.currentStage).not.toBe(afterOpen.currentStage);
  });

  it("records approved Talk It Out handoff with pending context", () => {
    const item = createStrategyWorkItem({ entryReason: "unsure" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Feeling stuck on direction",
      currentReality: "Feeling stuck on direction",
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
    expect(consumed?.softContext).toMatch(/stuck/i);
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
      listStrategyConnections(item.id).some((c) => c.syncDirection === "from_destination"),
    ).toBe(true);
  });

  it("uses presentation for guided prompts", () => {
    patchAdaptiveCompanionExplicitPrefs({
      examplePreference: "prefer",
      summaryFirst: false,
    });
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    updateStrategyWorkItem(item.id, {
      currentReality: "Already answered opening",
      decisionStatement: "Already answered opening",
    });
    const prompt = guidedPromptForWorkItem(
      getStrategyWorkItem(item.id)!,
      resolveAdaptivePresentation(),
    );
    expect(prompt.exampleHint).toBeTruthy();
    expect(prompt.whyItMatters).toBeTruthy();
  });
});
