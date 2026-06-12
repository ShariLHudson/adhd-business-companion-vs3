import { describe, expect, it } from "vitest";
import {
  isActionAcceptance,
  isActionRecoveryCommand,
  parseActionRecoveryCommand,
  selectCurrentAction,
} from "./actionSelectors";
import type { FounderAction } from "./actionTypes";

const sampleAction = (): FounderAction => ({
  id: "a1",
  title: "Finish Founder Dashboard",
  description: "Open Projects for ADHD Ecosystem.",
  actionType: "open-project",
  priority: "high",
  workspace: { section: "projects", ecosystemKind: "projects" },
  prefill: { projectTitle: "ADHD Ecosystem", taskTitle: "Founder Dashboard" },
  status: "offered",
  sourceEventIds: [],
  nextStep: "Continue Founder Dashboard in Projects.",
  createdAt: "2026-06-09T10:00:00.000Z",
  emoji: "📁",
});

describe("actionSelectors", () => {
  it("detects recovery commands", () => {
    expect(isActionRecoveryCommand("what should I work on")).toBe(true);
    expect(isActionRecoveryCommand("hello")).toBe(false);
  });

  it("detects action acceptance", () => {
    expect(isActionAcceptance("yes")).toBe(true);
    expect(isActionAcceptance("let's do it")).toBe(true);
    expect(isActionAcceptance("maybe later")).toBe(false);
  });

  it("returns current action by priority", () => {
    const current = selectCurrentAction([
      { ...sampleAction(), priority: "low" },
      { ...sampleAction(), id: "a2", priority: "high", title: "Draft SOP" },
    ]);
    expect(current?.title).toBe("Draft SOP");
  });

  it("parses next-action recovery", () => {
    const result = parseActionRecoveryCommand(
      "show my next action",
      [sampleAction()],
    );
    expect(result.kind).toBe("next-action");
    expect(result.message).toContain("Founder Dashboard");
  });
});
