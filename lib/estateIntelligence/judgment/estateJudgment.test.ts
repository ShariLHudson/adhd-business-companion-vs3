import { describe, expect, it } from "vitest";
import {
  evaluateEstateJudgment,
  getAllPurposeProfiles,
  getPurposeProfile,
  GENTLE_GUIDANCE_FORBIDDEN_RE,
} from "@/lib/estateIntelligence/judgment";
import { getEstateKnowledgeRegistry } from "@/lib/estateKnowledge";

function expectGentleGuidance(text: string): void {
  expect(text).not.toMatch(GENTLE_GUIDANCE_FORBIDDEN_RE);
  expect(text).not.toMatch(/Want me to take you/i);
}

describe("estateJudgment", () => {
  it("assigns a purpose profile to every registry place", () => {
    const profiles = getAllPurposeProfiles();
    expect(profiles.length).toBe(getEstateKnowledgeRegistry().places.length);
    for (const profile of profiles) {
      expect(profile.purpose).toBeTruthy();
      expect(profile.primaryFeeling).toBeTruthy();
      expect(profile.idealActivities.length).toBeGreaterThan(0);
    }
  });

  it("Ocean Conservatory purpose profile matches canon", () => {
    const profile = getPurposeProfile("conservatory");
    expect(profile.displayName).toMatch(/Ocean Conservatory/i);
    expect(profile.energyLevel).toBe("low");
    expect(profile.bestFor).toContain("Overwhelm");
    expect(profile.relatedPlaceIds).toContain("reflection-pond");
  });

  it("recommends recover places when overwhelmed — not keyword-only", () => {
    const result = evaluateEstateJudgment({
      userText: "I'm overwhelmed.",
    });
    expect(result.handled).toBe(true);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(result.recommendations.length).toBeLessThanOrEqual(4);
    const placeIds = result.recommendations
      .filter((r) => r.kind === "place")
      .map((r) => r.id);
    expect(
      placeIds.some((id) =>
        ["conservatory", "reflection-pond", "greenhouse", "clear-my-mind"].includes(
          id,
        ),
      ),
    ).toBe(true);
    expect(result.body).toMatch(/why|enjoy|come to mind|quiet|might be/i);
    expect(result.body).not.toMatch(/I don't know|I'm not sure/i);
    expect(result.intro).toMatch(/overwhelm/i);
    expectGentleGuidance(`${result.intro}\n${result.body}`);
    expect(result.suggestions.some((s) => /sounds good/i.test(s))).toBe(true);
    expect(result.suggestions).not.toContain("Visit there");
  });

  it("recommends reading places for read intent", () => {
    const result = evaluateEstateJudgment({
      userText: "I need somewhere to read.",
    });
    expect(result.handled).toBe(true);
    const placeIds = result.recommendations
      .filter((r) => r.kind === "place")
      .map((r) => r.id);
    expect(placeIds.some((id) => ["library", "reading-nook", "conservatory"].includes(id))).toBe(
      true,
    );
    expect(result.recommendations.every((r) => r.why.length > 10)).toBe(true);
  });

  it("recommends thinking places for think intent", () => {
    const result = evaluateEstateJudgment({
      userText: "I need to think.",
    });
    expect(result.handled).toBe(true);
    const placeIds = result.recommendations
      .filter((r) => r.kind === "place")
      .map((r) => r.id);
    expect(
      placeIds.some((id) =>
        ["observatory", "reflection-pond", "decision-compass", "coffee-house"].includes(
          id,
        ),
      ),
    ).toBe(true);
  });

  it("includes focus features for focus intent", () => {
    const result = evaluateEstateJudgment({
      userText: "I need to focus.",
    });
    expect(result.handled).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
    const kinds = result.recommendations.map((r) => r.kind);
    expect(
      kinds.some((k) => k === "place" || k === "music" || k === "feature"),
    ).toBe(true);
  });

  it("organizes room catalog by discovery categories", () => {
    const result = evaluateEstateJudgment({
      userText: "What rooms do you have?",
    });
    expect(result.handled).toBe(true);
    expect(result.body).toMatch(/Reading spaces/);
    expect(result.body).toMatch(/Water spaces/);
    expect(result.body).toMatch(/Treehouse spaces/);
    expect(result.body).not.toMatch(/81 rooms/i);
    expect(result.body).toMatch(/explore one of those/i);
  });

  it("sometimes recommends one place when clear winner", () => {
    const result = evaluateEstateJudgment({
      userText: "I'm completely burned out and need stillness.",
      visitedPlaceIds: [
        "library",
        "reading-nook",
        "coffee-house",
        "round-table",
      ],
    });
    expect(result.handled).toBe(true);
    const places = result.recommendations.filter((r) => r.kind === "place");
    expect(places.length).toBeGreaterThanOrEqual(1);
    expect(places.length).toBeLessThanOrEqual(3);
  });

  it("describes named room story with why", () => {
    const result = evaluateEstateJudgment({
      userText: "Tell me about the Ocean Conservatory",
    });
    expect(result.handled).toBe(true);
    expect(result.matchedPlaceId).toBe("conservatory");
    expect(result.body).toMatch(/Ocean Conservatory|conservatory/i);
    expect(result.body).not.toMatch(/I don't know/i);
    expectGentleGuidance(`${result.intro}\n${result.body}`);
  });

  it("follows Rule of Gentle Guidance — recommends, never directs", () => {
    const cases = [
      "I'm overwhelmed.",
      "I need somewhere to read.",
      "I need to focus.",
      "Tell me about the Greenhouse",
    ];
    for (const userText of cases) {
      const result = evaluateEstateJudgment({ userText });
      expect(result.handled).toBe(true);
      expectGentleGuidance(`${result.intro}\n${result.body}`);
      for (const suggestion of result.suggestions) {
        expectGentleGuidance(suggestion);
        expect(suggestion).not.toMatch(/^Visit /i);
      }
    }
  });
});
