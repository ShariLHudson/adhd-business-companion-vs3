import { describe, expect, it } from "vitest";
import {
  detectAiVoiceIssues,
  memberRequestedStructuredOutput,
  scrubAiVoiceFormatting,
  scrubAiVoicePhrases,
  SPARK_HUMAN_VOICE_PROMPT_BLOCK,
} from "./sparkHumanVoice";

describe("sparkHumanVoice", () => {
  it("detects banned AI phrases", () => {
    const issues = detectAiVoiceIssues("Great question! Let's dive in.");
    expect(issues.some((i) => i.kind === "phrase")).toBe(true);
  });

  it("detects markdown headings", () => {
    const issues = detectAiVoiceIssues("### Step one\nDo the thing.");
    expect(issues.some((i) => i.kind === "markdown_heading")).toBe(true);
  });

  it("allows structure when member asked for steps", () => {
    expect(
      memberRequestedStructuredOutput("Give me step-by-step instructions"),
    ).toBe(true);
    const issues = detectAiVoiceIssues(
      "1. First\n2. Second\n3. Third\n4. Fourth",
      "Give me step-by-step instructions",
    );
    expect(issues.some((i) => i.kind === "numbered_framework")).toBe(false);
  });

  it("scrubs headings and bold", () => {
    const result = scrubAiVoiceFormatting("## Title\n\n**Bold** idea.");
    expect(result.rewritten).toBe(true);
    expect(result.text).not.toMatch(/^##/);
    expect(result.text).not.toContain("**");
  });

  it("scrubs filler phrases", () => {
    const result = scrubAiVoicePhrases(
      "Great question! Here's what I'd try.",
    );
    expect(result.text).not.toMatch(/great question/i);
  });

  it("includes final voice check in prompt block", () => {
    expect(SPARK_HUMAN_VOICE_PROMPT_BLOCK).toMatch(/Would Shari say this/i);
    expect(SPARK_HUMAN_VOICE_PROMPT_BLOCK).toMatch(/Let's dive in/i);
  });
});
