import { describe, expect, it } from "vitest";
import { chamberExpertiseHintForChat } from "./chamberExpertiseHintForChat";

describe("chamberExpertiseHintForChat", () => {
  it("returns undefined for empty text", () => {
    expect(chamberExpertiseHintForChat({ userText: "" })).toBeUndefined();
    expect(chamberExpertiseHintForChat({ userText: "   " })).toBeUndefined();
  });

  it("returns undefined when confidence is low (no forced activation)", () => {
    expect(chamberExpertiseHintForChat({ userText: "hello there" })).toBeUndefined();
    expect(
      chamberExpertiseHintForChat({ userText: "system" }),
    ).toBeUndefined();
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
    expect(hint).toMatch(/do not announce it.*say things like/i);
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
