/**
 * @vitest-environment jsdom
 *
 * CB-007 New Chat & Context Isolation — production reset ownership.
 * Visible greeting voice: CB-015 (`NEW_CONVERSATION_GREETING`).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  messagesForFreshAiRequest,
  resetActiveConversation,
} from "@/lib/conversationReset";
import {
  clearConversation,
  getLastActivity,
  getPrefs,
  loadConversation,
  saveConversation,
  savePrefs,
  setLastActivity,
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
import {
  clearStashedConversation,
  loadStashedConversation,
  stashConversationBeforeHandoff,
} from "@/lib/conversationHandoffRecovery";
import {
  beginContextualHelpSession,
  discardContextualHelpSession,
  getContextualHelpSession,
  resetContextualHelpSessionForTests,
} from "@/lib/conversationReset/contextualHelpSession";
import {
  hasActivePendingChoice,
  registerPendingChoice,
} from "@/lib/pendingChoice/manager";
import { resolvePendingChoiceTurn } from "@/lib/pendingChoice/resolve";
import {
  readCompanionConversationState,
  writeCompanionConversationState,
} from "@/lib/companionConversationContext/store";
import {
  loadDiscoverySession,
  saveDiscoverySession,
} from "@/lib/estateBrain/discoveryMode";
import type { DiscoverySession } from "@/lib/estateBrain/discoveryTypes";
import {
  loadImpliedNeedSession,
  saveImpliedNeedSession,
} from "@/lib/intentAwareConversation/impliedNeedSession";
import {
  loadFrictionFirstSession,
  saveFrictionFirstSession,
} from "@/lib/sparkCompanion/frictionFirst/frictionFirstSession";
import {
  getOutcomeThread,
  patchOutcomeThread,
} from "@/lib/companionOutcomeThread";
import {
  loadActiveTaskLockState,
  saveActiveTaskLockState,
} from "@/lib/estate/activeTaskLock";
import {
  loadCollectionPendingOffer,
  saveCollectionPendingOffer,
} from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { NEW_CONVERSATION_GREETING } from "@/lib/freshStartCopy";
import { resolveCompanionContinue } from "@/lib/companionLedContinue";
import { CONTINUITY_STORAGE_KEYS } from "@/lib/continuityManifest";

describe("resetActiveConversation — New Chat / New Day", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearConversation();
    clearConversationOwner();
    clearStashedConversation();
    resetContextualHelpSessionForTests();
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

  it("New Chat clears handoff stash so prior threads cannot silently restore", () => {
    seedPriorConversation();
    stashConversationBeforeHandoff([
      { role: "user", content: "Draft the client email." },
      { role: "assistant", content: "Here is a draft…" },
    ]);
    expect(loadStashedConversation()?.messages.length).toBe(2);

    resetActiveConversation({ mode: "new-chat" });

    expect(loadStashedConversation()).toBeNull();
  });

  it("New Day discards contextual Help without restoring the suspended thread", () => {
    seedPriorConversation();
    beginContextualHelpSession({
      currentMessages: [
        { role: "user", content: "Help me write an email to a client." },
        {
          role: "assistant",
          content: "Sure — what's the main point of the email?",
        },
      ],
      place: { roomEntryId: "welcome-home", question: "How do I start?" },
    });
    expect(getContextualHelpSession()?.active).toBe(true);

    resetActiveConversation({ mode: "new-day" });

    expect(getContextualHelpSession()).toBeNull();
    expect(loadConversation()).toBeNull();
  });

  it("discardContextualHelpSession does not restore suspended messages", () => {
    beginContextualHelpSession({
      currentMessages: [
        { role: "user", content: "Old thread" },
        { role: "assistant", content: "Old reply" },
      ],
      place: { question: "Help?" },
    });
    expect(discardContextualHelpSession()).toBe(true);
    expect(getContextualHelpSession()).toBeNull();
    expect(loadConversation()).toBeNull();
  });

  function seedTemporaryIsolationVectors() {
    registerPendingChoice({
      type: "estate_place",
      choices: [
        {
          id: "reflection-pond",
          label: "Reflection Pond",
          callback: { kind: "navigate_place", placeId: "reflection-pond" },
        },
        {
          id: "personal-library",
          label: "Personal Library",
          callback: { kind: "navigate_place", placeId: "personal-library" },
        },
        {
          id: "conservatory",
          label: "Ocean Conservatory",
          callback: { kind: "navigate_place", placeId: "conservatory" },
        },
      ],
      menuText:
        "1. Reflection Pond\n2. Personal Library\n3. Ocean Conservatory",
    });
    writeCompanionConversationState({
      lastDiscussedEntity: {
        kind: "feature",
        id: "proposal",
        displayName: "the proposal",
        answeredAtTurn: 4,
      },
      lastUserGoal: "create",
      currentTopic: "proposal draft",
      pendingAction: {
        type: "estate_navigate",
        placeId: "possibility-house",
        priorAssistantQuestion: "Want to head to Possibility House?",
        originalReason: "create offer",
        offeredAtTurn: 4,
        expiresAtTurn: 99,
      },
      updatedAtTurn: 5,
    });
    const discovery: DiscoverySession = {
      topic: "research",
      confidence: {
        goal: true,
        obstacle: false,
        outcome: false,
        context: false,
        score: 0.25,
      },
      answers: {},
      questionIndex: 0,
      originalUserText: "research the proposal",
      startedAtTurn: 1,
    };
    saveDiscoverySession(discovery);
    saveImpliedNeedSession({
      matchKey: "overwhelm",
      primaryPlaceId: "clear-my-mind",
      choices: [],
      offeredAtTurn: 2,
    });
    saveFrictionFirstSession({
      domain: "writing",
      focusSituation: "want_focus_cant",
      barrierIds: ["task_too_big", "dont_know_start"],
      offeredAtTurn: 2,
      originalUserText: "I have too much to do with the proposal",
    });
    patchOutcomeThread({
      currentProject: "the proposal",
      currentGoal: "finish the proposal",
      pendingQuestion: "Want to keep going on the proposal?",
    });
    setLastActivity({
      kind: "chat",
      title: "Working on the proposal",
      summary: "Drafting the proposal",
    });
    saveActiveTaskLockState({
      activeTask: {
        id: "task-proposal",
        kind: "draft",
        topic: "the proposal",
        status: "working",
        openedAtTurn: 1,
        lastTouchedTurn: 3,
        sourceUserText: "draft the proposal",
      },
      routingSuppressedUntilTurn: 10,
    });
    saveCollectionPendingOffer({
      phase: "room_suggested",
      sourceUserText: "save the proposal notes",
      suggestedRoomId: "evidence-vault",
      prefill: { title: "Proposal notes", body: "notes" },
      offeredAtTurn: 3,
      offerLine: "Want to keep this in the Evidence Vault?",
      savedAt: new Date().toISOString(),
    });
  }

  it("CB-007: after New Chat, numbered 3 does not resolve the prior destination menu", () => {
    seedPriorConversation();
    seedTemporaryIsolationVectors();
    expect(hasActivePendingChoice()).toBe(true);

    const before = resolvePendingChoiceTurn("3");
    expect(before.kind).toBe("resolved");
    if (before.kind === "resolved") {
      expect(before.choice.id).toBe("conservatory");
    }

    // Re-seed pending after the resolve above consumed it, then New Chat.
    seedTemporaryIsolationVectors();
    resetActiveConversation({ mode: "new-chat" });

    expect(hasActivePendingChoice()).toBe(false);
    const after = resolvePendingChoiceTurn("3");
    expect(after.kind).toBe("none");
  });

  it("CB-007: named pending choice after New Chat does not resolve", () => {
    seedTemporaryIsolationVectors();
    resetActiveConversation({ mode: "new-chat" });
    expect(resolvePendingChoiceTurn("Ocean Conservatory").kind).toBe("none");
    expect(resolvePendingChoiceTurn("the third one").kind).toBe("none");
  });

  it("CB-007: clears companion context, discovery, and other temp workflow state", () => {
    seedTemporaryIsolationVectors();
    resetActiveConversation({ mode: "new-chat" });

    const ctx = readCompanionConversationState();
    expect(ctx.lastDiscussedEntity).toBeNull();
    expect(ctx.lastUserGoal).toBeNull();
    expect(ctx.pendingAction).toBeNull();
    expect(ctx.currentTopic).toBeNull();

    expect(loadDiscoverySession()).toBeNull();
    expect(loadImpliedNeedSession()).toBeNull();
    expect(loadFrictionFirstSession()).toBeNull();
    expect(getOutcomeThread()).toBeNull();
    expect(getLastActivity()).toBeNull();
    expect(loadActiveTaskLockState().activeTask).toBeNull();
    expect(loadCollectionPendingOffer()).toBeNull();
  });

  it("CB-007: preserves prefs, rhythms, reminders, and saved-for-later evidence", () => {
    seedPriorConversation();
    localStorage.setItem(
      "companion-rhythms-v1",
      JSON.stringify([{ id: "r1", title: "Morning planning" }]),
    );
    localStorage.setItem(
      "companion-reminders-v1",
      JSON.stringify([{ id: "rem1", title: "Call Pat" }]),
    );
    localStorage.setItem(
      CONTINUITY_STORAGE_KEYS.createSavedForLater,
      JSON.stringify({
        workflowId: "uc:email:saved",
        lastUpdated: new Date().toISOString(),
        collectedAnswers: { topic: "Client follow-up" },
      }),
    );

    resetActiveConversation({ mode: "new-chat" });

    expect(getPrefs().name).toBe("Shari");
    expect(localStorage.getItem("companion-rhythms-v1")).toContain(
      "Morning planning",
    );
    expect(localStorage.getItem("companion-reminders-v1")).toContain("Call Pat");
    expect(
      localStorage.getItem(CONTINUITY_STORAGE_KEYS.createSavedForLater),
    ).toContain("Client follow-up");
  });

  it("CB-007: Continue can still find saved work evidence without chat last-activity", () => {
    setLastActivity({
      kind: "chat",
      title: "Working on the proposal",
      summary: "Temporary chat cue",
    });
    localStorage.setItem(
      CONTINUITY_STORAGE_KEYS.createSavedForLater,
      JSON.stringify({
        workflowId: "uc:email:saved",
        lastUpdated: new Date().toISOString(),
        itemType: "email",
        collectedAnswers: { topic: "Client follow-up" },
        status: "saved_for_later",
      }),
    );

    resetActiveConversation({ mode: "new-chat" });
    expect(getLastActivity()).toBeNull();

    // Saved-for-later evidence remains; Continue must not require chat last-activity.
    expect(
      localStorage.getItem(CONTINUITY_STORAGE_KEYS.createSavedForLater),
    ).toBeTruthy();
    const continueResult = resolveCompanionContinue();
    // empty/onboarding/choose/single are all valid; must not invent proposal from last activity
    if (continueResult.mode === "single") {
      expect(continueResult.option.title).not.toMatch(/proposal/i);
    }
    if (continueResult.mode === "choose") {
      expect(
        continueResult.options.some((o) => /proposal/i.test(o.title)),
      ).toBe(false);
    }
  });

  it("CB-007: New Chat greeting complies with CB-015 (no reset/session jargon)", () => {
    expect(NEW_CONVERSATION_GREETING).toMatch(/Fresh start/i);
    expect(NEW_CONVERSATION_GREETING).not.toMatch(
      /reset|session|workflow|pending|conversationId|cleared/i,
    );
  });

  it("CB-007: New Day and New Chat both clear temporary state", () => {
    seedTemporaryIsolationVectors();
    resetActiveConversation({ mode: "new-day" });
    expect(hasActivePendingChoice()).toBe(false);
    expect(readCompanionConversationState().lastDiscussedEntity).toBeNull();
    expect(getOutcomeThread()).toBeNull();

    seedTemporaryIsolationVectors();
    const chat = resetActiveConversation({ mode: "new-chat" });
    expect(chat.mode).toBe("new-chat");
    expect(hasActivePendingChoice()).toBe(false);
  });
});
