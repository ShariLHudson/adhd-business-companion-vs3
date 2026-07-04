import { describe, expect, it } from "vitest";
import { evaluateSparkEstateConstitution } from "./evaluateConstitution";
import { roomLifeSkillHintForPlace } from "./roomSkills";
import { sparkEstateConstitutionHintForChat } from "./sparkEstateConstitutionHintForChat";
import {
  SPARK_CONSTITUTION_NORTH_STAR,
  SPARK_SELF_TRUST_GUIDING_QUESTION,
} from "./types";

describe("sparkEstateConstitution", () => {
  it("includes self-trust guiding question and north star in hint", () => {
    const hint = sparkEstateConstitutionHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_SELF_TRUST_GUIDING_QUESTION);
    expect(hint).toContain(SPARK_CONSTITUTION_NORTH_STAR);
  });

  it("activates curiosity on self-criticism", () => {
    const d = evaluateSparkEstateConstitution({
      userText: "What's wrong with me? I'm such a failure.",
    });
    expect(d.activePrinciples).toContain("curiosity_over_criticism");
    expect(d.targetMeasures).toContain("less_shame");
  });

  it("detects trust loss in memory and finishing", () => {
    const d = evaluateSparkEstateConstitution({
      userText: "I can't remember anything and I never finish what I start",
    });
    expect(d.trustLossSignals).toContain("memory");
    expect(d.trustLossSignals).toContain("finishing");
    expect(d.activePrinciples).toContain("rewrite_identity");
  });

  it("celebrates awareness wins", () => {
    const d = evaluateSparkEstateConstitution({
      userText: "I finally noticed the pattern and chose rest instead of pushing",
    });
    expect(d.activePrinciples).toContain("celebrate_awareness");
  });

  it("adds room life skill hint when placeId provided", () => {
    const hint = sparkEstateConstitutionHintForChat({
      userText: "Hi",
      placeId: "greenhouse",
    });
    expect(hint).toContain("patience");
    expect(roomLifeSkillHintForPlace("greenhouse")).toContain("patience");
  });
});
