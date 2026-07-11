import { describe, expect, it } from "vitest";

import {
  detectMemberEmotionalSignals,
  emotionalFirstResponseHint,
  formatEmotionalContinuation,
  formatEmotionalFirstOpening,
  planEmotionalFirstResponse,
  shouldUseEmotionalFirstSequence,
} from "./emotionalFirstResponseSequence";

describe("Emotional-First Response Sequence", () => {
  it("detects overwhelm and plans reflect → normalize before guidance", () => {
    const plan = planEmotionalFirstResponse({
      text: "I'm completely overwhelmed and don't know what to do first",
    });
    expect(plan.requiresEmotionalFirstSequence).toBe(true);
    expect(plan.detectedSignals).toContain("overwhelm");
    expect(plan.phases).toEqual([
      "detect",
      "reflect",
      "normalize",
      "guide",
      "continue",
    ]);
    expect(plan.reflection).toBeTruthy();
    expect(plan.normalization).toBeTruthy();
    expect(plan.mayProceedToGuidance).toBe(true);
    expect(emotionalFirstResponseHint(plan)).toMatch(/Reflect/);
    expect(emotionalFirstResponseHint(plan)).toMatch(/Normalize/);
  });

  it("reflects uncertainty without jumping to solutions in the opening", () => {
    const plan = planEmotionalFirstResponse({
      text: "I'm not sure which direction to take",
    });
    expect(plan.detectedSignals).toContain("uncertainty");
    const opening = formatEmotionalFirstOpening(plan);
    expect(opening).toBeTruthy();
    expect(opening).not.toMatch(/you should/i);
    expect(opening).not.toMatch(/here's a plan/i);
  });

  it("always offers continuation even when a solution is ready", () => {
    const plan = planEmotionalFirstResponse({
      text: "I'm stressed about this launch",
      hasSolutionReady: true,
    });
    expect(plan.continuationOffers.length).toBeGreaterThanOrEqual(2);
    expect(formatEmotionalContinuation(plan)).toBeTruthy();
    expect(emotionalFirstResponseHint(plan)).toMatch(/continuation/i);
  });

  it("skips emotional-first for purely factual questions", () => {
    expect(
      shouldUseEmotionalFirstSequence("What is a profit margin?"),
    ).toBe(false);
    const plan = planEmotionalFirstResponse({
      text: "What is a profit margin?",
    });
    expect(plan.requiresEmotionalFirstSequence).toBe(false);
    expect(plan.reflection).toBeNull();
  });

  it("detects multiple signals in priority order", () => {
    const signals = detectMemberEmotionalSignals(
      "I'm overwhelmed and afraid I'll fail",
    );
    expect(signals[0]).toBe("overwhelm");
    expect(signals).toContain("fear");
  });

  it("never returns empty reasoning", () => {
    const cases = [
      "I feel overwhelmed",
      "What is SEO?",
      "I'm procrastinating again",
    ];
    for (const text of cases) {
      expect(planEmotionalFirstResponse({ text }).reasoning.length).toBeGreaterThan(
        0,
      );
    }
  });
});
