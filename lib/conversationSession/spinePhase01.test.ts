/**
 * @vitest-environment jsdom
 *
 * ConversationSession spine — Phase 0/1 identity, reset, projection guards.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearConversationSession,
  getOrCreateConversationSpine,
  getActiveSpineConversationId,
  projectionMatchesActiveSpine,
  resetConversationSessionMemoryForTests,
  CONVERSATION_STORE_CLASSIFICATION,
} from "@/lib/conversationSession";
import { resetActiveConversation } from "@/lib/conversationReset";
import {
  clearGeneralChatCertifiedRuntime,
  getGeneralChatCertifiedRuntime,
  saveGeneralChatCertifiedRuntime,
} from "@/lib/certifiedConversation/generalChatCertifiedState";
import { emptyTopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";
import {
  clearConversationOwner,
  CONVERSATION_OWNER_STORAGE_KEY,
  loadConversationOwnerPointer,
  setActiveConversationOwner,
} from "@/lib/conversationContinuity";
import {
  clearUniversalCreationSession,
  loadUniversalCreationSession,
  saveUniversalCreationSession,
} from "@/lib/universalCreation";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import {
  clearShariConversationThread,
  peekShariConversationThread,
  resolveShariConversationThread,
  storeShariConversationThread,
  type ShariConversationThread,
} from "@/lib/shariAnswerFirst/conversationContinuity";
import {
  clearIntentWorkflow,
  getIntentWorkflow,
  saveIntentWorkflow,
} from "@/lib/conversationStabilization/intentWorkflowStore";
import {
  clearActiveTopic,
  getActiveTopic,
  saveActiveTopic,
} from "@/lib/conversationStabilization/activeTopicStore";
import { buildConversationDecision } from "@/lib/conversationStabilization/conversationDecision";
import {
  beginTurnDecision,
  endTurnDecision,
  getActiveTurnDecision,
} from "@/lib/conversationStabilization/turnDecisionStore";
import {
  getSpineTurnGateForTests,
  markSpineTurnStarted,
  resetSpineTurnGateForTests,
} from "@/lib/conversationSession/spineInvariants";

function seedCieTopic(conversationId: string, topic: string) {
  saveGeneralChatCertifiedRuntime({
    conversationId,
    topicAnchor: {
      ...emptyTopicAnchor(),
      primaryTopic: topic,
    },
    cieState: null,
  });
}

function sampleUcSession(
  boundConversationId?: string,
): UniversalCreationSession {
  return {
    documentType: "email",
    phase: "discovery",
    confidence: {
      what: true,
      why: false,
      who: false,
      success: false,
      score: 25,
    },
    answers: { what: "client follow-up" },
    questionIndex: 0,
    originalUserText: "Help me write an email",
    startedAtTurn: 1,
    preparationReady: false,
    pendingEnhancements: [],
    ...(boundConversationId ? { boundConversationId } : {}),
  };
}

function sampleShariThread(conversationId: string): ShariConversationThread {
  return {
    id: "thread-1",
    conversationId,
    originalRequest: "How do I price my offer?",
    currentGoal: "pricing help",
    conversationMode: null,
    primaryHelpMode: "advice",
    lastAnswer: "Start with your costs and the outcome you sell.",
    topicKeywords: ["pricing"],
    memberContextNotes: [],
    assumptions: [],
    corrections: [],
    relevantContextKeys: [],
    updatedAt: new Date().toISOString(),
  };
}

describe("ConversationSession spine Phase 0", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearGeneralChatCertifiedRuntime();
    clearConversationOwner();
    clearUniversalCreationSession();
    clearShariConversationThread({ reason: "test_reset" });
    clearIntentWorkflow();
    clearActiveTopic();
    endTurnDecision();
    resetSpineTurnGateForTests();
  });

  it("exposes spine APIs and store classifications", () => {
    const spine = getOrCreateConversationSpine();
    expect(spine.conversationId).toBeTruthy();
    expect(getActiveSpineConversationId()).toBe(spine.conversationId);
    expect(CONVERSATION_STORE_CLASSIFICATION.messages).toBe("view");
    expect(CONVERSATION_STORE_CLASSIFICATION.continuityOwner).toBe(
      "projection",
    );
    expect(CONVERSATION_STORE_CLASSIFICATION.universalCreationSession).toBe(
      "adapter",
    );
    expect(CONVERSATION_STORE_CLASSIFICATION.turnAuthority).toBe("consumer");
  });

  it("projectionMatchesActiveSpine rejects foreign ids", () => {
    const spine = getOrCreateConversationSpine();
    expect(projectionMatchesActiveSpine(spine.conversationId)).toBe(true);
    expect(projectionMatchesActiveSpine("other-conversation")).toBe(false);
    expect(projectionMatchesActiveSpine(null)).toBe(false);
  });
});

describe("ConversationSession spine Phase 1 — reset + projections", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearGeneralChatCertifiedRuntime();
    clearConversationOwner();
    clearUniversalCreationSession();
    clearShariConversationThread({ reason: "test_reset" });
    clearIntentWorkflow();
    clearActiveTopic();
    endTurnDecision();
    resetSpineTurnGateForTests();
  });

  it("New Chat cannot retain prior CIE topic", () => {
    const prior = getOrCreateConversationSpine();
    seedCieTopic(prior.conversationId, "hiring a marketing assistant");
    expect(
      getGeneralChatCertifiedRuntime(prior.conversationId)?.topicAnchor
        ?.primaryTopic,
    ).toBe("hiring a marketing assistant");

    const result = resetActiveConversation({ mode: "new-chat" });
    expect(result.conversationId).not.toBe(prior.conversationId);
    expect(getGeneralChatCertifiedRuntime(result.conversationId)).toBeNull();
    expect(getGeneralChatCertifiedRuntime()).toBeNull();
  });

  it("New Day cannot retain prior CIE topic", () => {
    const prior = getOrCreateConversationSpine();
    seedCieTopic(prior.conversationId, "pricing my workshop");
    expect(
      getGeneralChatCertifiedRuntime(prior.conversationId)?.topicAnchor
        ?.primaryTopic,
    ).toBe("pricing my workshop");

    const result = resetActiveConversation({ mode: "new-day" });
    expect(result.conversationId).not.toBe(prior.conversationId);
    expect(getGeneralChatCertifiedRuntime(result.conversationId)).toBeNull();
    expect(getGeneralChatCertifiedRuntime()).toBeNull();
  });

  it("Shari help-thread from another conversation is ignored", () => {
    const active = getOrCreateConversationSpine();
    storeShariConversationThread(sampleShariThread("foreign-conversation-id"));
    expect(peekShariConversationThread()?.conversationId).toBe(
      "foreign-conversation-id",
    );

    const resolved = resolveShariConversationThread(active.conversationId);
    expect(resolved.thread).toBeNull();
    expect(resolved.staleRejected).toBe(true);
    expect(peekShariConversationThread()).toBeNull();
  });

  it("Continuity projection from another conversation is ignored", () => {
    const spineA = getOrCreateConversationSpine();
    setActiveConversationOwner({
      kind: "guided_workflow",
      workflowId: "uc:email:t1",
      workflowType: "email",
      currentStepId: "q:0",
      awaitingAnswer: true,
    });
    const pointer = loadConversationOwnerPointer();
    expect(pointer?.conversationId).toBe(spineA.conversationId);

    sessionStorage.setItem(
      CONVERSATION_OWNER_STORAGE_KEY,
      JSON.stringify({
        ...pointer!,
        conversationId: "foreign-conversation-id",
      }),
    );

    clearConversationSession();
    resetConversationSessionMemoryForTests();
    const spineB = getOrCreateConversationSpine();
    expect(spineB.conversationId).not.toBe(spineA.conversationId);
    expect(loadConversationOwnerPointer()).toBeNull();
  });

  it("UC projection from another conversation is ignored", () => {
    const spineA = getOrCreateConversationSpine();
    saveUniversalCreationSession(sampleUcSession(spineA.conversationId));
    expect(loadUniversalCreationSession()?.boundConversationId).toBe(
      spineA.conversationId,
    );

    clearConversationSession();
    resetConversationSessionMemoryForTests();
    const spineB = getOrCreateConversationSpine();
    expect(spineB.conversationId).not.toBe(spineA.conversationId);
    // Prior UC session remains in memory/storage but is foreign to spine B.
    expect(loadUniversalCreationSession()).toBeNull();
  });

  it("reset clears IntentWorkflow, ActiveTopic, and turn decisions", () => {
    getOrCreateConversationSpine();
    saveIntentWorkflow({
      interpretedGoal: "write a client email",
      artifactType: "email",
      classificationStatus: "not_applicable",
      context: { topic: "client email" },
      responseOwner: "shari",
      status: "active",
      startedAtTurn: 1,
      updatedAtTurn: 1,
    });
    saveActiveTopic({
      topicId: "t1",
      userGoal: "email draft",
      selectedKnowledgeSources: [],
      status: "identified",
      confidence: "high",
      responseOwner: "shari",
      startedAtTurn: 1,
      updatedAtTurn: 1,
    });
    beginTurnDecision(
      "turn-1",
      buildConversationDecision({ userText: "Help me write an email" }),
    );
    expect(getIntentWorkflow()).toBeTruthy();
    expect(getActiveTopic()).toBeTruthy();
    expect(getActiveTurnDecision()).toBeTruthy();

    resetActiveConversation({ mode: "new-chat" });

    expect(getIntentWorkflow()).toBeNull();
    expect(getActiveTopic()).toBeNull();
    expect(getActiveTurnDecision()).toBeNull();
  });

  it("marks spine turn started for invariant gate", () => {
    const spine = getOrCreateConversationSpine();
    markSpineTurnStarted(spine.conversationId);
    expect(getSpineTurnGateForTests().conversationId).toBe(spine.conversationId);
    expect(getSpineTurnGateForTests().turnConsumed).toBe(false);
    endTurnDecision();
    expect(getSpineTurnGateForTests().turnConsumed).toBe(true);
  });
});
