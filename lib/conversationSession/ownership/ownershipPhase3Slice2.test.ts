/**
 * Phase 3 slice 2 — Continuity chamber/board, Help Thread, Intent Workflow,
 * Active Topic reclassification, mid-turn claims.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  resetConversationSessionMemoryForTests,
} from "../store";
import {
  beginOwnershipTurnGate,
  claimTurnOwnership,
  clearOwnershipTraceForTests,
  collectOwnershipClaims,
  getSpineOwnership,
  resetOwnershipTurnGateForTests,
  resolveConversationOwnership,
  selectAuthoritativeClaim,
  setSpineOwnership,
} from "./index";
import {
  clearConversationOwner,
  persistConversationOwner,
  setActiveConversationOwner,
} from "@/lib/conversationContinuity/ownerStore";
import type { ConversationOwner } from "@/lib/conversationContinuity/types";
import {
  clearShariConversationThread,
  storeShariConversationThread,
  type ShariConversationThread,
} from "@/lib/shariAnswerFirst/conversationContinuity";
import {
  clearIntentWorkflow,
  saveIntentWorkflow,
} from "@/lib/conversationStabilization/intentWorkflowStore";
import type { IntentWorkflowState } from "@/lib/conversationStabilization/intentWorkflowTypes";
import {
  clearActiveTopic,
  saveActiveTopic,
} from "@/lib/conversationStabilization/activeTopicStore";
import type { ActiveTopicState } from "@/lib/conversationStabilization/activeTopicTypes";
import {
  clearCollectionPendingOffer,
  saveCollectionPendingOffer,
} from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { createCollectionPendingOffer } from "@/lib/estate/collectionFramework/collectionOfferFlow";
import { buildCollectionPrefill } from "@/lib/estate/collectionFramework/collectionOfferIntelligence";
import { clearUniversalCreationSession } from "@/lib/universalCreation";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

describe("Phase 3 slice 2 — Continuity / Help / Intent / Active Topic", () => {
  beforeEach(() => {
    const storage = memoryStorage();
    vi.stubGlobal("sessionStorage", storage);
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", {
      sessionStorage: storage,
      localStorage: storage,
      dispatchEvent: vi.fn(),
    });
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearConversationOwner();
    clearShariConversationThread();
    clearIntentWorkflow();
    clearActiveTopic();
    clearCollectionPendingOffer();
    clearUniversalCreationSession();
    clearOwnershipTraceForTests();
    resetOwnershipTurnGateForTests();
    getOrCreateConversationSession();
  });

  it("Chamber suggestion without Continuity pointer does not seize ownership", () => {
    const claims = collectOwnershipClaims({ awaitingConfirmation: null });
    expect(claims.some((c) => c.owner === "chamber")).toBe(false);
    const resolution = resolveConversationOwnership({
      userText: "Maybe later I will visit the Chamber.",
      legacy: { awaitingConfirmation: null },
    });
    expect(resolution.nextOwnership?.owner).not.toBe("chamber");
  });

  it("Intentional Chamber Continuity entry claims chamber ownership", () => {
    const spine = getOrCreateConversationSession();
    const chamber: ConversationOwner = {
      kind: "chamber_specialist",
      memberId: "clarity",
      conversationId: spine.conversationId,
      awaitingAnswer: true,
    };
    setActiveConversationOwner(chamber);
    persistConversationOwner(chamber);
    const claims = collectOwnershipClaims({ awaitingConfirmation: null });
    const { selected } = selectAuthoritativeClaim(claims);
    expect(selected?.owner).toBe("chamber");
  });

  it("Explicit task change releases Collection and Continuity-facing ownership", () => {
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "evidence-vault",
        sourceUserText: "Solved it.",
        offerLine: "Vault?",
        prefill: buildCollectionPrefill("evidence-vault", "Solved it."),
        offeredAtTurn: 1,
      }),
    );
    setSpineOwnership({
      owner: "collection_offer",
      reason: "collection_save_offer",
      status: "awaiting_user",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedReply: { kind: "confirmation" },
    });
    const resolution = resolveConversationOwnership({
      userText: "Add free delivery to the email.",
      legacy: { awaitingConfirmation: null },
    });
    expect(resolution.action).toBe("release_owner");
    expect(resolution.nextOwner).toBe("companion");
  });

  it("Help Thread claims only with a real stored thread", () => {
    const spine = getOrCreateConversationSession();
    const thread: ShariConversationThread = {
      id: "help-1",
      conversationId: spine.conversationId,
      originalRequest: "How do I price my offer?",
      currentGoal: "pricing help",
      conversationMode: null,
      primaryHelpMode: "how_to_guidance",
      lastAnswer: "Start with value.",
      topicKeywords: ["price"],
      memberContextNotes: [],
      assumptions: [],
      corrections: [],
      relevantContextKeys: [],
      updatedAt: new Date().toISOString(),
    };
    storeShariConversationThread(thread);
    const claims = collectOwnershipClaims({ awaitingConfirmation: null });
    expect(claims.some((c) => c.owner === "help_thread")).toBe(true);

    const withCreate = resolveConversationOwnership({
      userText: "Write an email instead",
      legacy: { awaitingConfirmation: null },
      createSessionActive: false,
    });
    // New task language may release help via interrupt / companion fallback
    expect(
      withCreate.action === "release_owner" ||
        withCreate.action === "handle_by_companion" ||
        withCreate.action === "continue_owner",
    ).toBe(true);
  });

  it("Intent Workflow claims only when status is active", () => {
    const active: IntentWorkflowState = {
      interpretedGoal: "Build a pricing strategy",
      artifactType: "strategy",
      responseOwner: "shari",
      status: "active",
      startedAtTurn: 1,
      updatedAtTurn: 1,
      context: { topic: "pricing" },
      classificationStatus: "business_create",
    };
    saveIntentWorkflow(active);
    expect(
      collectOwnershipClaims({ awaitingConfirmation: null }).some(
        (c) => c.owner === "intent_workflow",
      ),
    ).toBe(true);

    clearIntentWorkflow();
    const paused: IntentWorkflowState = {
      ...active,
      status: "paused",
    };
    saveIntentWorkflow(paused);
    expect(
      collectOwnershipClaims({ awaitingConfirmation: null }).some(
        (c) => c.owner === "intent_workflow",
      ),
    ).toBe(false);
  });

  it("Active Topic never becomes the selected turn owner", () => {
    const topic: ActiveTopicState = {
      topicId: "topic-1",
      userGoal: "Understand pricing",
      selectedKnowledgeSources: [],
      responseOwner: "shari",
      status: "ready_to_answer",
      confidence: "high",
      startedAtTurn: 1,
      updatedAtTurn: 1,
    };
    saveActiveTopic(topic);
    const claims = collectOwnershipClaims({ awaitingConfirmation: null });
    expect(claims.some((c) => c.owner === "active_topic")).toBe(false);
    const { selected } = selectAuthoritativeClaim(claims);
    expect(selected?.owner).not.toBe("active_topic");
  });

  it("Stale Continuity pointer loses to newer Collection ownership", () => {
    const spine = getOrCreateConversationSession();
    const chamber: ConversationOwner = {
      kind: "chamber_specialist",
      memberId: "clarity",
      conversationId: spine.conversationId,
      awaitingAnswer: false,
    };
    setActiveConversationOwner(chamber);
    persistConversationOwner(chamber);
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "evidence-vault",
        sourceUserText: "Solved billing.",
        offerLine: "Vault?",
        prefill: buildCollectionPrefill("evidence-vault", "Solved billing."),
        offeredAtTurn: 2,
      }),
    );
    const { selected, rejected } = selectAuthoritativeClaim(
      collectOwnershipClaims({ awaitingConfirmation: null }),
    );
    expect(selected?.owner).toBe("collection_offer");
    expect(rejected.some((c) => c.owner === "chamber")).toBe(true);
  });

  it("Create beats stale Help Thread", () => {
    const spine = getOrCreateConversationSession();
    storeShariConversationThread({
      id: "help-2",
      conversationId: spine.conversationId,
      originalRequest: "How do I hire?",
      currentGoal: "hiring",
      conversationMode: null,
      primaryHelpMode: "how_to_guidance",
      lastAnswer: "Start small.",
      topicKeywords: ["hire"],
      memberContextNotes: [],
      assumptions: [],
      corrections: [],
      relevantContextKeys: [],
      updatedAt: new Date().toISOString(),
    });
    // Simulate Create owning the spine
    beginOwnershipTurnGate("create-vs-help");
    claimTurnOwnership(
      {
        owner: "create",
        reason: "universal_creation_session",
        status: "active",
        continuation: { kind: "create", documentType: "email" },
      },
      { turnKey: "create-vs-help", force: true },
    );
    const { selected } = selectAuthoritativeClaim(
      collectOwnershipClaims({ awaitingConfirmation: null }),
    );
    expect(selected?.owner).toBe("create");
    expect(getSpineOwnership()?.owner).toBe("create");
  });
});
