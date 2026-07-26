import { describe, expect, it } from "vitest";
import {
  appendResearchToAnswer,
  appendToResearchArea,
  buildAvatarResearchAutoPrompt,
  buildAvatarResearchSystemPrompt,
  describeResearchArea,
} from "./clientAvatarResearch";

const MODULE_LABELS = {
  behavioral: "Behavioral patterns — how they react",
  motivation: "Motivation drivers — what moves them",
};

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

describe("describeResearchArea (Step 10 per-area scoping)", () => {
  it("resolves a module key to its label + current text", () => {
    const area = describeResearchArea(
      { behavioral: "They procrastinate under stress" },
      "behavioral",
      MODULE_LABELS,
    );
    expect(area).toEqual({
      label: "Behavioral patterns — how they react",
      currentAnswer: "They procrastinate under stress",
    });
  });

  it("resolves a custom field by index, falling back to a friendly label", () => {
    const research = { custom: [{ label: "", value: "test idea" }] };
    expect(describeResearchArea(research, "custom:0", MODULE_LABELS)).toEqual({
      label: "Custom research field",
      currentAnswer: "test idea",
    });
    // A custom index that no longer exists resolves to null (caller skips).
    expect(describeResearchArea(research, "custom:5", MODULE_LABELS)).toBeNull();
  });
});

describe("appendToResearchArea (Add to This Area)", () => {
  it("appends to one module without touching any other area", () => {
    const before = {
      behavioral: "Existing note",
      motivation: "Keep me",
      custom: [{ label: "Idea", value: "orig" }],
    };
    const after = appendToResearchArea(before, "behavioral", "New angle");
    expect(after.behavioral).toBe("Existing note\n\nNew angle");
    // Every other area is untouched.
    expect(after.motivation).toBe("Keep me");
    expect(after.custom).toEqual([{ label: "Idea", value: "orig" }]);
    // Pure: the input object is not mutated.
    expect(before.behavioral).toBe("Existing note");
  });

  it("creates an empty module rather than overwriting, and scopes custom by index", () => {
    expect(appendToResearchArea({}, "motivation", "First").motivation).toBe(
      "First",
    );
    const research = {
      custom: [
        { label: "A", value: "a1" },
        { label: "B", value: "" },
      ],
    };
    const after = appendToResearchArea(research, "custom:1", "b-add");
    expect(after.custom).toEqual([
      { label: "A", value: "a1" },
      { label: "B", value: "b-add" },
    ]);
  });

  it("returns the research unchanged for a deleted custom index", () => {
    const research = { custom: [{ label: "A", value: "a1" }] };
    expect(appendToResearchArea(research, "custom:9", "nope")).toBe(research);
  });
});
