import { describe, expect, it } from "vitest";
import {
  formatAssistantParagraphs,
  plainLanguageFormattingHintForPrompt,
  toPlainLanguageDisplay,
} from "./plainLanguageFormatting";

describe("plainLanguageFormatting", () => {
  it("includes the global rule in prompt hints", () => {
    expect(plainLanguageFormattingHintForPrompt()).toMatch(/Do NOT use markdown heading/i);
    expect(plainLanguageFormattingHintForPrompt()).toMatch(/---/);
  });

  it("strips headings, separators, and bold", () => {
    const raw = `### Welcome Back
---
What would you like to work on today?
---
• **Finish** the newsletter`;
    expect(toPlainLanguageDisplay(raw)).toBe(
      "Welcome Back\n\nWhat would you like to work on today?\n\n• Finish the newsletter",
    );
  });

  it("normalizes markdown bullets", () => {
    expect(toPlainLanguageDisplay("- one\n- two")).toBe("• one\n• two");
  });

  it("formats assistant paragraphs after cleanup", () => {
    expect(formatAssistantParagraphs("### Hi\n\nStill here.")).toEqual([
      "Hi",
      "Still here.",
    ]);
  });
});
