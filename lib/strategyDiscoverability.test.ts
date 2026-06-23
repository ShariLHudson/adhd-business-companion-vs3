import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  POPULAR_STRATEGIES,
  SITUATION_STRATEGY_MAP,
  browseCategoriesForLibrary,
  buildStrategyFounderAnalytics,
  buildStrategyMetadata,
  getStrategiesForSituation,
  getStrategiesForWhatYoureDealingWith,
  getStrategyLibraryCounts,
  recommendStrategyFromUserText,
  resetStrategyIntelligenceForTests,
  searchStrategies,
  trackStrategyEvent,
} from "./strategyIntelligence";
import { getStrategy } from "./strategySystem";

describe("strategyDiscoverability", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
    vi.stubGlobal("window", { localStorage: globalThis.localStorage });
  });

  it("exposes visible library counts", () => {
    const counts = getStrategyLibraryCounts();
    expect(counts.adhdStrategies).toBeGreaterThan(0);
    expect(counts.businessStrategies).toBeGreaterThan(0);
    expect(counts.totalBuiltin).toBe(counts.adhdStrategies + counts.businessStrategies);
    expect(counts.recommendedStrategies).toBeGreaterThan(0);
    expect(counts.savedStrategies).toBeGreaterThanOrEqual(0);
  });

  it("searches by problem language — can't get started", () => {
    const results = searchStrategies("I can't get started");
    const titles = results.map((r) => r.title.toLowerCase());
    expect(titles.some((t) => t.includes("shrink") || t.includes("first step") || t.includes("tiny"))).toBe(
      true,
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it("searches by problem language — sales", () => {
    const results = searchStrategies("sales");
    const ids = results.map((r) => r.strategyId);
    expect(ids).toContain("offer-help-not-sales");
    expect(
      ids.some((id) =>
        ["follow-up-first", "ask-directly", "talk-to-five", "value-first-pricing"].includes(id),
      ),
    ).toBe(true);
  });

  it("maps situations to strategies via Situation Atlas", () => {
    const visibility = getStrategiesForSituation("fear-of-being-seen");
    expect(visibility.length).toBeGreaterThan(0);
    expect(visibility.some((s) => s.id === "borrow-belief")).toBe(true);

    const launch = getStrategiesForSituation("launch-avoidance");
    expect(launch.some((s) => s.id === "test-before-scale")).toBe(true);
  });

  it("returns situation-based recommendations for dealing-with-right-now", () => {
    const recs = getStrategiesForWhatYoureDealingWith();
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].situationLabel).toBeTruthy();
    expect(recs[0].strategyIds.length).toBeGreaterThan(0);
  });

  it("recommends strategy from companion-style user text", () => {
    const sales = recommendStrategyFromUserText("I keep putting off my sales calls.");
    expect(sales).not.toBeNull();
    expect(sales?.offerMessage).toMatch(/strategy/i);
    expect(sales?.strategyId).toBeTruthy();

    const decision = recommendStrategyFromUserText("I can't decide which offer to focus on.");
    expect(decision).not.toBeNull();
    expect(decision?.strategyId).toBeTruthy();
  });

  it("popular strategies reference valid builtin strategies", () => {
    for (const pop of POPULAR_STRATEGIES) {
      expect(getStrategy(pop.strategyId)).toBeDefined();
    }
  });

  it("strategy metadata includes situation and problem fields", () => {
    const strategy = getStrategy("shrink-first-step");
    expect(strategy).toBeDefined();
    const meta = buildStrategyMetadata(strategy!);
    expect(meta.problemPhrases.length).toBeGreaterThan(0);
    expect(meta.companionGuidance).toBe(true);
    expect(["easy", "medium", "hard"]).toContain(meta.difficulty);
  });

  it("tracks analytics events for founder intelligence", () => {
    resetStrategyIntelligenceForTests();
    trackStrategyEvent("shrink-first-step", "viewed");
    trackStrategyEvent("shrink-first-step", "started");
    trackStrategyEvent("shrink-first-step", "completed");
    const analytics = buildStrategyFounderAnalytics();
    expect(analytics.mostViewed.some((x) => x.strategyId === "shrink-first-step")).toBe(true);
    expect(analytics.mostStarted.some((x) => x.strategyId === "shrink-first-step")).toBe(true);
  });

  it("covers browse categories for library hero", () => {
    const cats = browseCategoriesForLibrary();
    expect(cats.map((c) => c.label)).toContain("Overwhelm");
    expect(cats.map((c) => c.label)).toContain("Delegation");
  });

  it("every situation map entry has at least one valid strategy", () => {
    for (const entry of SITUATION_STRATEGY_MAP) {
      const strategies = getStrategiesForSituation(entry.situationId);
      expect(strategies.length).toBeGreaterThan(0);
    }
  });
});
