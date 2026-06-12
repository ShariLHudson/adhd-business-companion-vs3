import { describe, expect, it } from "vitest";
import {
  detectDoItNowOffer,
  extractExplicitFocusMinutes,
  isActionDone,
  isPhysicalWellnessSuggestion,
} from "./doItNowActions";

describe("doItNowActions", () => {
  it("classifies drink water as quick physical — not focus", () => {
    const offer = detectDoItNowOffer(
      "A glass of water might help if your energy is low. Want to do that now?",
    );
    expect(offer?.kind).toBe("quick-physical");
    expect(offer?.label).toBe("Do It Now");
    expect(extractExplicitFocusMinutes(offer!.sourceText)).toBeNull();
  });

  it("classifies stretch and breathe as physical without timer", () => {
    expect(
      detectDoItNowOffer("How about stretching your arms for a minute?")?.kind,
    ).toBe("quick-physical");
    expect(
      detectDoItNowOffer("Take three slow breaths — want to try that now?")
        ?.kind,
    ).toBe("quick-physical");
  });

  it("classifies timed work as focus", () => {
    const offer = detectDoItNowOffer(
      "Want to do a 10-minute focus session on your prompts?",
    );
    expect(offer?.kind).toBe("focus");
    expect(offer?.minutes).toBe(10);
  });

  it("classifies email as work", () => {
    const offer = detectDoItNowOffer(
      "How about responding to one email? Want to try that?",
    );
    expect(offer?.kind).toBe("work");
  });

  it("classifies mental micro-actions", () => {
    const offer = detectDoItNowOffer(
      "Could you name one task that would help most right now?",
    );
    expect(offer?.kind).toBe("quick-mental");
    expect(offer?.mentalReply).toMatch(/one task/i);
  });

  it("detects done responses", () => {
    expect(isActionDone("done")).toBe(true);
    expect(isActionDone("I'm back")).toBe(true);
    expect(isActionDone("not yet")).toBe(false);
  });

  it("does not treat wellness text as timed focus", () => {
    const mixed = "Set a timer for 5 minutes - drink water first though";
    expect(isPhysicalWellnessSuggestion("Drink a full glass of water")).toBe(
      true,
    );
    expect(isPhysicalWellnessSuggestion(mixed)).toBe(true);
    expect(extractExplicitFocusMinutes(mixed)).toBeNull();
  });
});
