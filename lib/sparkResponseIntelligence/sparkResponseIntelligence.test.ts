import { describe, expect, it } from "vitest";

import {
  analyzeBeforeCompose,
  evaluateBeforeSend,
  runSparkResponseIntelligence,
} from "./evaluateSparkResponseIntelligence";

describe("Spark Response Intelligence Engine", () => {
  const baseInput = {
    turnId: "t1",
    threadId: "thread-1",
    memberMessage: "",
  };

  it("requests clarification when member is overwhelmed", () => {
    const result = runSparkResponseIntelligence({
      ...baseInput,
      memberMessage: "I'm overwhelmed.",
    });

    expect(result.kind).toBe("clarification");
    if (result.kind === "clarification") {
      expect(result.clarificationQuestion).toMatch(/venting|drop|guilt/i);
      expect(result.analysis.disciplines).toEqual([]);
    }
  });

  it("activates marketing disciplines for campaign ask with enough context", () => {
    const analysis = analyzeBeforeCompose({
      ...baseInput,
      memberMessage:
        "Help me build a marketing campaign for my coaching offer to entrepreneurs.",
    });

    expect(analysis.disciplines).toContain("marketing");
    expect(analysis.disciplines).toContain("wordsmith");
  });

  it("clarifies vague marketing campaign request", () => {
    const result = runSparkResponseIntelligence({
      ...baseInput,
      memberMessage: "I need a marketing campaign.",
    });

    expect(result.kind).toBe("clarification");
  });

  it("fails evaluation for software voice draft", () => {
    const analysis = analyzeBeforeCompose({
      ...baseInput,
      memberMessage: "What should I focus on today?",
    });

    const evaluation = evaluateBeforeSend(
      { text: "Error: You must complete this required task." },
      analysis,
    );

    expect(evaluation.pass).toBe(false);
    expect(evaluation.revisionHints.length).toBeGreaterThan(0);
  });

  it("returns ready_to_compose when no draft provided", () => {
    const result = runSparkResponseIntelligence({
      ...baseInput,
      memberMessage: "Help me prepare for a sales meeting tomorrow.",
    });

    expect(result.kind).toBe("ready_to_compose");
  });
});
