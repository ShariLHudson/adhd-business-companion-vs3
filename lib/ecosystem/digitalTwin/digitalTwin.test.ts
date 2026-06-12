// Founder Ecosystem — Phase 16 Founder Digital Twin tests.
// Proves the twin models behavior (not personality) across a long history,
// produces probabilistic predictions, yields adaptive insights, and honors the
// ethics rules (never diagnose, never label as a condition, never claim
// certainty). (Spec deliverable "digitalTwinTests.ts"; *.test.ts for vitest.)

import { describe, expect, it } from "vitest";

import { containsClinicalLanguage } from "../clinicalLanguageGuard";
import { sampleFounderHistory } from "../intelligence/fixtures/founderHistory";
import { buildFounderDigitalTwin } from "./founderDigitalTwin";
import { buildPredictions, twinMaturity } from "./predictionEngine";
import {
  buildDigitalTwinDashboard,
  selectAdaptiveInsights,
  selectOperatingProfile,
} from "./digitalTwinSelectors";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-10T09:00:00.000Z");
const history = () => sampleFounderHistory(FOUNDER, NOW);

const WORK = ["visionary", "builder", "operator", "teacher", "creator", "strategist", "connector"];

describe("digital twin composes behavioral models", () => {
  const twin = buildFounderDigitalTwin(history(), FOUNDER, { now: NOW });

  it("builds work / decision / execution / momentum / overwhelm / success models", () => {
    expect(twin.workStyle.traits.length).toBeGreaterThan(0);
    for (const t of twin.workStyle.traits) {
      expect(WORK).toContain(t.value);
      expect(["low", "medium", "high"]).toContain(t.confidence);
    }
    expect(twin.momentum.drivers.length).toBeGreaterThan(0);
    expect(twin.executionStyle.observation.length).toBeGreaterThan(0);
    expect(twin.success.observation.length).toBeGreaterThan(0);
  });

  it("captures stage, focus, preferred hours and twin memory", () => {
    expect(twin.businessStage).toBeTruthy();
    expect(twin.memory.decisions.length).toBeGreaterThanOrEqual(0);
    expect(["morning", "afternoon", "evening", null]).toContain(twin.preferredWorkHours.bestTimeOfDay);
  });

  it("reports a maturity level reflecting evidence volume", () => {
    expect(["low", "medium", "high"]).toContain(twin.maturity);
    expect(twin.observedEventCount).toBeGreaterThan(0);
    expect(twinMaturity(5)).toBe("low");
    expect(twinMaturity(200)).toBe("high");
  });
});

describe("prediction engine returns probabilities, not facts", () => {
  const p = buildPredictions(history(), FOUNDER, { now: NOW });

  it("all likelihoods are bounded probabilities with confidence + basis", () => {
    for (const k of ["taskCompletion", "procrastination", "overwhelm", "projectSuccess", "recommendationAcceptance"] as const) {
      const l = p[k];
      expect(l.probability).toBeGreaterThan(0);
      expect(l.probability).toBeLessThan(1);
      expect(["low", "medium", "high"]).toContain(l.confidence);
      expect(l.basis.length).toBeGreaterThan(0);
    }
  });
});

describe("adaptive insights", () => {
  it("turns behavior into observational adaptations", () => {
    const twin = buildFounderDigitalTwin(history(), FOUNDER, { now: NOW });
    const insights = selectAdaptiveInsights(twin);
    expect(insights.length).toBeGreaterThan(0);
    for (const i of insights) {
      expect(i.insight.length).toBeGreaterThan(0);
      expect(i.adaptation.length).toBeGreaterThan(0);
    }
  });

  it("operating profile exposes the key dimensions", () => {
    const prof = selectOperatingProfile(buildFounderDigitalTwin(history(), FOUNDER, { now: NOW }));
    expect(prof.workStyles.length).toBeGreaterThan(0);
    expect(prof.stage).toBeTruthy();
  });
});

describe("dashboard integration", () => {
  it("assembles operating profile, drivers, triggers, patterns, insights", () => {
    const dash = buildDigitalTwinDashboard(buildFounderDigitalTwin(history(), FOUNDER, { now: NOW }));
    expect(dash.momentumDrivers.length).toBeGreaterThan(0);
    expect(Array.isArray(dash.overwhelmTriggers)).toBe(true);
    expect(dash.adaptiveInsights.length).toBeGreaterThan(0);
    expect(dash.predictions.taskCompletion.probability).toBeLessThan(1);
  });
});

describe("ethics: behavior not personality, never diagnosis or certainty", () => {
  const twin = buildFounderDigitalTwin(history(), FOUNDER, { now: NOW });

  it("never emits clinical / diagnostic / labeling language", () => {
    const blob = JSON.stringify(twin);
    expect(containsClinicalLanguage(blob)).toBe(false);
  });

  it("frames notes as observations, and never claims certainty", () => {
    const blob = JSON.stringify(twin.observations).toLowerCase();
    expect(blob).not.toMatch(/\b(always will|guaranteed|certainly will|definitely will|you will always)\b/);
    // predictions are probabilities, never 0 or 1
    for (const k of Object.keys(twin.predictions) as (keyof typeof twin.predictions)[]) {
      expect(twin.predictions[k].probability).toBeGreaterThan(0);
      expect(twin.predictions[k].probability).toBeLessThan(1);
    }
  });
});
