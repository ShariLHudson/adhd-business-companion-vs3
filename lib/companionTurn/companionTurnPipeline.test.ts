import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPendingEstatePlaceMenu } from "@/lib/estate/estatePlaceNavigation";
import {
  classifyCompanionIntent,
  companionIntentHandledByKernel,
  executeCompanionIntent,
} from "./index";

describe("companion turn pipeline", () => {
  beforeEach(() => {
    clearPendingEstatePlaceMenu();
  });

  it("1. classify — pricing help → CHAT (CB-022: domain alias must not auto-NAVIGATE)", () => {
    const classified = classifyCompanionIntent({
      userText: "I need help with pricing",
    });
    // Bare “help with pricing” is a domain question — answer in chat.
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("chat");
  });

  it("1b. classify — explicit Talk to Sales → Chamber NAVIGATE", () => {
    const classified = classifyCompanionIntent({
      userText: "Talk to Sales",
    });
    expect(classified.kind).toBe("NAVIGATE");
    expect(classified.plan.type).toBe("navigate-place");
    if (classified.plan.type === "navigate-place") {
      expect(classified.plan.command.workspaceOffer.chamberMemberId).toBe(
        "sales",
      );
    }
  });

  it("2. classify + execute — Reading Nook → place menu, then pick", () => {
    const classified = classifyCompanionIntent({
      userText: "Take me to Reading Nook",
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("place-menu");

    const onPlaceMenu = vi.fn();
    const onNavigatePlace = vi.fn();
    const handled = executeCompanionIntent(classified, {
      onCaptureWrite: vi.fn(),
      onNavigateMemory: vi.fn(),
      onNavigatePlace,
      onSoundscape: vi.fn(),
      onAssistantLine: vi.fn(),
      onPlaceMenu,
      onCaptureMenu: vi.fn(),
      onRoomAction: vi.fn(),
    });

    expect(handled).toBe(true);
    expect(onPlaceMenu).toHaveBeenCalledTimes(1);
    expect(onNavigatePlace).not.toHaveBeenCalled();
  });

  it("3. classify — save thought → CAPTURE", () => {
    const classified = classifyCompanionIntent({
      userText: "Save this thought",
    });
    expect(classified.kind).toBe("CAPTURE");
    expect(companionIntentHandledByKernel(classified)).toBe(true);
  });

  it("4. classify — calm sounds → AUDIO", () => {
    const classified = classifyCompanionIntent({
      userText: "Play calm sounds",
    });
    expect(classified.kind).toBe("AUDIO");
  });

  it("5. informational SOP → CHAT without kernel intercept", () => {
    const classified = classifyCompanionIntent({
      userText: "what is the best way to start an SOP",
      forceChat: true,
    });
    expect(classified.kind).toBe("CHAT");
    expect(executeCompanionIntent(classified, {
      onCaptureWrite: vi.fn(),
      onNavigateMemory: vi.fn(),
      onNavigatePlace: vi.fn(),
      onSoundscape: vi.fn(),
      onAssistantLine: vi.fn(),
      onPlaceMenu: vi.fn(),
      onCaptureMenu: vi.fn(),
      onRoomAction: vi.fn(),
    })).toBe(false);
  });

  it("6. quiet place offer → CHAT local (menu), not API", () => {
    const classified = classifyCompanionIntent({
      userText: "I'm stressed, somewhere quiet",
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("place-menu");
    expect(companionIntentHandledByKernel(classified)).toBe(true);
  });

  it("7. relationship chat mentioning a room stays in chat — no navigate", () => {
    const classified = classifyCompanionIntent({
      userText: "I love the greenhouse",
      primaryTurn: {
        type: "RELATIONSHIP_CHAT",
        confidence: "high",
        owner: "chat",
        reason: "test",
        blockKernelNavigation: true,
        blockBridgeResponder: true,
        blockCollectionOffer: true,
        blockSecondaryResponders: true,
      },
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).not.toBe("navigate-place");

    const onNavigatePlace = vi.fn();
    expect(
      executeCompanionIntent(classified, {
        onCaptureWrite: vi.fn(),
        onNavigateMemory: vi.fn(),
        onNavigatePlace,
        onSoundscape: vi.fn(),
        onAssistantLine: vi.fn(),
        onPlaceMenu: vi.fn(),
        onCaptureMenu: vi.fn(),
        onRoomAction: vi.fn(),
      }),
    ).toBe(false);
    expect(onNavigatePlace).not.toHaveBeenCalled();
  });

  it("8. pricing help may open Sales only when chamber match — otherwise chat", () => {
    const classified = classifyCompanionIntent({
      userText: "I need help with pricing",
      primaryTurn: {
        type: "RELATIONSHIP_CHAT",
        confidence: "high",
        owner: "chat",
        reason: "test relationship — stay in chat unless chamber exempt",
        blockKernelNavigation: true,
        blockBridgeResponder: true,
        blockCollectionOffer: true,
        blockSecondaryResponders: true,
      },
    });
    // Chamber members are Fix A exempt; without a chamber-only primary, chat wins.
    if (classified.plan.type === "navigate-place") {
      expect(classified.plan.command.workspaceOffer.chamberMemberId).toBeTruthy();
    } else {
      expect(classified.kind).toBe("CHAT");
      expect(companionIntentHandledByKernel(classified)).toBe(false);
    }
  });
});
