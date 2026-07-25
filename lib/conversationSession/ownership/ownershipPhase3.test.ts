/**
 * Phase 3 — Conversation ownership migration tests.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  resetConversationSessionMemoryForTests,
} from "../store";
import {
  applyOwnershipResolution,
  beginOwnershipTurnGate,
  beginSpineOwnership,
  claimTurnOwnership,
  clearOwnershipTraceForTests,
  clearSpineOwnership,
  collectOwnershipClaims,
  getOwnershipTraceForTests,
  getOwnershipTurnGateForTests,
  getSpineOwnership,
  mayRecoverCollectionPendingFromAssistant,
  resetOwnershipTurnGateForTests,
  resolveConversationOwnership,
  selectAuthoritativeClaim,
} from "./index";
import {
  clearCollectionPendingOffer,
  saveCollectionPendingOffer,
} from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { createCollectionPendingOffer } from "@/lib/estate/collectionFramework/collectionOfferFlow";
import { buildCollectionPrefill } from "@/lib/estate/collectionFramework/collectionOfferIntelligence";
import {
  clearWinSavePending,
  createWinSavePending,
  saveWinSavePending,
} from "@/lib/estate/winSavePending";
import { clearUniversalCreationSession } from "@/lib/universalCreation";
import { clearFrictionlessPending } from "@/lib/frictionlessActionLayer";
import type { AwaitingUserConfirmationState } from "@/lib/conversationConfirmationGate";

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

const awaiting: AwaitingUserConfirmationState = {
  active: true,
  kind: "general",
  assistantPrompt: "Would you like to preserve it?",
  offeredAtTurn: 2,
};

describe("Phase 3 ownership", () => {
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
    clearCollectionPendingOffer();
    clearWinSavePending();
    clearUniversalCreationSession();
    clearFrictionlessPending();
    clearOwnershipTraceForTests();
    resetOwnershipTurnGateForTests();
    getOrCreateConversationSession();
  });

  it("Test 1 — single-owner guarantee with conflicting legacy states", () => {
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "evidence-vault",
        sourceUserText: "Solved a hard client problem today.",
        offerLine: "Preserve in Evidence Vault?",
        prefill: buildCollectionPrefill(
          "evidence-vault",
          "Solved a hard client problem today.",
        ),
        offeredAtTurn: 2,
      }),
    );
    saveWinSavePending(
      createWinSavePending({ seedText: "A win", offeredAtTurn: 2 }),
    );
    beginSpineOwnership({
      owner: "companion",
      reason: "stale_companion",
      status: "active",
    });

    const claims = collectOwnershipClaims({ awaitingConfirmation: awaiting });
    const { selected, rejected } = selectAuthoritativeClaim(claims);
    expect(selected).not.toBeNull();
    // Collection is the workflow owner; confirmation is expectedReply, not a rival.
    expect(selected!.owner).toBe("collection_offer");
    expect(selected!.expectedReply?.kind).toMatch(/confirmation|choice/);
    expect(
      claims.filter((c) => c.owner === "confirmation").length,
    ).toBe(0);
    expect(rejected.length).toBeGreaterThan(0);
  });

  it("Test 2 — explicit task override releases collection ownership", () => {
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "evidence-vault",
        sourceUserText: "Solved it.",
        offerLine: "Vault?",
        prefill: buildCollectionPrefill("evidence-vault", "Solved it."),
        offeredAtTurn: 3,
      }),
    );
    beginSpineOwnership({
      owner: "collection_offer",
      reason: "collection_save_offer",
      status: "awaiting_user",
      expectedReply: { kind: "confirmation" },
    });

    const resolution = resolveConversationOwnership({
      userText: "Add free delivery to the email.",
      legacy: { awaitingConfirmation: awaiting },
      createSessionActive: false,
    });
    expect(resolution.action).toBe("release_owner");
    expect(resolution.cleanup).toEqual(
      expect.arrayContaining(["confirmation", "collection", "win_save"]),
    );

    applyOwnershipResolution(resolution, {
      clearAwaitingConfirmation: () => undefined,
      currentTurn: 4,
    });
    expect(getSpineOwnership()?.owner).toBe("companion");
  });

  it("Test 3 — correction with create stays on create", () => {
    beginSpineOwnership({
      owner: "create",
      reason: "universal_creation_session",
      status: "active",
      continuation: { kind: "create", documentType: "email", phase: "draft" },
    });
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "journal",
        sourceUserText: "note",
        offerLine: "Journal?",
        prefill: buildCollectionPrefill("journal", "note"),
        offeredAtTurn: 1,
      }),
    );

    const resolution = resolveConversationOwnership({
      userText: "Actually I meant rewrite the newsletter instead",
      legacy: { awaitingConfirmation: awaiting },
      createSessionActive: true,
    });
    expect(["repair_owner", "transfer_owner"]).toContain(resolution.action);
    expect(resolution.nextOwner).toBe("create");
    expect(resolution.cleanup).toEqual(
      expect.arrayContaining(["confirmation", "collection"]),
    );
    expect(resolution.cleanup).not.toContain("create");
  });

  it("Test 4 — decline releases confirmation family", () => {
    for (const decline of ["No", "Not now", "cancel this", "4"]) {
      clearCollectionPendingOffer();
      clearWinSavePending();
      clearOwnershipTraceForTests();
      saveWinSavePending(
        createWinSavePending({ seedText: "Win", offeredAtTurn: 1 }),
      );
      beginSpineOwnership({
        owner: "collection_offer",
        reason: "hall_win_save_offer",
        status: "awaiting_user",
        expectedReply: { kind: "choice" },
      });

      const resolution = resolveConversationOwnership({
        userText: decline,
        legacy: { awaitingConfirmation: awaiting },
      });
      if (decline === "4" || decline === "Not now" || decline === "No") {
        expect(resolution.action).toBe("release_owner");
        applyOwnershipResolution(resolution, { currentTurn: 2 });
        expect(getSpineOwnership()?.owner).toBe("companion");
      } else {
        // cancel this — owner exit path
        expect(resolution.action).toBe("release_owner");
      }
    }
  });

  it("Test 5 — completion releases to companion", () => {
    beginSpineOwnership({
      owner: "collection_offer",
      reason: "collection_save_offer",
      status: "awaiting_user",
    });
    clearSpineOwnership("completed_open");
    const ownership = getSpineOwnership();
    expect(ownership?.owner).toBe("none");
    expect(ownership?.status).toBe("completed");
  });

  it("Test 6 — suggestion does not seize control without acceptance", () => {
    beginSpineOwnership({
      owner: "companion",
      reason: "companion_fallback",
      status: "active",
    });
    // Mentions alone — no pending offer, no awaiting confirmation.
    const claims = collectOwnershipClaims({ awaitingConfirmation: null });
    const { selected } = selectAuthoritativeClaim(claims);
    expect(selected?.owner === "collection_offer").toBe(false);
    const resolution = resolveConversationOwnership({
      userText: "Tell me more about the Evidence Vault someday.",
      legacy: { awaitingConfirmation: null },
    });
    expect(
      resolution.action === "handle_by_companion" ||
        resolution.action === "continue_owner",
    ).toBe(true);
    expect(resolution.nextOwnership?.owner).not.toBe("collection_offer");
  });

  it("Test 7 — accepted transfer writes collection ownership", () => {
    beginSpineOwnership({
      owner: "collection_offer",
      reason: "evidence_vault_offer",
      status: "awaiting_user",
      destinationId: "evidence-vault",
      expectedReply: { kind: "confirmation" },
    });
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "evidence-vault",
        sourceUserText: "Solved billing with a client.",
        offerLine: "Preserve?",
        prefill: buildCollectionPrefill(
          "evidence-vault",
          "Solved billing with a client.",
        ),
        offeredAtTurn: 5,
      }),
    );
    const resolution = resolveConversationOwnership({
      userText: "yes",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(resolution.action).toBe("continue_owner");
    expect(["confirmation", "collection_offer"]).toContain(
      resolution.currentOwner,
    );
  });

  it("Test 10 — recovery compatibility is guarded", () => {
    // No spine ownership → cannot revive.
    expect(
      mayRecoverCollectionPendingFromAssistant({
        userText: "yes",
        lastAssistantLooksLikeOffer: true,
        isConfirmationReply: true,
      }).allow,
    ).toBe(false);

    beginSpineOwnership({
      owner: "companion",
      reason: "confirmation_decline",
      status: "active",
    });
    expect(
      mayRecoverCollectionPendingFromAssistant({
        userText: "yes",
        lastAssistantLooksLikeOffer: true,
        isConfirmationReply: true,
      }).allow,
    ).toBe(false);

    beginSpineOwnership({
      owner: "collection_offer",
      reason: "collection_save_offer",
      status: "awaiting_user",
      expectedReply: { kind: "confirmation" },
    });
    expect(
      mayRecoverCollectionPendingFromAssistant({
        userText: "yes",
        lastAssistantLooksLikeOffer: true,
        isConfirmationReply: true,
        turnsSinceOffer: 0,
      }).allow,
    ).toBe(true);

    expect(
      mayRecoverCollectionPendingFromAssistant({
        userText: "yes",
        lastAssistantLooksLikeOffer: true,
        isConfirmationReply: true,
        turnsSinceOffer: 9,
      }).allow,
    ).toBe(false);
  });

  it("Part 4 — mid-turn claim API allows one claim per turn", () => {
    beginOwnershipTurnGate("turn-mid-1");
    const first = claimTurnOwnership(
      {
        owner: "collection_offer",
        reason: "collection_save_offer",
        status: "awaiting_user",
        expectedReply: { kind: "confirmation" },
        sourceTurnId: "t1",
      },
      { turnKey: "turn-mid-1" },
    );
    expect(first.ok).toBe(true);
    const second = claimTurnOwnership(
      {
        owner: "create",
        reason: "create_hijack_attempt",
        status: "active",
        sourceTurnId: "t1",
      },
      { turnKey: "turn-mid-1" },
    );
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.reason).toMatch(/already_claimed/);
    }
    expect(getSpineOwnership()?.owner).toBe("collection_offer");
    expect(getOwnershipTurnGateForTests()?.claimedBy).toBe("collection_offer");
  });

  it("Test 11 — diagnostics record rejected claims", () => {
    saveCollectionPendingOffer(
      createCollectionPendingOffer({
        roomId: "evidence-vault",
        sourceUserText: "Solved it.",
        offerLine: "Vault?",
        prefill: buildCollectionPrefill("evidence-vault", "Solved it."),
        offeredAtTurn: 1,
      }),
    );
    const claims = collectOwnershipClaims({ awaitingConfirmation: awaiting });
    const resolution = resolveConversationOwnership({
      userText: "No",
      legacy: { awaitingConfirmation: awaiting },
    });
    applyOwnershipResolution(
      resolution,
      { currentTurn: 2 },
      {
        ownerBefore: "confirmation",
        claims: claims.map((c) => ({
          owner: c.owner,
          source: c.source,
          priority: c.priority,
        })),
      },
    );
    const trace = getOwnershipTraceForTests();
    expect(trace.length).toBeGreaterThan(0);
    expect(trace[trace.length - 1]!.action).toBe("release_owner");
    expect(trace[trace.length - 1]!.reason).toMatch(/decline|release/i);
  });
});
