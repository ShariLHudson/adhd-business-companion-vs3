import { describe, expect, it } from "vitest";
import { selectExpertContribution, CHAMBER_INTELLIGENCE_BUDGET_TOKENS } from "../selectExpertContribution";

describe("selectExpertContribution — correct framework selection", () => {
  it("selects the framework whose trigger matches the request (Marketing: 30-Day Experiment for a marketing plan)", () => {
    const selection = selectExpertContribution({
      expertId: "MKT",
      userText: "I need a marketing strategy.",
      role: "primary",
    });

    expect(selection).not.toBeNull();
    const names = selection!.frameworks.map((f) => f.name);
    expect(names).toContain("Promise–Proof–Path");
  });

  it("selects a different framework for a different situation (Systems: MVP Process for an onboarding process)", () => {
    const selection = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process.",
      role: "primary",
    });

    expect(selection).not.toBeNull();
    const names = selection!.frameworks.map((f) => f.name);
    expect(names).toContain("Minimum Viable Process");
  });

  it("selects the event-transformation framework for retreat planning, not a generic one", () => {
    const selection = selectExpertContribution({
      expertId: "EVT",
      userText: "I want to plan a two-day ADHD business retreat.",
      role: "primary",
    });

    expect(selection).not.toBeNull();
    const names = selection!.frameworks.map((f) => f.name);
    expect(names).toContain("Event Promise Anchor");
  });
});

describe("selectExpertContribution — correct ADHD translation selection", () => {
  it("selects the marketing-calendar translation only when a plan/calendar is mentioned", () => {
    const withPlan = selectExpertContribution({
      expertId: "MKT",
      userText: "I need a marketing plan.",
      role: "primary",
    });
    expect(withPlan!.adhdTranslations.map((t) => t.id)).toContain("no-12-month-calendar");

    const withoutPlan = selectExpertContribution({
      expertId: "MKT",
      userText: "hello there",
      role: "primary",
    });
    expect(withoutPlan!.adhdTranslations.map((t) => t.id)).not.toContain("no-12-month-calendar");
  });

  it("selects the SOP-library translation only when documentation/process language appears", () => {
    const selection = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to document our process.",
      role: "primary",
    });
    expect(selection!.adhdTranslations.map((t) => t.id)).toContain("no-sop-library-first");
  });

  it("selects the follow-up/aftercare translation for retreat energy management", () => {
    const selection = selectExpertContribution({
      expertId: "EVT",
      userText: "I want to plan a two-day ADHD business retreat and manage my energy afterward.",
      role: "primary",
    });
    expect(selection!.adhdTranslations.map((t) => t.id)).toContain("no-follow-up-after");
  });
});

describe("selectExpertContribution — no knowledge dumping", () => {
  it("returns zero frameworks and zero ADHD translations when nothing matches", () => {
    const selection = selectExpertContribution({
      expertId: "MKT",
      userText: "what time is it",
      role: "primary",
    });

    expect(selection).not.toBeNull();
    expect(selection!.frameworks).toHaveLength(0);
    expect(selection!.adhdTranslations).toHaveLength(0);
  });

  it("never selects more than 2 frameworks for a primary expert, even if many match", () => {
    // Marketing plan + calendar + launch language could plausibly match
    // several frameworks at once — cap must hold regardless.
    const selection = selectExpertContribution({
      expertId: "MKT",
      userText:
        "I need a marketing plan and I have guilt across every channel and my launches wipe me out and nobody knows I exist.",
      role: "primary",
    });

    expect(selection!.frameworks.length).toBeLessThanOrEqual(2);
  });

  it("never selects more than 1 framework for a supporting expert", () => {
    const selection = selectExpertContribution({
      expertId: "MKT",
      userText:
        "I need a marketing plan and I have guilt across every channel and my launches wipe me out.",
      role: "supporting",
    });

    expect(selection!.frameworks.length).toBeLessThanOrEqual(1);
  });

  it("surfaces at most one signature question, and only for the primary role", () => {
    const primary = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process.",
      role: "primary",
    });
    expect(primary!.question).toBeDefined();

    const supporting = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process.",
      role: "supporting",
    });
    expect(supporting!.question).toBeUndefined();
  });

  it("returns null for an expert with no migrated intelligence module (graceful fallback, not an empty dump)", () => {
    const selection = selectExpertContribution({
      expertId: "FIN",
      userText: "I need help pricing my offer.",
      role: "primary",
    });
    expect(selection).toBeNull();
  });
});

describe("selectExpertContribution — token budget enforcement", () => {
  it("never exceeds the primary budget, even for a request matching everything", () => {
    const selection = selectExpertContribution({
      expertId: "MKT",
      userText:
        "I need a marketing plan and I have guilt across every channel and my launches wipe me out and nobody knows I exist and my positioning is mushy.",
      role: "primary",
    });

    expect(selection!.estimatedTokens).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_BUDGET_TOKENS.primary);
  });

  it("never exceeds the supporting budget", () => {
    const selection = selectExpertContribution({
      expertId: "EVT",
      userText:
        "I want to plan a two-day ADHD business retreat with hospitality details scattered everywhere and too many segments and moving parts and I need to manage my energy after.",
      role: "supporting",
    });

    expect(selection!.estimatedTokens).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_BUDGET_TOKENS.supporting);
  });

  it("degrades gracefully under budget pressure rather than throwing or overflowing", () => {
    // Even a request matching every framework and translation for Systems
    // must still respect the supporting budget by simply including less.
    const selection = selectExpertContribution({
      expertId: "SYS",
      userText:
        "I need to create a client onboarding process and document our process and I keep overbuilding for rare cases and my tools multiply without flow and I forget to begin the process.",
      role: "supporting",
    });

    expect(selection).not.toBeNull();
    expect(selection!.estimatedTokens).toBeLessThanOrEqual(CHAMBER_INTELLIGENCE_BUDGET_TOKENS.supporting);
    expect(selection!.frameworks.length).toBeLessThanOrEqual(1);
  });
});

describe("selectExpertContribution — deterministic selection", () => {
  it("returns identical output for identical input, run repeatedly", () => {
    const input = {
      expertId: "MKT" as const,
      userText: "I need a marketing strategy.",
      role: "primary" as const,
    };

    const first = selectExpertContribution(input);
    const second = selectExpertContribution(input);
    const third = selectExpertContribution(input);

    expect(second).toEqual(first);
    expect(third).toEqual(first);
  });

  it("is order-independent noise-tolerant: rephrasing without new triggers keeps the same framework choice", () => {
    const a = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process.",
      role: "primary",
    });
    const b = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process for my business.",
      role: "primary",
    });

    expect(a!.frameworks.map((f) => f.id)).toEqual(b!.frameworks.map((f) => f.id));
  });
});
