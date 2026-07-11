import { describe, expect, it } from "vitest";
import {
  SPARK_CURRICULUM_MASTER_INDEX,
  computeCurriculumStats,
  getAllCurriculumEntries,
  getCurriculumByPillar,
  curriculumMasterIndexToJson,
  curriculumEntryToKnowledgeCardSeed,
} from "./masterIndex";
import { CURRICULUM_EXPERIENCE_KINDS } from "./types";

describe("Spark Curriculum Master Index", () => {
  it("has unique curriculum entry ids", () => {
    const ids = getAllCurriculumEntries().map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all four pillars", () => {
    const stats = computeCurriculumStats();
    expect(stats.byPillar.build_yourself).toBeGreaterThan(40);
    expect(stats.byPillar.build_your_business).toBeGreaterThan(50);
    expect(stats.byPillar.build_your_thinking).toBeGreaterThan(25);
    expect(stats.byPillar.build_your_legacy).toBeGreaterThan(25);
    expect(stats.totalTopics).toBeGreaterThan(150);
  });

  it("every topic declares capability focus and future experiences", () => {
    for (const entry of getAllCurriculumEntries()) {
      expect(entry.capabilityFocus.length).toBeGreaterThan(10);
      expect(entry.futureLearningExperiences.length).toBeGreaterThan(0);
      expect(entry.futureLearningExperiences).toContain("knowledge_card");
      expect(entry.primaryCompetencies.length).toBeGreaterThan(0);
    }
  });

  it("filters by pillar", () => {
    const business = getCurriculumByPillar("build_your_business");
    expect(business.every((e) => e.pillarId === "build_your_business")).toBe(
      true,
    );
    expect(business.some((e) => e.title === "Pricing Psychology")).toBe(true);
  });

  it("serializes to JSON for CMS import", () => {
    const json = curriculumMasterIndexToJson();
    const parsed = JSON.parse(json) as typeof SPARK_CURRICULUM_MASTER_INDEX;
    expect(parsed.entries.length).toBe(SPARK_CURRICULUM_MASTER_INDEX.entries.length);
    expect(parsed.version).toBe("1.0.0");
  });

  it("maps to knowledge card seed without lesson body", () => {
    const entry = getAllCurriculumEntries()[0]!;
    const seed = curriculumEntryToKnowledgeCardSeed(entry);
    expect(seed.kind).toBe("knowledge-card");
    expect(seed.title).toBe(entry.title);
    expect(seed.metadata?.difficulty).toBe(entry.difficulty);
    expect((seed as { capabilityFocus?: string }).capabilityFocus).toBe(
      entry.capabilityFocus,
    );
  });

  it("tracks experience kind coverage across curriculum", () => {
    const stats = computeCurriculumStats();
    for (const kind of CURRICULUM_EXPERIENCE_KINDS) {
      expect(stats.experienceKindCoverage[kind] ?? 0).toBeGreaterThan(0);
    }
  });
});
