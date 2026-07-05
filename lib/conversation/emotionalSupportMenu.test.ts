import { describe, expect, it } from "vitest";
import { classifyPrimaryConversationTurnWithEngine } from "./primaryTurnClassifier";
import { isCreateTerminalDecision } from "./createTerminalOwner";
import { shouldResolveEarlyLocalSupportTurn } from "./earlyLocalSupportTurn";
import {
  isEmotionalSupportMenuOffer,
  isEmotionalSupportMenuSelection,
  resolveEmotionalSupportMenuChoice,
} from "./emotionalDistressRouting";
import { resolveExplicitCompanionAction } from "@/lib/companion/explicitCompanionActions";
import { clearUniversalCreationSession } from "@/lib/universalCreation";

const STRESS_REPLY =
  "You're carrying a lot of tension in this. Stress doesn't mean you're failing — it means something matters.\n\nWould you like calming audio, a breathing reset, or to stay here with me?";

describe("emotional support menu routing", () => {
  it("detects the three-option support menu", () => {
    expect(isEmotionalSupportMenuOffer(STRESS_REPLY)).toBe(true);
  });

  it("breathing reset choice is not create terminal", () => {
    clearUniversalCreationSession();
    const user = "a breathing reset";
    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: user,
      lastAssistantText: STRESS_REPLY,
    });
    expect(
      isCreateTerminalDecision(engine, {
        userText: user,
        lastAssistantText: STRESS_REPLY,
        primaryTurn: primary,
      }),
    ).toBe(false);
    expect(
      shouldResolveEarlyLocalSupportTurn(user, primary, STRESS_REPLY),
    ).toBe(true);
    expect(resolveEmotionalSupportMenuChoice(user, STRESS_REPLY)).toBe(
      "breathe",
    );
    expect(resolveExplicitCompanionAction(user, STRESS_REPLY)?.kind).toBe(
      "open-breathe",
    );
  });

  it("calming audio choice is not create terminal", () => {
    const user = "calming audio";
    expect(isEmotionalSupportMenuSelection(user, STRESS_REPLY)).toBe(true);
    expect(resolveEmotionalSupportMenuChoice(user, STRESS_REPLY)).toBe(
      "focus-audio",
    );
  });

  it("stay here choice is not create terminal", () => {
    const user = "stay here with me";
    expect(isEmotionalSupportMenuSelection(user, STRESS_REPLY)).toBe(true);
    expect(resolveEmotionalSupportMenuChoice(user, STRESS_REPLY)).toBe("stay");
  });
});
