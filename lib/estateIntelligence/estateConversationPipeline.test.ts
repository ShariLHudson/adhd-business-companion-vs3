import { describe, expect, it } from "vitest";
import {
  evaluateEstateConversationTurn,
  estateConversationHintForChat,
} from "./estateConversationPipeline";
import { matchEstateCapabilities } from "./estateMatcher";

const VALIDATION_PROMPTS: {
  text: string;
  entryId: string;
}[] = [
  { text: "I'm overwhelmed", entryId: "momentum-builder" },
  { text: "What is a peaceful place?", entryId: "peaceful-places" },
  { text: "I need to focus", entryId: "momentum-builder" },
  { text: "I want to create a workshop", entryId: "creative-studio" },
  { text: "I can't decide what to do", entryId: "decision-compass" },
  { text: "I want to research AI tools", entryId: "observatory" },
];

describe("Estate Conversation Pipeline™", () => {
  for (const { text, entryId } of VALIDATION_PROMPTS) {
    it(`routes "${text}" via unified pipeline`, () => {
      const turn = evaluateEstateConversationTurn({
        userText: text,
        activeSection: "home",
        welcomeHomePrimary: true,
        frostedChatContext: true,
      });
      expect(turn?.estate.bestMatch?.entry.id).toBe(entryId);
      expect(turn?.estateRoutingActive).toBe(true);
      expect(turn?.workspaceOffer?.section).toBeTruthy();
    });
  }

  it("includes behavioral rules in every hint", () => {
    const turn = evaluateEstateConversationTurn({
      userText: "I'm overwhelmed",
      activeSection: "home",
      welcomeHomePrimary: true,
      frostedChatContext: true,
      overwhelmed: true,
    });
    const hint = estateConversationHintForChat(turn, { overwhelmed: true });
    expect(hint).toContain("ESTATE BEHAVIORAL CONSISTENCY");
    expect(hint).toContain("NO ROOM EXPLANATIONS FIRST");
    expect(hint).toContain("WELCOME HOME ESTATE CONCIERGE");
  });

  it("evaluates Momentum Builder in-room without skipping estate layer", () => {
    const turn = evaluateEstateConversationTurn({
      userText: "I'm overwhelmed",
      activeSection: "momentum-builder",
      frostedChatContext: true,
      overwhelmed: true,
    });
    expect(turn?.estate.suppressed).toBe(true);
    const hint = estateConversationHintForChat(turn, {
      inRoomHint: "MOMENTUM BUILDER™ ROOM",
    });
    expect(hint).toContain("ESTATE IN-ROOM");
    expect(hint).toContain("MOMENTUM BUILDER™ ROOM");
    expect(hint).not.toContain("This is Momentum Builder");
  });

  it("matcher stays single source for focus intent", () => {
    const matches = matchEstateCapabilities({ userText: "I need to focus" });
    expect(matches[0]?.entry.id).toBe("momentum-builder");
  });
});
