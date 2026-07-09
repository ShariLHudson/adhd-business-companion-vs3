import { describe, expect, it } from "vitest";

import {
  formatSparkEstateFileAndDataArchitectureReport,
  getSparkEstateDataLayer,
  SPARK_ESTATE_DATA_LAYERS,
  SPARK_ESTATE_DATA_PRINCIPLE,
  SPARK_ESTATE_DATA_QUALITY_QUESTIONS,
  SPARK_ESTATE_EXPORT_SAVE_RULES,
  SPARK_ESTATE_FUNNEL_DATA_FLOW,
  SPARK_ESTATE_ROOM_DATA_RULES,
  verifySparkEstateFileAndDataArchitecture,
} from "./sparkEstateFileAndDataArchitectureMap";

describe("sparkEstateFileAndDataArchitectureMap", () => {
  it("defines ten data architecture layers with clear owners", () => {
    const verification = verifySparkEstateFileAndDataArchitecture();
    expect(SPARK_ESTATE_DATA_LAYERS).toHaveLength(10);
    expect(SPARK_ESTATE_DATA_PRINCIPLE).toBe("One source of truth.");
    expect(verification.layerCount).toBe(10);
    expect(verification.layersMapped).toBe(true);
    expect(getSparkEstateDataLayer("projects")?.primaryOwner).toContain(
      "Goals & Projects",
    );
  });

  it("keeps projects as the single owner with chamber memory as reference", () => {
    const projects = getSparkEstateDataLayer("projects");
    expect(projects?.references?.some((ref) => ref.includes("read-only"))).toBe(
      true,
    );
    expect(verifySparkEstateFileAndDataArchitecture().projectsHaveSingleOwner).toBe(
      true,
    );
  });

  it("documents temporary vs permanent data and room rules", () => {
    expect(SPARK_ESTATE_ROOM_DATA_RULES.length).toBeGreaterThanOrEqual(3);
    expect(SPARK_ESTATE_EXPORT_SAVE_RULES.length).toBeGreaterThanOrEqual(5);
    expect(SPARK_ESTATE_DATA_QUALITY_QUESTIONS).toHaveLength(4);
    expect(SPARK_ESTATE_FUNNEL_DATA_FLOW.length).toBeGreaterThanOrEqual(5);
  });

  it("verifies card sources and export rules align with estate systems", () => {
    const verification = verifySparkEstateFileAndDataArchitecture();
    expect(verification.cardSourcesAligned).toBe(true);
    expect(verification.exportRulesAligned).toBe(true);
    expect(verification.oneSourceOfTruth).toBe(true);
  });

  it("formats a readable architecture report", () => {
    const report = formatSparkEstateFileAndDataArchitectureReport();
    expect(report).toContain(SPARK_ESTATE_DATA_PRINCIPLE);
    expect(report).toContain("member creates a funnel");
    expect(report).toContain("Integration checks");
  });
});
