import { describe, expect, it } from "vitest";
import {
  appendResearchToAnswer,
  buildAvatarResearchAutoPrompt,
  buildAvatarResearchSystemPrompt,
} from "./clientAvatarResearch";

describe("buildAvatarResearchSystemPrompt", () => {
  it("includes the question, current answer, prior context and avatar name", () => {
    const prompt = buildAvatarResearchSystemPrompt({
      questionLabel: "What are they struggling with most?",
      currentAnswer: "Too many tabs open",
      priorAnswers: [{ label: "Who they help", value: "Solo founders" }],
      avatarName: "Burned Out Coach",
    });
    expect(prompt).toContain("What are they struggling with most?");
    expect(prompt).toContain("Too many tabs open");
    expect(prompt).toContain("Who they help: Solo founders");
    expect(prompt).toContain("Burned Out Coach");
    // Never routes to escalation.
    expect(prompt).toMatch(/Never mention .*Chamber.*Board/);
  });

  it("marks an empty answer clearly", () => {
    const prompt = buildAvatarResearchSystemPrompt({
      questionLabel: "What are they trying to achieve?",
    });
    expect(prompt).toContain("(empty so far)");
  });
});

describe("buildAvatarResearchAutoPrompt", () => {
  it("references the draft when one exists", () => {
    const p = buildAvatarResearchAutoPrompt({
      questionLabel: "Q",
      currentAnswer: "My draft",
    });
    expect(p).toContain("My draft");
  });
  it("is generic when there is no draft", () => {
    const p = buildAvatarResearchAutoPrompt({ questionLabel: "Q" });
    expect(p.toLowerCase()).toContain("think through this question");
    expect(p).not.toContain("draft so far");
  });
});

describe("appendResearchToAnswer", () => {
  it("uses the addition when the answer is empty", () => {
    expect(appendResearchToAnswer("", "Fresh insight")).toBe("Fresh insight");
    expect(appendResearchToAnswer("   ", "Fresh insight")).toBe("Fresh insight");
  });

  it("appends with a clean blank line and preserves existing text", () => {
    expect(appendResearchToAnswer("My own words.", "Shari's angle")).toBe(
      "My own words.\n\nShari's angle",
    );
  });

  it("never loses existing text and trims the addition", () => {
    const existing = "Line one\nLine two";
    const result = appendResearchToAnswer(existing, "  padded addition  ");
    expect(result.startsWith(existing)).toBe(true);
    expect(result).toContain("padded addition");
    expect(result).not.toContain("padded addition  ");
  });

  it("leaves the answer unchanged for an empty addition", () => {
    expect(appendResearchToAnswer("Existing", "   ")).toBe("Existing");
  });
});
