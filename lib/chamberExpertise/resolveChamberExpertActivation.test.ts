import { describe, expect, it } from "vitest";
import { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";

describe("resolveChamberExpertActivation — worked examples", () => {
  it("Example 1: client onboarding process → Systems primary, Client Relationships supporting, Knowledge Management possible", () => {
    const result = resolveChamberExpertActivation({
      userText: "I need to create a client onboarding process.",
      intentCategory: "build",
      estateCategory: "business",
    });

    expect(result.primary).toBe("SYS");
    expect(result.supporting).toContain("CR");
    expect(result.possible).toContain("KMG");
    expect(result.confidence).not.toBe("low");
  });

  it("Example 2: marketing strategy → Marketing primary, Strategy + Client Relationships supporting", () => {
    const result = resolveChamberExpertActivation({
      userText: "I need a marketing strategy.",
      intentCategory: "plan",
      estateCategory: "business",
    });

    expect(result.primary).toBe("MKT");
    expect(result.supporting).toContain("STR");
    expect(result.supporting).toContain("CR");
  });

  it("Example 3: two-day ADHD business retreat → Events primary, Marketing + Client Relationships supporting", () => {
    const result = resolveChamberExpertActivation({
      userText: "I want to plan a two-day ADHD business retreat.",
      intentCategory: "plan",
      estateCategory: "business",
    });

    expect(result.primary).toBe("EVT");
    expect(result.supporting).toContain("MKT");
    expect(result.supporting).toContain("CR");
  });
});

describe("resolveChamberExpertActivation — anti-single-keyword rule", () => {
  it("does not activate a primary from userText alone, with no intent or estate signal", () => {
    const result = resolveChamberExpertActivation({
      userText: "system",
    });

    expect(result.primary).toBeNull();
    expect(result.supporting).toEqual([]);
    expect(result.confidence).toBe("low");
  });

  it("does not activate a primary from a topic match plus a single weak corroboration below the multi-signal floor", () => {
    // Topic match only (no intentCategory, no estateCategory, no legacy expert ids)
    // must never be enough on its own, regardless of how many phrases match.
    const result = resolveChamberExpertActivation({
      userText: "system workflow checklist handoffs sop process",
    });

    expect(result.primary).toBeNull();
  });

  it("activates once a second independent signal (intent category) corroborates the topic match", () => {
    const result = resolveChamberExpertActivation({
      userText: "I need to build a system for my workflow.",
      intentCategory: "build",
    });

    expect(result.primary).toBe("SYS");
  });

  it("treats an empty request as no activation", () => {
    const result = resolveChamberExpertActivation({ userText: "" });
    expect(result.primary).toBeNull();
    expect(result.confidence).toBe("low");
  });
});

describe("resolveChamberExpertActivation — legacy expert id corroboration", () => {
  it("treats an already-resolved Estate Brain expert id as a strong corroborating signal", () => {
    const result = resolveChamberExpertActivation({
      userText: "help me with this",
      legacyExpertIds: ["business-strategist"],
    });

    // Legacy id alone (1 signal group) still should not be sufficient —
    // this documents current behavior and the multi-signal requirement.
    expect(result.primary).toBeNull();
  });

  it("combines with a topic match to activate the aliased canonical expert", () => {
    const result = resolveChamberExpertActivation({
      userText: "I need a marketing strategy.",
      legacyExpertIds: ["business-strategist"],
    });

    expect(result.primary).toBe("STR");
  });
});

describe("resolveChamberExpertActivation — determinism", () => {
  it("returns the same result for the same input", () => {
    const input = {
      userText: "I need to create a client onboarding process.",
      intentCategory: "build" as const,
      estateCategory: "business" as const,
    };
    const first = resolveChamberExpertActivation(input);
    const second = resolveChamberExpertActivation(input);
    expect(second).toEqual(first);
  });
});
