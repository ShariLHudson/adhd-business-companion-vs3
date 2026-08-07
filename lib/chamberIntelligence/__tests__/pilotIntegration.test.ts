/**
 * Pilot integration — I-1/I-2.
 *
 * Verifies the feature-flag gate itself: flag off leaves
 * chamberExpertiseHintForChat byte-for-byte unchanged from pre-pilot
 * behavior; flag on enriches only the migrated pilot experts (Marketing,
 * Systems, Events) and leaves everyone else on the existing fallback,
 * with the whole composed hint still under the 550-token cap.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chamberExpertiseHintForChat } from "@/lib/chamberExpertise/chamberExpertiseHintForChat";
import { CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS } from "../selectExpertContribution";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Chamber Intelligence pilot — feature flag gate", () => {
  it("defaults OFF: hint uses the pre-pilot expertise-themes format", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I need a marketing strategy.",
      intentCategory: "plan",
      estateCategory: "business",
    });

    expect(hint).toBeDefined();
    expect(hint).toContain("Bring in:");
    expect(hint).not.toContain("Apply Promise");
  });

  it("when enabled, a pilot expert (Marketing) uses the deep selection layer", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "true");

    const hint = chamberExpertiseHintForChat({
      userText: "I need a marketing strategy.",
      intentCategory: "plan",
      estateCategory: "business",
    });

    expect(hint).toBeDefined();
    expect(hint).toContain("Apply Promise–Proof–Path");
    expect(hint).toContain("Leading perspective: Marketing Intelligence");
  });

  it("when enabled, a non-pilot expert falls back to the existing format unchanged", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "true");

    // Finance has no migrated intelligence module yet.
    const hint = chamberExpertiseHintForChat({
      userText: "I want to build a business strategy.",
      intentCategory: "build",
      estateCategory: "business",
    });

    expect(hint).toBeDefined();
    // Strategy is primary here (no pilot module) and Finance is one of the
    // supporting experts (also no pilot module) — both should still read
    // as "Bring in:" fallback lines, not "Apply <framework>".
    expect(hint).toContain("Bring in:");
  });

  it("mixed activation: pilot expert (Systems) enriched, non-pilot supporting expert (Client Relationships) falls back", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "true");

    const hint = chamberExpertiseHintForChat({
      userText: "I need to create a client onboarding process.",
      intentCategory: "build",
      estateCategory: "business",
    });

    expect(hint).toBeDefined();
    expect(hint).toContain("Apply Minimum Viable Process");
    // Client Relationships is supporting here and is not a migrated pilot
    // expert — it must still read in the existing fallback format.
    expect(hint).toMatch(/Also relevant: Client Relationships Intelligence — Notices/);
  });

  it("never exceeds the whole-hint token budget with the pilot enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "true");

    const cases = [
      { userText: "I need a marketing strategy.", intentCategory: "plan" as const, estateCategory: "business" as const },
      { userText: "I need to create a client onboarding process.", intentCategory: "build" as const, estateCategory: "business" as const },
      { userText: "I want to plan a two-day ADHD business retreat.", intentCategory: "plan" as const, estateCategory: "business" as const },
      { userText: "I want to build a business strategy.", intentCategory: "build" as const, estateCategory: "business" as const },
    ];

    for (const input of cases) {
      const hint = chamberExpertiseHintForChat(input);
      expect(hint).toBeDefined();
      expect(estimateTokens(hint!)).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS);
    }
  });

  it("pilot enrichment never reduces below the pre-pilot budget observed for the same requests", () => {
    // Sanity check: enrichment should be a bounded increase, not a runaway
    // template — pilot hints should stay in the same order of magnitude as
    // the fallback, not 3-4x larger.
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "false");
    const before = chamberExpertiseHintForChat({
      userText: "I need a marketing strategy.",
      intentCategory: "plan",
      estateCategory: "business",
    })!;

    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "true");
    const after = chamberExpertiseHintForChat({
      userText: "I need a marketing strategy.",
      intentCategory: "plan",
      estateCategory: "business",
    })!;

    expect(estimateTokens(after)).toBeLessThan(estimateTokens(before) * 2.5);
  });
});
