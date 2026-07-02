import { describe, expect, it } from "vitest";
import {
  isConfirmationAcceptance,
  isConfirmationDecline,
  messageAsksUserConfirmation,
  shouldStopAfterAssistantOffer,
} from "./conversationConfirmationGate";

describe("conversationConfirmationGate", () => {
  it("detects focus audio confirmation offer", () => {
    const line =
      "I can open Focus Audio for background audio. Want me to open it?";
    expect(messageAsksUserConfirmation(line)).toBe(true);
    expect(shouldStopAfterAssistantOffer(line)).toBe(true);
  });

  it("detects estate room invitation", () => {
    const line =
      "Peaceful Places™ inside the Estate was created for moments like this. Would you like me to take you there?";
    expect(messageAsksUserConfirmation(line)).toBe(true);
  });

  it("does not treat statements as confirmation waits", () => {
    expect(
      messageAsksUserConfirmation("Momentum Builder™ helps with overwhelm."),
    ).toBe(false);
  });

  it("recognizes yes and no answers", () => {
    expect(isConfirmationAcceptance("yes")).toBe(true);
    expect(isConfirmationAcceptance("open it")).toBe(true);
    expect(isConfirmationAcceptance("go ahead")).toBe(true);
    expect(isConfirmationDecline("not now")).toBe(true);
    expect(isConfirmationDecline("stay here")).toBe(true);
  });
});
