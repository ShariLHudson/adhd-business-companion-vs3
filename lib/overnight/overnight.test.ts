import { describe, expect, it } from "vitest";

import {
  listOvernightPhases,
  OVERNIGHT_PHASE_TIMELINE,
  prepareExecutiveQuestions,
  prepareMorningBrief,
  prepareOffice,
  prepareRecommendations,
  prepareResearchSummary,
  runCollectPhase,
  runNormalizePhase,
  runObservePhase,
  runOvernightExecutiveCycle,
  runOvernightCycle,
  runPrioritizePhase,
  runPreparePhase,
  runReasonPhase,
  runRecommendPhase,
  SAMPLE_PREPARED_OFFICE,
  getCycleHistory,
  listCycleHistory,
  topRecommendations,
} from "./index";

describe("Overnight Executive Cycle", () => {
  it("defines seven overnight phases in order", () => {
    expect(OVERNIGHT_PHASE_TIMELINE).toHaveLength(7);
    expect(listOvernightPhases().map((p) => p.id)).toEqual([
      "collect",
      "normalize",
      "observe",
      "reason",
      "recommend",
      "prioritize",
      "prepare",
    ]);
  });

  it("collect and normalize phases process sample signals", () => {
    const collected = runCollectPhase();
    expect(collected.signals.length).toBeGreaterThan(0);
    expect(collected.sourceCounts.research).toBeGreaterThan(0);

    const normalized = runNormalizePhase(collected);
    expect(normalized.signals.length).toBeGreaterThan(0);
    expect(normalized.signals.every((s) => s.sparkReady)).toBe(true);
  });

  it("observe and reason phases compose SPARK and Executive Questions", () => {
    const collected = runCollectPhase();
    const normalized = runNormalizePhase(collected);
    const observed = runObservePhase(normalized);
    expect(observed.observations.length).toBeGreaterThan(0);

    const reasoned = runReasonPhase(observed);
    expect(reasoned.founderRelevant).toBeGreaterThan(0);
  });

  it("recommend, prioritize, and prepare phases assemble office", () => {
    const collected = runCollectPhase();
    const normalized = runNormalizePhase(collected);
    const observed = runObservePhase(normalized);
    const reasoned = runReasonPhase(observed);
    const recommended = runRecommendPhase(reasoned);
    expect(recommended.recommendations.length).toBeGreaterThan(0);

    const prioritized = runPrioritizePhase(recommended);
    expect(prioritized.items[0].compositeScore).toBeGreaterThanOrEqual(
      prioritized.items[prioritized.items.length - 1].compositeScore,
    );

    const office = runPreparePhase(prioritized);
    expect(office.brief.greeting).toContain("Shari");
    expect(office.recommendedFirstAction).toBeTruthy();
  });

  it("sample morning brief matches calm executive narrative", () => {
    expect(SAMPLE_PREPARED_OFFICE.morning.whileYouWereAway).toContain(
      "124 research items reviewed.",
    );
    expect(SAMPLE_PREPARED_OFFICE.morning.stats.opportunitiesDeserveAttention).toBe(4);
    expect(SAMPLE_PREPARED_OFFICE.brief.recommendedMissionId).toBe("listening-rooms");
    expect(SAMPLE_PREPARED_OFFICE.morning.whileYouWereAway.some((l) => /Listening Rooms/i.test(l))).toBe(
      true,
    );
  });

  it("public API prepares office, mission, questions, and recommendations", () => {
    const office = prepareOffice();
    expect(office.todaysQuestions.length).toBeGreaterThan(0);
    expect(office.opportunities.length).toBeGreaterThan(0);
    expect(office.research.length).toBeGreaterThan(0);

    const brief = prepareMorningBrief();
    expect(brief.highlights.length).toBeGreaterThan(0);

    const questions = prepareExecutiveQuestions();
    expect(questions[0].question).toBeTruthy();

    const recs = prepareRecommendations(3);
    expect(recs.length).toBeLessThanOrEqual(3);
    expect(topRecommendations(office.recommendations, 1)[0].compositeScore).toBeGreaterThan(0);

    expect(prepareResearchSummary().some((r) => r.worthReading)).toBe(true);
  });

  it("orchestrator runs full cycle and history records outcomes", () => {
    const run = runOvernightExecutiveCycle();
    expect(run.phases).toHaveLength(7);
    expect(run.preparedOffice.missionFocus.missionId).toBeTruthy();

    const alt = runOvernightCycle();
    expect(alt.id).toMatch(/^cycle-/);

    expect(listCycleHistory().length).toBeGreaterThan(0);
    expect(getCycleHistory("2026-07-06")?.briefGenerated).toBe(true);
  });
});
