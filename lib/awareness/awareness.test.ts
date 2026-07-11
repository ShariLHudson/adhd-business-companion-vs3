import { describe, expect, it } from "vitest";

import {
  AWARENESS_NOTICES,
  AWARENESS_PRINCIPLE,
  EXECUTIVE_AWARENESS_QUESTIONS,
  awarenessService,
  collectAwarenessSignals,
  composeAwareness,
  detectChanges,
  detectPatterns,
  observeSignals,
  significantAwareness,
} from "./index";

describe("Executive Awareness", () => {
  it("states the design principle — observant, not talkative", () => {
    expect(AWARENESS_PRINCIPLE).toContain("observant");
    expect(EXECUTIVE_AWARENESS_QUESTIONS.length).toBe(6);
    expect(AWARENESS_NOTICES.length).toBe(8);
  });

  it("collects signals from existing Founder systems", () => {
    const signals = collectAwarenessSignals("listening-rooms");
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.some((s) => s.domain === "mission_movement")).toBe(true);
    expect(new Set(signals.map((s) => s.source)).size).toBeGreaterThan(1);
  });

  it("observations answer executive awareness questions", () => {
    const observations = observeSignals(collectAwarenessSignals("listening-rooms"));
    const first = observations[0];
    expect(first.whatChanged.length).toBeGreaterThan(0);
    expect(first.whyNoticed.length).toBeGreaterThan(0);
    expect(first.whyItMatters.length).toBeGreaterThan(0);
    expect(first.whoIsAffected.length).toBeGreaterThan(0);
    expect(typeof first.shouldAct).toBe("boolean");
    expect(typeof first.shouldWatch).toBe("boolean");
  });

  it("detects change kinds against prior baseline", () => {
    const signals = collectAwarenessSignals("listening-rooms");
    const changes = detectChanges(signals);
    expect(changes.every((c) => c.kind)).toBe(true);
    if (changes.length > 0) {
      expect(changes[0].confidence.score).toBeGreaterThan(0);
    }
  });

  it("detects patterns without overwhelming output", () => {
    const signals = collectAwarenessSignals("listening-rooms");
    const changes = detectChanges(signals);
    const patterns = detectPatterns(signals, changes);
    expect(Array.isArray(patterns)).toBe(true);
  });

  it("composeAwareness surfaces only significant recommendations", () => {
    const view = composeAwareness({ missionId: "listening-rooms" });
    expect(view.product).toBe("founder");
    expect(view.opportunities.length).toBeLessThanOrEqual(3);
    expect(view.risks.length).toBeLessThanOrEqual(3);
    expect(view.recommendations.length).toBeLessThanOrEqual(3);
    expect(view.recommendations.every((r) => r.significant)).toBe(true);
    expect(view.backgroundCount).toBeGreaterThanOrEqual(0);
  });

  it("recommendations route to output channels", () => {
    const recs = significantAwareness("listening-rooms");
    expect(recs.every((r) => r.channel !== "background")).toBe(true);
    const channels = new Set(recs.map((r) => r.channel));
    expect(channels.size).toBeGreaterThan(0);
  });

  it("public API surfaces through awarenessService", () => {
    expect(awarenessService.sampleRepository().questions().length).toBe(6);
    expect(awarenessService.compose({ missionId: "listening-rooms" }).signals.length).toBeGreaterThan(0);
  });
});
