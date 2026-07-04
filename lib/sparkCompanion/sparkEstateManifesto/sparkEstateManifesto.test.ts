import { describe, expect, it } from "vitest";
import { evaluateSparkEstateManifesto, estatePlaceVoiceHint } from "./evaluateManifesto";
import { sparkEstateManifestoHintForChat } from "./sparkEstateManifestoHintForChat";
import { SPARK_MANIFESTO_FORBIDDEN_OPENING, SPARK_MANIFESTO_OPENING } from "./types";

describe("sparkEstateManifesto", () => {
  it("includes manifesto opening in hint", () => {
    const hint = sparkEstateManifestoHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_MANIFESTO_OPENING);
    expect(hint).toContain(SPARK_MANIFESTO_FORBIDDEN_OPENING);
  });

  it("detects difficult season on overwhelm", () => {
    const d = evaluateSparkEstateManifesto({
      userText: "I'm overwhelmed and ashamed",
    });
    expect(d.season).toBe("difficult");
    expect(d.relevantQuestions).toContain("understand_feeling");
    expect(d.relevantQuestions).toContain("stay_with_me");
  });

  it("detects celebrating season", () => {
    const d = evaluateSparkEstateManifesto({
      userText: "I'm so excited — we launched!",
    });
    expect(d.season).toBe("celebrating");
  });

  it("maps estate place voice", () => {
    expect(estatePlaceVoiceHint("coffee-house")).toContain(
      "carry this conversation alone",
    );
  });

  it("includes five questions for confusion", () => {
    const d = evaluateSparkEstateManifesto({
      userText: "I'm confused and don't understand any of this",
    });
    expect(d.relevantQuestions).toContain("make_sense");
  });
});
