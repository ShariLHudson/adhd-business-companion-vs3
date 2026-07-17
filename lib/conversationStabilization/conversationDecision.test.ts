/**
 * Phase A — Conversation Decision contract + scenic/breathe permissions.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mayOfferScenicPlaceSuggestions } from "@/lib/estate/scenicPlaceSuggestionPolicy";
import { classifyCompanionIntent } from "@/lib/companionTurn";
import {
  authorizeBreatheAutoOpen,
  authorizeScenicPlaceMenu,
  buildConversationDecision,
  mayAutoOpenBreathe,
  mayFinishWithScenicMenu,
  mayKernelOfferPlaceMenu,
} from "./conversationDecision";
import { endTurnDecision } from "./turnDecisionStore";

describe("conversationDecision — Phase A contract", () => {
  beforeEach(() => {
    endTurnDecision();
    if (typeof window !== "undefined") {
      window.__sparkConversationDecisionLog = [];
    }
  });
  afterEach(() => {
    endTurnDecision();
  });

  it("project overwhelm → task help mode, scenic denied", () => {
    const text = "I'm overwhelmed trying to finish this project.";
    const d = buildConversationDecision({ userText: text });
    expect(d.emotionalCondition).toBe("task_breakdown");
    expect(d.scenicMenuPermission).toBe("denied");
    expect(mayFinishWithScenicMenu(d)).toBe(false);
    expect(authorizeScenicPlaceMenu(text)).toBe(false);
    expect(mayOfferScenicPlaceSuggestions(text)).toBe(false);
  });

  it("bare overwhelm → scenic denied, breathe auto denied", () => {
    const text = "I'm overwhelmed today.";
    const d = buildConversationDecision({ userText: text });
    expect(d.scenicMenuPermission).toBe("denied");
    expect(d.breatheAutoOpenPermission).toBe("denied");
    expect(mayAutoOpenBreathe(d)).toBe(false);
    expect(authorizeBreatheAutoOpen(text)).toBe(false);
  });

  it("cognitive overload → scenic denied", () => {
    const text = "I have too much on my brain to remember it all.";
    expect(authorizeScenicPlaceMenu(text)).toBe(false);
    expect(mayOfferScenicPlaceSuggestions(text)).toBe(false);
  });

  it("laundry / dryer → scenic denied; kernel place-menu becomes chat", () => {
    const text =
      "i have to fold and put away some laundry but its still in the dryer from this morning";
    expect(authorizeScenicPlaceMenu(text)).toBe(false);
    const classified = classifyCompanionIntent({ userText: text });
    expect(classified.plan.type).not.toBe("place-menu");
  });

  it("explicit somewhere peaceful → scenic allowed", () => {
    const text = "Take me somewhere peaceful.";
    const d = buildConversationDecision({ userText: text });
    expect(authorizeScenicPlaceMenu(text)).toBe(true);
    expect(mayFinishWithScenicMenu(d)).toBe(true);
    expect(mayKernelOfferPlaceMenu(d)).toBe(true);
    expect(d.responseMode).toBe("navigate_explicitly");
  });

  it("explicit breathe → auto-open allowed; calm me down is not", () => {
    expect(authorizeBreatheAutoOpen("Help me breathe")).toBe(true);
    expect(authorizeBreatheAutoOpen("I need to calm down")).toBe(false);
  });

  it("casual update stays natural_conversation", () => {
    const d = buildConversationDecision({
      userText: "The appointment went well today.",
    });
    expect(d.responseMode).toBe("natural_conversation");
    expect(d.scenicMenuPermission).toBe("denied");
  });
});
