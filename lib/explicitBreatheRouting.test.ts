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

  it("still blocks generic calm down without breath intent", () => {
    expect(shouldBlockStressAutoToolRouting("I need to calm down")).toBe(true);
    expect(detectStandaloneToolRequest("I need to calm down")).toBeNull();
  });

  it("maps let's do breathing after stress offer", () => {
    expect(detectStressReliefToolChoice("Let's do breathing")).toBe("breathe");
  });
});
