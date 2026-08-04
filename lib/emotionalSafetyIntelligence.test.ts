import { describe, expect, it } from "vitest";
import {
  applyEmotionalSafetyRewrites,
  buildEmotionalSafetyPromptBlock,
  buildFutureImpactFraming,
  buildGrowthProgressFraming,
  buildIntelligenceSystemGuardrail,
  buildNeutralQuietObservation,
  buildPatternObservationFraming,
  buildPermissionFirstOffer,
  detectEmotionalSafetyViolations,
  filterEmotionalSafety,
  passesEmotionalSafetyFilter,
  PERMISSION_FIRST_SENSITIVE_INSIGHT,
  sanitizeIntelligenceInsight,
} from "./emotionalSafetyIntelligence";

describe("emotionalSafetyIntelligence P0.60", () => {
  it("detects forbidden shame and blame patterns", () => {
    expect(detectEmotionalSafetyViolations("You are behind on this goal")).toContain(
      "shame",
    );
    expect(detectEmotionalSafetyViolations("You failed to complete the task")).toContain(
      "blame",
    );
    expect(detectEmotionalSafetyViolations("You should have done more")).toContain(
      "should_have",
    );
    expect(detectEmotionalSafetyViolations("Other people seem ahead")).toContain(
      "comparison",
    );
  });

  it("rewrites forbidden language into neutral observation", () => {
    const result = applyEmotionalSafetyRewrites(
      "You are behind on this goal and you should have updated it.",
    );
    expect(result).not.toMatch(/you are behind/i);
    expect(result).not.toMatch(/should have/i);
  });

  it("passes supportive framing unchanged", () => {
    const msg =
      "Would you like to pick this back up? We can simplify this if it feels like too much right now.";
    expect(passesEmotionalSafetyFilter(msg)).toBe(true);
    expect(filterEmotionalSafety(msg).safe).toBe(true);
  });

  it("sanitizes intelligence insights", () => {
    const safe = sanitizeIntelligenceInsight(
      "You failed to log progress this week.",
    );
    expect(safe).not.toMatch(/failed to/i);
  });

  it("builds permission-first sensitive insight offer", () => {
    expect(PERMISSION_FIRST_SENSITIVE_INSIGHT).toMatch(/Would it help/i);
    expect(buildPermissionFirstOffer("your goals")).toMatch(/say no/i);
  });

  it("builds system-specific guardrail blocks", () => {
    expect(buildIntelligenceSystemGuardrail("growth")).toMatch(
      /GROWTH INTELLIGENCE/,
    );
    expect(buildIntelligenceSystemGuardrail("resilience")).toMatch(
      /permission/i,
    );
    expect(buildEmotionalSafetyPromptBlock()).toMatch(/non-negotiable/i);
  });

  it("frames growth, future, and pattern insights safely", () => {
    expect(buildGrowthProgressFraming("added 12 new members", "the last month")).toBe(
      "You've added 12 new members over the last month.",
    );
    expect(buildFutureImpactFraming("At the current pace, this may take longer")).not.toMatch(
      /fail/i,
    );
    expect(buildPatternObservationFraming("multiple projects are active")).toMatch(
      /tends to happen/i,
    );
    expect(buildNeutralQuietObservation("This goal")).toMatch(
      /pick this back up/i,
    );
  });
});
