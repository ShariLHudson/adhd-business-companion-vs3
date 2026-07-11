import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEstateAction } from "@/lib/estate/decisionKernel";
import {
  resetEstateRoomAwarenessForTests,
  setVisualRoom,
  syncEstateRoomAwareness,
} from "@/lib/estate/roomAwareness";
import { evaluateEstateRoomAction } from "./evaluateEstateRoomAction";
import { resolveCurrentEstateRoom } from "./resolveCurrentEstateRoom";

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

describe("estate room context", () => {
  beforeEach(() => {
    stubSession();
    resetEstateRoomAwarenessForTests();
  });

  it("resolves current room from direct visit first", () => {
    expect(
      resolveCurrentEstateRoom({
        directVisitRoomId: "journal",
        activeSection: "home",
        memoryRoomId: "coffee-house",
      }),
    ).toBe("journal");
  });

  it("resolves journal section to journal gazebo room", () => {
    expect(
      resolveCurrentEstateRoom({
        directVisitRoomId: null,
        activeSection: "growth-journal",
        memoryRoomId: null,
        preferVisualAwareness: false,
      }),
    ).toBe("journal");
  });

  it("home section beats stale memory room", () => {
    expect(
      resolveCurrentEstateRoom({
        directVisitRoomId: null,
        activeSection: "home",
        memoryRoomId: "clear-my-mind",
      }),
    ).toBe("welcome-home");
  });

  it("non-place tool section ignores stale memory", () => {
    expect(
      resolveCurrentEstateRoom({
        directVisitRoomId: null,
        activeSection: "settings",
        memoryRoomId: "coffee-house",
      }),
    ).toBeNull();
  });

  it("journal gazebo — journal intent opens journal, does not navigate", () => {
    setVisualRoom("journal");
    const action = evaluateEstateRoomAction({
      userText: "I'd like to journal for a few minutes.",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("open_journal");
    expect(action?.reply).toMatch(/open your journal/i);
  });

  it("journal gazebo — show my journal opens journal", () => {
    setVisualRoom("journal");
    const action = evaluateEstateRoomAction({
      userText: "Show me my journal.",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("open_journal");
    expect(action?.reply).toMatch(/Opening your current journal/i);
  });

  it("journal gazebo — create new journal opens selector", () => {
    setVisualRoom("journal");
    const action = evaluateEstateRoomAction({
      userText: "Create a new journal.",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("create_journal");
  });

  it("kernel blocks re-navigation when already in journal", () => {
    setVisualRoom("journal");
    const result = resolveEstateAction({
      userText: "Show me my journal.",
      currentPlaceId: "journal",
    });
    expect(result.action).toBe("ROOM_ACTION");
    if (result.action === "ROOM_ACTION") {
      expect(result.roomAction.kind).toBe("open_journal");
    }
  });

  it("kernel still navigates when not in target room", () => {
    setVisualRoom("coffee-house");
    const result = resolveEstateAction({
      userText: "Take me to the Journal Gazebo.",
      currentPlaceId: "coffee-house",
    });
    expect(result.action).toBe("NAVIGATE");
  });

  it("kernel does not claim already-here without visual_room", () => {
    const result = resolveEstateAction({
      userText: "Take me to the Coffee House.",
      currentPlaceId: "coffee-house",
    });
    if (result.action === "CHAT") {
      expect(result.immediateReply ?? "").not.toMatch(/already/i);
    } else {
      expect(["NAVIGATE", "ROOM_ACTION"]).toContain(result.action);
    }
  });

  it("from Welcome Home, clear my mind navigates — same chat, no already-here", () => {
    setVisualRoom("welcome-home");
    const result = resolveEstateAction({
      userText: "clear my mind",
      currentPlaceId: "welcome-home",
    });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(result.target.command.roomId ?? result.target.command.entryId).toBe(
        "clear-my-mind",
      );
    }
    expect(
      "immediateReply" in result ? (result.immediateReply ?? "") : "",
    ).not.toMatch(/already here/i);
  });

  it("stale clear-my-mind visual after home sync still navigates on pivot", () => {
    setVisualRoom("clear-my-mind");
    syncEstateRoomAwareness({ section: "home" });
    const result = resolveEstateAction({
      userText: "clear my mind",
      currentPlaceId: "welcome-home",
      activeSection: "home",
    });
    expect(result.action).toBe("NAVIGATE");
  });

  it("even with stale clear-my-mind visual, clear my mind re-opens — never already-here dead-end", () => {
    setVisualRoom("clear-my-mind");
    const result = resolveEstateAction({
      userText: "clear my mind",
      currentPlaceId: "clear-my-mind",
    });
    expect(["NAVIGATE", "ROOM_ACTION"]).toContain(result.action);
    if (result.action === "ROOM_ACTION") {
      expect(result.roomAction.kind).toBe("open_section");
      expect(result.roomAction.section).toBe("brain-dump");
      expect(result.immediateReply).not.toMatch(/already here/i);
    }
    if (result.action === "CHAT") {
      expect(result.immediateReply ?? "").not.toMatch(/already here/i);
    }
  });

  it("creative studio — SOP request stays in room", () => {
    setVisualRoom("creative-studio");
    const action = evaluateEstateRoomAction({
      userText: "Help me create an SOP.",
      currentPlaceId: "creative-studio",
    });
    expect(action?.action.kind).toBe("launch_creation");
    expect(action?.action.creationIntent).toBe("sop");
  });

  it("coffee house — sit here remains only when visually there", () => {
    expect(
      evaluateEstateRoomAction({
        userText: "Let's sit here.",
        currentPlaceId: "coffee-house",
      }),
    ).toBeNull();

    setVisualRoom("coffee-house");
    const action = evaluateEstateRoomAction({
      userText: "Let's sit here.",
      currentPlaceId: "coffee-house",
    });
    expect(action?.action.kind).toBe("remain_in_room");
  });

  it("momentum room — show projects opens projects", () => {
    setVisualRoom("momentum-institute");
    const action = evaluateEstateRoomAction({
      userText: "Show my projects.",
      currentPlaceId: "momentum-institute",
    });
    expect(action?.action.kind).toBe("open_projects");
  });
});
