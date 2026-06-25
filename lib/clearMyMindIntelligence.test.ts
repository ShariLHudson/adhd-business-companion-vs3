import { describe, expect, it } from "vitest";
import { __clearMyMindIntelligenceTest } from "./clearMyMindIntelligence";
import { shariImmediateHoldResponse } from "./clearMyMindCompanionVoice";

const { inferEmotionalTone, extractPeople, extractBusinessTerms, wordCount } =
  __clearMyMindIntelligenceTest;

const SHORT_LINES = [
  "I've got it.",
  "Thank you for sharing that.",
  "I'm glad you told me.",
];

const HEAVY_LINES = [
  "That sounds like a lot to be carrying.",
  "I'm really glad you shared that with me.",
  "We don't have to solve everything right now.",
  "I've got it.",
];

describe("shariImmediateHoldResponse", () => {
  it("responds briefly for a short single thought", () => {
    const line = shariImmediateHoldResponse(["call mom"]);
    expect(SHORT_LINES).toContain(line);
    expect(line).not.toMatch(/call mom/i);
  });

  it("acknowledges weight for emotional or long thoughts", () => {
    const long =
      "I keep putting off the newsletter and feeling guilty about my client waiting and the whole launch timeline slipping again";
    const line = shariImmediateHoldResponse([long]);
    expect(HEAVY_LINES).toContain(line);
    expect(line).not.toMatch(/newsletter|client|launch/i);
  });

  it("holds multiple pieces without inventory language", () => {
    const line = shariImmediateHoldResponse([
      "email Sarah",
      "fix the landing page",
    ]);
    expect(line).not.toMatch(/two|2|separate|thoughts/i);
    expect(line.length).toBeLessThan(80);
  });

  it("respects short-response relief hints", () => {
    const line = shariImmediateHoldResponse({
      parts: ["a medium length thought about tomorrow"],
      submissionIndex: 2,
      hints: { prefersShortResponses: true, prefersVoice: false, prefersTyping: false, oftenContinuesSharing: true },
    });
    expect(SHORT_LINES).toContain(line);
  });
});

describe("clearMyMindIntelligence extractors", () => {
  it("counts words", () => {
    expect(wordCount("one two three")).toBe(3);
    expect(wordCount("  ")).toBe(0);
  });

  it("infers emotional tone", () => {
    expect(inferEmotionalTone("I feel so overwhelmed")).toBe("overwhelm");
    expect(inferEmotionalTone("just a normal Tuesday")).toBeNull();
  });

  it("extracts people names", () => {
    expect(extractPeople("Call Sarah about the launch")).toContain("Sarah");
  });

  it("extracts business terms", () => {
    expect(extractBusinessTerms("newsletter launch for client")).toEqual(
      expect.arrayContaining(["newsletter", "launch", "client"]),
    );
  });
});
