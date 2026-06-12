import { describe, expect, it } from "vitest";
import {
  assistantOfferedAssistedHelp,
  assistantSuggestedAction,
  isActionAcceptance,
} from "./assistedActionBridge";

describe("assistedActionBridge", () => {
  it("detects action acceptance phrases", () => {
    expect(isActionAcceptance("I can do that")).toBe(true);
    expect(isActionAcceptance("yes")).toBe(true);
    expect(isActionAcceptance("maybe later")).toBe(false);
  });

  it("blocks email suggestion when proposal is locked", () => {
    expect(
      assistantSuggestedAction(
        "How about responding to one email?",
        "Proposal",
      ),
    ).toBeNull();
  });

  it("detects email suggestion from assistant", () => {
    const action = assistantSuggestedAction(
      "How about responding to one email?",
    );
    expect(action?.id).toBe("email");
    expect(action?.itemType).toBe("Email");
  });

  it("detects how about one email phrasing", () => {
    expect(assistantSuggestedAction("How about one email?")?.id).toBe("email");
  });

  it("detects post and plan suggestions", () => {
    expect(
      assistantSuggestedAction("Want to try drafting a LinkedIn post?")?.id,
    ).toBe("post");
    expect(
      assistantSuggestedAction("How about starting a marketing plan?")?.id,
    ).toBe("plan");
  });

  it("recognizes when assist was already offered", () => {
    expect(
      assistantOfferedAssistedHelp(
        "Would you like me to help draft the email? I can open Create beside us.",
      ),
    ).toBe(true);
    expect(
      assistantSuggestedAction(
        "Would you like me to help draft the email? I can open Create beside us.",
      ),
    ).toBeNull();
  });
});
