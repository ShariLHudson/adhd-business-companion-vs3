import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPendingEstatePlaceMenu, savePendingEstatePlaceMenu } from "../estatePlaceNavigation";
import { resetEstateRoomAwarenessForTests } from "@/lib/estate/roomAwareness";
import { planEstateActionExecution } from "./planEstateActionExecution";
import { resolveEstateAction } from "./resolveEstateAction";

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

describe("estate decision kernel acceptance", () => {
  beforeEach(() => {
    stubSession();
    resetEstateRoomAwarenessForTests();
    clearPendingEstatePlaceMenu();
  });

  it('1. "I need help with pricing" → CHAT', () => {
    const result = resolveEstateAction({ userText: "I need help with pricing" });
    expect(result.action).toBe("CHAT");
    expect(planEstateActionExecution(result).type).toBe("chat");
  });

  it('2. "Take me to the Coffee House" → NAVIGATE', () => {
    const result = resolveEstateAction({
      userText: "Take me to the Coffee House",
    });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(result.target.command.roomId ?? result.target.command.entryId).toBe(
        "coffee-house",
      );
    }
    expect(planEstateActionExecution(result).type).toBe("navigate-place");
  });

  it('3. "I\'m stressed, somewhere quiet" → MENU', () => {
    const result = resolveEstateAction({
      userText: "I'm stressed, somewhere quiet",
    });
    expect(result.action).toBe("MENU");
    if (result.action === "MENU") {
      expect(result.menuKind).toBe("place");
      expect(result.placeIds.length).toBeGreaterThanOrEqual(2);
    }
    expect(planEstateActionExecution(result).type).toBe("place-menu");
  });

  it('4. "Save this thought" → CAPTURE', () => {
    const result = resolveEstateAction({ userText: "Save this thought" });
    expect(result.action).toBe("CAPTURE");
    if (result.action === "CAPTURE") {
      expect(result.captureType).toBe("journal");
    }
    expect(planEstateActionExecution(result).type).toBe("capture-write");
  });

  it('5. "Play calm sounds" → AUDIO', () => {
    const result = resolveEstateAction({ userText: "Play calm sounds" });
    expect(result.action).toBe("AUDIO");
    expect(planEstateActionExecution(result).type).toBe("soundscape");
    expect(
      resolveEstateAction({ userText: "Play calm sounds" }).action,
    ).not.toBe("NAVIGATE");
  });

  it('6. "1" with pending menu → NAVIGATE', () => {
    savePendingEstatePlaceMenu({
      placeIds: ["reading-nook", "greenhouse", "back-deck"],
    });
    const result = resolveEstateAction({ userText: "1" });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(result.target.command.roomId ?? result.target.command.entryId).toBe(
        "reading-nook",
      );
    }
  });

  it("exactly one action per input — no multi-label", () => {
    const result = resolveEstateAction({ userText: "I want music" });
    expect(["CHAT", "NAVIGATE", "CAPTURE", "AUDIO", "MENU"]).toContain(
      result.action,
    );
    const actions = new Set([result.action]);
    expect(actions.size).toBe(1);
  });

  it("NAVIGATE wins over AUDIO for explicit place phrasing", () => {
    const result = resolveEstateAction({
      userText: "Take me to the Coffee House",
    });
    expect(result.action).toBe("NAVIGATE");
  });

  it("CAPTURE wins over AUDIO for save phrasing", () => {
    const result = resolveEstateAction({
      userText: "Save this to my journal: shipped the landing page",
    });
    expect(result.action).toBe("CAPTURE");
  });
});
