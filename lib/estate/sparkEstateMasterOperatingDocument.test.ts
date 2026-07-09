import { describe, expect, it } from "vitest";

import {
  assessSparkEstateMasterOperatingDocumentCompliance,
  evaluateSparkEstateOperatingAddition,
  formatSparkEstateMasterOperatingDocumentReport,
  SPARK_ESTATE_COMPANION_MODEL,
  SPARK_ESTATE_CORE_PROMISE,
  SPARK_ESTATE_GROWTH_RULES,
  SPARK_ESTATE_IDENTITY_CAPABILITIES,
  SPARK_ESTATE_MASTER_OPERATING_PURPOSE,
  SPARK_ESTATE_OPERATING_CREATION_JOURNEY,
  SPARK_ESTATE_OPERATING_INTELLIGENCE_LAYERS,
  SPARK_ESTATE_QUALITY_STANDARD,
  verifySparkEstateMasterOperatingDocument,
} from "./sparkEstateMasterOperatingDocument";

describe("sparkEstateMasterOperatingDocument", () => {
  it("defines identity, companion model, and core promise", () => {
    const verification = verifySparkEstateMasterOperatingDocument();
    expect(SPARK_ESTATE_IDENTITY_CAPABILITIES).toHaveLength(7);
    expect(SPARK_ESTATE_COMPANION_MODEL).toHaveLength(5);
    expect(SPARK_ESTATE_CORE_PROMISE.to).toContain("next step");
    expect(SPARK_ESTATE_MASTER_OPERATING_PURPOSE).toContain("vision");
    expect(verification.operatingDocumentReady).toBe(true);
    expect(verification.corePromiseReady).toBe(true);
  });

  it("maps operating intelligence layers and universal creation journey", () => {
    expect(SPARK_ESTATE_OPERATING_INTELLIGENCE_LAYERS).toHaveLength(6);
    expect(SPARK_ESTATE_OPERATING_CREATION_JOURNEY).toHaveLength(8);
    expect(SPARK_ESTATE_OPERATING_CREATION_JOURNEY[0]).toBe("understand");
    expect(SPARK_ESTATE_OPERATING_CREATION_JOURNEY.at(-1)).toBe("remember");
  });

  it("evaluates operating additions against the quality standard", () => {
    const evaluation = evaluateSparkEstateOperatingAddition({
      label: "Workshop launch momentum guidance",
      helpsMember: "Helps the member choose the next small step",
      fitsJourney: "Supports Create and Progress stages",
      soundsLikeSpark: "Warm and practical with one question at a time",
      reducesFriction: "Surfaces one next action instead of a full task list",
    });
    expect(evaluation.approved).toBe(true);
    expect(evaluation.checklist).toHaveLength(SPARK_ESTATE_QUALITY_STANDARD.length);
  });

  it("rejects additions that fail quality standard questions", () => {
    const evaluation = evaluateSparkEstateOperatingAddition({
      label: "New dashboard",
      helpsMember: "",
      fitsJourney: "Adds analytics widgets",
      soundsLikeSpark: "Corporate dashboard tone",
      reducesFriction: "Shows more metrics",
    });
    expect(evaluation.approved).toBe(false);
    expect(evaluation.issues.length).toBeGreaterThan(0);
  });

  it("aligns philosophies with estate subsystems", () => {
    const compliance = assessSparkEstateMasterOperatingDocumentCompliance();
    expect(compliance.creationJourneyReady).toBe(true);
    expect(compliance.intelligenceLayersReady).toBe(true);
    expect(compliance.governanceAligned).toBe(true);
    expect(compliance.productionReadinessMapped).toBe(true);
    expect(SPARK_ESTATE_GROWTH_RULES).toHaveLength(2);
  });

  it("formats a readable master operating document report", () => {
    const report = formatSparkEstateMasterOperatingDocumentReport();
    expect(report).toContain("Core promise");
    expect(report).toContain("Intelligence architecture");
    expect(report).toContain("Quality standard");
    expect(report).toContain("Compliance checks");
  });
});
