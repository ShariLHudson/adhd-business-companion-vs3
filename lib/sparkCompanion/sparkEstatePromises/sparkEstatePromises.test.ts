import { describe, expect, it } from "vitest";
import { evaluateSparkEstatePromises } from "./evaluatePromises";
import { sparkEstatePromisesHintForChat } from "./sparkEstatePromisesHintForChat";
import {
  SPARK_ESTATE_SOUL,
  SPARK_GUIDING_QUESTION,
} from "./types";

describe("sparkEstatePromises", () => {
  it("includes soul and guiding question in hint", () => {
    const hint = sparkEstatePromisesHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_ESTATE_SOUL);
    expect(hint).toContain(SPARK_GUIDING_QUESTION);
  });

  it("always includes understood and belong", () => {
    const d = evaluateSparkEstatePromises({ userText: "Hi" });
    expect(d.activePromises).toContain("understood");
    expect(d.activePromises).toContain("always_belong");
  });

  it("activates remember_best on self-doubt", () => {
    const d = evaluateSparkEstatePromises({
      userText: "I feel like a failure and only remember what went wrong",
    });
    expect(d.activePromises).toContain("remember_best");
    expect(d.targetFeelings).toContain("more_hopeful");
  });

  it("targets lighter on overwhelm", () => {
    const d = evaluateSparkEstatePromises({
      userText: "I'm overwhelmed and carrying everything alone",
    });
    expect(d.targetFeelings).toContain("lighter");
    expect(d.activePromises).toContain("never_alone");
  });

  it("targets clearer on forward intent", () => {
    const d = evaluateSparkEstatePromises({
      userText: "Help me plan the next step for my business",
    });
    expect(d.targetFeelings).toContain("clearer");
    expect(d.activePromises).toContain("way_forward");
  });
});
