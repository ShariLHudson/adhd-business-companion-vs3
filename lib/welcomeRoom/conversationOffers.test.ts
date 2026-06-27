import { describe, expect, it } from "vitest";
import {
  isWelcomeRoomConversation,
  welcomeRoomWorkspaceOffer,
} from "./conversationOffers";

describe("welcomeRoom conversation offers", () => {
  it("detects story and identity questions", () => {
    expect(isWelcomeRoomConversation("Who are you?")).toBe(true);
    expect(isWelcomeRoomConversation("Why did you build this?")).toBe(true);
    expect(isWelcomeRoomConversation("Help me write an email")).toBe(false);
  });

  it("returns a gentle workspace offer", () => {
    const offer = welcomeRoomWorkspaceOffer("Tell me about yourself");
    expect(offer?.section).toBe("welcome-room");
    expect(offer?.buttonLabel).toMatch(/Welcome Room/i);
  });
});
