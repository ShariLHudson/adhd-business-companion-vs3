import { describe, expect, it } from "vitest";
import { sampleFounderHistory } from "../intelligence/fixtures/founderHistory";
import { buildCommandCenterState } from "./commandCenterEngine";
import {
  answerCommandCenterQuestion,
  answerWhatShouldIWorkOn,
  parseCommandCenterQuestion,
} from "./commandCenterSelectors";
import { generateMorningBriefing } from "./morningBriefingGenerator";
import { getFounderOperatingState } from "../fos/founderOperatingState";

const NOW = new Date("2026-06-09T12:00:00.000Z");

describe("commandCenter", () => {
  const events = sampleFounderHistory();
  const state = buildCommandCenterState(events, "founder-001", { now: NOW });

  it("builds all command center sections", () => {
    expect(state.today.currentStage).toBeTruthy();
    expect(state.briefing.headline.length).toBeGreaterThan(0);
    expect(state.nextAction.title.length).toBeGreaterThan(0);
    expect(state.momentum).toBeDefined();
    expect(state.capacity.recommendation).toBeTruthy();
  });

  it("surfaces at most a handful of attention projects", () => {
    expect(state.projects.length).toBeLessThanOrEqual(6);
  });

  it("generates morning briefing with open decisions slot", () => {
    const os = getFounderOperatingState(events, "founder-001", { now: NOW });
    const briefing = generateMorningBriefing(os, events, "founder-001", undefined, NOW);
    expect(briefing.mostImportantGoal !== undefined).toBe(true);
    expect(Array.isArray(briefing.openDecisions)).toBe(true);
  });

  it("answers conversational questions from state", () => {
    expect(parseCommandCenterQuestion("what should I work on")).toBe("work-on");
    const reply = answerWhatShouldIWorkOn(state);
    expect(reply).toContain(state.nextAction.title);
    expect(
      answerCommandCenterQuestion("what's most important?", state),
    ).toBeTruthy();
  });

  it("keeps next action singular", () => {
    expect(typeof state.nextAction.title).toBe("string");
    expect(state.nextAction.reasons.length).toBeGreaterThan(0);
  });
});
