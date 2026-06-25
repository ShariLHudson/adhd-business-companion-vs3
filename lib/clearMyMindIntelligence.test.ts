import { describe, expect, it } from "vitest";
import { __clearMyMindIntelligenceTest } from "./clearMyMindIntelligence";
import { shariImmediateHoldResponse } from "./clearMyMindCompanionVoice";

const { inferEmotionalTone, extractPeople, extractBusinessTerms, wordCount } =
  __clearMyMindIntelligenceTest;

describe("shariImmediateHoldResponse", () => {
  it("responds briefly for a short single thought", () => {
    expect(shariImmediateHoldResponse(["call mom"])).toBe("I've got this.");
  });

  it("acknowledges weight for a longer single thought", () => {
    const long =
      "I keep putting off the newsletter and feeling guilty about my client waiting and the whole launch timeline slipping again";
    expect(shariImmediateHoldResponse([long])).toBe(
      "That's a lot to carry. I've got it.",
    );
  });

  it("holds multiple pieces safely", () => {
    expect(
      shariImmediateHoldResponse(["email Sarah", "fix the landing page"]),
    ).toBe("I've got all of this — every piece is held safely.");
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
