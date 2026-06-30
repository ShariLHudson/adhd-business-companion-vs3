import { describe, expect, it } from "vitest";
import {
  buildHiddenIntentPromptHint,
  detectHiddenIntent,
  summarizeHiddenIntent,
} from "./hiddenIntent";

describe("detectHiddenIntent (CT-11)", () => {
  it("maps SOP to VA independence", () => {
    const result = detectHiddenIntent("I need an SOP.");
    expect(result?.patternId).toBe("sop");
    expect(result?.hiddenGoal).toMatch(/independently/i);
  });

  it("maps newsletter to audience trust", () => {
    const result = detectHiddenIntent("I need a newsletter.");
    expect(result?.patternId).toBe("newsletter");
    expect(result?.hiddenGoal).toMatch(/trust/i);
  });

  it("maps pricing help to confidence in worth", () => {
    const result = detectHiddenIntent("I need pricing help.");
    expect(result?.patternId).toBe("pricing");
    expect(result?.hiddenGoal).toMatch(/confident/i);
  });

  it("maps website to credibility and leads", () => {
    const result = detectHiddenIntent("I need a website.");
    expect(result?.patternId).toBe("website");
    expect(result?.hiddenGoal).toMatch(/credibility/i);
    expect(result?.hiddenGoal).toMatch(/leads/i);
  });

  it("returns null for empty input", () => {
    expect(detectHiddenIntent("")).toBeNull();
  });

  it("builds a mentor coaching hint with turn-1 forbidden rules", () => {
    const hypothesis = detectHiddenIntent("I need an SOP.");
    expect(hypothesis).not.toBeNull();
    const hint = buildHiddenIntentPromptHint(hypothesis!);
    expect(hint).toMatch(/TURN 1/i);
    expect(hint).toMatch(/outlines/i);
    expect(hint).toMatch(/wonder/i);
  });

  it("summarizes for iceberg log", () => {
    const hypothesis = detectHiddenIntent("I need a website.");
    expect(hypothesis).not.toBeNull();
    expect(summarizeHiddenIntent(hypothesis!)).toMatch(/Website/);
    expect(summarizeHiddenIntent(hypothesis!)).toMatch(/→/);
  });
});
