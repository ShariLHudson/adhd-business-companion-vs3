/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  beginContextualHelpSession,
  contextualHelpMemoryHintForChat,
  endContextualHelpSession,
  getContextualHelpSession,
  isContextualHelpSessionActive,
  recoverContextualHelpSessionAfterRefresh,
  resetContextualHelpSessionForTests,
} from "@/lib/conversationReset/contextualHelpSession";
import {
  clearConversation,
  getPrefs,
  loadConversation,
  saveConversation,
  savePrefs,
} from "@/lib/companionStore";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  loadConversationSession,
  resetConversationSessionMemoryForTests,
} from "@/lib/conversationSession";
import {
  __resetEstateMemoryCacheForTests,
  estateMemoryHintForChat,
  getEstateMemory,
  patchEstateMemory,
  resetEstateMemory,
} from "@/lib/estateMemory";
import { openGuidedFieldHelpChat } from "@/lib/profile/openGuidedFieldHelpChat";
import type { GuidedFieldHelpRequest } from "@/lib/profile/guidedFieldTypes";

const YESTERDAY_DIGEST = {
  role: "user" as const,
  summary: "Yesterday we planned the launch email.",
  at: "2026-07-14T12:00:00.000Z",
};

const OLD_MESSAGES = [
  { role: "user" as const, content: "Yesterday I wanted help with my launch." },
  {
    role: "assistant" as const,
    content: "Sure — let's pick up your launch email.",
  },
];

function seedOldConversation() {
  saveConversation(OLD_MESSAGES);
  const session = getOrCreateConversationSession();
  patchEstateMemory((mem) => ({
    ...mem,
    currentRoom: {
      entryId: "identity-office",
      section: "home",
      enteredAt: new Date().toISOString(),
    },
    conversationDigest: [YESTERDAY_DIGEST],
    activeJourney: {
      ...mem.activeJourney,
      activeTask: "Finish launch email",
      intentChain: ["launch"],
      pendingEntryIds: [],
      steps: mem.activeJourney.steps,
    },
    momentumState: {
      ...mem.momentumState,
      unfinishedLoops: ["launch-email-draft"],
    },
  }));
  return session;
}

