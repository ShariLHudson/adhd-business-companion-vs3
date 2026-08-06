/**
 * Chamber Expertise Contribution Tests — Phase C.5.
 *
 * Phase B/C answered "is the right expert selected?" These tests answer
 * the next question: "does that expert actually change what gets
 * recommended?" — not just get named.
 *
 * Honest scope: these are unit tests against the hint text that reaches
 * the LLM's system prompt, not against the LLM's final generated answer.
 * They verify the *material we hand Shari* is substantive and specific —
 * they cannot verify the model's prose. See
 * docs/estate/CHAMBER_EXPERTISE_CONTRIBUTION_TESTS.md for that scope note
 * and the full rationale.
 */

import { describe, expect, it } from "vitest";
import { chamberExpertiseHintForChat } from "./chamberExpertiseHintForChat";

describe("Chamber Expertise Contribution — Example 1: marketing strategy", () => {
  const hint = chamberExpertiseHintForChat({
    userText: "I need a marketing strategy.",
    intentCategory: "plan",
    estateCategory: "business",
  });

  it("produces a hint (Marketing activates)", () => {
    expect(hint).toBeDefined();
  });

  it("surfaces audience clarity, positioning, channels, message, and testing — not just 'here are marketing ideas'", () => {
    const h = hint!.toLowerCase();
    expect(h).toContain("audience");
    expect(h).toContain("positioning");
    expect(h).toContain("channel");
    expect(h).toMatch(/message|messaging/);
    expect(h).toContain("testing");
  });

  it("is not a bare label — carries a distinctive thinking pattern, not a generic phrase", () => {
    expect(hint).not.toMatch(/here are (some )?marketing ideas/i);
    expect(hint).toContain("Notices when a message is technically true but unclear to a stranger");
  });
});

describe("Chamber Expertise Contribution — Example 2: client onboarding process", () => {
  const hint = chamberExpertiseHintForChat({
    userText: "I need to create a client onboarding process.",
    intentCategory: "build",
    estateCategory: "business",
  });

  it("produces a hint (Systems primary, Client Relationships supporting)", () => {
    expect(hint).toBeDefined();
    expect(hint).toContain("Systems Intelligence");
    expect(hint).toContain("Client Relationships Intelligence");
  });

  it("Systems thinking surfaces repeatability, steps, handoffs, documentation, and before/during/after design", () => {
    const h = hint!.toLowerCase();
    expect(h).toMatch(/repeatable/);
    expect(h).toContain("handoff");
    expect(h).toContain("documentation");
    expect(h).toMatch(/before, during, and after/);
  });

  it("Client Relationships thinking surfaces trust, communication, and member experience", () => {
    const h = hint!.toLowerCase();
    expect(h).toContain("trust");
    expect(h).toContain("communication");
    expect(h).toMatch(/member experience|journey/);
  });
});

describe("Chamber Expertise Contribution — Example 3: two-day ADHD business retreat", () => {
  const hint = chamberExpertiseHintForChat({
    userText: "I want to plan a two-day ADHD business retreat.",
    intentCategory: "plan",
    estateCategory: "business",
  });

  it("produces a hint (Events activates)", () => {
    expect(hint).toBeDefined();
    expect(hint).toContain("Events Intelligence");
  });

  it("surfaces attendee transformation, experience design, logistics, energy management, and ADHD-friendly pacing — not just 'create an agenda'", () => {
    const h = hint!.toLowerCase();
    expect(h).toContain("transformation");
    expect(h).toContain("experience design");
    expect(h).toContain("logistics");
    expect(h).toContain("energy management");
    expect(h).toMatch(/adhd-friendly pacing/);
  });

  it("is not a bare label — never reduces to 'create an agenda'", () => {
    expect(hint).not.toMatch(/^.{0,120}create an agenda/i);
    expect(hint).toContain("Notices the transformation guests are meant to feel before building the agenda");
  });
});

describe("Chamber Expertise Contribution — general quality bar", () => {
  it("every activated expert's hint line names a thinking pattern, not only a label", () => {
    const cases = [
      { userText: "I want to build a business strategy.", intentCategory: "build" as const, estateCategory: "business" as const },
      { userText: "I want to organize my AI documentation.", intentCategory: "organize" as const, estateCategory: "business" as const },
      { userText: "I need help figuring out why clients are not staying engaged.", intentCategory: "understand" as const, estateCategory: "business" as const },
    ];

    for (const input of cases) {
      const hint = chamberExpertiseHintForChat(input);
      expect(hint).toBeDefined();
      // "Bring in:" is the marker that concrete themes (not just a name)
      // follow the thinking pattern for both the primary and each
      // supporting expert.
      const bringInCount = (hint!.match(/Bring in:/g) ?? []).length;
      expect(bringInCount).toBeGreaterThanOrEqual(2); // primary + at least one supporting
    }
  });

  it("never collapses to a name-only hint when a primary is found", () => {
    const hint = chamberExpertiseHintForChat({
      userText: "I need to create a client onboarding process.",
      intentCategory: "build",
      estateCategory: "business",
    });
    expect(hint).toContain("Leading perspective: Systems Intelligence — Notices");
    expect(hint).not.toBe("CHAMBER EXPERTISE: Systems Intelligence.");
  });
});
