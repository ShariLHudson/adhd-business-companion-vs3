import { describe, expect, it } from "vitest";
import {
  buildContextualChatFallback,
  buildRuntimeRecoveryResponse,
  classifyCoachingFallbackKind,
} from "@/lib/sparkConversation/coachingFallback";
import { conversationRecentlyShowedRecovery } from "@/lib/chatFastPath/recoveryDedup";
import { resolveChatFailureReply } from "@/lib/chatFastPath/resolveChatFailureReply";

describe("conversation recovery", () => {
  it("uses development continuation for app frustration without generic coaching", () => {
    const reply = buildContextualChatFallback({
      userText: "I just want this app to work.",
    });
    expect(classifyCoachingFallbackKind("I just want this app to work.")).toBe(
      "development_frustration",
    );
    expect(reply).toMatch(/estate|behave|breaking/i);
    expect(reply).not.toMatch(/what feels most true/i);
  });

  it("runtime recovery includes the tangled lead once", () => {
    const reply = buildRuntimeRecoveryResponse({
      userText: "I just want this app to work.",
    });
    expect(reply).toMatch(/something got tangled/i);
    expect(reply).toMatch(/estate|behave|breaking/i);
  });

  it("does not stack recovery lead on consecutive failures", () => {
    const messages = [
      { role: "user", content: "Take me to the library." },
      {
        role: "assistant",
        content:
          "Something got tangled for a second, but I'm still here. You were working on getting the Estate to behave — let's stay with that.",
      },
      { role: "user", content: "I just want this app to work." },
    ];
    expect(conversationRecentlyShowedRecovery(messages)).toBe(true);
    const reply = resolveChatFailureReply({
      err: new Error("companion-chat-timeout"),
      userText: "I just want this app to work.",
      messages,
    });
    expect(reply).toBeNull();
  });

  it("runtime recovery uses one line for generic failures", () => {
    const reply = buildRuntimeRecoveryResponse({
      userText: "hello",
    });
    expect(reply).toBe(
      "Something got tangled for a second, but I'm still here.",
    );
    expect(reply).not.toContain("tell me what you need");
  });

  it("runtime recovery does not stack bridge navigation fallback", () => {
    const reply = buildRuntimeRecoveryResponse({
      userText: "Can we go to the library?",
    });
    expect(reply).toBe(
      "Something got tangled for a second, but I'm still here.",
    );
    expect(reply).not.toMatch(/name where you'd like to be/i);
  });
});
