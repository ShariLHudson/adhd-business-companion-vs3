import { describe, expect, it } from "vitest";
import {
  DEEP_DIVE_TOPICS,
  matchDeepDiveTopic,
} from "./deepDiveCatalog";
import {
  isLearningPathMenuOffer,
  learningPathHintForSelection,
  learningPathMenuOfferBlock,
  mapMenuLineLabelToKey,
} from "./learningPathMenu";

describe("learningPathMenu", () => {
  it("exposes the restored 4-path menu with Deep Dive", () => {
    expect(learningPathMenuOfferBlock()).toContain("Quick Answer");
    expect(learningPathMenuOfferBlock()).toContain("Deep Dive");
    expect(learningPathMenuOfferBlock()).not.toContain("Build one together");
  });

  it("detects learning path menu offers", () => {
    const menu =
      "A mind map organizes ideas visually.\n\nWould you like:\n1. Quick Answer\n2. Example\n3. Apply to My Business\n4. Deep Dive";
    expect(isLearningPathMenuOffer(menu)).toBe(true);
  });

  it("maps legacy and new menu labels", () => {
    expect(mapMenuLineLabelToKey("Quick Answer")).toBe("quick_answer");
    expect(mapMenuLineLabelToKey("Real-world example")).toBe("example");
    expect(mapMenuLineLabelToKey("Deep Dive")).toBe("deep_dive");
    expect(mapMenuLineLabelToKey("Build one together")).toBe("deep_dive");
  });

  it("deep dive hint forbids relationship reflection", () => {
    const hint = learningPathHintForSelection("deep_dive", "mind maps");
    expect(hint).toMatch(/DEEP DIVE/i);
    expect(hint).toMatch(/NOT relationship reflection/i);
    expect(hint).toMatch(/I've noticed/i);
  });
});

describe("deepDiveCatalog", () => {
  it("lists restored Business Playbook deep dive topics", () => {
    expect(DEEP_DIVE_TOPICS.length).toBeGreaterThanOrEqual(5);
    expect(DEEP_DIVE_TOPICS.map((t) => t.label)).toContain("Positioning");
  });

  it("matches deep dive requests", () => {
    expect(matchDeepDiveTopic("Give me a deep dive on pricing")?.id).toBe(
      "pricing",
    );
  });
});
