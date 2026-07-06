import { describe, expect, it, beforeEach } from "vitest";

import {
  SAMPLE_FOUNDER_OBSERVATIONS,
  SAMPLE_FOUNDER_PATTERNS,
  friction,
  isObservationalPhrase,
  learn,
  observe,
  patterns,
  recommend,
  resetRuntimeFounderProfile,
  strengths,
  founderProfileService,
} from "./index";

describe("Executive Digital Twin™ — Founder Profile Intelligence", () => {
  beforeEach(() => {
    resetRuntimeFounderProfile();
  });

  it("sample observations cover habits without personality labels", () => {
    expect(SAMPLE_FOUNDER_OBSERVATIONS.length).toBeGreaterThanOrEqual(8);
    for (const obs of SAMPLE_FOUNDER_OBSERVATIONS) {
      expect(obs.observation.toLowerCase()).not.toMatch(/you are (a|an)/);
      expect(obs.observation.toLowerCase()).not.toContain("personality");
    }
  });

  it("patterns use observational I've noticed phrasing", () => {
    const all = patterns();
    expect(all.length).toBeGreaterThanOrEqual(SAMPLE_FOUNDER_PATTERNS.length);
    for (const p of all) {
      expect(isObservationalPhrase(p.noticedPhrase)).toBe(true);
      expect(p.noticedPhrase).toMatch(/^I've noticed/);
    }
  });

  it("observe captures runtime evidence", () => {
    const captured = observe({
      event: "Finished strategy outline before noon.",
      context: "morning strategy",
      kind: "planning_habit",
      outcome: "positive",
    });
    expect(captured.id).toContain("obs-runtime");
    expect(captured.evidenceCount).toBe(1);
  });

  it("learn reinforces matching observations", () => {
    const first = learn({
      kind: "restart_habit",
      context: "gentle restart test",
      observation: "Audio helped restart during low energy.",
      outcome: "positive",
    });
    const second = learn({
      kind: "restart_habit",
      context: "gentle restart test",
      observation: "Audio helped restart during low energy.",
      outcome: "positive",
    });
    expect(second.evidenceCount).toBeGreaterThan(first.evidenceCount);
    expect(second.confidence).toBeGreaterThan(first.confidence);
  });

  it("recommend returns architecture-only adaptation hooks", () => {
    const recs = recommend();
    expect(recs.length).toBeGreaterThan(0);
    for (const r of recs) {
      expect(r.architectureOnly).toBe(true);
      expect(isObservationalPhrase(r.noticedPhrase)).toBe(true);
    }
  });

  it("friction surfaces reduction without blame", () => {
    const items = friction();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((f) => f.reduction.length > 0)).toBe(true);
    expect(items.every((f) => isObservationalPhrase(f.noticedPhrase))).toBe(true);
  });

  it("strengths identify repeatable success outcomes", () => {
    const items = strengths();
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((s) => s.outcomes.includes("momentum"))).toBe(true);
    expect(items.every((s) => s.repeatability >= 0)).toBe(true);
  });

  it("profile composes full digital twin view", () => {
    const view = founderProfileService.profile();
    expect(view.product).toBe("founder");
    expect(view.principles.some((p) => p.includes("personality"))).toBe(true);
    expect(view.observationCount).toBeGreaterThanOrEqual(8);
    expect(view.recommendations.length).toBeGreaterThan(0);
  });

  it("never uses personality type language in recommendations", () => {
    const forbidden = [/you are a/i, /personality type/i, /introvert/i, /extrovert/i];
    for (const r of recommend()) {
      for (const re of forbidden) {
        expect(r.noticedPhrase).not.toMatch(re);
        expect(r.suggestion).not.toMatch(re);
      }
    }
  });
});
