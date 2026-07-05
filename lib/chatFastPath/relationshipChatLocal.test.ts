import { describe, expect, it } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import {
  relationshipConversationLocalReply,
  shouldCompleteRelationshipChatLocally,
} from "./relationshipChatLocal";

describe("relationshipChatLocal", () => {
  it("routes good-day wish through local relationship completion", () => {
    const text = "I hope you are having a good day.";
    const decision = classifyPrimaryConversationTurn({ userText: text });
    expect(decision.type).toBe("RELATIONSHIP_CHAT");
    expect(decision.confidence).toBe("high");
    expect(shouldCompleteRelationshipChatLocally(decision, text)).toBe(true);
    expect(relationshipConversationLocalReply(text)).toMatch(/kind|thank/i);
  });

  it("completes casual how-are-you locally without API", () => {
    const text = "not much how are you today";
    const decision = classifyPrimaryConversationTurn({ userText: text });
    expect(decision.type).toBe("RELATIONSHIP_CHAT");
    expect(decision.confidence).toBe("high");
    expect(shouldCompleteRelationshipChatLocally(decision, text)).toBe(true);
    const reply = relationshipConversationLocalReply(text);
    expect(reply).toMatch(/good|thanks for asking/i);
    expect(reply).not.toMatch(/tell me what you need/i);
  });

  it("completes how-about-you check-in locally without high classifier confidence", () => {
    const text = "not much. how about you";
    const decision = classifyPrimaryConversationTurn({ userText: text });
    expect(shouldCompleteRelationshipChatLocally(decision, text)).toBe(true);
    const reply = relationshipConversationLocalReply(text);
    expect(reply).toMatch(/good|thanks for asking|quiet/i);
    expect(reply).not.toMatch(/tell me what you need/i);
  });

  it("does not local-complete low-confidence relationship turns", () => {
    const decision = classifyPrimaryConversationTurn({
      userText: "maybe we could talk later",
    });
    if (decision.confidence === "high") return;
    expect(shouldCompleteRelationshipChatLocally(decision, "maybe we could talk later")).toBe(
      false,
    );
  });
});
