import { describe, expect, it, beforeEach } from "vitest";
import { recommendCapabilitiesForGoal } from "@/lib/estateCapabilityRegistry/goalRecommendations";
import { formatRecommendationLine } from "@/lib/estateCapabilityRegistry/goalRecommendations";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import {
  clearPendingChoice,
  loadPendingChoice,
  registerPendingChoiceFromConcierge,
  registerPendingChoiceFromPlaceIds,
  resolvePendingChoiceTurn,
} from "./index";

describe("pendingChoice manager", () => {
  beforeEach(() => {
    clearPendingChoice();
  });

  function registerFocusMenu() {
    const rec = recommendCapabilitiesForGoal("I need to focus");
    expect(rec).not.toBeNull();
    const menuText = formatRecommendationLine(rec!.goalSummary, rec!.options);
    registerPendingChoiceFromConcierge({
      goalSummary: rec!.goalSummary,
      options: rec!.options,
      menuText,
    });
    return { rec: rec!, menuText };
  }

  it('resolves "2" to Quiet Music for focus menu', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("2");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.capability).toBe("focus.music");
      expect(result.action.kind).toBe("open_focus_audio");
    }
    expect(loadPendingChoice()).toBeNull();
  });

  it('resolves "the coffee one" to Coffee House', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("the coffee one");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.capability).toBe("place.coffee-house");
      expect(result.action.placeId).toBe("coffee-house");
    }
  });

  it('resolves "first" to Time Block', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("first");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.capability).toBe("focus.timer");
    }
  });

  it('clears pending on "actually never mind"', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("actually never mind");
    expect(result.kind).toBe("cancelled");
    expect(loadPendingChoice()).toBeNull();
  });

  it("clears pending and yields topic change for new CREATE workflow", () => {
    registerFocusMenu();
    const text = "I need help writing an SOP";
    expect(shouldEnterUniversalCreation(text)).toBe(true);
    const result = resolvePendingChoiceTurn(text);
    expect(result.kind).toBe("topic_change");
    expect(loadPendingChoice()).toBeNull();
  });

  it('does not hijack explicit navigation while coffee menu is pending', () => {
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "tea-room", "dining-room"],
      menuText:
        "1. Coffee House\n2. Tea Room\n3. Dining Room\nJust tell me which one.",
    });
    const result = resolvePendingChoiceTurn("Take me to the Music Room");
    expect(result.kind).toBe("topic_change");
    expect(loadPendingChoice()).toBeNull();
  });

  it("re-shows menu on unrecognized short reply", () => {
    const { menuText } = registerFocusMenu();
    const result = resolvePendingChoiceTurn("maybe purple");
    expect(result.kind).toBe("unrecognized");
    if (result.kind === "unrecognized") {
      expect(result.reply).toMatch(/not sure which option/i);
      expect(result.menuText).toContain("1.");
    }
    expect(loadPendingChoice()).not.toBeNull();
    expect(menuText).toMatch(/Time Block|Quiet Music/i);
  });
});
