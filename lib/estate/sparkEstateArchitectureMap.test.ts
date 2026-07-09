import { describe, expect, it } from "vitest";

import {
  assessSparkEstateIntegration,
  entriesForDomain,
  formatSparkEstateArchitectureReport,
  getPhaseMapping,
  SPARK_ESTATE_ARCHITECTURE_ENTRIES,
  SPARK_ESTATE_ECOSYSTEM_VISION,
  SPARK_ESTATE_PHASE_MAPPINGS,
  verifySparkEstateArchitectureIntegration,
} from "./sparkEstateArchitectureMap";

describe("sparkEstateArchitectureMap", () => {
  it("maps Spark Estate phase implementations including Phase 18, 19, 20, 21, 23, 24, 25, 27, and 28", () => {
    expect(SPARK_ESTATE_PHASE_MAPPINGS.length).toBe(26);
    expect(SPARK_ESTATE_PHASE_MAPPINGS.every((mapping) => mapping.phase >= 1)).toBe(
      true,
    );
    expect(getPhaseMapping(10)?.implementations).toContain(
      "lib/estate/chamber/chamberMemberJourney.ts",
    );
    expect(getPhaseMapping(11)?.implementations).toContain(
      "lib/universalCreation/sparkEstateCreationJourney.ts",
    );
    expect(getPhaseMapping(14)?.implementations).toContain(
      "lib/estate/sparkEstateIntelligenceRoutingMap.ts",
    );
    expect(getPhaseMapping(15)?.implementations).toContain(
      "lib/estate/sparkEstateMemberProfileEngine.ts",
    );
    expect(getPhaseMapping(16)?.implementations).toContain(
      "lib/estate/sparkEstateCardEcosystem.ts",
    );
    expect(getPhaseMapping(17)?.implementations).toContain(
      "lib/estate/sparkEstateConversationEngine.ts",
    );
    expect(getPhaseMapping(18)?.implementations).toContain(
      "lib/estate/sparkEstateRoomIntelligenceArchitecture.ts",
    );
    expect(getPhaseMapping(19)?.implementations).toContain(
      "lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture.ts",
    );
    expect(getPhaseMapping(20)?.implementations).toContain(
      "lib/estate/sparkEstateUserJourneyAndMemberLifecycleArchitecture.ts",
    );
    expect(getPhaseMapping(21)?.implementations).toContain(
      "lib/estate/sparkEstateSystemGovernanceAndQualityStandards.ts",
    );
    expect(getPhaseMapping(23)?.implementations).toContain(
      "lib/estate/sparkEstateOnboardingAndFirst7DaysExperience.ts",
    );
    expect(getPhaseMapping(24)?.implementations).toContain(
      "lib/estate/sparkEstateDailyCompanionExperience.ts",
    );
    expect(getPhaseMapping(25)?.implementations).toContain(
      "lib/estate/sparkEstateRoomBlueprintTemplate.ts",
    );
    expect(getPhaseMapping(27)?.implementations).toContain(
      "lib/estate/sparkEstateFileAndDataArchitectureMap.ts",
    );
    expect(getPhaseMapping(28)?.implementations).toContain(
      "lib/estate/sparkEstateProductionReadinessChecklist.ts",
    );
  });

  it("documents existing, missing, and consolidation targets", () => {
    const assessment = assessSparkEstateIntegration();
    expect(assessment.existing.length).toBeGreaterThan(10);
    expect(assessment.missing.some((entry) => entry.id === "card-knowledge-library")).toBe(
      false,
    );
    expect(
      SPARK_ESTATE_ARCHITECTURE_ENTRIES.find(
        (entry) => entry.id === "card-knowledge-library",
      )?.status,
    ).toBe("partial");
    expect(
      assessment.conflicting.some((entry) => entry.id === "creation-workflow-engine"),
    ).toBe(true);
    expect(assessment.recommendedOrder[0]).toContain("Priority 1");
  });

  it("verifies cross-phase integration without duplicate systems", () => {
    const result = verifySparkEstateArchitectureIntegration();
    expect(result.assessment.phasesAligned).toBe(true);
    expect(result.assessment.chamberUsesEstateJourneys).toBe(true);
    expect(result.assessment.creationJourneyAligned).toBe(true);
    expect(result.assessment.completionSystemAligned).toBe(true);
    expect(result.assessment.chamberDemoReady).toBe(true);
    expect(result.assessment.productionReadinessAligned).toBe(true);
    expect(result.assessment.fileAndDataArchitectureAligned).toBe(true);
    expect(result.assessment.knowledgeLibraryAligned).toBe(true);
    expect(result.assessment.onboardingFirstWeekAligned).toBe(true);
    expect(result.assessment.roomBlueprintAligned).toBe(true);
    expect(result.assessment.roomIntelligenceAligned).toBe(true);
    expect(result.assessment.systemGovernanceAligned).toBe(true);
    expect(result.assessment.topNavigationAligned).toBe(true);
    expect(result.assessment.memberLifecycleAligned).toBe(true);
    expect(result.aligned).toBe(true);
  });

  it("covers core architecture domains", () => {
    expect(entriesForDomain("room-architecture").length).toBeGreaterThanOrEqual(2);
    expect(entriesForDomain("universal-creation").length).toBeGreaterThanOrEqual(2);
    expect(entriesForDomain("completion-system").length).toBeGreaterThanOrEqual(1);
    expect(entriesForDomain("card-system").length).toBeGreaterThanOrEqual(2);
    expect(SPARK_ESTATE_ARCHITECTURE_ENTRIES.length).toBeGreaterThanOrEqual(15);
  });

  it("formats a readable architecture report", () => {
    const report = formatSparkEstateArchitectureReport();
    expect(report).toContain(SPARK_ESTATE_ECOSYSTEM_VISION);
    expect(report).toContain("Integration checks");
    expect(report).toContain("Recommended order");
  });
});
