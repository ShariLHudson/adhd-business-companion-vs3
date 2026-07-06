import { describe, expect, it } from "vitest";

import {
  SAMPLE_IMPROVEMENT_OPPORTUNITIES,
  SAMPLE_IMPROVEMENT_RELATIONSHIPS,
  calculateROI,
  compareResults,
  findExperiments,
  improvementService,
  institutionalMemoryLinks,
  prioritizeImprovements,
  recommendImprovements,
  review,
} from "./index";

describe("Continuous Improvement Engine™", () => {
  it("sample opportunities answer what, why, root cause, and action", () => {
    expect(SAMPLE_IMPROVEMENT_OPPORTUNITIES.length).toBeGreaterThanOrEqual(4);
    for (const opp of SAMPLE_IMPROVEMENT_OPPORTUNITIES) {
      expect(opp.whatIsHappening.length).toBeGreaterThan(0);
      expect(opp.whyIsHappening.length).toBeGreaterThan(0);
      expect(opp.rootCause.length).toBeGreaterThan(0);
      expect(opp.evidence.length).toBeGreaterThan(0);
      expect(opp.roi.summary.length).toBeGreaterThan(0);
    }
  });

  it("review() creates executive improvement reviews", () => {
    const weekly = review({ kind: "weekly" });
    expect(weekly.title).toContain("Weekly");
    expect(weekly.whatWorked.length).toBeGreaterThan(0);
    expect(weekly.slowingDown.length).toBeGreaterThan(0);
    expect(weekly.improve.length).toBeGreaterThan(0);

    const mission = review({ kind: "mission", missionId: "listening-rooms" });
    expect(mission.missionId).toBe("listening-rooms");
  });

  it("recommendImprovements generates evidence-based recommendations", () => {
    const recs = recommendImprovements();
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.rationale.length > 0)).toBe(true);
    expect(recs.every((r) => r.evidenceIds.length > 0)).toBe(true);
  });

  it("calculateROI scores opportunities", () => {
    const roi = calculateROI("imp-approval-packets");
    expect(roi).toBeTruthy();
    expect(roi!.score).toBeGreaterThan(0);
    expect(roi!.timeSavedHours).toBeGreaterThan(0);
  });

  it("prioritizeImprovements orders by priority and ROI", () => {
    const ordered = prioritizeImprovements();
    expect(ordered[0].priority).toBe("high");
    expect(ordered.length).toBeGreaterThanOrEqual(4);
  });

  it("findExperiments supports controlled experiments", () => {
    const running = findExperiments({ status: "running" });
    expect(running.some((e) => e.hypothesis.length > 0)).toBe(true);
    expect(running[0].lessons).toBeDefined();
  });

  it("compareResults synthesizes experiment lessons", () => {
    const result = compareResults({
      experimentIdA: "exp-onboarding-audio",
      experimentIdB: "exp-gentle-restart-pilot",
    });
    expect(result?.experimentA.status).toBe("completed");
    expect(result?.recommendation.length).toBeGreaterThan(0);
  });

  it("relationships connect observations, opportunities, and experiments", () => {
    const rels = improvementService.relationships();
    expect(rels.length).toBeGreaterThanOrEqual(SAMPLE_IMPROVEMENT_RELATIONSHIPS.length);
    expect(rels.some((r) => r.kind === "validates")).toBe(true);
  });

  it("history tracks improvement lineage", () => {
    const hist = improvementService.history("imp-approval-packets");
    expect(hist.length).toBeGreaterThan(0);
  });

  it("links to institutional memory for root cause thinking", () => {
    const links = institutionalMemoryLinks();
    expect(links.some((l) => l.institutionalMemoryId === "mem-lesson-welcome-first")).toBe(true);
  });

  it("public API surfaces through improvementService", () => {
    expect(improvementService.topImprovement()?.id).toBeTruthy();
    expect(improvementService.sampleRepository().metrics().length).toBeGreaterThan(0);
  });
});
