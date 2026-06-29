import { describe, expect, it } from "vitest";
import {
  FOCUS_AUDIO_OFFER_KEY,
  isConversationOfferDeclined,
  toolSuggestionDeclineKey,
  workspaceOfferDeclineKey,
} from "./declinedOffers";
import type { ToolSuggestion } from "@/lib/companionToolSuggestions";

describe("declinedOffers", () => {
  it("maps peaceful places tool suggestions to focus-audio", () => {
    const offer = {
      kind: "focus-session",
      action: { type: "tool", tool: "focus-audio" },
    } as ToolSuggestion;
    expect(toolSuggestionDeclineKey(offer)).toBe(FOCUS_AUDIO_OFFER_KEY);
  });

  it("tracks workspace focus-audio by section", () => {
    expect(
      workspaceOfferDeclineKey({
        section: "focus-audio",
        buttonLabel: "Open Peaceful Places",
        line: "test",
      }),
    ).toBe("focus-audio");
  });

  it("remembers declined keys in conversation scope", () => {
    const declined = new Set<string>([FOCUS_AUDIO_OFFER_KEY]);
    expect(isConversationOfferDeclined(declined, FOCUS_AUDIO_OFFER_KEY)).toBe(
      true,
    );
    expect(isConversationOfferDeclined(declined, "breathe")).toBe(false);
  });
});
