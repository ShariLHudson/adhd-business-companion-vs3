/**
 * companionEmotions — Phase 1 of the Work State Priority Model
 * (docs/estate/WORK_STATE_PRIORITY_MODEL.md), approved for implementation
 * in this exact order: (1) fix the classifier distinction, (2) add the
 * gate, (3) validate with golden conversations.
 *
 * This file locks in Phase 1: closing the vocabulary gap that caused
 * calm, confident build requests ("I'm building a workshop.") to
 * misclassify as "unclear," and separating genuine confusion from that
 * vocabulary gap via `isGenuineConfusionSignal` — a distinct, narrower
 * signal from `detectEmotionalState()`'s own `"unclear"` catch-all.
 */

import { describe, expect, it } from "vitest";
import { detectEmotionalState, isGenuineConfusionSignal } from "./companionEmotions";

describe("detectEmotionalState — vocabulary gap fix (the four work objects named in the Work State Priority Model)", () => {
  const BUILD_CASES = [
    "I am creating a workshop.",
    "I'm building a workshop.",
    "I'm planning a workshop.",
    "I need help planning a workshop.",
    "I'm designing a workshop.",
    "I'm developing a process for new clients.",
    "I want to develop a process for new clients.",
    "I'm documenting our process.",
    "I'm building a course for my clients.",
    "I'm writing a newsletter.",
  ];

  it.each(BUILD_CASES)("%s -> building (not misclassified as unclear)", (text) => {
    expect(detectEmotionalState(text)).toBe("building");
  });

  it("does not regress the pre-existing base-verb forms", () => {
    expect(detectEmotionalState("I want to create a workshop.")).toBe("building");
    expect(detectEmotionalState("I'm drafting a proposal.")).toBe("building");
  });
});

describe("detectEmotionalState — 'course' vocabulary fix does not false-positive on 'of course'", () => {
  it.each(["Yes, of course I'll do that.", "Of course that makes sense.", "I'll help, of course."])(
    "%s -> NOT building (the common phrase 'of course' must never match the artifact word 'course')",
    (text) => {
      expect(detectEmotionalState(text)).not.toBe("building");
    },
  );
});

describe("detectEmotionalState — unaffected cases (regression guard)", () => {
  it("distress signals still classify correctly, unaffected by the vocabulary additions", () => {
    expect(detectEmotionalState("I'm overwhelmed about my workshop.")).toBe("overwhelmed");
    expect(detectEmotionalState("I'm stuck trying to figure out my workshop.")).toBe("stuck");
    expect(detectEmotionalState("I'm overwhelmed trying to figure out my workshop.")).toBe("overwhelmed");
  });
});

describe("isGenuineConfusionSignal — separates genuine confusion from a vocabulary gap", () => {
  it("returns false for a clear build request that merely returns 'unclear' from a lingering classifier gap", () => {
    // The exact case that originally motivated this function: both this
    // sentence and a genuinely confused one returned "unclear" with no
    // way to tell them apart from the enum value alone.
    expect(isGenuineConfusionSignal("I need help planning a workshop.")).toBe(false);
  });

  it("returns true for genuine confusion language", () => {
    expect(isGenuineConfusionSignal("I'm not sure what I need help with.")).toBe(true);
    expect(isGenuineConfusionSignal("I'm confused about what to do next.")).toBe(true);
    expect(isGenuineConfusionSignal("I don't know where to start.")).toBe(true);
    expect(isGenuineConfusionSignal("I have no idea what I'm doing.")).toBe(true);
  });

  it("returns false for calm build requests and for stuck/overwhelmed text (those have their own dedicated EmotionalState values)", () => {
    expect(isGenuineConfusionSignal("I want to create a workshop.")).toBe(false);
    expect(isGenuineConfusionSignal("I'm stuck trying to figure out my workshop.")).toBe(false);
    expect(isGenuineConfusionSignal("Yes, of course I'll do that.")).toBe(false);
  });

  it("returns false for empty text", () => {
    expect(isGenuineConfusionSignal("")).toBe(false);
    expect(isGenuineConfusionSignal("   ")).toBe(false);
  });
});