describe("contextual help session — isolates Ask Shari for Help", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearConversation();
    resetContextualHelpSessionForTests();
    __resetEstateMemoryCacheForTests();
    resetEstateMemory();
    savePrefs({
      name: "Shari",
      hasChatted: true,
      hasSeenWelcomeIntro: true,
    });
  });

  it("creates a new help conversation ID and drops old messages + digest", () => {
    const prior = seedOldConversation();
    expect(loadConversation()?.length).toBe(2);
    expect(getEstateMemory().conversationDigest).toHaveLength(1);

    const begun = beginContextualHelpSession({
      currentMessages: OLD_MESSAGES,
      place: {
        roomEntryId: "identity-office",
        sectionId: "identity",
        fieldPath: "identity.mission",
        stepOrField: "mission",
        question: "What is your mission?",
      },
    });

    expect(begun.helpConversationId).toBeTruthy();
    expect(begun.helpConversationId).not.toBe(prior.conversationId);
    expect(begun.previousConversationId).toBe(prior.conversationId);
    expect(isContextualHelpSessionActive()).toBe(true);
    expect(loadConversation()).toBeNull();
    expect(getEstateMemory().conversationDigest).toEqual([]);
    expect(getEstateMemory().activeJourney.activeTask).toBeUndefined();
    expect(getEstateMemory().momentumState.unfinishedLoops).toEqual([]);

    const liveSession = loadConversationSession();
    expect(liveSession?.conversationId).toBe(begun.helpConversationId);

    const hint = estateMemoryHintForChat();
    expect(hint).toMatch(/CONTEXTUAL HELP SESSION/i);
    expect(hint).toMatch(/identity-office/);
    expect(hint).toMatch(/identity\.mission/);
    expect(hint).not.toMatch(/Yesterday we planned the launch email/);
    expect(hint).not.toMatch(/Recent conversation/);

    // Profile / prefs preserved
    expect(getPrefs().name).toBe("Shari");
    expect(getEstateMemory().currentRoom?.entryId).toBe("identity-office");
  });

  it("keeps place context in the help hint and omits old digest on refresh", () => {
    seedOldConversation();
    const first = beginContextualHelpSession({
      currentMessages: OLD_MESSAGES,
      place: {
        roomEntryId: "offer-suite",
        sectionId: "offers",
        fieldPath: "offers.mainOffer",
        stepOrField: "mainOffer",
      },
    });

    const recovered = recoverContextualHelpSessionAfterRefresh();
    expect(recovered).not.toBeNull();
    expect(recovered!.helpConversationId).not.toBe(first.helpConversationId);
    expect(isContextualHelpSessionActive()).toBe(true);

    const suspended = getContextualHelpSession()?.suspended;
    expect(suspended?.messages).toEqual(OLD_MESSAGES);
    expect(suspended?.conversationDigest).toEqual([YESTERDAY_DIGEST]);

    // Live help memory still has no yesterday digest
    expect(getEstateMemory().conversationDigest).toEqual([]);
    const hint = contextualHelpMemoryHintForChat();
    expect(hint).toMatch(/offer-suite/);
    expect(hint).toMatch(/offers\.mainOffer/);
    expect(hint).not.toMatch(/Yesterday/);
  });

  it("restores the prior conversation and place when Help closes", () => {
    const prior = seedOldConversation();
    beginContextualHelpSession({
      currentMessages: OLD_MESSAGES,
      place: {
        roomEntryId: "identity-office",
        sectionId: "identity",
        fieldPath: "identity.mission",
      },
    });

    // Help thread can accumulate its own messages without destroying the snapshot
    saveConversation([
      { role: "user", content: "Help me with this mission field." },
      { role: "assistant", content: "Happy to help with your mission." },
    ]);

    const ended = endContextualHelpSession();
    expect(ended).not.toBeNull();
    expect(ended!.restoredMessages).toEqual(OLD_MESSAGES);
    expect(ended!.conversationId).toBe(prior.conversationId);
    expect(isContextualHelpSessionActive()).toBe(false);

    expect(loadConversationSession()?.conversationId).toBe(prior.conversationId);
    expect(getEstateMemory().conversationDigest).toEqual([YESTERDAY_DIGEST]);
    expect(getEstateMemory().activeJourney.activeTask).toBe("Finish launch email");
    expect(getEstateMemory().currentRoom?.entryId).toBe("identity-office");
    expect(getPrefs().name).toBe("Shari");
  });

  it("openGuidedFieldHelpChat begins a fresh session before welcome messages", () => {
    seedOldConversation();
    const welcomeMessages: string[] = [];
    let helpConversationId: string | null = null;

    const detail: GuidedFieldHelpRequest = {
      sectionId: "work-style",
      fieldKey: "decisionStyle",
      fieldPath: "work-style.decisionStyle",
      helpMode: "help_me_develop",
      currentValue: "",
      approvedBusinessContext: {},
      relatedFieldValues: {},
      question: "How do you make decisions?",
    };

    openGuidedFieldHelpChat(detail, {
      beginFreshHelpSession: () => {
        const begun = beginContextualHelpSession({
          currentMessages: OLD_MESSAGES,
          place: {
            roomEntryId: "working-style-study",
            sectionId: detail.sectionId,
            fieldPath: detail.fieldPath,
            stepOrField: detail.fieldKey,
            question: detail.question,
          },
        });
        helpConversationId = begun.helpConversationId;
      },
      openChat: () => {
        /* stay in place — overlay only */
      },
      appendAssistantWelcome: (text) => {
        welcomeMessages.push(text);
      },
      sendMemberOpener: () => {
        /* opener would go to fresh thread */
      },
    });

    expect(helpConversationId).toBeTruthy();
    expect(welcomeMessages).toHaveLength(1);
    expect(getEstateMemory().conversationDigest).toEqual([]);
    expect(estateMemoryHintForChat()).not.toMatch(/Yesterday/);
    expect(getContextualHelpSession()?.place.sectionId).toBe("work-style");
  });
});
