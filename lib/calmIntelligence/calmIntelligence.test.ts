import { describe, expect, it } from "vitest";

import {
  ATTENTION_FILTER_QUESTIONS,
  CALM_INTELLIGENCE_PRINCIPLE,
  RULE_OF_ONE_PRINCIPLE,
  RULE_OF_THREE_PRINCIPLE,
  applyAttentionFilter,
  applyRuleOfOne,
  applyRuleOfThree,
  buildProgressiveDisclosure,
  buildSimplificationSuggestions,
  calmIntelligenceService,
  classifyInterruptions,
  composeCalmIntelligence,
  composeExecutivePresence,
  computeFocusScore,
  filterForToday,
} from "./index";

describe("Calm Intelligence™", () => {
  it("states the core principle — knowing does not mean showing", () => {
    expect(CALM_INTELLIGENCE_PRINCIPLE).toContain("does not mean Founder should show it");
    expect(ATTENTION_FILTER_QUESTIONS.length).toBe(5);
  });

  it("attention filter answers five questions per item", () => {
    const result = applyAttentionFilter(
      {
        id: "test-1",
        title: "Ship listening rooms",
        summary: "Primary mission work",
        source: "executive_decision",
        leverageScore: 90,
        missionId: "listening-rooms",
      },
      "listening-rooms",
    );
    expect(result.neededToday).toBe(true);
    expect(result.movesActiveMission).toBe(true);
    expect(typeof result.passes).toBe("boolean");
  });

  it("rule of one leads with one mission, recommendation, decision, and next step", () => {
    const one = applyRuleOfOne("listening-rooms");
    expect(one.mission?.id).toBe("listening-rooms");
    expect(one.nextStep?.label.length).toBeGreaterThan(0);
    expect(RULE_OF_ONE_PRINCIPLE).toContain("One mission");
  });

  it("rule of three caps visible items at three", () => {
    const items = Array.from({ length: 7 }, (_, i) => ({ id: `item-${i}`, title: `Item ${i}` }));
    const capped = applyRuleOfThree(items);
    expect(capped.items.length).toBeLessThanOrEqual(3);
    expect(capped.hiddenCount).toBe(4);
    expect(capped.principle).toBe(RULE_OF_THREE_PRINCIPLE);
  });

  it("progressive disclosure reveals layers on request", () => {
    const summary = buildProgressiveDisclosure("Summary", "Detail", ["evidence"], ["history"], "summary");
    expect(summary.summary).toBe("Summary");
    expect(summary.detail).toBeUndefined();

    const full = buildProgressiveDisclosure("Summary", "Detail", ["evidence"], ["history"], "history");
    expect(full.history).toEqual(["history"]);
  });

  it("focus score estimates overload dimensions", () => {
    const focus = computeFocusScore("listening-rooms");
    expect(focus.score).toBeGreaterThanOrEqual(0);
    expect(focus.score).toBeLessThanOrEqual(100);
    expect(["calm", "steady", "strained", "overloaded"]).toContain(focus.label);
    expect(focus.simplification.length).toBeGreaterThan(0);
  });

  it("simplification engine suggests calm reductions", () => {
    const suggestions = buildSimplificationSuggestions("listening-rooms");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].action).toBeTruthy();
  });

  it("interruption engine classifies timing", () => {
    const items = filterForToday("listening-rooms").map((f) => ({
      id: f.id,
      title: f.title,
      summary: f.summary,
      source: f.source,
    }));
    const interruptions = classifyInterruptions(items, "listening-rooms");
    expect(interruptions.every((i) => i.classification)).toBe(true);
  });

  it("executive presence stays calm without false urgency", () => {
    const presence = composeExecutivePresence("Good morning.", "One thing at a time.");
    expect(presence.neverUrgentWithoutReason).toBe(true);
    expect(presence.headline).toBe("Good morning.");
  });

  it("composeCalmIntelligence reduces cognitive load for Founder", () => {
    const view = composeCalmIntelligence({ missionId: "listening-rooms" });
    expect(view.product).toBe("founder");
    expect(view.opportunities.items.length).toBeLessThanOrEqual(3);
    expect(view.recommendations.items.length).toBeLessThanOrEqual(3);
    expect(view.ruleOfOne.mission).toBeTruthy();
    expect(view.presence.neverUrgentWithoutReason).toBe(true);
  });

  it("public API surfaces through calmIntelligenceService", () => {
    expect(calmIntelligenceService.sampleRepository().filterQuestions().length).toBe(5);
    expect(calmIntelligenceService.compose({ missionId: "listening-rooms" }).principle).toBe(
      CALM_INTELLIGENCE_PRINCIPLE,
    );
  });
});
