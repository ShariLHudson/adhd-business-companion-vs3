import { describe, expect, it } from "vitest";
import {
  coachFocusOptions,
  coachFocusPrompt,
  coachNeedHasFocusStep,
  PROJECT_COACH_MORE_NEEDS,
  PROJECT_COACH_PRIMARY_NEEDS,
} from "./projectCoachChoices";

describe("projectCoachChoices", () => {
  it("shows four primary needs plus More bucket", () => {
    expect(PROJECT_COACH_PRIMARY_NEEDS.map((n) => n.id)).toEqual([
      "outcome",
      "planning",
      "tasks",
      "roadblocks",
    ]);
    expect(PROJECT_COACH_MORE_NEEDS.map((n) => n.id)).toEqual([
      "goals",
      "notes",
      "appointments",
      "files",
      "other",
    ]);
  });

  it("only outcome, planning, and tasks have a focus step", () => {
    expect(coachNeedHasFocusStep("outcome")).toBe(true);
    expect(coachNeedHasFocusStep("planning")).toBe(true);
    expect(coachNeedHasFocusStep("tasks")).toBe(true);
    expect(coachNeedHasFocusStep("roadblocks")).toBe(false);
    expect(coachNeedHasFocusStep("goals")).toBe(false);
  });

  it("uses workspace-aware focus prompts", () => {
    expect(coachFocusPrompt("planning")).toBe(
      "What part of this project would you like to plan?",
    );
    expect(coachFocusPrompt("tasks")).toBe("What would help with tasks?");
    expect(coachFocusPrompt("outcome")).toBe("Let's define success.");
  });

  it("lists task help options", () => {
    expect(coachFocusOptions("tasks").map((o) => o.label)).toContain(
      "Choose the next action",
    );
  });
});
