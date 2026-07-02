import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { fileInCabinet, clearCabinetForTests } from "@/lib/momentumInstitute/cabinetStore";
import { clearLearningExperiencesForTests, startLearningExperience } from "@/lib/momentumInstitute/learningExperienceStore";
import { clearGrowthProfileForTests } from "@/lib/momentumInstitute/growthProfileStore";
import { PHASE1_INSTITUTE_CATALOG } from "./phase1Catalog";
import {
  resetInstituteCatalogProvider,
  setInstituteCatalogProvider,
} from "../catalog/provider";
import { resolveKnowledgeCardMemberStatus } from "./knowledgeCardMemberState";
import { resolveKnowledgeCardViewModel } from "./knowledgeCardViewModel";

describe("Knowledge Card member state (Phase 3)", () => {
  const pricingCardId = "kc-pricing-pricing-foundations";

  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    setInstituteCatalogProvider({ load: () => PHASE1_INSTITUTE_CATALOG });
    clearCabinetForTests();
    clearLearningExperiencesForTests();
    clearGrowthProfileForTests();
  });

  afterEach(() => {
    resetInstituteCatalogProvider();
    vi.restoreAllMocks();
    clearCabinetForTests();
    clearLearningExperiencesForTests();
    clearGrowthProfileForTests();
  });

  it("starts as not started", () => {
    expect(resolveKnowledgeCardMemberStatus(pricingCardId)).toBe("not_started");
  });

  it("becomes in progress when learning begins", () => {
    startLearningExperience("exp-bmm-pricing-pricing-foundations");
    expect(resolveKnowledgeCardMemberStatus(pricingCardId)).toBe("in_progress");
  });

  it("becomes saved when filed in cabinet", () => {
    fileInCabinet({ knowledgeCardId: pricingCardId });
    expect(resolveKnowledgeCardMemberStatus(pricingCardId)).toBe("saved");
  });

  it("builds rich index card view models", () => {
    const card = PHASE1_INSTITUTE_CATALOG.knowledgeCards.find(
      (entry) => entry.id === pricingCardId,
    )!;
    const drawer = PHASE1_INSTITUTE_CATALOG.drawers.find(
      (entry) => entry.id === card.drawerId,
    )!;
    const model = resolveKnowledgeCardViewModel(card, drawer);

    expect(model.title).toBe("Pricing Foundations");
    expect(model.estimatedMinutes).toBe(8);
    expect(model.competencyLabel).toBe("Pricing");
    expect(model.statusLabel).toBe("Not Started");
  });
});
