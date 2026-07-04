import { describe, expect, it } from "vitest";
import {
  detectEstateCoachingSituation,
  detectCoachingGoal,
  formatEstateCoachingMenu,
  parseEstateCoachingChoice,
  resolveEstateCoachingMenu,
  shouldCoachBeforeNavigate,
  buildCoachingOpenPayload,
} from "./estateCoaching";

describe("Estate Coaching Architecture", () => {
  it("detects focus coaching situations without immediate room transport", () => {
    expect(detectEstateCoachingSituation("I need to focus")).toBe("focus");
    expect(detectEstateCoachingSituation("I can't concentrate")).toBe("focus");
    expect(detectEstateCoachingSituation("I keep getting interrupted")).toBe(
      "focus",
    );
    // Discovery Mode runs first for vague focus requests.
    expect(shouldCoachBeforeNavigate("I need to focus")).toBe(false);
    expect(shouldCoachBeforeNavigate("help me decide")).toBe(true);
  });

  it("does not coach explicit artifact or room navigation", () => {
    expect(shouldCoachBeforeNavigate("Help me write an email")).toBe(false);
    expect(shouldCoachBeforeNavigate("Take me to the focus room")).toBe(false);
    expect(shouldCoachBeforeNavigate("Research the newest AI tools")).toBe(
      false,
    );
  });

  it("presents human prescriptions — not feature names", () => {
    const menu = resolveEstateCoachingMenu("I need to focus");
    expect(menu).not.toBeNull();
    const formatted = formatEstateCoachingMenu(menu!);
    expect(formatted).toMatch(/figure out what would help/i);
    expect(formatted).toMatch(/Get everything out of your head first/);
    expect(formatted).toMatch(/two-minute breathing reset/);
    expect(formatted).not.toMatch(/Clear My Mind™/);
    expect(formatted).not.toMatch(/Focus Room/);
  });

  it("detects goal context for intelligent follow-up", () => {
    const goal = detectCoachingGoal("I'm trying to finish an SOP");
    expect(goal?.kind).toBe("sop");
    const menu = resolveEstateCoachingMenu(
      "I need to focus on finishing my SOP",
    );
    expect(menu?.goal?.kind).toBe("sop");
    expect(menu?.sequenceHint).toMatch(/SOP waiting/i);
  });

  it("parses numbered coaching choice into navigation payload", () => {
    const menu = resolveEstateCoachingMenu("I need to focus")!;
    const choice = parseEstateCoachingChoice("2", menu);
    expect(choice?.id).toBe("focus-clear-mind");

    const payload = buildCoachingOpenPayload(
      "2",
      "focus",
      choice!,
    );
    expect(payload?.estatePlaceId).toBe("clear-my-mind");
    expect(payload?.openSection).toBe("brain-dump");
  });

  it("detects overwhelmed and decision coaching", () => {
    expect(detectEstateCoachingSituation("I'm so overwhelmed")).toBe(
      "overwhelmed",
    );
    expect(detectEstateCoachingSituation("I can't decide which offer")).toBe(
      "decision",
    );
  });
});
