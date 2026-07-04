import { describe, expect, it } from "vitest";
import { evaluateSparkRightHelp } from "./evaluateRightHelp";
import { mapRightHelpToCompanionRole } from "./roles";
import { sparkEstateRightHelpHintForChat } from "./sparkEstateRightHelpHintForChat";
import { SPARK_ICONIC_HELP_QUESTION, SPARK_RIGHT_HELP_FIRST_QUESTION } from "./types";

describe("sparkEstateRightHelp", () => {
  it("includes first question in hint", () => {
    const hint = sparkEstateRightHelpHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_RIGHT_HELP_FIRST_QUESTION);
  });

  it("infers build on clear create request", () => {
    const d = evaluateSparkRightHelp({
      userText: "Help me write an SOP for onboarding",
    });
    expect(d.role).toBe("build");
    expect(d.confidence).toBe("high");
    expect(mapRightHelpToCompanionRole(d.role)).toBe("create_do");
  });

  it("infers stay with me on loneliness", () => {
    const d = evaluateSparkRightHelp({
      userText: "I don't want to be alone right now — just stay with me",
    });
    expect(d.role).toBe("stay_with_me");
    expect(mapRightHelpToCompanionRole(d.role)).toBe("support_restore");
  });

  it("offers choices when confidence is low", () => {
    const d = evaluateSparkRightHelp({ userText: "Hi" });
    expect(d.confidence).toBe("low");
    expect(d.offerChoices.length).toBeGreaterThanOrEqual(2);
    const hint = sparkEstateRightHelpHintForChat({ userText: "Hi" });
    expect(hint).toContain(SPARK_ICONIC_HELP_QUESTION);
  });

  it("infers understand on why questions", () => {
    const d = evaluateSparkRightHelp({
      userText: "Why do I keep doing this every time?",
    });
    expect(d.role).toBe("understand");
  });
});
