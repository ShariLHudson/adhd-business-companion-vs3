import { describe, expect, it, beforeEach } from "vitest";

import {
  findBusinessReasoning,
  findDecisionHistory,
  findLessons,
  findPastExperiments,
  findProductHistory,
  findSimilar,
  institutionalMemoryService,
  recall,
  rediscoverMemory,
  remember,
  resetRuntimeInstitutionalMemory,
  SAMPLE_INSTITUTIONAL_MEMORIES,
  SAMPLE_MEMORY_RELATIONSHIPS,
  validateRelationshipIntegrity,
} from "./index";

describe("Institutional Memory™", () => {
  beforeEach(() => {
    resetRuntimeInstitutionalMemory();
  });

  it("sample memories link Listening Rooms chain", () => {
    expect(SAMPLE_INSTITUTIONAL_MEMORIES.length).toBeGreaterThanOrEqual(10);
    expect(SAMPLE_MEMORY_RELATIONSHIPS.length).toBeGreaterThanOrEqual(8);

    const mission = institutionalMemoryService.sampleRepository().forMission("listening-rooms");
    expect(mission.length).toBeGreaterThanOrEqual(8);
    expect(mission.some((m) => m.kind === "product-evolution")).toBe(true);
    expect(mission.some((m) => m.kind === "decision")).toBe(true);
    expect(mission.some((m) => m.kind === "lesson")).toBe(true);
  });

  it("creates runtime memories via remember()", () => {
    const created = remember({
      kind: "lesson",
      title: "Test lesson",
      description: "Sample runtime lesson.",
      context: "Sprint 9 test.",
      whyThisHappened: "Verify remember API.",
      problemSolved: "Architecture validation.",
      alternativesConsidered: [],
      expectedOutcome: "Memory stored.",
      actualOutcome: "Memory stored.",
      lessonsLearned: ["What worked: remember() merges with sample repo."],
      wouldDoAgain: true,
      relatedMissions: ["listening-rooms"],
      relatedProducts: [],
      relatedResearch: [],
      relatedCustomers: [],
      relatedContent: [],
      relatedWorkshops: [],
      relatedCampaigns: [],
      relatedRevenue: [],
      evidence: [],
      graphNodeIds: [],
    });

    expect(created.id).toMatch(/^mem-runtime-/);
    expect(institutionalMemoryService.list().some((m) => m.id === created.id)).toBe(true);
  });

  it("recalls and filters institutional memories", () => {
    const decisions = recall({ kind: "decision" });
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions[0].kind).toBe("decision");

    const search = recall({ search: "Listening" });
    expect(search.length).toBeGreaterThan(0);
  });

  it("answers decision history questions", () => {
    const decision = findDecisionHistory("mem-decision-invest-restart");
    expect(decision).not.toBeNull();
    expect(decision!.alternativesConsidered.length).toBeGreaterThan(0);

    const reasoning = findBusinessReasoning("mem-decision-invest-restart");
    expect(reasoning).not.toBeNull();
    expect(reasoning!.narrative.some((n) => n.includes("Why did we decide"))).toBe(true);
    expect(reasoning!.wouldDecideSameToday).toBe(true);
  });

  it("retrieves lessons via lesson engine", () => {
    const lessons = findLessons({ missionId: "listening-rooms" });
    expect(lessons.length).toBeGreaterThan(0);

    const analysis = institutionalMemoryService.analyzeLessons(lessons);
    expect(analysis.shouldRepeat.length + analysis.whatWorked.length).toBeGreaterThan(0);
  });

  it("validates relationship integrity", () => {
    const integrity = validateRelationshipIntegrity();
    expect(integrity.valid).toBe(true);
    expect(integrity.orphanCount).toBe(0);
  });

  it("rediscovers past thinking", () => {
    const result = rediscoverMemory("Have we thought about Listening Rooms before?");
    expect(result.memories.length).toBeGreaterThan(0);
    expect(result.relatedGraphNodeIds.length).toBeGreaterThan(0);
    expect(result.narrative.length).toBeGreaterThan(0);
  });

  it("finds similar memories and product history", () => {
    const similar = findSimilar("mem-lr-original-idea");
    expect(similar.length).toBeGreaterThan(0);

    const product = findProductHistory("listening-rooms");
    expect(product.length).toBeGreaterThan(0);
    expect(product[0].originalVision).toBeTruthy();

    const experiments = findPastExperiments({ missionId: "listening-rooms" });
    expect(Array.isArray(experiments)).toBe(true);
  });

  it("builds ecosystem timeline", () => {
    const timeline = institutionalMemoryService.ecosystemTimeline(5);
    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[0].occurredAt).toBeTruthy();
  });
});
