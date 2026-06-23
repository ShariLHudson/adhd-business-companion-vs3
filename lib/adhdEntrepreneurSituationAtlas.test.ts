import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeIntuitiveAwareness } from "./companionIntuitiveAwareness";
import {
  SITUATION_ATLAS,
  approveSituationCandidate,
  buildSituationAtlasAnalytics,
  getAtlasValidationCoverage,
  getFounderReviewQueue,
  lookupSituations,
  mapAtlasNeedToActualNeed,
  recordUnknownPattern,
  rejectSituationCandidate,
  resetSituationAtlasForTests,
  resolveSituation,
  situationAtlasHintForChat,
} from "./adhdEntrepreneurSituationAtlas";

describe("adhdEntrepreneurSituationAtlas", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetSituationAtlasForTests();
  });

  it("contains 40+ situation entries across categories", () => {
    expect(SITUATION_ATLAS.length).toBeGreaterThanOrEqual(40);
    const categories = new Set(SITUATION_ATLAS.map((e) => e.category));
    expect(categories.has("adhd_core")).toBe(true);
    expect(categories.has("sales")).toBe(true);
    expect(categories.has("visibility")).toBe(true);
    expect(categories.has("launch")).toBe(true);
    expect(categories.has("money")).toBe(true);
  });

  it("maps different surface statements to execution friction", () => {
    const phrases = [
      "I can't get started",
      "I've been procrastinating all week",
      "I know what to do but I don't do it",
    ];
    for (const text of phrases) {
      const resolution = resolveSituation({ userText: text });
      expect(resolution.matched).toBe(true);
      expect(resolution.situationId).toBe("execution-friction");
      expect(resolution.actualNeed).toBe("start_execution");
    }
  });

  it("maps planning addiction statements separately from execution friction", () => {
    const resolution = resolveSituation({
      userText: "I think I need a better system before I can start",
    });
    expect(resolution.situationId).toBe("planning-addiction");
    expect(mapAtlasNeedToActualNeed(resolution.primary!.entry.actualNeed)).toBe(
      "start_execution",
    );
  });

  it("recognizes visibility fear as confidence not marketing", () => {
    const resolution = resolveSituation({
      userText: "Who am I to teach this?",
    });
    expect(resolution.situationName).toBe("Expert Imposter Syndrome");
    expect(resolution.actualNeed).toBe("build_confidence");
    expect(resolution.category).toBe("visibility");
  });

  it("recognizes pricing guilt as confidence situation", () => {
    const resolution = resolveSituation({
      userText: "I feel bad charging that much",
    });
    expect(resolution.situationId).toBe("pricing-guilt");
    expect(resolution.actualNeed).toBe("build_confidence");
  });

  it("recommends appropriate interventions per situation", () => {
    const resolution = resolveSituation({ userText: "I can't decide between these two offers" });
    expect(resolution.primary?.entry.recommendedInterventions).toContain("decision_compass");
    expect(resolution.primary?.entry.antiPatterns.some((a) => /pros and cons/i.test(a))).toBe(
      true,
    );
  });

  it("creates candidate situations for unknown patterns", () => {
    const candidate = recordUnknownPattern(
      "Something weird is happening with my entire business model pivot strategy",
    );
    expect(candidate).toBeTruthy();
    const queue = getFounderReviewQueue();
    expect(queue.pending.length).toBeGreaterThan(0);
  });

  it("supports founder approve and reject review flow", () => {
    const candidate = recordUnknownPattern(
      "My brain refuses to open the spreadsheet every single week",
    );
    expect(candidate).toBeTruthy();
    const approved = approveSituationCandidate(candidate!.id, {
      suggestedName: "Spreadsheet Avoidance",
      suggestedCategory: "money",
      suggestedActualNeed: "action",
    });
    expect(approved?.name).toBe("Spreadsheet Avoidance");
    expect(getFounderReviewQueue().approved.length).toBe(1);

    const candidate2 = recordUnknownPattern("Another totally unique unmapped phrase here today");
    rejectSituationCandidate(candidate2!.id);
    expect(getFounderReviewQueue().rejected.length).toBe(1);
  });

  it("links atlas entries to validation scenarios", () => {
    const coverage = getAtlasValidationCoverage();
    expect(coverage.totalEntries).toBeGreaterThanOrEqual(40);
    expect(coverage.linkedScenarios).toBeGreaterThanOrEqual(30);
    expect(coverage.uniqueScenarioIds).toContain("money-pricing-guilt");
  });

  it("generates situation-aware chat hints", () => {
    const resolution = resolveSituation({ userText: "I'm almost ready to launch but not quite" });
    const hint = situationAtlasHintForChat(resolution);
    expect(hint).toMatch(/SITUATION ATLAS/);
    expect(hint).toMatch(/Launch Avoidance/);
    expect(hint).not.toMatch(/routing defect|scoring/i);
  });

  it("integrates with intuitive awareness when domain intelligence is not locked", () => {
    const analysis = analyzeIntuitiveAwareness({
      messages: [{ role: "user", content: "I can't get started on anything today" }],
      userText: "I can't get started on anything today",
      emotionalState: "stuck",
    });
    expect(analysis.situationName).toBe("Execution Friction");
    expect(analysis.actualNeed).toBe("start_execution");
  });

  it("builds founder atlas analytics", () => {
    lookupSituations({ userText: "I can't get started on anything" });
    const analytics = buildSituationAtlasAnalytics();
    expect(analytics.totalEntries).toBeGreaterThanOrEqual(40);
    expect(analytics.candidateCount).toBeGreaterThanOrEqual(0);
  });
});
