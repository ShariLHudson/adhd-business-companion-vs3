import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_INSTITUTE_CATALOG } from "./catalog/testCatalog";
import {
  resetInstituteCatalogProvider,
  setInstituteCatalogProvider,
} from "./catalog/provider";
import {
  resolveExperienceById,
  resolveExperiencesForKnowledgeCard,
  resolveExperiencesForTopic,
} from "./experienceResolver";
import {
  canAdvanceLifecycle,
  nextLifecycleStage,
  isPermissionGatedStage,
} from "./lifecycle";
import {
  clearCabinetForTests,
  fileInCabinet,
  listCabinetItems,
} from "./cabinetStore";
import {
  clearGrowthProfileForTests,
  getGrowthProfile,
  recordLearningCompletion,
} from "./growthProfileStore";
import {
  advanceLearningExperience,
  clearLearningExperiencesForTests,
  startLearningExperience,
} from "./learningExperienceStore";
import {
  clearEvidenceOpportunitiesForTests,
  createEvidenceOpportunity,
  returnClosingPrompt,
} from "./evidenceBridge";
import {
  acceptCabinetFiling,
  beginInstituteExperience,
} from "./instituteOrchestrator";
import { resolveMakeItMineForExperience } from "./makeItMine";
import {
  listPillars,
  listDepartmentsForPillar,
} from "./catalog/provider";
import {
  resolveExperiencesForTimeSlot,
  suggestTimeSlotsForTopic,
} from "./timeAvailability";
import {
  ecosystemDestinationsForExperience,
  isPermissionGatedEcosystemDestination,
} from "./ecosystemLinks";
import { SPARK_COMPETENCY_FRAMEWORK_V1 } from "@/lib/sparkCompetencyFramework/competencyFrameworkV1";

