import { describe, expect, it } from "vitest";
import {
  buildCoachingFallbackResponse,
  buildContextualChatFallback,
  buildRuntimeRecoveryResponse,
} from "@/lib/sparkConversation/coachingFallback";
import {
  BRIDGE_CONTINUATION_LINE,
  BRIDGE_RESPONDER_DISABLED,
  isBridgeContinuationResponse,
  PICK_UP_CONTINUATION_LINE,
  responseOwnershipBlocksBridge,
} from "@/lib/sparkConversation/bridgeResponderGuard";
import { buildFailSafeChatReply } from "@/lib/chatFastPath/chatTurnGuarantee";
import { resolveChatFailureReply } from "@/lib/chatFastPath/resolveChatFailureReply";

const BLOCKED_CASES = [
  {
    label: "meta frustration",
    userText: "Why do you keep asking me that?",
    mustMatch: /don't want to keep circling|right to call that out/i,
  },
  {
    label: "chat development priority",
    userText:
      "What feels most important is to make sure my chat works well in this app.",
    mustMatch: /chat work|behav|breaking|priority/i,
  },
  {
    label: "board room navigation",
    userText: "i have a meeting in the board room",
    mustMatch: /board room|where you'd like|still with you/i,
  },
  {
    label: "marketing strategy work",
    userText: "i need help developing a marketing strategy",
    mustMatch: /marketing strategy|first piece|stay on that/i,
  },
  {
    label: "lakeside wish",
    userText: "i want to sit by the lake",
    mustMatch: /where you'd like|still with you|lake/i,
  },
] as const;

function assertNeverBridge(reply: string) {
  expect(BRIDGE_RESPONDER_DISABLED).toBe(true);
  expect(isBridgeContinuationResponse(reply)).toBe(false);
  expect(reply).not.toContain(BRIDGE_CONTINUATION_LINE);
  expect(reply).not.toContain(PICK_UP_CONTINUATION_LINE);
  expect(reply).not.toMatch(/keep going from there/i);
  expect(reply).not.toMatch(/pick up from what we were working on/i);
}

describe("bridge responder disabled", () => {
  it.each(BLOCKED_CASES)(
    "$label — contextual fallback never returns bridge line",
    ({ userText, mustMatch }) => {
      const reply = buildContextualChatFallback({
        userText,
        priorUserText: "some earlier unrelated topic about lunch",
        lastAssistantText: "Tell me more about that.",
      });
      assertNeverBridge(reply);
      expect(reply).toMatch(mustMatch);
    },
  );

  it.each(BLOCKED_CASES)(
    "$label — coaching fallback with memory never returns bridge line",
    ({ userText, mustMatch }) => {
      const reply = buildCoachingFallbackResponse(userText, {
        priorUserText: "we were talking about something else entirely",
        lastAssistantText: "What would help most?",
      });
      assertNeverBridge(reply);
      expect(reply).toMatch(mustMatch);
    },
  );

  it.each(BLOCKED_CASES)(
    "$label — fail-safe reply never returns bridge line",
    ({ userText, mustMatch }) => {
      const reply = buildFailSafeChatReply(
        userText,
        {
          priorUserText: "earlier message",
          lastAssistantText: "assistant line",
        },
        [
          { role: "user", content: "earlier message" },
          {
            role: "assistant",
            content:
              "Something got tangled for a second, but I'm still here.",
          },
          { role: "user", content: userText },
        ],
      );
      assertNeverBridge(reply);
      expect(reply).toMatch(mustMatch);
    },
  );

  it("runtime recovery may include tangled lead but never bridge continuation", () => {
    const reply = buildRuntimeRecoveryResponse({
      userText: "Why do you keep asking me that?",
      priorUserText: "old topic",
    });
    expect(reply).toMatch(/something got tangled/i);
    assertNeverBridge(reply);
  });

  it("response ownership blocks bridge from replacing a valid assistant reply", () => {
    expect(
      responseOwnershipBlocksBridge(
        "Here's a thoughtful answer about your marketing plan.",
      ),
    ).toBe(true);
    expect(
      responseOwnershipBlocksBridge(
        "Something got tangled for a second, but I'm still here.",
      ),
    ).toBe(false);
  });

  it("resolveChatFailureReply returns null when ownership blocks replacement", () => {
    const reply = resolveChatFailureReply({
      err: new Error("timeout"),
      userText: "Why do you keep asking me that?",
      messages: [
        { role: "user", content: "hello" },
        {
          role: "assistant",
          content: "I already answered your question about the board room.",
        },
        { role: "user", content: "Why do you keep asking me that?" },
      ],
    });
    expect(reply).toBeNull();
  });

  it("list-making turn — never pick-up bridge; offers to write the list", () => {
    const reply = buildContextualChatFallback({
      userText: "i need to write the list right now",
      priorUserText:
        "i have a lot in my head and need to make a list of things i need to do so i don't forget",
      lastAssistantText: "When would you like me to remind you?",
    });
    assertNeverBridge(reply);
    expect(reply).toMatch(/write it now|first thing|list/i);
  });
});
