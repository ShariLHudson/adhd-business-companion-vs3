import { describe, expect, it } from "vitest";
import {
  adhdNativeHintForChat,
  analyzeAdhdNativeTurn,
  hasEarnedFeatureRouting,
  shouldDeferEcosystemRouting,
} from "./adhdNativeIntelligence";

describe("adhdNativeIntelligence", () => {
  it("detects idea explosion pattern", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I have so many ideas I don't know which to pursue",
      emotionalState: "unclear",
      obstacle: null,
    });
    expect(a.thinkingPattern).toBe("idea_explosion");
    expect(a.possibleRootCauses.length).toBeGreaterThan(0);
  });

  it("detects planning addiction", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I keep planning but never starting",
      emotionalState: "stuck",
      obstacle: null,
    });
    expect(a.thinkingPattern).toBe("planning_addiction");
  });

  it("surfaces root causes for marketing plan requests", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I need a marketing plan for my coaching business",
      emotionalState: "building",
      obstacle: null,
    });
    expect(a.possibleRootCauses).toContain("unclear offer");
    expect(a.hierarchyLevel).toBeGreaterThanOrEqual(3);
  });

  it("activates momentum protection", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I just finished the first draft and I'm on a roll",
      emotionalState: "focused",
      obstacle: null,
    });
    expect(a.protectionMode).toBe("momentum");
    expect(adhdNativeHintForChat(a)).toMatch(/MOMENTUM PROTECTION/i);
  });

  it("activates overwhelm protection", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I'm completely overwhelmed by everything",
      emotionalState: "overwhelmed",
      obstacle: null,
    });
    expect(a.protectionMode).toBe("overwhelm");
    expect(adhdNativeHintForChat(a)).toMatch(/OVERWHELM PROTECTION/i);
  });

  it("defers ecosystem routing during discovery", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I have too much on my mind",
      emotionalState: "overwhelmed",
      obstacle: null,
      discoveryPhase: "issue",
      hasEcosystemFeatureMatch: true,
      shouldDeferTools: true,
    });
    expect(a.earnedFeatureRouting).toBe(false);
    expect(shouldDeferEcosystemRouting(a, true)).toBe(true);
  });

  it("earns routing for clear ecosystem match outside discovery", () => {
    const a = analyzeAdhdNativeTurn({
      text: "I can't decide which offer to launch",
      emotionalState: "unclear",
      obstacle: null,
      discoveryPhase: "none",
      hasEcosystemFeatureMatch: true,
      shouldDeferTools: false,
    });
    expect(a.earnedFeatureRouting).toBe(true);
    expect(hasEarnedFeatureRouting(a, false)).toBe(true);
  });

  it("hint forbids laziness framing", () => {
    const hint = adhdNativeHintForChat(
      analyzeAdhdNativeTurn({
        text: "test",
        emotionalState: "unclear",
        obstacle: null,
      }),
    );
    expect(hint).toMatch(/FORBIDDEN/i);
    expect(hint).toMatch(/laziness/i);
  });
});
