import { describe, expect, it } from "vitest";

import {
  assessSparkEstateRoomBlueprintCompliance,
  buildSparkEstateRoomBlueprintDraft,
  formatSparkEstateRoomBlueprintReport,
  getSparkEstateRoomBlueprint,
  listSparkEstateRoomBlueprints,
  SPARK_ESTATE_ROOM_BLUEPRINT_PRINCIPLE,
  SPARK_ESTATE_ROOM_BLUEPRINT_SECTIONS,
  SPARK_ESTATE_ROOM_BLUEPRINT_VISION,
  SPARK_ESTATE_ROOM_QUALITY_CHECKLIST,
  SPARK_ESTATE_ROOM_WORKFLOW_STEPS,
  validateSparkEstateRoomBlueprint,
  verifySparkEstateRoomBlueprintTemplate,
} from "./sparkEstateRoomBlueprintTemplate";
import { getEstateRoomById } from "./estateRoomRegistry";

describe("sparkEstateRoomBlueprintTemplate", () => {
  it("defines ten blueprint sections and the universal room workflow", () => {
    const verification = verifySparkEstateRoomBlueprintTemplate();
    expect(SPARK_ESTATE_ROOM_BLUEPRINT_SECTIONS).toHaveLength(10);
    expect(SPARK_ESTATE_ROOM_WORKFLOW_STEPS).toHaveLength(8);
    expect(SPARK_ESTATE_ROOM_QUALITY_CHECKLIST).toHaveLength(10);
    expect(SPARK_ESTATE_ROOM_BLUEPRINT_PRINCIPLE).toContain("not just a screen");
    expect(SPARK_ESTATE_ROOM_BLUEPRINT_VISION).toContain("Same trusted companion");
    expect(verification.sections).toBe(10);
    expect(verification.workflowSteps).toBe(8);
    expect(verification.creationJourneyAligned).toBe(true);
    expect(verification.allBlueprintsValid).toBe(true);
  });

  it("registers blueprints for core demo rooms", () => {
    expect(listSparkEstateRoomBlueprints().length).toBeGreaterThanOrEqual(5);
    const chamber = getSparkEstateRoomBlueprint("momentum-institute");
    expect(chamber?.memberFacingName).toContain("Chamber of Momentum");
    expect(chamber?.cards.some((card) => card.kind === "knowledge-card")).toBe(true);

    const create = getSparkEstateRoomBlueprint("creative-studio");
    expect(create?.primarySection).toBe("content-generator");
    expect(create?.outputs).toContain("content");

    const compass = getSparkEstateRoomBlueprint("decision-compass");
    expect(compass?.doesNotDo.some((line) => /decision for the member/i.test(line))).toBe(
      true,
    );
  });

  it("validates blueprint completeness", () => {
    const blueprint = getSparkEstateRoomBlueprint("momentum-builder");
    expect(blueprint).not.toBeNull();
    const result = validateSparkEstateRoomBlueprint(blueprint!);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("assesses registry alignment for demo rooms", () => {
    const assessment = assessSparkEstateRoomBlueprintCompliance("decision-compass");
    expect(assessment.hasBlueprint).toBe(true);
    expect(assessment.registryAligned).toBe(true);
    expect(assessment.navigationAligned).toBe(true);
    expect(assessment.templateAligned).toBe(true);
  });

  it("builds a draft blueprint from estate registry entries", () => {
    const room = getEstateRoomById("observatory");
    expect(room).not.toBeNull();
    const draft = buildSparkEstateRoomBlueprintDraft(room!);
    expect(draft.roomId).toBe("observatory");
    expect(draft.purpose).toBe(room!.purpose);
    expect(validateSparkEstateRoomBlueprint(draft).valid).toBe(true);
  });

  it("formats a readable room blueprint report", () => {
    const report = formatSparkEstateRoomBlueprintReport();
    expect(report).toContain("Blueprint sections");
    expect(report).toContain("Quality checklist");
    expect(report).toContain("Registered room blueprints");
    expect(report).toContain("Integration checks");
  });
});
