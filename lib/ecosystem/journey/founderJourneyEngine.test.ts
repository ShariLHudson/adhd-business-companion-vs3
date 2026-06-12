// Founder Ecosystem — Phase 9 Founder Journey Engine tests.
// Proves the system detects the founder's business stage and focus, and that
// recommendations change per stage (validate at idea, delegate at scaling).
// (Named *.test.ts so vitest discovers it.)

import { describe, expect, it } from "vitest";

import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { detectFounderJourney } from "./founderJourneyEngine";
import {
  advisorGuidanceForStage,
  adjustAdvisorRecommendations,
  advisorBoardForJourney,
} from "./advisorStageGuidance";
import { getJourneyDashboard } from "./journeyDashboard";
import {
  selectThingsToAvoid,
  whatMattersMostNow,
  whatToSkipNow,
  whereAmIInMyJourney,
} from "./journeySelectors";
import { sampleJourneySamples } from "./sampleJourneyData";

describe("stage detection across all five stages", () => {
  for (const sample of sampleJourneySamples()) {
    it(`detects the ${sample.stage} stage`, () => {
      const j = detectFounderJourney(sample.events, sample.founderId, {
        profile: sample.profile,
        now: new Date("2026-06-10T09:00:00.000Z"),
      });
      expect(j.currentStage).toBe(sample.stage);
      expect(["low", "medium", "high"]).toContain(j.confidence);
      expect(j.stageScores[0].stage).toBe(sample.stage);
    });
  }
});

describe("focus detection", () => {
  it("identifies a primary focus from the activity", () => {
    const sample = sampleJourneySamples().find((s) => s.stage === "launching")!;
    const j = detectFounderJourney(sample.events, sample.founderId, { profile: sample.profile });
    expect(j.primaryFocus).not.toBeNull();
    expect(j.focusScores.length).toBeGreaterThan(0);
  });
});

describe("stage-specific recommendations", () => {
  const byStage = Object.fromEntries(
    sampleJourneySamples().map((s) => [
      s.stage,
      detectFounderJourney(s.events, s.founderId, { profile: s.profile }),
    ]),
  );

  it("idea stage focuses on validation, not automation", () => {
    const text = JSON.stringify(byStage.idea.recommendations).toLowerCase();
    expect(text).toMatch(/validat/);
    expect(selectThingsToAvoid(byStage.idea).join(" ").toLowerCase()).toMatch(/automation|logo/);
  });

  it("scaling stage focuses on delegation, not logo design", () => {
    const text = JSON.stringify(byStage.scaling.recommendations).toLowerCase();
    expect(text).toMatch(/delegat/);
    expect(selectThingsToAvoid(byStage.scaling).join(" ").toLowerCase()).toMatch(/logo|low-leverage|weeds/);
  });

  it("recommendations differ between idea and scaling", () => {
    expect(JSON.stringify(byStage.idea.recommendations)).not.toBe(
      JSON.stringify(byStage.scaling.recommendations),
    );
  });
});

describe("advisor ↔ stage integration", () => {
  it("gives different CEO guidance at idea vs scaling", () => {
    const idea = advisorGuidanceForStage("ceo", "idea");
    const scaling = advisorGuidanceForStage("ceo", "scaling");
    expect(idea.recommend).not.toEqual(scaling.recommend);
    expect(idea.deprioritize.join(" ").toLowerCase()).toMatch(/hiring|automation/);
  });

  it("flags off-stage recommendations", () => {
    const adjusted = adjustAdvisorRecommendations("ceo", "idea", [
      "Validate demand with buyers",
      "Set up full automation",
    ]);
    expect(adjusted[0].fit).toBe("aligned");
    expect(adjusted.some((a) => a.fit === "off-stage")).toBe(true);
  });

  it("builds the four-advisor board for a journey", () => {
    const sample = sampleJourneySamples().find((s) => s.stage === "growing")!;
    const j = detectFounderJourney(sample.events, sample.founderId, { profile: sample.profile });
    expect(advisorBoardForJourney(j).map((a) => a.advisor)).toEqual([
      "ceo",
      "marketing",
      "sales",
      "operations",
    ]);
  });
});

describe("journey dashboard + answers", () => {
  it("builds a stepper with one current stage", () => {
    const sample = sampleJourneySamples().find((s) => s.stage === "building")!;
    const dash = getJourneyDashboard(sample.events, sample.founderId, { profile: sample.profile });
    expect(dash.steps.filter((s) => s.state === "current").length).toBe(1);
    expect(dash.progress).toBeGreaterThan(0);
    expect(dash.recommendedActions.length).toBeGreaterThan(0);
  });

  it("answers where am I / what matters / what to skip", () => {
    const sample = sampleJourneySamples().find((s) => s.stage === "idea")!;
    const j = detectFounderJourney(sample.events, sample.founderId);
    expect(whereAmIInMyJourney(j)).toMatch(/Idea/);
    expect(whatMattersMostNow(j).length).toBeGreaterThan(0);
    expect(whatToSkipNow(j).length).toBeGreaterThan(0);
  });
});

describe("runs on the master workflow without error", () => {
  it("produces a journey from a mixed event stream", () => {
    const events = simulateMasterWorkflow("founder-001", new Date("2026-06-01T09:00:00.000Z"));
    const j = detectFounderJourney(events, "founder-001");
    expect(["idea", "building", "launching", "growing", "scaling"]).toContain(j.currentStage);
  });
});

describe("no diagnosis guardrail", () => {
  it("never emits medical/mental-health language", () => {
    for (const sample of sampleJourneySamples()) {
      const j = detectFounderJourney(sample.events, sample.founderId, { profile: sample.profile });
      const blob = JSON.stringify(j).toLowerCase();
      expect(blob).not.toMatch(/diagnos|disorder|adhd|depress|anxiety disorder|medication/);
    }
  });
});
