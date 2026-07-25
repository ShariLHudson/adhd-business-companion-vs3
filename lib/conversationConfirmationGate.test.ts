import { describe, expect, it } from "vitest";
import {
  isActiveQuestionAcceptance,
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

  describe("isActiveQuestionAcceptance (B2)", () => {
    it("preserves the base acceptance vocabulary", () => {
      for (const t of ["yes", "sure", "okay", "ok", "go ahead", "do it"]) {
        expect(isActiveQuestionAcceptance(t)).toBe(true);
      }
    });

    it("adds bounded continuation and selection short answers", () => {
      for (const t of [
        "go",
        "go for it",
        "continue",
        "keep going",
        "next",
        "that one",
        "this one",
        "the first one",
        "first one",
        "the second one",
        "option two",
        "option 1",
        "number two",
      ]) {
        expect(isActiveQuestionAcceptance(t)).toBe(true);
      }
    });

    it("does not match longer navigation / action sentences", () => {
      // These start with a binding word but are not short answers — they must
      // not bind as acceptance even inside an active question.
      for (const t of [
        "go to the boardroom",
        "continue working on the deck",
        "next room please",
        "take me to momentum",
      ]) {
        expect(isActiveQuestionAcceptance(t)).toBe(false);
      }
    });

    it("does NOT widen the shared global acceptance predicate", () => {
      // The context-free predicate (read by unguarded frictionless / task-lock
      // consumers) must stay narrow, so these tokens can never be captured
      // globally.
      for (const t of ["go", "continue", "next", "that one", "the first one"]) {
        expect(isConfirmationAcceptance(t)).toBe(false);
      }
    });
  });
});
