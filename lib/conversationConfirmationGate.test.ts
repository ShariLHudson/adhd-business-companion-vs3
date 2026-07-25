import { describe, expect, it } from "vitest";
import {
  isConfirmationAcceptance,
  isConfirmationDecline,
  messageAsksUserConfirmation,
  shouldArmPendingQuestion,
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
      "Peaceful Places inside the Estate was created for moments like this. Would you like me to take you there?";
    expect(messageAsksUserConfirmation(line)).toBe(true);
  });

  it("does not treat statements as confirmation waits", () => {
    expect(
      messageAsksUserConfirmation("Momentum Builder helps with overwhelm."),
    ).toBe(false);
  });

  it("recognizes yes and no answers", () => {
    expect(isConfirmationAcceptance("yes")).toBe(true);
    expect(isConfirmationAcceptance("open it")).toBe(true);
    expect(isConfirmationAcceptance("go ahead")).toBe(true);
    expect(isConfirmationDecline("not now")).toBe(true);
    expect(isConfirmationDecline("stay here")).toBe(true);
  });

  it("recognizes free-form build/create/draft/make offers (B1)", () => {
    expect(messageAsksUserConfirmation("Want to build one?")).toBe(true);
    expect(messageAsksUserConfirmation("Want me to draft that for you?")).toBe(
      true,
    );
    expect(messageAsksUserConfirmation("Would you like me to draft that?")).toBe(
      true,
    );
    expect(messageAsksUserConfirmation("Should we create it together?")).toBe(
      true,
    );
    expect(messageAsksUserConfirmation("Shall we get started?")).toBe(true);
  });

  it("does not over-arm rhetorical or non-action questions (B1)", () => {
    // Questions with no build/create/offer invitation must not arm.
    expect(messageAsksUserConfirmation("What is a customer persona?")).toBe(
      false,
    );
    expect(messageAsksUserConfirmation("How are you feeling today?")).toBe(
      false,
    );
    expect(messageAsksUserConfirmation("Isn't that interesting?")).toBe(false);
    expect(messageAsksUserConfirmation("Do you think that's right?")).toBe(
      false,
    );
    // A build word with no question mark is a statement, not an offer.
    expect(messageAsksUserConfirmation("I can build one for you.")).toBe(false);
  });

  describe("shouldArmPendingQuestion (B1)", () => {
    it("arms on a qualifying free-form offer", () => {
      expect(shouldArmPendingQuestion("Want to build one?")).toBe(true);
      expect(shouldArmPendingQuestion("Should we create it together?")).toBe(
        true,
      );
    });

    it("does not arm rhetorical or non-offer questions", () => {
      expect(shouldArmPendingQuestion("What is a customer persona?")).toBe(
        false,
      );
      expect(shouldArmPendingQuestion("How are you today?")).toBe(false);
    });

    it("does not double-arm when a structured offer already armed", () => {
      expect(
        shouldArmPendingQuestion("Want to build one?", { alreadyArmed: true }),
      ).toBe(false);
    });
  });
});
