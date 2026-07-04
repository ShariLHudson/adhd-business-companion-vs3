import { describe, expect, it, beforeEach } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { shouldRouteThroughEstateKernel } from "./estateKernelGate";
import { isInformationalChatTurn } from "@/lib/chatFastPath/chatTurnGuarantee";
import { clearPendingEstatePlaceMenu } from "./estatePlaceNavigation";

describe("estateKernelGate", () => {
  beforeEach(() => {
    clearPendingEstatePlaceMenu();
  });
  it("routes estate navigation through the kernel", () => {
    const cases = [
      "What does the Coffee House look like?",
      "I'd like to visit the Observatory.",
      "Take me to the Library.",
      "Show me the Greenhouse.",
      "Let's go to the Conservatory.",
      "Take me to the pool.",
      "I'd like to visit the Study Hall.",
      "Show me the Personal Deck.",
      "Take me to the kitchen.",
      "Visit the Reading Nook.",
    ];
    for (const text of cases) {
      expect(shouldRouteThroughEstateKernel(text)).toBe(true);
    }
  });

  it("does not steal genuine how-to coaching turns", () => {
    expect(
      shouldRouteThroughEstateKernel("How do I write a proposal for a client?"),
    ).toBe(false);
    expect(isInformationalChatTurn("How do I write a proposal for a client?")).toBe(
      true,
    );
  });

  it("classifies navigation as NAVIGATE not CHAT", () => {
    const classified = classifyCompanionIntent({
      userText: "Take me to the Study Hall.",
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("NAVIGATE");
  });

  it("classifies ambiguous library navigation as place-menu (CHAT kind)", () => {
    const classified = classifyCompanionIntent({
      userText: "Take me to the Library.",
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("place-menu");
  });

  it("classifies look-like questions as NAVIGATE", () => {
    const classified = classifyCompanionIntent({
      userText: "What does the Coffee House look like?",
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("NAVIGATE");
  });

  it("classifies study hall and kitchen navigation as NAVIGATE", () => {
    for (const userText of [
      "Take me to the Study Hall.",
      "I'd like to visit the Momentum Room.",
      "Show me the kitchen.",
    ]) {
      const classified = classifyCompanionIntent({
        userText,
        lastAssistantText: null,
        currentPlaceId: null,
      });
      expect(classified.kind, userText).toBe("NAVIGATE");
    }
  });

  it("classifies ambiguous reading nook navigation as place-menu", () => {
    const classified = classifyCompanionIntent({
      userText: "Take me to the Reading Nook.",
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("place-menu");
  });

  it("implied need phrases stay in chat — frictionless IMPLIED_NEED handles them", () => {
    expect(shouldRouteThroughEstateKernel("I could use a cup of coffee.")).toBe(
      false,
    );
    expect(shouldRouteThroughEstateKernel("I need to clear my head.")).toBe(
      false,
    );
    const classified = classifyCompanionIntent({
      userText: "I could use a cup of coffee.",
      lastAssistantText: null,
      currentPlaceId: null,
    });
    expect(classified.kind).toBe("CHAT");
  });

  it("primary turn ownership can block kernel even for place-like text", () => {
    const relationship = classifyPrimaryConversationTurn({
      userText: "I hope you're having a good day.",
    });
    expect(
      shouldRouteThroughEstateKernel("Take me to the Library.", {
        primaryTurn: relationship,
      }),
    ).toBe(false);

    const implied = classifyPrimaryConversationTurn({
      userText: "I need a cup of coffee.",
    });
    expect(
      shouldRouteThroughEstateKernel("I need a cup of coffee.", {
        primaryTurn: implied,
      }),
    ).toBe(false);
  });
});
