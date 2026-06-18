import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildStrategyApplyChatPrompt,
  getStrategyApplyOptions,
  STRATEGY_APPLY_FALLBACK,
} from "./strategyApplyOptions";
import * as companionStore from "./companionStore";

describe("strategyApplyOptions", () => {
  beforeEach(() => {
    vi.spyOn(companionStore, "getProjects").mockReturnValue([]);
  });

  it("raising rates strategy shows rate-specific apply options", () => {
    const options = getStrategyApplyOptions("raise-one-client", "pricing");
    const labels = options.map((o) => o.label);
    expect(labels).toContain("Decide who to raise rates for");
    expect(labels).toContain("Write the rate increase message");
    expect(labels).toContain("Explain the new value");
    expect(labels).toContain("Handle client objections");
    expect(labels).not.toContain("Too many ideas");
  });

  it("content strategy shows content-specific apply options", () => {
    const options = getStrategyApplyOptions("content-from-convos", "content");
    const labels = options.map((o) => o.label);
    expect(labels).toContain("Choose a topic");
    expect(labels).toContain("Write the hook");
    expect(labels).toContain("Explain the idea");
    expect(labels).toContain("Turn it into a post");
  });

  it("decision strategy shows decision-specific apply options", () => {
    const options = getStrategyApplyOptions("pick-then-learn", "decision-making");
    const labels = options.map((o) => o.label);
    expect(labels).toContain("Compare two options");
    expect(labels).toContain("Choose what matters most");
    expect(labels).toContain("Reduce the choices");
    expect(labels).toContain("Pick the next step");
  });

  it("unknown strategy uses fallback options", () => {
    const options = getStrategyApplyOptions("not-a-real-strategy", "systems");
    expect(options.map((o) => o.id)).toEqual(
      STRATEGY_APPLY_FALLBACK.map((o) => o.id),
    );
    expect(options[0]!.label).toBe("Apply this to my current situation");
  });

  it("active project context appears in apply-with-Shari prompt but does not force project routing", () => {
    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Summit Launch",
        goal: "",
        goals: [],
        nextAction: "",
        horizon: "now",
        status: "in-progress",
        color: "#1e4f4f",
        createdAt: "",
        updatedAt: "",
      },
    ]);

    const options = getStrategyApplyOptions("raise-one-client", "pricing");
    const writeMsg = options.find((o) => o.id === "rate-message")!;
    const prompt = buildStrategyApplyChatPrompt(writeMsg, {
      strategyTitle: "Raise One Client First",
      strategyId: "raise-one-client",
      categoryId: "pricing",
      activeProjectName: "Summit Launch",
    });
    expect(prompt).toContain("Summit Launch");
    expect(prompt).toContain("don't force project routing");
    expect(prompt).not.toContain("Open Projects");
  });
});
