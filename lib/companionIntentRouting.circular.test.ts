import { describe, expect, it } from "vitest";

/**
 * Regression: companionIntentRouting ↔ messageClassification circular import
 * must not throw ReferenceError on RESEARCH_ACADEMIC_RE at module init.
 */
describe("companionIntentRouting circular import safety", () => {
  it("loads classifyCompanionIntentBucket after messageClassification chain", async () => {
    await import("./messageClassification");
    const { classifyCompanionIntentBucket } = await import(
      "./companionIntentRouting"
    );
    expect(classifyCompanionIntentBucket("what does research say about ADHD")).toBe(
      "research",
    );
    expect(() =>
      classifyCompanionIntentBucket("lets work on the email"),
    ).not.toThrow();
  });
});