describe("Momentum Institute Engine", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    setInstituteCatalogProvider({ load: () => TEST_INSTITUTE_CATALOG });
    clearCabinetForTests();
    clearGrowthProfileForTests();
    clearLearningExperiencesForTests();
    clearEvidenceOpportunitiesForTests();
  });

  afterEach(() => {
    resetInstituteCatalogProvider();
    vi.restoreAllMocks();
  });

  it("resolves available experiences from catalog data — not hard-coded", () => {
    const cardExperiences = resolveExperiencesForKnowledgeCard(
      "kc-pricing-psychology",
    );
    expect(cardExperiences).toHaveLength(3);
    expect(cardExperiences.every((r) => r.available)).toBe(true);
    expect(cardExperiences[0]?.knowledgeCard.id).toBe("kc-pricing-psychology");

    const topicExperiences = resolveExperiencesForTopic("topic-pricing-basics");
    expect(topicExperiences.length).toBeGreaterThanOrEqual(3);
  });

  it("filters experiences when topic does not support the type", () => {
    const catalog = structuredClone(TEST_INSTITUTE_CATALOG);
    catalog.topics[0]!.supportedExperienceTypes = ["business_mastery_minute"];
    setInstituteCatalogProvider({ load: () => catalog });

    const results = resolveExperiencesForKnowledgeCard("kc-pricing-psychology");
    const apply = results.find((r) => r.experience.kind === "apply_to_my_business");
    expect(apply?.available).toBe(false);
  });

  it("advances lifecycle in order", () => {
    const resolved = resolveExperienceById("exp-bmm-pricing");
    const stages = resolved!.lifecycleStages;
    expect(nextLifecycleStage("discover", stages)).toBe("learn");
    expect(canAdvanceLifecycle("learn", "reflect", stages)).toBe(true);
    expect(canAdvanceLifecycle("discover", "reflect", stages)).toBe(false);
  });

  it("gates Make It Mine and Evidence Vault behind permission", () => {
    expect(isPermissionGatedStage("make_it_mine")).toBe(true);
    expect(isPermissionGatedStage("evidence_vault")).toBe(true);
    expect(isPermissionGatedStage("growth_profile")).toBe(false);
  });

  it("starts learning experience referencing master knowledge card", () => {
    const experience = startLearningExperience("exp-bmm-pricing");
    expect(experience?.knowledgeCardId).toBe("kc-pricing-psychology");
    expect(experience?.lifecycleStage).toBe("discover");
    expect(experience?.originatedFromKind).toBe("knowledge-card");
  });

  it("files cabinet references without duplicating content", () => {
    const item = fileInCabinet({
      knowledgeCardId: "kc-pricing-psychology",
      experienceDefinitionId: "exp-bmm-pricing",
    });
    expect(item.label).toBe("Pricing Psychology");
    expect(listCabinetItems()).toHaveLength(1);
    expect(listCabinetItems()[0]?.knowledgeCardId).toBe("kc-pricing-psychology");

    const duplicate = fileInCabinet({
      knowledgeCardId: "kc-pricing-psychology",
      experienceDefinitionId: "exp-bmm-pricing",
    });
    expect(duplicate.id).toBe(item.id);
    expect(listCabinetItems()).toHaveLength(1);
  });

  it("updates growth profile automatically on completion", () => {
    recordLearningCompletion({
      learningExperienceId: "ile-test",
      knowledgeCardId: "kc-pricing-psychology",
      experienceDefinitionId: "exp-bmm-pricing",
      experienceType: "business_mastery_minute",
      drawerId: "drawer-dept-marketing-pricing",
      departmentId: "dept-marketing",
    });
    const profile = getGrowthProfile();
    expect(profile.completedLearning).toHaveLength(1);
    expect(profile.competencies.some((c) => c.competencyId === "comp-pricing")).toBe(
      true,
    );
    expect(
      profile.competencies.find((c) => c.competencyId === "comp-pricing")?.level,
    ).toBe("exploring");
    expect(profile.timeline.some((t) => t.event === "competency_updated")).toBe(
      true,
    );
  });

  it("creates evidence opportunity on return — never auto-saves evidence", () => {
    const experience = startLearningExperience("exp-bmm-pricing")!;
    let current = experience;
    const resolved = resolveExperienceById("exp-bmm-pricing")!;
    const stages = resolved.lifecycleStages;

    for (const stage of stages) {
      if (stage === current.lifecycleStage) continue;
      if (nextLifecycleStage(current.lifecycleStage, stages) === stage) {
        current = advanceLearningExperience(current.id)!;
      }
    }

    const opportunity = createEvidenceOpportunity({
      learningExperienceId: current.id,
      knowledgeCardId: current.knowledgeCardId,
      experienceDefinitionId: current.experienceDefinitionId,
    });
    expect(opportunity.status).toBe("pending_return");
    expect(opportunity.evidenceEntryId).toBeUndefined();
  });

  it("resolves Make It Mine for pricing lesson", () => {
    const mim = resolveMakeItMineForExperience("exp-apply-pricing");
    expect(mim?.intent).toBe("improve_my_pricing");
    expect(mim?.outcomeLabel).toMatch(/MY pricing/i);
  });

  it("orchestrates cabinet filing then journal offer", () => {
    beginInstituteExperience("exp-bmm-pricing");
    const turn = acceptCabinetFiling({
      knowledgeCardId: "kc-pricing-psychology",
      experienceDefinitionId: "exp-bmm-pricing",
    });
    expect(turn.kind).toBe("journal_offer");
    expect(getGrowthProfile().timeline.some((t) => t.event === "filed_cabinet")).toBe(
      true,
    );
  });

  it("includes The Return closing philosophy", () => {
    const closing = returnClosingPrompt("Pricing Psychology");
    expect(closing).toMatch(/come back and tell me what happened/i);
    expect(closing).toMatch(/Evidence Vault/i);
  });

  it("loads Spark Competency Framework v1.0 pillars and departments", () => {
    const pillars = listPillars();
    expect(pillars).toHaveLength(4);
    expect(pillars.map((p) => p.id)).toEqual([
      "build_yourself",
      "build_your_business",
      "build_your_thinking",
      "build_your_legacy",
    ]);

    const marketingDepts = listDepartmentsForPillar("build_your_business");
    expect(marketingDepts.some((d) => d.slug === "marketing")).toBe(true);
    expect(SPARK_COMPETENCY_FRAMEWORK_V1.exampleDrawers.length).toBeGreaterThan(50);
  });

  it("recommends experiences by available time", () => {
    const fiveMin = resolveExperiencesForTimeSlot("kc-pricing-psychology", "5_min");
    expect(fiveMin.every((r) => r.experience.kind === "business_mastery_minute")).toBe(
      true,
    );

    const slots = suggestTimeSlotsForTopic("kc-pricing-psychology");
    expect(slots).toContain("5_min");
    expect(slots).toContain("15_min");
  });

  it("maps experiences to Personal Learning Ecosystem destinations", () => {
    const destinations = ecosystemDestinationsForExperience(
      "apply_to_my_business",
    );
    expect(destinations).toContain("make_it_mine");
    expect(destinations).toContain("evidence_vault");
    expect(destinations).toContain("growth_profile");
    expect(isPermissionGatedEcosystemDestination("evidence_vault")).toBe(true);
    expect(isPermissionGatedEcosystemDestination("growth_profile")).toBe(false);
  });
});
