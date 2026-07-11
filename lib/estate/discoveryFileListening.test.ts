import { describe, expect, it } from "vitest";
import { detectDiscoverySectionSuggestions } from "./discoveryFileListening";

describe("discoveryFileListening", () => {
  it("suggests people helped when the story mentions helping someone", () => {
    const suggestions = detectDiscoverySectionSuggestions(
      "Today I helped a client untangle a billing issue they'd been dreading.",
      new Set(),
      { situation: "Today I helped a client untangle a billing issue." },
    );
    expect(suggestions.some((s) => s.id === "whoBenefited")).toBe(true);
  });

  it("does not re-suggest expanded or filled sections", () => {
    const expanded = new Set(["problem"]);
    const suggestions = detectDiscoverySectionSuggestions(
      "I solved a tricky scheduling problem and learned to pause first.",
      expanded,
      { situation: "story", problem: "Fixed the calendar clash." },
    );
    expect(suggestions.some((s) => s.id === "problem")).toBe(false);
    expect(suggestions.some((s) => s.id === "lessonsLearned")).toBe(true);
  });
});
