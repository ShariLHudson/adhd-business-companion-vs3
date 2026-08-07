import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chamberExpertiseHintForChat } from "./chamberExpertiseHintForChat";

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("chamberExpertiseHintForChat", () => {
  it("returns undefined for empty text", () => {
    expect(chamberExpertiseHintForChat({ userText: "" })).toBeUndefined();
    expect(chamberExpertiseHintForChat({ userText: "   " })).toBeUndefined();
  });

  it("returns undefined when there is zero signal anywhere (no forced activation)", () => {
    expect(chamberExpertiseHintForChat({ userText: "hello there" })).toBeUndefined();
  });

  it("V2 (default as of the flip): a single weak keyword asks a clarifying question instead of staying silent", () => {
    // "system" alone is real but weak (single-keyword) signal for Systems
    // — V2's insufficient-evidence state builds a clarifying question
    // from it rather than V1's old silent `undefined`. See
    // docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md.
    const hint = chamberExpertiseHintForChat({ userText: "system" });
    expect(hint).toBeDefined();
    expect(hint).toMatch(/ask ONE grounded clarifying question/i);
  });

  it("V1 (explicit rollback): the same weak keyword stays silent, matching pre-V2-2 behavior", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "false");
    expect(chamberExpertiseHintForChat({ userText: "system" })).toBeUndefined();
  });

  it("returns a hint naming the primary expert when confidence is high enough", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I need to create a client onboarding process.",
      intentCategory: "build",
      estateCategory: "business",
    });

    expect(hint).toBeDefined();
    expect(hint).toContain("Systems Intelligence");
    expect(hint).toContain("Client Relationships Intelligence");
  });

  it("instructs Shari never to announce the expert or perform a handoff", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I need a marketing strategy.",
      intentCategory: "plan",
      estateCategory: "business",
    });

    expect(hint).toBeDefined();
    // The forbidden phrases ("bringing in the Marketing expert", "now talking
    // to Systems") appear only as explicit counter-examples inside a
    // "do not say things like ..." instruction — verify that framing, not a
    // bare absence of the words (which would also match a hint that never
    // warned against them at all).
    expect(hint).toMatch(/do not announce them.*say things like/i);
    expect(hint).toContain("never a handoff");
    expect(hint).toContain("Spark is helping me think");
  });

  it("is internal-only and never member-facing (never says the label out loud as a persona)", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I want to plan a two-day ADHD business retreat.",
      intentCategory: "plan",
      estateCategory: "business",
    });

    expect(hint).toContain("Speak only as Shari");
  });
});
