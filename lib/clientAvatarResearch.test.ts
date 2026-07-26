import { describe, expect, it } from "vitest";
import {
  addResponseToAnswer,
  addSessionToAnswer,
  appendResearchToAnswer,
  appendToResearchArea,
  buildAvatarResearchAutoPrompt,
  buildAvatarResearchSystemPrompt,
  collectAddableResponses,
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

  it("resolves a custom field by its permanent id, falling back to a friendly label", () => {
    const research = { custom: [{ id: "cf_1", label: "", value: "test idea" }] };
    expect(describeResearchArea(research, "custom:cf_1", MODULE_LABELS)).toEqual({
      label: "Custom research field",
      currentAnswer: "test idea",
    });
    // A custom id that no longer exists resolves to null (caller skips).
    expect(
      describeResearchArea(research, "custom:cf_missing", MODULE_LABELS),
    ).toBeNull();
  });
});

describe("appendToResearchArea (Add to This Area)", () => {
  it("appends to one module without touching any other area", () => {
    const before = {
      behavioral: "Existing note",
      motivation: "Keep me",
      custom: [{ id: "cf_1", label: "Idea", value: "orig" }],
    };
    const after = appendToResearchArea(before, "behavioral", "New angle");
    expect(after.behavioral).toBe("Existing note\n\nNew angle");
    // Every other area is untouched.
    expect(after.motivation).toBe("Keep me");
    expect(after.custom).toEqual([{ id: "cf_1", label: "Idea", value: "orig" }]);
    // Pure: the input object is not mutated.
    expect(before.behavioral).toBe("Existing note");
  });

  it("creates an empty module rather than overwriting, and scopes custom by id (not index)", () => {
    expect(appendToResearchArea({}, "motivation", "First").motivation).toBe(
      "First",
    );
    const research = {
      custom: [
        { id: "cf_a", label: "A", value: "a1" },
        { id: "cf_b", label: "B", value: "" },
      ],
    };
    // Address by id — even though cf_b is at index 1, reordering cannot break it.
    const after = appendToResearchArea(research, "custom:cf_b", "b-add");
    expect(after.custom).toEqual([
      { id: "cf_a", label: "A", value: "a1" },
      { id: "cf_b", label: "B", value: "b-add" },
    ]);
  });

  it("returns the research unchanged for a deleted custom id", () => {
    const research = { custom: [{ id: "cf_a", label: "A", value: "a1" }] };
    expect(appendToResearchArea(research, "custom:cf_gone", "nope")).toBe(
      research,
    );
  });
});

describe("research accumulation (dedup by stable id)", () => {
  const msg = (id: string, content: string, extra = {}) => ({
    id,
    role: "assistant" as const,
    content,
    ...extra,
  });

  it("collects only useful, not-yet-added assistant responses in order", () => {
    const messages = [
      { id: "u1", role: "user" as const, content: "q", hidden: true },
      msg("a1", "First insight"),
      msg("a2", "Broken", { error: true }),
      msg("a3", "Second insight"),
    ];
    expect(
      collectAddableResponses(messages, ["a1"]).map((m) => m.id),
    ).toEqual(["a3"]);
  });

  it("Add This Response appends one response and records its id; twice is a no-op", () => {
    const first = addResponseToAnswer("My words.", msg("a1", "Angle one"), []);
    expect(first.answer).toBe("My words.\n\nAngle one");
    expect(first.addedIds).toEqual(["a1"]);
    // Adding the same id again does nothing (dedup by id, never text).
    const again = addResponseToAnswer(first.answer, msg("a1", "Angle one"), [
      "a1",
    ]);
    expect(again.answer).toBe(first.answer);
    expect(again.addedIds).toEqual([]);
  });

  it("Add Entire Research Session appends all not-yet-added responses, then adds nothing new", () => {
    const messages = [msg("a1", "One"), msg("a2", "Two"), msg("a3", "Three")];
    // a1 already added earlier.
    const result = addSessionToAnswer("Base.", messages, ["a1"]);
    expect(result.answer).toBe("Base.\n\nTwo\n\nThree");
    expect(result.addedIds).toEqual(["a2", "a3"]);
    // Running the full session again (all now added) appends nothing.
    const again = addSessionToAnswer(result.answer, messages, [
      "a1",
      "a2",
      "a3",
    ]);
    expect(again.answer).toBe(result.answer);
    expect(again.addedIds).toEqual([]);
  });

  it("preserves legitimately repeated ideas (dedup is by id, not text)", () => {
    const messages = [msg("a1", "Same idea"), msg("a2", "Same idea")];
    const result = addSessionToAnswer("", messages, []);
    expect(result.answer).toBe("Same idea\n\nSame idea");
    expect(result.addedIds).toEqual(["a1", "a2"]);
  });
});
