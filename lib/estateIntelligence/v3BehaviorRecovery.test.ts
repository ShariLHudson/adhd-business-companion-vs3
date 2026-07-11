import { describe, expect, it } from "vitest";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { evaluateEstateConversationTurn } from "./estateConversationPipeline";
import {
  mergeWorkspaceOfferSecondary,
  resolveEstateAwareWorkspaceOffer,
} from "./v3BehaviorRecovery";

const PROMPTS = [
  { text: "What is a peaceful place?", entryId: "peaceful-places" },
  { text: "I'm overwhelmed.", entryId: "momentum-builder" },
  { text: "I need to clear my thoughts.", entryId: "clear-my-mind" },
  { text: "I can't decide what to do first.", entryId: "decision-compass" },
  { text: "I want to research AI tools.", entryId: "observatory" },
  { text: "Help me create a workshop.", entryId: "creative-studio" },
] as const;

describe("V3 behavior recovery — routing regression", () => {
  for (const { text, entryId } of PROMPTS) {
    it(`estate routes "${text}" to ${entryId}`, () => {
      const turn = evaluateEstateConversationTurn({
        userText: text,
        activeSection: "home",
        welcomeHomePrimary: true,
        frostedChatContext: true,
        overwhelmed: /\boverwhelm/i.test(text),
      });
      expect(turn?.estate.bestMatch?.entry.id).toBe(entryId);
      expect(turn?.workspaceOffer?.section).toBeTruthy();
    });
  }

  it("estate offer wins over stayInConversation gating (v3 regression)", () => {
    const text = "I can't decide what to do first.";
    const turn = evaluateEstateConversationTurn({
      userText: text,
      activeSection: "home",
      welcomeHomePrimary: true,
      frostedChatContext: true,
    });
    const intent = resolveIntentRouting({ userText: text });
    const offer = resolveEstateAwareWorkspaceOffer({
      routingBlocked: false,
      estateTurn: turn,
      turnIntentRouting: intent,
      doingIntentOffer: null,
      stayInConversation: true,
    });
    expect(offer?.section).toBe("decision-compass");
  });

  it("v3 intent routing fallback when estate confidence is low", () => {
    const text = "I need content ideas for LinkedIn";
    const turn = evaluateEstateConversationTurn({
      userText: text,
      activeSection: "home",
      welcomeHomePrimary: true,
      frostedChatContext: true,
    });
    const intent = resolveIntentRouting({ userText: text });
    const offer = resolveEstateAwareWorkspaceOffer({
      routingBlocked: false,
      estateTurn: turn,
      turnIntentRouting: intent,
      doingIntentOffer: null,
      stayInConversation: false,
    });
    expect(turn?.estateRoutingActive).toBeFalsy();
    expect(offer?.section).toBeTruthy();
  });

  it("merges v3 secondary workspace offer when estate has none", () => {
    const primary = {
      section: "momentum-builder" as const,
      buttonLabel: "Step into Momentum Builder",
      line: "Let's make today easier.",
    };
    const intent = resolveIntentRouting({
      userText: "I'm overwhelmed and my head is full",
      overwhelmed: true,
    });
    const merged = mergeWorkspaceOfferSecondary(primary, intent);
    if (intent.secondaryWorkspaceOffer) {
      expect(merged.secondary?.section).toBe(intent.secondaryWorkspaceOffer.section);
    }
  });
});
