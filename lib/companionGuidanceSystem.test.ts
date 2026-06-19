import { describe, expect, it } from "vitest";

import {
  buildPrefillSummaryMessage,
  companionGuidanceHintForChat,
  detectResearchWorkspaceConnection,
  extractConversationPrefill,
  learningToDoingHint,
  shouldOfferConversationPrefill,
  toolTeachingHint,
} from "./companionGuidanceSystem";

describe("companionGuidanceSystem", () => {
  it("detects audience research → Client Avatar offer", () => {
    const match = detectResearchWorkspaceConnection(
      "Help me understand ADHD entrepreneurs who run service businesses",
      null,
    );
    expect(match?.section).toBe("client-avatars");
    expect(match?.offerLine).toMatch(/Client Avatar/i);
  });

  it("does not offer when Client Avatar already open", () => {
    expect(
      detectResearchWorkspaceConnection(
        "Help me understand my ideal client",
        "client-avatars",
      ),
    ).toBeNull();
  });

  it("detects prefill-ready phrasing", () => {
    expect(
      shouldOfferConversationPrefill(
        "I think I have enough information to build my client avatar",
      ),
    ).toBe(true);
  });

  it("extracts avatar prefills only when chat supplies field content", () => {
    const fills = extractConversationPrefill(
      [
        {
          role: "assistant",
          content: "Tell me about the person you help most often.",
        },
        {
          role: "user",
          content:
            "ADHD entrepreneurs who struggle with marketing need clarity and simple systems.",
        },
      ],
      "client-avatars",
    );
    expect(fills.length).toBeGreaterThan(0);
    expect(fills[0]?.field).toBe("avatar-who");
  });

  it("does not prefill avatar from help-seeking I-help phrasing alone", () => {
    const fills = extractConversationPrefill(
      [
        {
          role: "assistant",
          content: "Tell me about the person you help most often.",
        },
        {
          role: "user",
          content: "I help ADHD entrepreneurs who struggle with marketing.",
        },
      ],
      "client-avatars",
    );
    expect(fills.length).toBe(0);
  });

  it("builds prefill summary message", () => {
    const msg = buildPrefillSummaryMessage("client-avatars", [
      { field: "avatar-who", value: "ADHD entrepreneurs", label: "Who they are" },
    ]);
    expect(msg).toMatch(/already pulled/i);
    expect(msg).toMatch(/ADHD entrepreneurs/);
  });

  it("bridges teaching to workspace", () => {
    const hint = learningToDoingHint("Teach me about client avatars", "");
    expect(hint).toMatch(/Client Avatar/i);
  });

  it("includes spin wheel tool teaching", () => {
    expect(toolTeachingHint("How do I use Spin The Wheel?")).toMatch(
      /Spin The Wheel/i,
    );
  });

  it("guidance hint includes core rules and completion when workspace open", () => {
    const hint = companionGuidanceHintForChat({
      workspacePanel: "client-avatars",
      userText: "They struggle with marketing",
    });
    expect(hint).toMatch(/NO DUPLICATE QUESTIONS/i);
    expect(hint).toMatch(/COMPLETION/i);
  });
});
