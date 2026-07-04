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

  it("1. classify — pricing help → CHAT (API path)", () => {
    const classified = classifyCompanionIntent({
      userText: "I need help with pricing",
    });
    expect(classified.kind).toBe("CHAT");
    expect(classified.plan.type).toBe("chat");
    expect(companionIntentHandledByKernel(classified)).toBe(false);
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
});
