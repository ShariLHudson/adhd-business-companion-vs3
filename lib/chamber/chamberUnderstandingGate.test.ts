import { describe, expect, it } from "vitest";
import {
  applyChamberUnderstandingGate,
  hasClearObjective,
  understandChamberTurn,
} from "./chamberUnderstandingGate";

describe("hasClearObjective", () => {
  it("detects stated goals and help asks", () => {
    expect(
      hasClearObjective("I want to raise my prices without losing clients"),
    ).toBe(true);
    expect(
      hasClearObjective("Help me write a launch email for my course"),
    ).toBe(true);
    expect(
      hasClearObjective("How should I phase this product launch?"),
    ).toBe(true);
    expect(
      hasClearObjective(
        "Should I launch everything at once or release over time?",
      ),
    ).toBe(true);
  });

  it("does not treat thin venting as a clear objective", () => {
    expect(hasClearObjective("I'm frustrated with my client")).toBe(false);
    expect(hasClearObjective("This week has been hard")).toBe(false);
  });
});

describe("understandChamberTurn — clear objective advances", () => {
  it("answers instead of listen_question when the objective is already clear", () => {
    const u = understandChamberTurn({
      userText:
        "I need to decide whether to launch everything at once or release over time.",
      specialistId: "marketing",
    });
    expect(u.helpMode).not.toBe("listen_question");
    expect(u.understandingConfidence).toBeGreaterThanOrEqual(0.8);
    expect(u.goal).toMatch(/objective|decide|move forward/i);
  });

  it("still listens when the situation is shared without a clear ask", () => {
    const u = understandChamberTurn({
      userText: "I have a client who won't follow through and I'm stuck.",
      specialistId: "partnerships",
    });
    // Ambiguous aim (repair vs exit) may still need one clarifying question
    expect(["listen_question", "reassure"]).toContain(u.helpMode);
  });
});

describe("applyChamberUnderstandingGate — no restating asks", () => {
  it("keeps a forward-moving advisory draft when the objective is clear", () => {
    const draft =
      "I'd phase it. Ship the core offer first, then layer extras once people are using it — that keeps focus and lowers launch risk.";
    const result = applyChamberUnderstandingGate({
      userText:
        "I want to launch my course — should I release everything at once or over time?",
      draftText: draft,
      specialistId: "marketing",
      specialistLabel: "Marketing",
    });
    expect(result.understanding.helpMode).not.toBe("listen_question");
    expect(result.text).toContain("phase");
    expect(result.text).not.toMatch(
      /what are you most trying to get clear on|tell me a little more about what's going on/i,
    );
  });

  it("does not replace a clear-objective answer with exploratory restating", () => {
    const result = applyChamberUnderstandingGate({
      userText: "Help me price my coaching offer for busy founders.",
      draftText:
        "Start with a simple range based on outcome, not hours — then test one clear package before adding tiers.",
      specialistId: "finance",
      specialistLabel: "Finance",
    });
    expect(result.text).toMatch(/range|package|outcome/i);
    expect(result.text).not.toMatch(
      /what are you most trying|tell me a little more/i,
    );
  });
});
