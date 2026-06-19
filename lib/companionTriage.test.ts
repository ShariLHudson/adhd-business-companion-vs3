import { describe, expect, it } from "vitest";
import {
  getTriagePhase,
  matchesTriageOpening,
  shouldDeferToolSuggestion,
  triageHintForChat,
} from "./companionTriage";

const base = {
  state: "unclear" as const,
  obstacle: null,
  somatic: false,
  askingHow: false,
};

describe("companionTriage", () => {
  it("detects triage openings", () => {
    expect(matchesTriageOpening("I'm overwhelmed and can't get motivated")).toBe(
      true,
    );
    expect(matchesTriageOpening("I'm overwhelmed")).toBe(true);
    expect(matchesTriageOpening("write me a linkedin post")).toBe(false);
  });

  it("starts in needs_question on first distress message", () => {
    expect(
      getTriagePhase({
        ...base,
        text: "I'm bored and can't get motivated to work",
        lastAssistantText: "",
      }),
    ).toBe("needs_question");
  });

  it("moves to needs_paths after user answers clarifying question", () => {
    expect(
      getTriagePhase({
        ...base,
        text: "The work just feels boring",
        lastAssistantText:
          "Is the problem that the work feels boring, too big, pointless, or you're low on energy today?",
        messages: [
          { role: "user", content: "I'm bored and can't get motivated" },
          {
            role: "assistant",
            content:
              "Is the problem that the work feels boring, too big, pointless, or you're low on energy today?",
          },
          { role: "user", content: "The work just feels boring" },
        ],
      }),
    ).toBe("needs_paths");
  });

  it("becomes ready after paths were offered", () => {
    expect(
      getTriagePhase({
        ...base,
        text: "Let's lower the bar",
        lastAssistantText:
          "Then we should lower the bar. We could pick one tiny action, or switch to something more energizing.",
        messages: [
          { role: "user", content: "I'm bored and can't get motivated" },
          {
            role: "assistant",
            content: "What else is making this hard today?",
          },
          { role: "user", content: "Low energy" },
          {
            role: "assistant",
            content:
              "Then we should lower the bar. We could pick one tiny action, or switch to something more energizing.",
          },
          { role: "user", content: "Let's lower the bar" },
        ],
      }),
    ).toBe("ready");
  });

  it("defers tools during question and paths phases", () => {
    expect(shouldDeferToolSuggestion("needs_question")).toBe(true);
    expect(shouldDeferToolSuggestion("needs_paths")).toBe(true);
    expect(shouldDeferToolSuggestion("ready")).toBe(false);
  });

  it("includes no-tool language in triage hints", () => {
    const hint = triageHintForChat("needs_question", "I'm overwhelmed");
    expect(hint).toMatch(/no tools/i);
    expect(hint).toMatch(/timer/i);
  });
});
