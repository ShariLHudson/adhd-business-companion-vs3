/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  messagesForFreshAiRequest,
  resetActiveConversation,
} from "@/lib/conversationReset";
import {
  clearConversation,
  getPrefs,
  loadConversation,
  saveConversation,
  savePrefs,
} from "@/lib/companionStore";
import {
  applyConversationSessionPatch,
  clearConversationSession,
  getOrCreateConversationSession,
  loadConversationSession,
  resetConversationSessionMemoryForTests,
} from "@/lib/conversationSession";
import {
  clearConversationOwner,
  loadConversationOwnerPointer,
  setActiveConversationOwner,
} from "@/lib/conversationContinuity";
import {
  __resetEstateMemoryCacheForTests,
  estateMemoryHintForChat,
  getEstateMemory,
  patchEstateMemory,
  resetEstateMemory,
} from "@/lib/estateMemory";
import { isEstateConversationThreadFresh } from "@/lib/estateMemory/clearConversationThread";

describe("resetActiveConversation — New Chat / New Day", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearConversation();
    clearConversationOwner();
    __resetEstateMemoryCacheForTests();
    resetEstateMemory();
    savePrefs({
      name: "Shari",
      hasChatted: true,
      hasSeenWelcomeIntro: true,
    });
  });

  function seedPriorConversation() {
    saveConversation([
      { role: "user", content: "Help me write an email to a client." },
      {
        role: "assistant",
        content: "Sure — what's the main point of the email?",
      },
    ]);
    const session = getOrCreateConversationSession();
    applyConversationSessionPatch({
      conversationHistory: [
        {
          role: "user",
          content: "Help me write an email to a client.",
          at: new Date().toISOString(),
        },
      ],
    });
    patchEstateMemory((mem) => ({
      ...mem,
      conversationDigest: [
        {
          role: "user",
          summary: "Writing a client email",
          at: new Date().toISOString(),
        },
        {
          role: "assistant",
          summary: "Asked for the main point",
          at: new Date().toISOString(),
        },
      ],
      activeJourney: {
        ...mem.activeJourney,
        activeTask: "draft client email",
      },
      momentumState: {
        ...mem.momentumState,
        unfinishedLoops: ["finish the email draft"],
      },
      userProfile: {
        goals: mem.userProfile.goals,
        preferences: ["Runs a coaching business"],
      },
    }));
    setActiveConversationOwner({
      kind: "guided_workflow",
      workflowId: "uc:email:t1",
      workflowType: "email",
      currentStepId: "q:0",
      awaitingAnswer: true,
    });
    return session.conversationId;
  }

  it("New Chat clears message storage and creates a new conversation id", () => {
    const oldId = seedPriorConversation();
    expect(loadConversation()?.length).toBe(2);

    const abort = new AbortController();
    const bump = vi.fn();
    const result = resetActiveConversation({
      mode: "new-chat",
      abortController: abort,
      bumpRequestGeneration: bump,
    });

    expect(bump).toHaveBeenCalledTimes(1);
    expect(abort.signal.aborted).toBe(true);
    expect(result.previousConversationId).toBe(oldId);
    expect(result.conversationId).toBeTruthy();
    expect(result.conversationId).not.toBe(oldId);
    expect(loadConversation()).toBeNull();
    expect(loadConversationSession()?.conversationId).toBe(
      result.conversationId,
    );
    expect(loadConversationOwnerPointer()).toBeNull();
  });

  it("clears hidden estate digest so the next AI hint cannot continue the prior thread", () => {
    seedPriorConversation();
    const beforeHint = estateMemoryHintForChat();
    expect(beforeHint).toMatch(/Recent conversation|Writing a client email/i);

    resetActiveConversation({ mode: "new-chat" });

    expect(getEstateMemory().conversationDigest).toEqual([]);
    expect(getEstateMemory().activeJourney.activeTask).toBeUndefined();
    expect(getEstateMemory().momentumState.unfinishedLoops).toEqual([]);
    expect(isEstateConversationThreadFresh()).toBe(true);

    const afterHint = estateMemoryHintForChat();
    expect(afterHint).toMatch(/FRESH CONVERSATION THREAD/i);
    expect(afterHint).not.toMatch(/Writing a client email/i);
    expect(afterHint).not.toMatch(/continue from here/i);
  });

  it("preserves approved long-term prefs while clearing temporary workflow state", () => {
    seedPriorConversation();
    resetActiveConversation({ mode: "new-day" });

    expect(getPrefs().name).toBe("Shari");
    expect(getPrefs().hasSeenWelcomeIntro).toBe(true);
    expect(getEstateMemory().userProfile.preferences).toContain(
      "Runs a coaching business",
    );
    expect(loadConversationSession()?.conversationHistory).toEqual([]);
  });

  it("New Day also rotates conversation id and clears prior messages", () => {
    const oldId = seedPriorConversation();
    const result = resetActiveConversation({ mode: "new-day" });
    expect(result.mode).toBe("new-day");
    expect(result.conversationId).not.toBe(oldId);
    expect(loadConversation()).toBeNull();
    expect(estateMemoryHintForChat()).toMatch(/FRESH CONVERSATION THREAD/i);
  });

  it("messagesForFreshAiRequest only keeps non-empty user/assistant turns", () => {
    expect(messagesForFreshAiRequest([])).toEqual([]);
    expect(
      messagesForFreshAiRequest([
        { role: "assistant", content: "" },
        { role: "user", content: "Hello" },
      ]),
    ).toEqual([{ role: "user", content: "Hello" }]);
  });

  it("refresh after New Chat does not restore prior conversation messages", () => {
    seedPriorConversation();
    resetActiveConversation({ mode: "new-chat" });
    expect(loadConversation()).toBeNull();

    resetConversationSessionMemoryForTests();
    __resetEstateMemoryCacheForTests();
    expect(loadConversation()).toBeNull();
    expect(isEstateConversationThreadFresh(getEstateMemory())).toBe(true);
  });
});
