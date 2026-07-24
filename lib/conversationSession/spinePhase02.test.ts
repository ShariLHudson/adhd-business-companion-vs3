/**
 * @vitest-environment jsdom
 *
 * ConversationSession spine — Phase 2 transcript authority & dual-write.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  appendConversationSpineTurn,
  clearConversationSession,
  getOrCreateConversationSpine,
  getSpineTranscriptMessages,
  resetConversationSessionMemoryForTests,
  syncCompanionViewMessagesToSpine,
} from "@/lib/conversationSession";
import { resetActiveConversation } from "@/lib/conversationReset";
import {
  certifyCompanionDelivery,
  clearGeneralChatCertifiedRuntime,
} from "@/lib/certifiedConversation";
import { emptyTopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";
import {
  getGeneralChatCertifiedRuntime,
  saveGeneralChatCertifiedRuntime,
} from "@/lib/certifiedConversation/generalChatCertifiedState";

describe("ConversationSession spine Phase 2 — transcript authority", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearGeneralChatCertifiedRuntime();
  });

  it("every user turn appends to ConversationSession", () => {
    const spine = getOrCreateConversationSpine();
    appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "user",
      text: "Should I hire a marketing assistant?",
      source: "test",
    });
    const history = getSpineTranscriptMessages(spine.conversationId);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({
      role: "user",
      content: "Should I hire a marketing assistant?",
    });
  });

  it("every assistant turn appends to ConversationSession", () => {
    const spine = getOrCreateConversationSpine();
    appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "user",
      text: "Help me price my offer",
    });
    appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "assistant",
      text: "Start with the outcome you sell and your costs.",
    });
    const history = getSpineTranscriptMessages(spine.conversationId);
    expect(history).toHaveLength(2);
    expect(history[1]?.role).toBe("assistant");
    expect(history[1]?.content).toMatch(/outcome/i);
  });

  it("view dual-write sync appends committed turns to the spine", () => {
    const spine = getOrCreateConversationSpine();
    syncCompanionViewMessagesToSpine(
      [],
      [
        { role: "user", content: "Write a short email" },
        { role: "assistant", content: "Who is it for?" },
      ],
    );
    expect(getSpineTranscriptMessages(spine.conversationId)).toEqual([
      { role: "user", content: "Write a short email" },
      { role: "assistant", content: "Who is it for?" },
    ]);
  });

  it("certifyCompanionDelivery reads the same transcript ConversationSession stores", () => {
    const spine = getOrCreateConversationSpine();
    appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "user",
      text: "Should I hire a marketing assistant?",
    });
    appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "assistant",
      text: "What would this person take off your plate first?",
    });
    appendConversationSpineTurn({
      conversationId: spine.conversationId,
      role: "user",
      text: "Lead generation and follow-up.",
    });

    const spineTranscript = getSpineTranscriptMessages(spine.conversationId);
    // Stale / empty view must not win — cert should use spine.
    const certified = certifyCompanionDelivery({
      conversationId: spine.conversationId,
      userText: "Lead generation and follow-up.",
      draftText:
        "Lead generation and follow-up is a solid first scope for a marketing assistant.",
      messages: [{ role: "user", content: "unrelated stale view" }],
      owner: "chat_api",
    });

    expect(certified.certified).toBe(true);
    expect(certified.text.trim().length).toBeGreaterThan(0);
    expect(getSpineTranscriptMessages(spine.conversationId)).toEqual(
      spineTranscript,
    );
    // Runtime stays bound to this conversation's spine id.
    expect(
      getGeneralChatCertifiedRuntime(spine.conversationId)?.conversationId,
    ).toBe(spine.conversationId);
  });

  it("New Chat starts an empty transcript", () => {
    const prior = getOrCreateConversationSpine();
    appendConversationSpineTurn({
      conversationId: prior.conversationId,
      role: "user",
      text: "Hiring a marketing assistant",
    });
    appendConversationSpineTurn({
      conversationId: prior.conversationId,
      role: "assistant",
      text: "Let's map the role.",
    });
    saveGeneralChatCertifiedRuntime({
      conversationId: prior.conversationId,
      topicAnchor: {
        ...emptyTopicAnchor(),
        primaryTopic: "hiring a marketing assistant",
      },
      cieState: null,
    });

    const result = resetActiveConversation({ mode: "new-chat" });
    expect(result.conversationId).not.toBe(prior.conversationId);
    expect(getSpineTranscriptMessages(result.conversationId)).toEqual([]);
    expect(getGeneralChatCertifiedRuntime(result.conversationId)).toBeNull();
  });

  it("New Day starts an empty transcript and never restores the old one", () => {
    const prior = getOrCreateConversationSpine();
    appendConversationSpineTurn({
      conversationId: prior.conversationId,
      role: "user",
      text: "Old day hiring topic",
    });
    const result = resetActiveConversation({ mode: "new-day" });
    expect(getSpineTranscriptMessages(result.conversationId)).toEqual([]);
    expect(
      getSpineTranscriptMessages(result.conversationId).some((m) =>
        m.content.toLowerCase().includes("hiring"),
      ),
    ).toBe(false);
  });
});
