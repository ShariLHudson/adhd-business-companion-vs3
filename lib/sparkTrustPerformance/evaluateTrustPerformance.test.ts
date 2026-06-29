import { describe, expect, it } from "vitest";

import {
  runTrustIngress,
  runTrustPerformance,
  runTrustQualityGate,
} from "./evaluateTrustPerformance";
import { classifyIntentFast, passesGoldenRule } from "./fastIntent";

describe("Spark Trust & Performance Engine", () => {
  const base = {
    turnId: "t1",
    threadId: "thread-1",
    memberMessage: "",
  };

  it("classifies intent under 100ms budget target", () => {
    const result = runTrustIngress({
      ...base,
      memberMessage: "What is a value proposition?",
    });

    expect(result.intentLabel).toBe("definition");
    expect(result.complexityLevel).toBe(1);
    expect(result.intentDetectionMs).toBeLessThan(100);
    expect(result.modules.knowledgeEngine).toBe(true);
    expect(result.goldenRulePassed).toBe(true);
  });

  it("marketing gets level 2 with minimal disciplines", () => {
    const result = runTrustIngress({
      ...base,
      memberMessage: "How do I improve my email marketing open rates?",
    });

    expect(result.intentLabel).toBe("marketing");
    expect(result.complexityLevel).toBe(2);
    expect(result.modules.disciplines).toEqual(
      expect.arrayContaining(["marketing", "wordsmith"]),
    );
  });

  it("golden rule blocks over-activation on simple asks", () => {
    const intent = classifyIntentFast("What is churn rate?");
    expect(intent).toBe("definition");
    expect(
      passesGoldenRule(1, {
        knowledgeEngine: true,
        cognitiveOrchestration: false,
        fullIntelligence: false,
        disciplines: [],
        observatory: false,
        creativeEngine: false,
      }),
    ).toBe(true);
  });

  it("quality gate rejects software voice and false certainty", () => {
    const gate = runTrustQualityGate({
      draftText: "Error: You must upgrade. This will definitely 100% fix everything.",
      memberMessage: "Help me with pricing",
      objectiveSummary: "Pricing guidance",
      complexityLevel: 4,
    });

    expect(gate.pass).toBe(false);
    expect(gate.revisionHints.length).toBeGreaterThan(0);
  });

  it("full pipeline ingress + egress", () => {
    const result = runTrustPerformance(
      {
        ...base,
        memberMessage: "Help me prepare for a sales meeting.",
      },
      { text: "Let's start with who you're meeting and what you want them to decide by the end." },
    );

    expect(result.phase).toBe("egress");
    if (result.phase === "egress") {
      expect(result.ingress.complexityLevel).toBeGreaterThanOrEqual(2);
    }
  });
});
