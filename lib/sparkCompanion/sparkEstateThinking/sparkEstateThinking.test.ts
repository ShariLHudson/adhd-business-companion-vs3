import { describe, expect, it } from "vitest";
import { evaluateSparkThinking } from "./evaluateThinking";
import { sparkEstateThinkingHintForChat } from "./sparkEstateThinkingHintForChat";
import {
  SPARK_DIGNITY_NORTH_STAR,
  SPARK_LIGHTER_FIVE_MINUTES,
  SPARK_THINKING_FIRST_QUESTION,
} from "./types";

describe("sparkEstateThinking", () => {
  it("includes dignity north star and first question", () => {
    const hint = sparkEstateThinkingHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_DIGNITY_NORTH_STAR);
    expect(hint).toContain(SPARK_THINKING_FIRST_QUESTION);
    expect(hint).toContain(SPARK_LIGHTER_FIVE_MINUTES);
  });

  it("reads state on task request", () => {
    const d = evaluateSparkThinking({
      userText: "Help me create a marketing plan",
    });
    expect(d.deferCertainty).toBe(true);
    expect(d.stateSignals.length).toBeGreaterThan(0);
  });

  it("normalizes shame before solving", () => {
    const d = evaluateSparkThinking({
      userText: "I haven't looked at my finances in months — I'm embarrassed",
    });
    expect(d.normalizeFirst).toBe(true);
  });

  it("suggests wrong-problem challenge on productivity + exhaustion", () => {
    const d = evaluateSparkThinking({
      userText: "Help me become more productive — I'm exhausted and burned out",
      overwhelmed: true,
    });
    expect(d.gentleWrongProblemChallenge).toBe(true);
  });

  it("names friction when stuck", () => {
    const d = evaluateSparkThinking({
      userText: "I'm stuck — too many options and don't know where to start",
    });
    expect(d.nameFriction).toBe(true);
    expect(d.stateSignals).toContain("confusion");
  });
});
