import { describe, expect, it } from "vitest";
import { isExplicitBreatheRequest } from "./explicitBreatheRouting";
import { detectStandaloneToolRequest } from "./standaloneToolRouting";
import {
  shouldBlockStressAutoToolRouting,
  detectStressReliefToolChoice,
} from "./stressRouting";

describe("explicitBreatheRouting", () => {
  it("detects calm down and take a breath", () => {
    expect(
      isExplicitBreatheRequest("I need to calm down and just take a breath"),
    ).toBe(true);
  });

  it("does not block breathe routing for explicit breath requests", () => {
    const text = "I need to calm down and just take a breath";
    expect(shouldBlockStressAutoToolRouting(text)).toBe(false);
    expect(detectStandaloneToolRequest(text)?.tool).toBe("breathe");
  });

  it("opens Breathe for calm-me-down aliases (Universal Access)", () => {
    expect(shouldBlockStressAutoToolRouting("I need to calm down")).toBe(false);
    expect(detectStandaloneToolRequest("I need to calm down")?.tool).toBe("breathe");
    expect(detectStandaloneToolRequest("Calm me down")?.tool).toBe("breathe");
  });

  it("recognizes Estate navigation and reset phrases", () => {
    expect(isExplicitBreatheRequest("Take me to Breathe")).toBe(true);
    expect(isExplicitBreatheRequest("Open Breathe")).toBe(true);
    expect(isExplicitBreatheRequest("I need to breathe")).toBe(true);
    expect(isExplicitBreatheRequest("Help me calm down")).toBe(true);
    expect(isExplicitBreatheRequest("I need a reset")).toBe(true);
  });

  it("maps let's do breathing after stress offer", () => {
    expect(detectStressReliefToolChoice("Let's do breathing")).toBe("breathe");
  });
});
