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

  it("does not recommend scenic places for bare overwhelm", () => {
    const result = evaluateEstateJudgment({
      userText: "I'm overwhelmed.",
    });
    expect(result.handled).toBe(false);
    expect(result.recommendations).toEqual([]);
    expect(result.body).toBe("");
  });

  it("recommends recover places when overwhelm includes place-seeking", () => {
    const result = evaluateEstateJudgment({
      userText: "I'm overwhelmed and need somewhere quiet.",
    });
    expect(result.handled).toBe(true);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(result.recommendations.length).toBeLessThanOrEqual(4);
    const placeIds = result.recommendations
      .filter((r) => r.kind === "place")
      .map((r) => r.id);
    expect(placeIds.length).toBeGreaterThan(0);
    expect(result.body).not.toMatch(/I don't know|I'm not sure/i);
    expectGentleGuidance(`${result.intro}\n${result.body}`);
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

  it("does not open place menus for bare think intent", () => {
    const result = evaluateEstateJudgment({
      userText: "I need to think.",
    });
    expect(result.handled).toBe(false);
    expect(result.recommendations).toEqual([]);
  });

  it("does not open place menus for bare focus intent", () => {
    const result = evaluateEstateJudgment({
      userText: "I need to focus.",
    });
    expect(result.handled).toBe(false);
    expect(result.recommendations).toEqual([]);
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

  it("sometimes recommends one place when clear winner with place-seeking", () => {
    const result = evaluateEstateJudgment({
      userText:
        "I'm completely burned out and need somewhere still and quiet.",
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
      "I'm overwhelmed and need somewhere quiet.",
      "I need somewhere to read.",
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

  it("does not route how-to / email automation into room menus", () => {
    const cases = [
      "i need to know about how to automate my email system as i get so much junk",
      "how do I filter junk from my inbox",
      "help me automate my email so I stop drowning in spam",
      "what's a good way to organize client emails",
    ];
    for (const userText of cases) {
      const result = evaluateEstateJudgment({ userText });
      expect(result.handled).toBe(false);
      expect(result.body).toBe("");
      expect(result.recommendations).toEqual([]);
    }
  });
});
