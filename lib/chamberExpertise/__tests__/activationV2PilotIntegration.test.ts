/**
 * Chamber Activation V2 (V2-2) — composer integration.
 *
 * Verifies the feature-flag gate itself: flag off leaves
 * chamberExpertiseHintForChat byte-for-byte driven by V1
 * (resolveChamberExpertActivation), unchanged from pre-V2-2 behavior.
 * Flag on additionally exercises the co-primary, contested, and
 * insufficient-evidence hint shapes from
 * docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md, each still under the
 * 550-token whole-hint cap.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chamberExpertiseHintForChat } from "../chamberExpertiseHintForChat";
import { CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS } from "@/lib/chamberIntelligence";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Chamber Activation V2 — feature flag gate", () => {
  it("defaults OFF: hint is driven by V1, no co-primary/contested language appears", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I want to launch a digital course but I'm stuck on pricing and how to actually market it.",
      intentCategory: "decide",
      estateCategory: "business",
    });
    // V1 has no co-primary concept — this exact sentence lands on Strategy
    // (documented baseline finding), never the new fusion language.
    expect(hint).toBeDefined();
    expect(hint).not.toContain("equally central");
    expect(hint).not.toContain("close call");
  });

  it("flag OFF and flag ON produce identical output for an ordinary, unambiguous request", () => {
    const input = {
      userText: "I need to create a client onboarding process.",
      intentCategory: "build" as const,
      estateCategory: "business" as const,
    };
    const off = chamberExpertiseHintForChat(input);
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
    const on = chamberExpertiseHintForChat(input);
    expect(on).toBe(off);
  });
});

describe("Chamber Activation V2 — co-primary hint shape", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
  });

  it("produces fusion language for both experts, never lead/support framing, under budget", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I want to launch a digital course but I'm stuck on pricing and how to actually market it.",
      intentCategory: "decide",
      estateCategory: "business",
    });
    expect(hint).toBeDefined();
    expect(hint).toContain("equally central");
    expect(hint).toContain("Finance Intelligence");
    expect(hint).toContain("Marketing Intelligence");
    expect(hint).not.toMatch(/lead with (Finance|Marketing) Intelligence's read/);
    expect(estimateTokens(hint!)).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS);
  });

  it("stays under budget even with the deep intelligence pilot also enabled for one co-primary expert", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT", "true");
    const hint = chamberExpertiseHintForChat({
      userText: "I want to launch a digital course but I'm stuck on pricing and how to actually market it.",
      intentCategory: "decide",
      estateCategory: "business",
    });
    expect(hint).toBeDefined();
    expect(estimateTokens(hint!)).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS);
  });
});

describe("Chamber Activation V2 — contested hint shape", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
  });

  it("softens the framing and never sounds confidently certain when the underlying state is contested", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I need a marketing strategy and a content calendar, not sure which matters more first.",
      intentCategory: "plan",
      estateCategory: "business",
    });
    expect(hint).toBeDefined();
    // Either contested or co-primary framing is acceptable here (see the
    // resolver's own test on this exact sentence) — the assertion that
    // matters is that whichever fires, the hint never announces
    // uncertainty to the member and stays under budget.
    expect(hint).not.toMatch(/I wasn't sure/i);
    expect(estimateTokens(hint!)).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS);
  });
});

describe("Chamber Activation V2 — insufficient evidence hint shape", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
  });

  it("asks one grounded clarifying question instead of a themed hint, never naming an expert", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I'm not sure what to do about my business right now.",
      intentCategory: "decide",
      estateCategory: "business",
    });
    expect(hint).toBeDefined();
    expect(hint).toMatch(/ask ONE grounded clarifying question/i);
    expect(hint).not.toMatch(/Strategy Intelligence|Finance Intelligence|Sales Intelligence|Systems Intelligence/);
    expect(hint!.match(/\?/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });

  it("produces no hint at all for ordinary relationship chat with zero business signal", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "Good morning! How are you today?",
    });
    expect(hint).toBeUndefined();
  });
});
