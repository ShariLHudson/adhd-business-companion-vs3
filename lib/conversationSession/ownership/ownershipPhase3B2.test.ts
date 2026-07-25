/**
 * Phase 3.1B — B2 wider short-answer binding.
 * The continuation/selection vocabulary binds to an active awaiting-reply owner
 * and NOWHERE else (no global "short reply means yes").
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

function armConfirmation(expectedKind: "confirmation" | "choice") {
  beginSpineOwnership({
    owner: "confirmation",
    reason: "free_form_assistant_offer",
    status: "awaiting_user",
    expectedReply:
      expectedKind === "choice"
        ? { kind: "choice", allowedValues: ["1", "2"] }
        : { kind: "confirmation" },
  });
}

describe("Phase 3.1B — B2 short-answer binding", () => {
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

  it("1 — active free-form offer + 'go' binds to the active owner", () => {
    armConfirmation("confirmation");
    const r = resolveConversationOwnership({
      userText: "go",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(r.action).toBe("continue_owner");
    expect(r.reason).toBe("confirmation_acceptance");
  });

  it("2 — active free-form offer + 'continue' binds to the active owner", () => {
    armConfirmation("confirmation");
    const r = resolveConversationOwnership({
      userText: "continue",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(r.action).toBe("continue_owner");
    expect(r.reason).toBe("confirmation_acceptance");
  });

  it("3 — active option question + 'the first one' / 'that one' binds", () => {
    for (const answer of ["the first one", "that one"]) {
      clearOwnershipTraceForTests();
      armConfirmation("choice");
      const r = resolveConversationOwnership({
        userText: answer,
        legacy: { awaitingConfirmation: awaiting },
      });
      expect(r.action).toBe("continue_owner");
      expect(r.reason).toBe("confirmation_acceptance");
    }
  });

  it("4 — the same phrases do NOT bind when no active owner exists", () => {
    // No spine awaiting owner armed, no pending stores.
    for (const answer of ["go", "continue", "next", "the first one", "that one"]) {
      const r = resolveConversationOwnership({
        userText: answer,
        legacy: { awaitingConfirmation: null },
      });
      expect(r.reason).not.toBe("confirmation_acceptance");
    }
  });

  it("5 — a genuine topic change still does not bind", () => {
    armConfirmation("confirmation");
    const r = resolveConversationOwnership({
      userText: "Actually, let's talk about payroll instead.",
      legacy: { awaitingConfirmation: awaiting },
    });
    expect(r.reason).not.toBe("confirmation_acceptance");
  });

  it("6 — existing yes/sure/okay still bind", () => {
    for (const answer of ["yes", "sure", "okay"]) {
      clearOwnershipTraceForTests();
      armConfirmation("confirmation");
      const r = resolveConversationOwnership({
        userText: answer,
        legacy: { awaitingConfirmation: awaiting },
      });
      expect(r.action).toBe("continue_owner");
      expect(r.reason).toBe("confirmation_acceptance");
    }
  });

  it("7 — precedence unchanged: a stronger explicit owner is not overridden", () => {
    // Create is active — 'continue' / 'next' must not be captured as a
    // confirmation acceptance that overrides the stronger owner.
    beginSpineOwnership({
      owner: "create",
      reason: "universal_creation_session",
      status: "active",
      continuation: { kind: "create", documentType: "email", phase: "draft" },
    });
    for (const answer of ["continue", "next", "go"]) {
      const r = resolveConversationOwnership({
        userText: answer,
        legacy: { awaitingConfirmation: null },
        createSessionActive: true,
      });
      expect(r.reason).not.toBe("confirmation_acceptance");
    }
  });
});
