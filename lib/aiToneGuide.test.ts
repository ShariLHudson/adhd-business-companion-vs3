import { describe, expect, it } from "vitest";

import { AI_TONE_GUIDES, aiToneLabel } from "./aiToneGuide";
import { normalizeAiTone, type AiTone } from "./companionStore";

describe("aiToneGuide — six distinct companion tones", () => {
  it("defines exactly six tones in product order", () => {
    expect(AI_TONE_GUIDES.map((g) => g.id)).toEqual([
      "gentle",
      "balanced",
      "direct",
      "playful",
      "strategic",
      "motivational",
    ]);
  });

  it("each tone has emoji, example, and feels-like copy", () => {
    for (const guide of AI_TONE_GUIDES) {
      expect(guide.emoji.length).toBeGreaterThan(0);
      expect(guide.feelsLike.length).toBeGreaterThan(10);
      expect(guide.example.length).toBeGreaterThan(20);
    }
  });

  it("formats settings summary labels with emoji except Playful", () => {
    expect(aiToneLabel("strategic")).toBe("🧠 Strategic");
    expect(aiToneLabel("playful")).toBe("Playful");
    expect(aiToneLabel("gentle")).toBe("❤️ Gentle");
  });
});

describe("normalizeAiTone — legacy migration", () => {
  const cases: [unknown, AiTone][] = [
    ["balanced", "balanced"],
    ["gentle", "gentle"],
    ["strategic", "strategic"],
    ["motivational", "motivational"],
    ["calm", "gentle"],
    ["minimal", "direct"],
    ["encouraging", "motivational"],
    ["unknown", "balanced"],
  ];

  it.each(cases)("maps %s → %s", (input, expected) => {
    expect(normalizeAiTone(input)).toBe(expected);
  });
});
