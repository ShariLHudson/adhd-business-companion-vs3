import { describe, expect, it } from "vitest";
import {
  buildResearchLibrarySystemPrompt,
  pickResearchLibraryGuidance,
} from "./researchLibraryConfig";
import { findingMayShowCitation, makeFinding } from "@/lib/research/types";

describe("researchLibraryConfig — topic packs as built_in_guidance", () => {
  it("returns framework guidance for a matching topic", () => {
    const guidance = pickResearchLibraryGuidance("How do I start a podcast?");
    expect(guidance.length).toBeGreaterThan(0);
    for (const item of guidance) {
      expect(item.id).toMatch(/^rl-guidance-/);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.content.length).toBeGreaterThan(0);
      expect(item.kind).toBeTruthy();
    }
  });

  it("returns no guidance for an unmatched topic", () => {
    expect(pickResearchLibraryGuidance("quantum tuna futures")).toEqual([]);
  });

  it("guidance can never become a citation", () => {
    const guidance = pickResearchLibraryGuidance("advisory board");
    expect(guidance.length).toBeGreaterThan(0);
    for (const item of guidance) {
      const finding = makeFinding({
        id: item.id,
        title: item.title,
        content: item.content,
        kind: item.kind ?? "theme",
        evidenceBasis: "built_in_guidance",
      });
      expect(finding.sources).toEqual([]);
      expect(findingMayShowCitation(finding)).toBe(false);
    }
  });
});

describe("researchLibraryConfig — honest Explore prompt", () => {
  it("frames guidance and explicitly forbids fabricating sources", () => {
    const prompt = buildResearchLibrarySystemPrompt({ topic: "advisory board" });
    expect(prompt).toContain("advisory board");
    expect(prompt).toMatch(/frameworks|proven models|practical principles/i);
    expect(prompt).toMatch(/Do NOT invent citations/i);
    expect(prompt).toMatch(/NOT live internet research/i);
  });

  it("includes optional prior context when provided", () => {
    const prompt = buildResearchLibrarySystemPrompt({
      topic: "pricing",
      priorContext: "Sells coaching packages.",
    });
    expect(prompt).toContain("Sells coaching packages.");
  });
});
