import { describe, expect, it } from "vitest";

import {
  orchestrateCognition,
  runCognitiveOrchestration,
  selfReviewCognition,
} from "./orchestrateCognition";

describe("Spark Cognitive Orchestration Engine", () => {
  const base = {
    turnId: "t1",
    threadId: "thread-1",
    memberMessage: "",
  };

  it("step 1-8: overwhelmed → coaching, clarification, no generation", () => {
    const plan = orchestrateCognition({
      ...base,
      memberMessage: "I'm overwhelmed.",
    });

    expect(plan.step2_emotionalState).toBe("overwhelmed");
    expect(plan.step4_thinkingMode).toBe("coaching");
    expect(plan.step5_disciplines).toEqual([]);
    expect(plan.step8_readyToGenerate).toBe(false);
    expect(plan.clarificationQuestion).toBeTruthy();
  });

  it("strategic pricing activates finance disciplines", () => {
    const plan = orchestrateCognition({
      ...base,
      memberMessage: "I'm thinking about raising my prices for my coaching offer.",
    });

    expect(plan.step3_businessContext).toContain("finance");
    expect(plan.step5_disciplines).toContain("finance");
    expect(plan.step4_thinkingMode).toBe("decision_support");
  });

  it("self review rejects low-trust verbose draft", () => {
    const plan = orchestrateCognition({
      ...base,
      memberMessage: "Help me plan Q3 priorities for revenue growth.",
    });

    const review = selfReviewCognition(
      {
        text: "x".repeat(700),
      },
      plan,
    );

    expect(review.canBeSimpler).toBe(true);
    expect(review.pass).toBe(false);
  });

  it("runCognitiveOrchestration returns ready when no draft", () => {
    const result = runCognitiveOrchestration({
      ...base,
      memberMessage: "Help me prepare for a sales meeting tomorrow.",
    });

    expect(result.kind).toBe("ready");
    if (result.kind === "ready") {
      expect(result.plan.step8_readyToGenerate).toBe(true);
    }
  });
});
