// Founder Ecosystem — Phase 10 Recommendation Engine tests.
// Proves recommendations are stage/focus relevant, actionable (carry links),
// reflect advisor input, fall back when there are no projects, factor energy/
// time, and never produce therapeutic/legal guidance.
// (Named *.test.ts so vitest discovers it.)

import { describe, expect, it } from "vitest";

import { containsClinicalLanguage } from "../clinicalLanguageGuard";
import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { sampleJourneySamples } from "../journey/sampleJourneyData";
import { getFounderRecommendations } from "./founderRecommendationEngine";
import { getRecommendationDashboard } from "./recommendationDashboard";
import {
  selectActionable,
  selectAdvisorNotes,
  selectFocusToday,
  selectThingsToAvoid,
  whatAreMyNextSteps,
  whatShouldIFocusOnToday,
} from "./recommendationSelectors";
import { sampleRecommendationSets } from "./sampleRecommendationData";

const NOW = new Date("2026-06-10T09:00:00.000Z");
const forStage = (stage: string) => {
  const s = sampleJourneySamples().find((x) => x.stage === stage)!;
  return getFounderRecommendations(s.events, s.founderId, { now: NOW, profile: s.profile });
};

describe("stage & focus relevance", () => {
  it("idea stage recommends validation and warns off automation", () => {
    const r = forStage("idea");
    expect(r.stage).toBe("idea");
    expect(JSON.stringify(r.recommendations).toLowerCase()).toMatch(/validat/);
    expect(selectThingsToAvoid(r).join(" ").toLowerCase()).toMatch(/automation|logo/);
  });

  it("scaling stage recommends delegation, not logo design", () => {
    const r = forStage("scaling");
    expect(r.stage).toBe("scaling");
    expect(JSON.stringify(r.recommendations).toLowerCase()).toMatch(/delegat/);
  });

  it("headline names the stage and a focus", () => {
    expect(forStage("launching").headline.toLowerCase()).toMatch(/launching/);
  });
});

describe("actionability", () => {
  it("every recommendation set has at least one actionable link", () => {
    for (const { recommendations } of sampleRecommendationSets()) {
      expect(selectActionable(recommendations).length).toBeGreaterThan(0);
    }
  });

  it("focus-today carries a concrete link and (often) an assisted draft", () => {
    const top = selectFocusToday(forStage("launching"));
    expect(top).not.toBeNull();
    expect(top!.links.length).toBeGreaterThan(0);
    expect(top!.links[0].target).not.toBe("none");
  });

  it("surfaces a GHL workflow link only when connected", () => {
    const s = sampleJourneySamples().find((x) => x.stage === "launching")!;
    const off = getFounderRecommendations(s.events, s.founderId, { now: NOW, profile: s.profile });
    const on = getFounderRecommendations(s.events, s.founderId, {
      now: NOW,
      profile: s.profile,
      ghlConnected: true,
    });
    const hasGhl = (r: ReturnType<typeof getFounderRecommendations>) =>
      JSON.stringify(r.recommendations).includes("ghl-workflow");
    expect(hasGhl(off)).toBe(false);
    expect(hasGhl(on)).toBe(true);
  });
});

describe("advisor input is reflected", () => {
  it("includes CEO + productivity advisor notes", () => {
    const notes = selectAdvisorNotes(forStage("growing"));
    const advisors = new Set(notes.map((n) => n.advisor));
    expect(advisors.has("ceo")).toBe(true);
    expect(advisors.has("productivity")).toBe(true);
  });
});

describe("fallback when no projects", () => {
  it("gives a first concrete step and an empty-state message", () => {
    const r = forStage("idea"); // journey idea sample has no projects
    expect(r.hasProjects).toBe(false);
    expect(r.recommendations[0].source).toBe("fallback");
    expect(r.recommendations[0].title.toLowerCase()).toMatch(/start here/);
    const dash = getRecommendationDashboard(
      sampleJourneySamples()[0].events,
      sampleJourneySamples()[0].founderId,
      { now: NOW },
    );
    expect(dash.emptyState).not.toBeNull();
  });
});

describe("energy & time factoring", () => {
  it("low energy shrinks step sizes and time budget", () => {
    const events = simulateMasterWorkflow("founder-001", new Date("2026-06-01T09:00:00.000Z"));
    const low = getFounderRecommendations(events, "founder-001", {
      now: new Date("2026-06-02T09:00:00.000Z"),
      energy: "low",
      availableMinutes: 30,
    });
    expect(low.availableMinutes).toBe(30);
    expect(low.recommendations.every((r) => r.estimatedMinutes <= 25)).toBe(true);
    expect(low.headline.toLowerCase()).toMatch(/small/);
  });

  it("time allocation sums roughly to the available minutes", () => {
    const r = forStage("growing");
    const total = r.timeAllocation.reduce((a, s) => a + s.minutes, 0);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(r.availableMinutes + 10);
  });
});

describe("answers", () => {
  it("answers focus-today and next-steps in plain language", () => {
    const r = forStage("building");
    expect(whatShouldIFocusOnToday(r).length).toBeGreaterThan(0);
    expect(whatAreMyNextSteps(r).length).toBeGreaterThan(0);
  });
});

describe("non-therapeutic / non-legal guardrail", () => {
  it("never emits medical/mental-health/legal language", () => {
    for (const { recommendations } of sampleRecommendationSets()) {
      const blob = JSON.stringify(recommendations).toLowerCase();
      expect(containsClinicalLanguage(blob)).toBe(false);
      expect(blob).not.toMatch(/lawsuit|legal advice|attorney/);
    }
  });
});
