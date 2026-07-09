import { describe, expect, it } from "vitest";

import {
  assessSparkEstateGovernanceCompliance,
  evaluateSparkEstateNewFeatureProposal,
  formatSparkEstateSystemGovernanceReport,
  SPARK_ESTATE_CARD_GOVERNANCE_FIELDS,
  SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP,
  SPARK_ESTATE_GOVERNANCE_PILLARS,
  SPARK_ESTATE_GOVERNANCE_PRINCIPLE,
  SPARK_ESTATE_NEW_FEATURE_CHECKLIST,
  SPARK_ESTATE_QUALITY_REVIEW_DIMENSIONS,
  SPARK_ESTATE_ROOM_CREATION_REQUIREMENTS,
  SPARK_ESTATE_SOURCE_OF_TRUTH_OWNERS,
  verifySparkEstateSystemGovernanceAndQualityStandards,
} from "./sparkEstateSystemGovernanceAndQualityStandards";

describe("sparkEstateSystemGovernanceAndQualityStandards", () => {
  it("defines governance pillars and source-of-truth owners", () => {
    const verification = verifySparkEstateSystemGovernanceAndQualityStandards();
    expect(SPARK_ESTATE_GOVERNANCE_PILLARS).toHaveLength(5);
    expect(SPARK_ESTATE_SOURCE_OF_TRUTH_OWNERS.length).toBeGreaterThanOrEqual(8);
    expect(SPARK_ESTATE_GOVERNANCE_PRINCIPLE).toContain("one ecosystem");
    expect(verification.pillars).toBe(5);
    expect(verification.newFeatureChecklist).toBe(7);
    expect(verification.governanceReady).toBe(true);
  });

  it("maps duplicate intelligence to existing owners", () => {
    expect(SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP.some((e) => e.capability === "planning")).toBe(
      true,
    );
    expect(SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP.some((e) => e.capability === "learning")).toBe(
      true,
    );
    expect(SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP.some((e) => e.capability === "progress")).toBe(
      true,
    );
  });

  it("rejects proposals that duplicate existing capability owners", () => {
    const evaluation = evaluateSparkEstateNewFeatureProposal({
      problem: "Help members plan a launch timeline",
      audience: "Members preparing a launch",
      capability: "planning",
      proposedOwner: "New planning module",
      proposedLocation: "lib/planning/duplicatePlanner.ts",
      memoryImpact: "timeline preferences",
      completionPath: "save plan and connect to project",
    });
    expect(evaluation.approved).toBe(false);
    expect(evaluation.duplicateRisk).toContain("planning");
    expect(evaluation.recommendedOwner).toContain("Universal Creation Journey");
  });

  it("approves well-scoped proposals that extend existing owners", () => {
    const evaluation = evaluateSparkEstateNewFeatureProposal({
      problem: "Help members draft a welcome sequence for a new offer",
      audience: "Members launching a new service",
      capability: "email-sequence",
      proposedOwner: "Universal Creation Journey",
      proposedLocation: "lib/universalCreation/orchestrator.ts",
      memoryImpact: "saved email drafts and offer context",
      completionPath: "save to asset library and connect to project",
    });
    expect(evaluation.approved).toBe(true);
    expect(evaluation.issues).toHaveLength(0);
  });

  it("defines room, card, and quality governance requirements", () => {
    const compliance = assessSparkEstateGovernanceCompliance();
    expect(SPARK_ESTATE_ROOM_CREATION_REQUIREMENTS).toHaveLength(5);
    expect(SPARK_ESTATE_CARD_GOVERNANCE_FIELDS).toHaveLength(6);
    expect(SPARK_ESTATE_QUALITY_REVIEW_DIMENSIONS).toHaveLength(5);
    expect(compliance.sourceOfTruthReady).toBe(true);
    expect(compliance.cardGovernanceReady).toBe(true);
    expect(compliance.dataGovernanceReady).toBe(true);
  });

  it("formats a readable governance report", () => {
    const report = formatSparkEstateSystemGovernanceReport();
    expect(report).toContain("Source of truth owners");
    expect(report).toContain("New feature checklist");
    expect(report).toContain("Compliance checks");
    expect(report).toContain("Scalability rules");
  });
});
