import { describe, expect, it, vi } from "vitest";

import {
  MOMENTUM_BUILDER_CATEGORIES,
  MOMENTUM_BUILDER_CATALOG,
  momentumBuildersForCategory,
  recommendMomentumBuilders,
} from "./index";

describe("momentumBuilders catalog", () => {
  it("defines five browse categories", () => {
    expect(MOMENTUM_BUILDER_CATEGORIES.map((c) => c.title)).toEqual([
      "Reset My Energy",
      "Wake Up My Brain",
      "Refocus",
      "Calm My Nervous System",
      "Surprise Me",
    ]);
  });

  it("ships curated items in every category", () => {
    for (const category of MOMENTUM_BUILDER_CATEGORIES) {
      expect(momentumBuildersForCategory(category.id).length).toBeGreaterThan(0);
    }
  });

  it("never duplicates builder ids", () => {
    const ids = MOMENTUM_BUILDER_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("recommendMomentumBuilders", () => {
  it("returns up to three recommendations with reasons", () => {
    const recs = recommendMomentumBuilders(3);
    expect(recs.length).toBeLessThanOrEqual(3);
    for (const rec of recs) {
      expect(rec.item.title.length).toBeGreaterThan(0);
      expect(rec.reason.length).toBeGreaterThan(0);
    }
  });
});

describe("recommendationsDismiss", () => {
  it("tracks hide/show for the session", async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
      },
    });
    vi.resetModules();
    const mod = await import("./recommendationsDismiss");
    mod.showMomentumRecommendations();
    expect(mod.areMomentumRecommendationsHidden()).toBe(false);
    mod.hideMomentumRecommendations();
    expect(mod.areMomentumRecommendationsHidden()).toBe(true);
    mod.showMomentumRecommendations();
    expect(mod.areMomentumRecommendationsHidden()).toBe(false);
    vi.unstubAllGlobals();
  });
});
