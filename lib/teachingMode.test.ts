import { describe, expect, it } from "vitest";
import {
  isConceptTeachingRequest,
  isTeachingContinuation,
  isTeachingMenuOffer,
  teachingModeActive,
  teachingModeHintForChat,
} from "./teachingMode";
import { learningPathMenuOfferBlock } from "./learningPathMenu";

describe("teachingMode", () => {
  const menu = `Would you like:\n${learningPathMenuOfferBlock()}`;

  it("detects concept teaching requests", () => {
    expect(isConceptTeachingRequest("What is a lead magnet?")).toBe(true);
    expect(isConceptTeachingRequest("Give me a deep dive on pricing")).toBe(true);
    expect(isConceptTeachingRequest("How do I find the games?")).toBe(false);
  });

  it("hints for learning path menu on first teaching turn", () => {
    const hint = teachingModeHintForChat("Teach me about sales funnels", "");
    expect(hint).toMatch(/LEARNING PATH MENU/i);
    expect(hint).toMatch(/Quick Answer/i);
    expect(hint).toMatch(/Deep Dive/i);
  });

  it("detects path picks after a learning path menu", () => {
    expect(isTeachingMenuOffer(menu)).toBe(true);
    expect(isTeachingContinuation("2", menu)).toBe(true);
    expect(isTeachingContinuation("Deep Dive", menu)).toBe(true);
  });

  it("deep dive path hint on option 4", () => {
    const hint = teachingModeHintForChat("4", menu);
    expect(hint).toMatch(/DEEP DIVE/i);
    expect(hint).toMatch(/NOT relationship reflection/i);
  });

  it("teachingModeActive covers first turn and continuation", () => {
    expect(teachingModeActive("Teach me about funnels", "")).toBe(true);
    expect(teachingModeActive("3", menu)).toBe(true);
  });
});
