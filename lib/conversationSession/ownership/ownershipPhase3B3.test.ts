/**
 * Phase 3.1B — B3 observer / navigation gating.
 * On a bound confirmation-acceptance turn the active owner continues and
 * competing observers / frictionless navigation are skipped. The gate reads the
 * resolver RESULT (isBoundConfirmationAcceptance) — never raw user text — so an
 * unowned short reply is never globally suppressed.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  resetConversationSessionMemoryForTests,
} from "../store";
import {
  beginSpineOwnership,
  clearOwnershipTraceForTests,
  isBoundConfirmationAcceptance,
  resetOwnershipTurnGateForTests,
  resolveConversationOwnership,
} from "./index";
import { clearCollectionPendingOffer } from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { clearWinSavePending } from "@/lib/estate/winSavePending";
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
  assistantPrompt: "Want to build one?",
  offeredAtTurn: 2,
};

function armFreeFormConfirmation() {
  beginSpineOwnership({
    owner: "confirmation",
    reason: "free_form_assistant_offer",
    status: "awaiting_user",
    expectedReply: { kind: "confirmation" },
  });
}

describe("Phase 3.1B — B3 observer/navigation gating", () => {
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

  it("1 — free-form offer + 'yes' gates observers (stays with owner)", () => {
    armFreeFormConfirmation();
    const r = resolveConversationOwnership({
      userText: "yes",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(r.action).toBe("continue_owner");
    expect(isBoundConfirmationAcceptance(r)).toBe(true);
  });

  it("2 — free-form offer + 'go' gates observers (stays with owner)", () => {
    armFreeFormConfirmation();
    const r = resolveConversationOwnership({
      userText: "go",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(r.action).toBe("continue_owner");
    expect(isBoundConfirmationAcceptance(r)).toBe(true);
  });

  it("3 — free-form offer + 'continue' gates frictionless navigation", () => {
    armFreeFormConfirmation();
    const r = resolveConversationOwnership({
      userText: "continue",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(isBoundConfirmationAcceptance(r)).toBe(true);
  });

  it("4 — unowned 'go' / 'next' does NOT gate observers", () => {
    for (const answer of ["go", "next", "continue", "yes"]) {
      const r = resolveConversationOwnership({
        userText: answer,
        legacy: { awaitingConfirmation: null },
      });
      expect(isBoundConfirmationAcceptance(r)).toBe(false);
    }
  });

  it("5 — explicit navigation under a stronger owner is not gated", () => {
    beginSpineOwnership({
      owner: "create",
      reason: "universal_creation_session",
      status: "active",
      continuation: { kind: "create", documentType: "email", phase: "draft" },
    });
    const r = resolveConversationOwnership({
      userText: "take me to momentum",
      legacy: { awaitingConfirmation: null },
      createSessionActive: true,
    });
    expect(isBoundConfirmationAcceptance(r)).toBe(false);
  });

  it("6 — a genuine topic change is not gated", () => {
    armFreeFormConfirmation();
    const r = resolveConversationOwnership({
      userText: "Actually, let's talk about payroll instead.",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(isBoundConfirmationAcceptance(r)).toBe(false);
  });

  it("7 — the active owner continues exactly once on acceptance", () => {
    armFreeFormConfirmation();
    const r = resolveConversationOwnership({
      userText: "yes",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(r.action).toBe("continue_owner");
    expect(r.reason).toBe("confirmation_acceptance");
    // Exactly one continued owner — an awaiting-reply owner, not a rival.
    expect(["confirmation", "collection_offer"]).toContain(r.currentOwner);
  });

  it("predicate is pure — only continue_owner + confirmation_acceptance gate", () => {
    expect(
      isBoundConfirmationAcceptance({
        action: "continue_owner",
        reason: "confirmation_acceptance",
      }),
    ).toBe(true);
    expect(
      isBoundConfirmationAcceptance({
        action: "continue_owner",
        reason: "menu_continuation",
      }),
    ).toBe(false);
    expect(
      isBoundConfirmationAcceptance({
        action: "handle_by_companion",
        reason: "confirmation_acceptance",
      }),
    ).toBe(false);
  });
});
