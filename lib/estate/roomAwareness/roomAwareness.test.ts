import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canClaimAlreadyHere,
  clearActiveWorkflow,
  getEstateRoomAwareness,
  getPreviousRoom,
  resetEstateRoomAwarenessForTests,
  setRequestedRoom,
  setVisualRoom,
  startActiveWorkflow,
  syncEstateRoomAwareness,
} from "./roomAwarenessState";
import { resolveEstateAction } from "@/lib/estate/decisionKernel";

function stubSession() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", { sessionStorage: storage, dispatchEvent: vi.fn() });
}

describe("estate room awareness", () => {
  beforeEach(() => {
    stubSession();
    resetEstateRoomAwarenessForTests();
  });

  it("tracks visual, conversation, requested, previous, and workflow", () => {
    setVisualRoom("coffee-house");
    setRequestedRoom("journal");
    startActiveWorkflow({ kind: "navigation", placeId: "journal" });

    let state = getEstateRoomAwareness();
    expect(state.visualRoom).toBe("coffee-house");
    expect(state.conversationRoom).toBe("coffee-house");
    expect(state.requestedRoom).toBe("journal");
    expect(state.activeWorkflow?.kind).toBe("navigation");

    setVisualRoom("journal");
    state = getEstateRoomAwareness();
    expect(state.visualRoom).toBe("journal");
    expect(state.previousRoom).toBe("coffee-house");
    expect(state.requestedRoom).toBeNull();
    expect(getPreviousRoom()).toBe("coffee-house");

    clearActiveWorkflow();
    expect(getEstateRoomAwareness().activeWorkflow).toBeNull();
  });

  it("refuses already-here when visual room is unknown", () => {
    expect(canClaimAlreadyHere("journal")).toBe(false);
    setVisualRoom("journal");
    expect(canClaimAlreadyHere("journal")).toBe(true);
    expect(canClaimAlreadyHere("coffee-house")).toBe(false);
  });

  it("maps home to welcome-home so stale Clear My Mind cannot claim already-here", () => {
    setVisualRoom("clear-my-mind");
    syncEstateRoomAwareness({ section: "home" });
    expect(getEstateRoomAwareness().visualRoom).toBe("welcome-home");
    expect(getEstateRoomAwareness().liveShellPlaceId).toBe("welcome-home");
    expect(canClaimAlreadyHere("clear-my-mind")).toBe(false);
    expect(canClaimAlreadyHere("welcome-home")).toBe(true);
  });

  it("clears visual on non-place tool sections so already-here cannot fire", () => {
    setVisualRoom("evidence-vault");
    syncEstateRoomAwareness({ section: "settings" });
    expect(getEstateRoomAwareness().visualRoom).toBeNull();
    expect(getEstateRoomAwareness().liveShellPlaceId).toBeNull();
    expect(canClaimAlreadyHere("evidence-vault")).toBe(false);
  });

  it("updates visual from section when section maps to a place", () => {
    setVisualRoom("coffee-house");
    syncEstateRoomAwareness({ section: "growth-journal" });
    expect(getEstateRoomAwareness().visualRoom).toBe("journal");
    expect(getPreviousRoom()).toBe("coffee-house");
  });

  it("treats evidence-bank section as evidence-vault", () => {
    syncEstateRoomAwareness({ section: "evidence-bank" });
    expect(getEstateRoomAwareness().visualRoom).toBe("evidence-vault");
    expect(canClaimAlreadyHere("evidence-vault")).toBe(true);
  });

  it("treats brain-dump section as clear-my-mind", () => {
    setVisualRoom("welcome-home");
    syncEstateRoomAwareness({ section: "brain-dump" });
    expect(getEstateRoomAwareness().visualRoom).toBe("clear-my-mind");
  });

  it("global: home section + welcome-home never already-heres a stale visual room", () => {
    setVisualRoom("coffee-house");
    const fromWelcome = resolveEstateAction({
      userText: "take me to the coffee house",
      currentPlaceId: "welcome-home",
      activeSection: "home",
    });
    expect(fromWelcome.action).toBe("NAVIGATE");
    expect(
      "immediateReply" in fromWelcome ? (fromWelcome.immediateReply ?? "") : "",
    ).not.toMatch(/already/i);
  });

  it("global: settings clears stale visual — navigate not already-here", () => {
    setVisualRoom("coffee-house");
    const result = resolveEstateAction({
      userText: "take me to the coffee house",
      currentPlaceId: null,
      activeSection: "settings",
    });
    expect(result.action).toBe("NAVIGATE");
    expect(
      "immediateReply" in result ? (result.immediateReply ?? "") : "",
    ).not.toMatch(/already/i);
  });

  it("global: welcome-home + clear my mind always navigates", () => {
    setVisualRoom("clear-my-mind");
    const result = resolveEstateAction({
      userText: "clear my mind",
      currentPlaceId: "welcome-home",
      activeSection: "home",
    });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(result.target.command.roomId ?? result.target.command.entryId).toBe(
        "clear-my-mind",
      );
    }
  });
});
