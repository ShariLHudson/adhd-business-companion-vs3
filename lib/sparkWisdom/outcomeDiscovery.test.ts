import { describe, expect, it } from "vitest";
import {
  buildOutcomeDiscoveryPromptBlock,
  discoverOutcome,
  OUTCOME_BEFORE_SOLUTION_RULE,
} from "./outcomeDiscovery";

describe("outcomeDiscovery (Spec 131)", () => {
  it("maps SOP to independence outcome", () => {
    const result = discoverOutcome("I need an SOP.", null);
    expect(result.patternId).toBe("sop");
    expect(result.hopedSuccess).toMatch(/without you/i);
    expect(result.outcomeQuestion.length).toBeGreaterThan(10);
    expect(result.avoidYet).toContain("SOP outline");
  });

  it("asks outcome before solution in prompt block", () => {
    const result = discoverOutcome("I need a newsletter.", null);
    const block = buildOutcomeDiscoveryPromptBlock(result);
    expect(block).toMatch(/OUTCOME DISCOVERY/i);
    expect(block).toMatch(OUTCOME_BEFORE_SOLUTION_RULE);
    expect(block).toMatch(/Do NOT discuss yet/i);
  });

  it("covers marketing hidden intent", () => {
    const result = discoverOutcome("I need marketing help.", null);
    expect(result.hopedSuccess).toMatch(/different/i);
  });
});
