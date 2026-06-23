import { describe, expect, it } from "vitest";
import {
  adaptMyDayOfferLine,
  isAdaptMyDayIntent,
} from "./adaptMyDayChatRouting";
import { assistantOfferedConsent } from "./conversationWorkflowContinuation";

describe("adaptMyDayChatRouting", () => {
  it("detects sluggish morning mismatch", () => {
    expect(
      isAdaptMyDayIntent(
        "I felt great last night but this morning I feel sluggish",
      ),
    ).toBe(true);
  });

  it("offer line is a consent question", () => {
    const line = adaptMyDayOfferLine();
    expect(assistantOfferedConsent(line)).toBe(true);
  });
});
