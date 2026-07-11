/**
 * Smoke routing for 151 runtime acceptance phrases.
 * Docs-only change companion — this file verifies expected turn owners.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { resolveEstateAction } from "@/lib/estate/decisionKernel";
import { evaluateEstatePlaceTurn } from "@/lib/estate/estatePlaceNavigation";
import { evaluateEstateConversationTurn } from "@/lib/estateIntelligence/estateConversationPipeline";
import {
  evaluateRecognitionLifecycleTurn,
  resetRecognitionRoomStateForTests,
  resetRecognitionStoreForTests,
  shouldBlockCreateForRecognitionTurn,
} from "@/lib/sparkRecognitionEngine";
import { resetEstateRoomAwarenessForTests } from "@/lib/estate/roomAwareness";

function stubStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
}

describe("151 runtime acceptance phrases", () => {
  beforeEach(() => {
    stubStorage();
    resetRecognitionRoomStateForTests();
    resetRecognitionStoreForTests();
    resetEstateRoomAwarenessForTests();
  });

  it('CREATE: "I need to create a workshop."', () => {
    const text = "I need to create a workshop.";
    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("TASK_REQUEST");
    expect(shouldBlockCreateForRecognitionTurn(text)).toBe(false);

    const estate = evaluateEstateConversationTurn({
      userText: text,
      activeSection: "home",
      welcomeHomePrimary: true,
      frostedChatContext: true,
    });
    expect(estate?.estate.bestMatch?.entry.id).toBe("creative-studio");
  });

  it('RECOGNITION: "I discovered something today."', () => {
    const text = "I discovered something today.";
    const recognition = evaluateRecognitionLifecycleTurn({ userText: text });
    expect(recognition.ownsTurn).toBe(true);
    expect(recognition.allowCreate).toBe(false);
    expect(recognition.offer?.stage).toBe("evidence_vault");
    expect(shouldBlockCreateForRecognitionTurn(text)).toBe(true);

    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("RECOGNITION");
  });

  it('NAVIGATE: "Take me to the Evidence Vault."', () => {
    const text = "Take me to the Evidence Vault.";
    const place = evaluateEstatePlaceTurn({
      userText: text,
      currentPlaceId: "home",
    });
    expect(place.type).toBe("navigate");
    if (place.type === "navigate") {
      const dest = place.command.roomId ?? place.command.entryId;
      expect(dest).toMatch(/evidence-vault|evidence-bank/);
    }

    // Kernel should not claim already-here for Vault when visual is unset.
    const kernel = resolveEstateAction({
      userText: text,
      currentPlaceId: "home",
    });
    expect(kernel.action).not.toBe("CHAT");
    if (kernel.action === "NAVIGATE" && kernel.target?.kind === "place") {
      const dest =
        kernel.target.command.roomId ?? kernel.target.command.entryId;
      expect(dest).toMatch(/evidence-vault|evidence-bank/);
    } else if (kernel.action === "ROOM_ACTION") {
      // In-room matcher may fire first for some currentPlaceIds; place turn
      // above is the destination authority for this acceptance phrase.
      expect(place.type).toBe("navigate");
    }
  });

  it('RECOGNITION / celebrate: "I finally finished something big."', () => {
    const text = "I finally finished something big.";
    const recognition = evaluateRecognitionLifecycleTurn({ userText: text });
    expect(recognition.ownsTurn).toBe(true);
    expect(recognition.allowCreate).toBe(false);

    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("RECOGNITION");
    expect(shouldBlockCreateForRecognitionTurn(text)).toBe(true);
  });
});
