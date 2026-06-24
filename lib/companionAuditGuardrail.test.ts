import { describe, expect, it } from "vitest";
import markers from "./companion-audit-guardrail-markers.json";
import {
  COMPANION_AUDIT_WARNING,
  COMPANION_BEHAVIOR_PATH_MARKERS,
  filterCompanionBehaviorPaths,
  isCompanionBehaviorPath,
} from "./companionAuditGuardrail";

describe("companionAuditGuardrail", () => {
  it("loads markers from shared json", () => {
    expect(COMPANION_BEHAVIOR_PATH_MARKERS).toEqual(markers);
    expect(COMPANION_BEHAVIOR_PATH_MARKERS.length).toBeGreaterThan(10);
  });

  it("detects intent routing and frictionless changes", () => {
    expect(isCompanionBehaviorPath("lib/intentRoutingIntelligence.ts")).toBe(
      true,
    );
    expect(isCompanionBehaviorPath("lib/frictionlessActionLayer.ts")).toBe(true);
    expect(isCompanionBehaviorPath("lib/knowledgeIntelligence.ts")).toBe(true);
  });

  it("detects relationship and decision intelligence paths", () => {
    expect(
      isCompanionBehaviorPath("lib/relationshipIntelligencePrompt.ts"),
    ).toBe(true);
    expect(
      isCompanionBehaviorPath("lib/companionDecisionIntelligence/decisionComplexityScore.ts"),
    ).toBe(true);
  });

  it("ignores unrelated files", () => {
    expect(isCompanionBehaviorPath("lib/planMyDay/planMyDay.test.ts")).toBe(
      false,
    );
    expect(isCompanionBehaviorPath("README.md")).toBe(false);
  });

  it("filters and dedupes companion paths", () => {
    expect(
      filterCompanionBehaviorPaths([
        "lib/intentRoutingIntelligence.ts",
        "lib/intentRoutingIntelligence.ts",
        "README.md",
      ]),
    ).toEqual(["lib/intentRoutingIntelligence.ts"]);
  });

  it("includes the audit reminder message", () => {
    expect(COMPANION_AUDIT_WARNING).toContain("npm run audit:companion");
    expect(COMPANION_AUDIT_WARNING).toContain("Companion behavior changed");
  });
});
