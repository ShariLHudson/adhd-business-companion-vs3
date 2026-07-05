import { describe, expect, it } from "vitest";
import {
  ENJOY_ESTATE_LABEL,
  isJustBeHereLabel,
  isPresenceModeAcceptance,
  isPresenceModeRequest,
  isPresenceModeSuggestionOffer,
  pickPresenceModeAckLine,
  PRESENCE_MODE_SUGGESTION_OVERWHELMED,
  PRESENCE_MODE_SUGGESTION_RACING_MIND,
  shouldOfferJustBeHereResumeMessage,
  shouldSuggestPresenceModeForDistress,
} from "./justBeHere";

describe("presenceMode", () => {
  it("exposes Enjoy the Estate visitor mode label", () => {
    expect(ENJOY_ESTATE_LABEL).toBe("Enjoy the Estate");
  });

  it("recognizes natural language presence requests", () => {
    expect(isPresenceModeRequest("I just want to sit here")).toBe(true);
    expect(isPresenceModeRequest("Let's just enjoy the view")).toBe(true);
    expect(isPresenceModeRequest("Can we just be here for a while?")).toBe(true);
    expect(isPresenceModeRequest("hide everything")).toBe(true);
    expect(isPresenceModeRequest("hide chat")).toBe(true);
    expect(isPresenceModeRequest("enjoy the room")).toBe(true);
    expect(isPresenceModeRequest("I don't want to think right now")).toBe(true);
    expect(isPresenceModeRequest("let's take a break")).toBe(true);
    expect(isJustBeHereLabel("just be here")).toBe(true);
    expect(isPresenceModeRequest("write an email")).toBe(false);
  });

  it("picks a brief conversational ack — never activation copy", () => {
    const ack = pickPresenceModeAckLine("hide everything");
    expect(ack).toMatch(/Of course|Absolutely|just be here/i);
    expect(ack).not.toMatch(/activated|entering|mode/i);
  });

  it("does not auto-insert resume lines after flame return", () => {
    expect(shouldOfferJustBeHereResumeMessage(3, true)).toBe(false);
  });

  it("suggests presence rarely for overwhelm and racing mind only", () => {
    expect(shouldSuggestPresenceModeForDistress("I'm overwhelmed").line).toBe(
      PRESENCE_MODE_SUGGESTION_OVERWHELMED,
    );
    expect(shouldSuggestPresenceModeForDistress("my brain won't stop").line).toBe(
      PRESENCE_MODE_SUGGESTION_RACING_MIND,
    );
    expect(shouldSuggestPresenceModeForDistress("write an email").suggest).toBe(
      false,
    );
  });

  it("accepts presence after a thoughtful suggestion", () => {
    const last = `Something here.\n\n${PRESENCE_MODE_SUGGESTION_RACING_MIND}`;
    expect(isPresenceModeSuggestionOffer(last)).toBe(true);
    expect(isPresenceModeAcceptance("yes please", last)).toBe(true);
    expect(isPresenceModeAcceptance("sure", last)).toBe(true);
  });
});
