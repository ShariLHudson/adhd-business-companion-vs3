import { describe, expect, it } from "vitest";
import {
  analyzeMultiTurnPatterns,
  multiTurnHintForChat,
  shouldDeferRoutingForMultiTurn,
  tallyThreadSignals,
} from "./adhdMultiTurnPatterns";

describe("adhdMultiTurnPatterns", () => {
  it("tallies planning signals across turns", () => {
    const signals = tallyThreadSignals([
      "Maybe I should outline it better first",
      "I need a system for organizing the sections",
      "Let me make a checklist before I start writing",
    ]);
    expect(signals.planning_language).toBeGreaterThanOrEqual(2);
  });

  it("detects planning addiction across turns", () => {
    const result = analyzeMultiTurnPatterns({
      messages: [
        { role: "user", content: "I need to launch my newsletter" },
        { role: "user", content: "Maybe I should outline it better first" },
        { role: "user", content: "I need a system for organizing the sections" },
        { role: "user", content: "Let me make a checklist before I start writing" },
      ],
    });
    expect(result.primary?.pattern).toBe("planning_addiction");
    expect(result.primary?.confidence).toBe("high");
    expect(result.primary?.routing.deferPlanningTools).toBe(true);
  });

  it("detects perfectionism across turns", () => {
    const result = analyzeMultiTurnPatterns({
      messages: [
        { role: "user", content: "It's not ready yet" },
        { role: "user", content: "I should research more examples first" },
        { role: "user", content: "I don't want it to sound wrong" },
      ],
    });
    expect(result.primary?.pattern).toBe("perfectionism_as_preparation");
    expect(result.primary?.confidence).not.toBe("low");
  });

  it("detects idea explosion", () => {
    const result = analyzeMultiTurnPatterns({
      messages: [
        { role: "user", content: "Or maybe a membership instead" },
        { role: "user", content: "What about a workshop series too?" },
        { role: "user", content: "Can you give me more options to consider?" },
      ],
    });
    expect(result.primary?.pattern).toBe("idea_explosion");
    expect(result.primary?.routing.blockMoreIdeas).toBe(true);
  });

  it("defers brain dump for overwhelm pattern", () => {
    const result = analyzeMultiTurnPatterns({
      messages: [
        { role: "user", content: "There's too much going on" },
        { role: "user", content: "Everything feels scattered" },
        { role: "user", content: "So many things and my head is full" },
      ],
    });
    expect(result.primary?.pattern).toBe("overwhelm_from_volume");
    expect(shouldDeferRoutingForMultiTurn(result, "brain_dump")).toBe(true);
  });

  it("does not false-positive on momentum", () => {
    const result = analyzeMultiTurnPatterns({
      messages: [
        { role: "user", content: "I just finished the first draft" },
        { role: "user", content: "I'm on a roll and moving forward" },
        { role: "user", content: "I got it done and made progress today" },
      ],
    });
    expect(result.primary).toBeNull();
  });

  it("includes reflection guidance in hint at high confidence", () => {
    const result = analyzeMultiTurnPatterns({
      messages: [
        { role: "user", content: "I need to plan this better" },
        { role: "user", content: "Let me organize it more first" },
        { role: "user", content: "I should make a checklist" },
      ],
    });
    const hint = multiTurnHintForChat(result);
    expect(hint).toMatch(/MULTI-TURN PATTERN/i);
    expect(hint).toMatch(/Do not sound clinical/i);
  });
});
