/**
 * Routing gate tests — relationship conversation vs celebration intent
 */

import { describe, expect, it } from "vitest";
import { evaluateCollectionSaveOffer } from "@/lib/estate/collectionFramework/collectionOfferIntelligence";
import {
  hasHighConfidenceCelebrationIntent,
  isRelationshipConversation,
  memberIsAskingToDoSomething,
  routingGateHintForChat,
} from "./routingGate";

describe("routingGate", () => {
  it("detects relationship conversation — good day wish", () => {
    expect(isRelationshipConversation("I hope you're having a good day.")).toBe(
      true,
    );
    expect(memberIsAskingToDoSomething("I hope you're having a good day.")).toBe(
      false,
    );
  });

  it("detects relationship greetings", () => {
    expect(isRelationshipConversation("Good morning")).toBe(true);
    expect(isRelationshipConversation("Thank you")).toBe(true);
    expect(isRelationshipConversation("You're doing a great job")).toBe(true);
  });

  it("does not treat positive sentiment as celebration", () => {
    expect(
      hasHighConfidenceCelebrationIntent("I hope you're having a good day."),
    ).toBe(false);
  });

  it("requires high confidence for real celebration", () => {
    expect(hasHighConfidenceCelebrationIntent("I want to celebrate this win")).toBe(
      true,
    );
    expect(
      hasHighConfidenceCelebrationIntent("I finished my book and shipped it today"),
    ).toBe(true);
    expect(hasHighConfidenceCelebrationIntent("That was a good meeting")).toBe(
      false,
    );
  });

  it("emits relationship hint without workspace routing", () => {
    const hint = routingGateHintForChat("I hope you're having a good day.");
    expect(hint).toMatch(/RELATIONSHIP CONVERSATION/i);
    expect(hint).toMatch(/NO routing/i);
    expect(hint).not.toMatch(/Would you like to celebrate/i);
  });

  it("blocks collection offer for friendly good-day message", () => {
    const offer = evaluateCollectionSaveOffer({
      userText: "I hope you're having a good day.",
      currentTurn: 5,
    });
    expect(offer).toBeNull();
  });

  it("still offers celebration garden for explicit wins", () => {
    const offer = evaluateCollectionSaveOffer({
      userText:
        "I finally shipped the landing page today and it actually went well.",
      currentTurn: 8,
    });
    expect(offer?.roomId).toBe("celebration-garden");
  });
});
