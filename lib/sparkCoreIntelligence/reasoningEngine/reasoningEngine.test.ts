import { describe, expect, it } from "vitest";

import { processReasoning } from "./reasoningEngine";

describe("Spark Core Reasoning Engine v1.0", () => {
  it("quick answer — no overthink, no disciplines", () => {
    const { plan, readyToCompose } = processReasoning({
      turnId: "t1",
      memberMessage: "What is churn rate?",
    });

    expect(plan.mode).toBe("quick_answer");
    expect(plan.overthinkGuard).toBe(true);
    expect(plan.disciplines).toEqual([]);
    expect(readyToCompose).toBe(true);
    expect(plan.askVsAnswer).toBe("answer");
  });

  it("pricing decision — disciplines + tradeoff + conflict resolution", () => {
    const { plan } = processReasoning({
      turnId: "t2",
      memberMessage: "I'm thinking about raising my prices for my coaching offer.",
    });

    expect(plan.disciplines).toContain("finance");
    expect(plan.tradeoffs.length).toBeGreaterThan(0);
    expect(plan.conflictResolved).toBeTruthy();
    expect(plan.rankedRecommendations[0]?.certaintyKind).toBe("recommendation");
  });

  it("research — flags research required", () => {
    const { plan } = processReasoning({
      turnId: "t3",
      memberMessage: "Research current competitor pricing in the coaching market.",
    });

    expect(plan.mode).toBe("research_reasoning");
    expect(plan.researchRequired).toBe(true);
  });

  it("vague creative — asks instead of answering", () => {
    const { plan, readyToCompose } = processReasoning({
      turnId: "t4",
      memberMessage: "I need a marketing campaign.",
    });

    expect(readyToCompose).toBe(false);
    expect(plan.askVsAnswer).toBe("ask");
    expect(plan.clarificationQuestion).toBeTruthy();
  });

  it("low confidence on tiny message — ask", () => {
    const { plan } = processReasoning({
      turnId: "t5",
      memberMessage: "Help",
    });

    expect(plan.confidence).toBe("low");
    expect(plan.askVsAnswer).toBe("ask");
  });

  it("separates certainty kinds in discipline positions", () => {
    const { plan } = processReasoning({
      turnId: "t6",
      memberMessage: "Verify market size for my niche.",
    });

    expect(plan.disciplinePositions.some((p) => p.certaintyKind === "fact")).toBe(true);
  });
});
