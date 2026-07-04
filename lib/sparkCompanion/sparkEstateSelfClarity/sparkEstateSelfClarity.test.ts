import { describe, expect, it } from "vitest";
import {
  detectIdentityStatement,
  evaluateSparkSelfClarity,
} from "./evaluateSelfClarity";
import { sparkEstateSelfClarityHintForChat } from "./sparkEstateSelfClarityHintForChat";
import { SPARK_SELF_CLARITY_GUIDING_QUESTION } from "./types";

describe("sparkEstateSelfClarity", () => {
  it("includes guiding question in hint", () => {
    const hint = sparkEstateSelfClarityHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_SELF_CLARITY_GUIDING_QUESTION);
  });

  it("detects identity statements", () => {
    expect(detectIdentityStatement("I'm lazy and I always quit")).toBe(true);
    const d = evaluateSparkSelfClarity({
      userText: "I'm lazy and I never finish anything",
    });
    expect(d.signals).toContain("identity_statement");
    expect(d.useCuriosityFirst).toBe(true);
  });

  it("detects discouraged historian", () => {
    const d = evaluateSparkSelfClarity({
      userText: "I only remember my mistakes and nothing ever works",
    });
    expect(d.signals).toContain("discouraged_historian");
  });

  it("activates story rewrite on always quit", () => {
    const d = evaluateSparkSelfClarity({
      userText: "I always quit — that's just who I am",
    });
    expect(d.signals).toContain("story_rewrite_moment");
  });

  it("hint forbids empty praise on harsh judgment", () => {
    const hint = sparkEstateSelfClarityHintForChat({
      userText: "I'm a failure and I hate myself",
    });
    expect(hint).toContain("IDENTITY / HARSH JUDGMENT");
    expect(hint).toContain("FORBIDDEN");
    expect(hint).toContain("Truth builds trust");
  });
});
