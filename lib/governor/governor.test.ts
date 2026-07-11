import { describe, expect, it } from "vitest";

import {
  ATTENTION_PROTECTION_RULE,
  COORDINATED_INTELLIGENCE_SYSTEMS,
  GOVERNOR_PRINCIPLE,
  GOVERNOR_QUESTIONS,
  collectIncomingRecommendations,
  composeGovernor,
  evaluateAttentionPolicy,
  governorService,
  prioritizeRecommendations,
  resolveConflicts,
} from "./index";

describe("Companion Intelligence Governor", () => {
  it("defines one companion principle — not competing systems", () => {
    expect(GOVERNOR_PRINCIPLE).toContain("ONE trusted companion");
    expect(ATTENTION_PROTECTION_RULE).toContain("Governor");
    expect(GOVERNOR_QUESTIONS.length).toBe(7);
    expect(COORDINATED_INTELLIGENCE_SYSTEMS.length).toBeGreaterThanOrEqual(12);
  });

  it("collects incoming recommendations from coordinated systems", () => {
    const incoming = collectIncomingRecommendations("listening-rooms");
    expect(incoming.length).toBeGreaterThan(0);
    const sources = new Set(incoming.map((i) => i.source));
    expect(sources.size).toBeGreaterThan(3);
    expect(incoming.every((i) => i.systemLabel.length > 0)).toBe(true);
  });

  it("attention policy answers governor questions with confidence", () => {
    const incoming = collectIncomingRecommendations("listening-rooms");
    const decision = evaluateAttentionPolicy(incoming[0]);
    expect(decision.reasoning.length).toBeGreaterThan(0);
    expect(decision.confidence.evidence.length).toBeGreaterThan(0);
    expect(typeof decision.shouldWait).toBe("boolean");
    expect(typeof decision.shouldNotifyFounder).toBe("boolean");
  });

  it("resolves conflicts and presents one primary recommendation", () => {
    const incoming = collectIncomingRecommendations("listening-rooms");
    const conflicts = resolveConflicts(incoming);
    const { primary, supporting } = prioritizeRecommendations(incoming);
    expect(primary).toBeTruthy();
    expect(supporting.length).toBeLessThanOrEqual(3);
    if (conflicts.length > 0) {
      expect(conflicts[0].explanation.length).toBeGreaterThan(0);
    }
  });

  it("composeGovernor protects attention — nothing bypasses coordination", () => {
    const view = composeGovernor({ missionId: "listening-rooms" });
    expect(view.product).toBe("founder");
    expect(view.attentionProtected).toBe(true);
    expect(view.primary).toBeTruthy();
    expect(view.supporting.length).toBeLessThanOrEqual(3);
    expect(view.coordinatedSystems).toContain("awareness");
    expect(view.coordinatedSystems).toContain("executive_decision");
    expect(view.silentCount + view.deferredCount).toBeGreaterThanOrEqual(0);
  });

  it("primary recommendation explains reasoning without exaggeration", () => {
    const primary = governorService.primary("listening-rooms");
    expect(primary?.reasoning.length).toBeGreaterThan(0);
    expect(primary?.confidence.rationale.length).toBeGreaterThan(0);
    expect(["high", "medium", "low", "exploratory"]).toContain(primary?.confidence.level);
  });

  it("public API surfaces through governorService", () => {
    expect(governorService.sampleRepository().trustRules().length).toBe(5);
    expect(governorService.compose({ missionId: "listening-rooms" }).incoming.length).toBeGreaterThan(0);
  });
});
