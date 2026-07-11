import { describe, expect, it, beforeEach, vi } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import {
  evaluateMetaEstateNavigationTurn,
  hasHardEstateNavigationIntent,
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
} from "./estateMetaNavigation";
import { evaluateLibraryConversationReply } from "./libraryConversationIntents";
import { evaluateInRoomConversationReply } from "./estateInRoomConversationIntents";
import { estateDirectCommandArrivalLine } from "@/lib/estateIntelligence/estateCommandRouter";
import { evaluateConversationEnvironmentNeed } from "./conversationDrivesNavigation";
import {
  resetEstateRoomAwarenessForTests,
  setVisualRoom,
} from "@/lib/estate/roomAwareness";

function stubSession() {
  const mem = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
}

describe("estateMetaNavigation", () => {
  it("does not treat room list questions as hard navigation", () => {
    const text = "do you have a list of rooms i can visit";
    expect(hasHardEstateNavigationIntent(text)).toBe(false);
    expect(isEstateRoomListOrMapRequest(text)).toBe(true);
  });

  it("offers a room picker for take me to another room", () => {
    const turn = evaluateMetaEstateNavigationTurn({
      userText: "take me to another room",
      currentPlaceId: "library",
    });
    expect(turn?.type).toBe("offer");
    if (turn?.type === "offer") {
      expect(turn.placeIds.length).toBe(3);
      expect(turn.line).toMatch(/Where would you like to go/i);
    }
  });

  it("navigates soft music room proposals with typos", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "how about a musci room",
      currentPlaceId: "library",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("music-room");
    }
  });

  it("offers room list instead of unknown place", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "do you have a list of rooms i can visit",
      currentPlaceId: "library",
    });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.line).toMatch(/Where would you like to go|Coffee House|Library/i);
    }
  });

  it("never unknown-places another room", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "take me to another room",
      currentPlaceId: "library",
    });
    expect(turn.type).not.toBe("unknown_place");
    expect(turn.type).toBe("offer");
  });

  it("routes another room through the estate kernel", () => {
    const classified = classifyCompanionIntent({
      userText: "take me to another room",
      currentPlaceId: "library",
    });
    expect(classified.plan.type).toBe("place-menu");
  });
});

describe("libraryConversationIntents", () => {
  it("answers what is available in the library", () => {
    const reply = evaluateLibraryConversationReply(
      "i don't know, what is available",
      "library",
    );
    expect(reply).toMatch(/Library|resources|Institute/i);
  });

  it("handles dan martell in the library", () => {
    const reply = evaluateLibraryConversationReply(
      "can i read something from dan martell",
      "library",
    );
    expect(reply).toMatch(/Dan Martell/i);
  });

  it("handles great thinkers button phrasing", () => {
    expect(isAnotherRoomRequest("Visit Another Room")).toBe(true);
    const reply = evaluateLibraryConversationReply(
      "I'd like to learn from great thinkers.",
      "library",
    );
    expect(reply).toMatch(/thinkers|wisdom/i);
  });
});

describe("estateInRoomConversationIntents", () => {
  it("answers apple pie recipe in the kitchen", () => {
    const reply = evaluateInRoomConversationReply(
      "a recipe for apple pie",
      "estate-kitchen",
    );
    expect(reply).toMatch(/apple pie/i);
  });

  it("acknowledges gallery when already there", () => {
    const reply = evaluateInRoomConversationReply(
      "this is the gallery",
      "gallery-of-firsts",
    );
    expect(reply).toMatch(/Hall of Accomplishments/i);
  });
});

describe("estate display names", () => {
  it("uses member-facing names on arrival", () => {
    expect(estateDirectCommandArrivalLine("gallery-of-firsts")).toMatch(
      /Hall of Accomplishments/i,
    );
    expect(estateDirectCommandArrivalLine("estate-kitchen")).toMatch(/Kitchen/i);
    expect(estateDirectCommandArrivalLine("woodland-path")).toMatch(
      /Woodland Path/i,
    );
  });
});

describe("deck navigation", () => {
  it("navigates directly to the back deck when member asks to sit on the deck", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "i would like to go sit out on the deck",
      currentPlaceId: "library",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      // back-deck aliases to fireside-deck (PLACE_ID_ALIASES)
      expect(turn.command.roomId ?? turn.command.entryId).toBe("fireside-deck");
    }
  });

  it("does not offer a fresh-air menu when the deck is named", () => {
    const evaluation = evaluateConversationEnvironmentNeed(
      "i would like to go sit out on the deck",
    );
    expect(evaluation.detected).toBe(false);
  });

  it("corrects a wrong deck arrival", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "no we ended up in the discovery room",
      currentPlaceId: "woodland-path",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("fireside-deck");
    }
  });

  it("acknowledges already here only when visual_room confirms", () => {
    stubSession();
    resetEstateRoomAwarenessForTests();
    // Without visual confirmation — no false already-here
    expect(
      evaluateInRoomConversationReply("we are already there", "discovery-room"),
    ).toBeNull();

    setVisualRoom("discovery-room");
    const reply = evaluateInRoomConversationReply(
      "we are already there",
      "discovery-room",
    );
    expect(reply).toMatch(/already in Discovery/i);
  });
});
