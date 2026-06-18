import { describe, expect, it } from "vitest";
import {
  isConceptTeachingRequest,
  isDetailedGuideRequest,
  isTeachingContinuation,
  isTeachingMenuOffer,
  teachingModeActive,
  teachingModeHintForChat,
} from "./teachingMode";

describe("teachingMode", () => {
  it("detects concept teaching requests", () => {
    expect(
      isConceptTeachingRequest(
        "Teach me what a sales funnel is and how to use it.",
      ),
    ).toBe(true);
    expect(isConceptTeachingRequest("Explain email marketing to me")).toBe(true);
    expect(isConceptTeachingRequest("Help me understand pricing")).toBe(true);
    expect(isConceptTeachingRequest("What is a lead magnet?")).toBe(true);
  });

  it("does not treat app navigation as concept teaching", () => {
    expect(isConceptTeachingRequest("How do I find the games?")).toBe(false);
    expect(isConceptTeachingRequest("How do I change the colors?")).toBe(false);
  });

  it("allows detailed guides when explicitly requested", () => {
    expect(
      isConceptTeachingRequest(
        "Give me a comprehensive guide to sales funnels",
      ),
    ).toBe(false);
    expect(isDetailedGuideRequest("Give me a full guide to funnels")).toBe(true);
  });

  it("hints for step 1 + path menu on first teaching turn", () => {
    const hint = teachingModeHintForChat(
      "Teach me about sales funnels",
      "",
    );
    expect(hint).toMatch(/TEACHING MODE/i);
    expect(hint).toMatch(/ONE simple sentence/i);
    expect(hint).toMatch(/Simple explanation/i);
    expect(hint).toMatch(/Build one together/i);
    expect(hint).toMatch(/Do NOT write a long guide/i);
  });

  it("detects path picks after a teaching menu", () => {
    const menu =
      "A sales funnel is the journey from first hearing about you to becoming a customer.\n\nWould you like:\n1. Simple explanation\n2. Real-world example\n3. Apply to my business\n4. Build one together";
    expect(isTeachingMenuOffer(menu)).toBe(true);
    expect(isTeachingContinuation("2", menu)).toBe(true);
    expect(isTeachingContinuation("Build one together", menu)).toBe(true);
  });

  it("build path hint coaches one stage at a time", () => {
    const menu =
      "Would you like:\n1. Simple explanation\n2. Real-world example\n3. Apply to my business\n4. Build one together";
    const hint = teachingModeHintForChat("4", menu);
    expect(hint).toMatch(/one stage at a time/i);
  });

  it("teachingModeActive covers first turn and continuation", () => {
    const menu =
      "Would you like:\n1. Simple explanation\n2. An example\n3. Apply to my business\n4. Build one together";
    expect(teachingModeActive("Teach me about funnels", "")).toBe(true);
    expect(teachingModeActive("3", menu)).toBe(true);
  });

  it("suppresses teaching when active workflow is locked", () => {
    expect(
      teachingModeActive("What is a positioning statement?", "", {
        activeWorkflowLocked: true,
      }),
    ).toBe(false);
  });
});
