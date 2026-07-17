import { describe, expect, it } from "vitest";
import {
  structureMultiItemResponse,
  shouldStructureMultiItemResponse,
} from "./structureMultiItemResponse";
import {
  formatAssistantParagraphs,
  plainLanguageFormattingHintForPrompt,
  toPlainLanguageDisplay,
} from "./plainLanguageFormatting";

describe("structureMultiItemResponse", () => {
  it("splits a crushed numbered exit-planning paragraph into separate items", () => {
    const raw =
      "Planning an exit for your business is crucial for maximizing value and ensuring a smooth transition. Here are some key points to consider: 1. Determine Your Goals: Why are you considering an exit—retirement, a new venture, or other reasons? 2. Valuation: Get a professional valuation to understand your business's worth. 3. Financial Records: Ensure your financial statements are in order. 4. Legal Considerations: Review contracts and ownership documents. 5. Timing: Consider market conditions. 6. Potential Buyers: Identify who might take over. Would you like to dive deeper into any of these areas?";

    const out = structureMultiItemResponse(raw);
    expect(out).toMatch(/^Planning an exit[\s\S]*\n\n1\. Determine Your Goals/);
    expect(out).toContain("\n\n2. Valuation:");
    expect(out).toContain("\n\n3. Financial Records:");
    expect(out).toContain("\n\n6. Potential Buyers:");
    expect(out).not.toMatch(/consider: 1\. Determine/);
    expect(shouldStructureMultiItemResponse(raw)).toBe(true);
  });

  it("formats three options", () => {
    const raw =
      "Your options are: 1. Stay the course for now. 2. Pause and revisit next month. 3. Hand the decision to a trusted partner.";
    const out = structureMultiItemResponse(raw);
    expect(out).toContain("\n\n1. Stay the course");
    expect(out).toContain("\n\n2. Pause and revisit");
    expect(out).toContain("\n\n3. Hand the decision");
  });

  it("formats pros and cons style numbered points", () => {
    const raw =
      "Pros and cons to weigh: 1. Pros — less overhead and more focus. 2. Cons — you may miss a tool you still need occasionally.";
    const out = structureMultiItemResponse(raw);
    expect(out).toContain("\n\n1. Pros");
    expect(out).toContain("\n\n2. Cons");
  });

  it("adds spacing between already line-broken numbered items", () => {
    const raw = "A few steps.\n1. First step\n2. Second step\n3. Third step";
    const out = structureMultiItemResponse(raw);
    expect(out).toContain("1. First step\n\n2. Second step\n\n3. Third step");
  });

  it("leaves one-paragraph emotional support alone", () => {
    const raw =
      "That sounds heavy. You do not have to figure out the whole exit tonight — just knowing it is on your mind is enough for now.";
    expect(structureMultiItemResponse(raw)).toBe(raw);
    expect(shouldStructureMultiItemResponse(raw)).toBe(false);
  });

  it("leaves a direct factual answer alone", () => {
    const raw = "Your Plan My Day lives under My Day and Work on Welcome Home.";
    expect(structureMultiItemResponse(raw)).toBe(raw);
  });

  it("does not corrupt dates and decimal numbers", () => {
    const raw =
      "We said March 3, 2024, and the fee was about 2.5 percent with a 1.5 hour call. Version 2.0 is enough for now.";
    expect(structureMultiItemResponse(raw)).toBe(raw);
  });

  it("preserves fenced code blocks", () => {
    const raw =
      "Try this snippet:\n\n```ts\nconst rate = 2.5;\n```\n\nThen continue.";
    expect(structureMultiItemResponse(raw)).toContain("```ts\nconst rate = 2.5;\n```");
  });

  it("preserves markdown links", () => {
    const raw = "See [Plan My Day](https://example.com/plan) when you are ready.";
    expect(structureMultiItemResponse(raw)).toContain(
      "[Plan My Day](https://example.com/plan)",
    );
  });

  it("does not destroy user text that mentions numbered items in a quote-like sentence without a list sequence", () => {
    const raw = 'You wrote "I already did step 1. Determine goals yesterday." That counts.';
    // Has "1. Determine" but no 2. — should stay intact
    expect(structureMultiItemResponse(raw)).toBe(raw);
  });

  it("is idempotent on already structured lists", () => {
    const once = structureMultiItemResponse(
      "Intro. 1. One thing here. 2. Two things here. 3. Three things here.",
    );
    const twice = structureMultiItemResponse(once);
    expect(twice).toBe(once);
  });

  it("display path and prompt rule include multi-item guidance", () => {
    expect(plainLanguageFormattingHintForPrompt()).toMatch(
      /Never place a numbered list inside one continuous paragraph/i,
    );
    const display = toPlainLanguageDisplay(
      "Here are several things to consider: 1. Alpha path forward. 2. Beta path if needed. 3. Gamma as a backup.",
    );
    expect(display).toContain("\n\n1. Alpha");
    expect(display).toContain("\n\n2. Beta");
    const paras = formatAssistantParagraphs(
      "Key points include: 1. First recommendation. 2. Second recommendation. 3. Third recommendation.",
    );
    expect(paras.length).toBeGreaterThanOrEqual(4);
    expect(paras.some((p) => p.startsWith("1."))).toBe(true);
  });
});
