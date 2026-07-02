import { describe, expect, it } from "vitest";
import { resolveWelcomeHomeChatPrompt } from "./chatPrompt";
import { WELCOME_HOME_SHARI_QUESTION } from "./content";
import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";

function stubArrival(
  partial: Partial<ArrivalIntelligence>,
): ArrivalIntelligence {
  return {
    homeState: "returning",
    chrome: {
      autoFocusInput: false,
      conversationInput: true,
      showSidebar: true,
      showTopBar: true,
    },
    visitorKind: "returning",
    greetingStrategy: "contextual",
    openingMessage: "Good morning.",
    greetingHeadline: "Good morning.",
    greetingBody: "I'm glad you're here. What would help most today?",
    welcomeLine: null,
    inviteQuestion: null,
    headline: null,
    uiEmphasis: "conversation",
    chatPlaceholder: "Tell me what you're thinking…",
    conversationalTone: "warm",
    continue: { kind: "none" },
    narrativeContext: { kind: "none" },
    suggestedAction: "none",
    contextualButtonLabel: null,
    showContinueList: false,
    returnIntervalHours: null,
    returnIntervalDays: null,
    isFirstMeeting: false,
    sessionVisitIndex: 1,
    timeOfDay: "morning",
    homesteadTime: "morning",
    livingHome: {} as ArrivalIntelligence["livingHome"],
    welcomePresence: null,
    livingRoom: null,
    littleSpark: null,
    ...partial,
  };
}

describe("resolveWelcomeHomeChatPrompt", () => {
  it("prefers greeting body over time-of-day headline", () => {
    const line = resolveWelcomeHomeChatPrompt(
      stubArrival({
        greetingHeadline: "Good morning.",
        greetingBody: "I'm glad you're here. What would help most today?",
      }),
    );
    expect(line).toBe("I'm glad you're here. What would help most today?");
    expect(line).not.toMatch(/^good morning/i);
  });

  it("falls back to the default question", () => {
    expect(resolveWelcomeHomeChatPrompt(null)).toBe(WELCOME_HOME_SHARI_QUESTION);
  });
});
