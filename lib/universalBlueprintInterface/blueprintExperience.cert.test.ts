/**
 * 106 — Blueprint Experience Completion certification (models + contracts).
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  ensureMarketingPlanBlueprintsRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  getBlueprint,
  initializeWorkFromBlueprint,
  linkWorkRelationship,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  restoreBlueprintSection,
  setBlueprintSectionRole,
  softDeleteBlueprintSection,
  MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
} from "@/lib/universalWorkEngine";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import {
  BLUEPRINT_LINK_MODE_EXPLANATIONS,
  buildBlueprintCommandCenter,
  buildRelationshipExplorer,
  listEstateAwarenessHooks,
  proposeExternalLink,
  resolveBlueprintCapabilityManifest,
} from "@/lib/universalBlueprintInterface";

describe("106 Blueprint Experience Completion", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkBlueprintStateForTests();
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
    ensureMarketingPlanWorkTypeRegistered();
    ensureMarketingPlanBlueprintsRegistered();
  });

  it("capability manifest reads Work Type flags (not hard-coded Work Type UI rules)", () => {
    const manifest = resolveBlueprintCapabilityManifest(
      MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
    );
    expect(manifest.workTypeId).toBe(MARKETING_PLAN_WORK_TYPE_ID);
    expect(manifest.capabilities.builderMode).toBe(true);
    expect(manifest.capabilities.tasks).toBe(true);
    expect(manifest.capabilities.chamberReview).toBe(true);
    expect(manifest.capabilities.groupedSections).toBe(true);
    expect(manifest.labels.calendar).toMatch(/Calendar/i);
  });

  it("command center stays lightweight with one next step", () => {
    const cc = buildBlueprintCommandCenter(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID);
    expect(cc.purpose.length).toBeGreaterThan(0);
    expect(cc.nextHelpfulStep.length).toBeGreaterThan(0);
    expect(cc.suggestedImprovement.length).toBeGreaterThan(0);
    expect(cc.recentChanges.length).toBeGreaterThan(0);
  });

  it("relationship explorer groups Works and Projects without duplicate identities", () => {
    const work = initializeWorkFromBlueprint({
      blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
      workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
      origin: "blueprints",
    });
    linkWorkRelationship({
      fromWorkId: work.workId,
      toRef: { kind: "project", id: "proj-106" },
      relationship: "supports",
      note: "Launch project",
    });
    const explorer = buildRelationshipExplorer(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID);
    expect(explorer.buckets.works.some((i) => i.navigateHint.id === work.workId)).toBe(
      true,
    );
    expect(explorer.buckets.projects[0]?.navigateHint.id).toBe("proj-106");
  });

  it("calendar/visual link proposals require approval and explain modes", () => {
    expect(BLUEPRINT_LINK_MODE_EXPLANATIONS.linked).toMatch(/Linked/i);
    expect(BLUEPRINT_LINK_MODE_EXPLANATIONS.copied).toMatch(/Copied/i);
    expect(BLUEPRINT_LINK_MODE_EXPLANATIONS.snapshot).toMatch(/Snapshot/i);
    const pending = proposeExternalLink({
      kind: "calendar",
      mode: "linked",
      targetId: "cal-1",
      title: "Work session",
    });
    expect(pending.awaitingApproval).toBe(true);
    expect(pending.explanation).toMatch(/Linked/i);
  });

  it("estate awareness hooks mark recognition live and Round Table/Chamber as contracts", () => {
    const hooks = listEstateAwarenessHooks();
    expect(hooks.length).toBe(8);
    expect(hooks.map((h) => h.surfaceId)).toContain("evidence_vault");
    expect(
      hooks.find((h) => h.surfaceId === "business_pulse")?.implementedHere,
    ).toBe(true);
    expect(
      hooks.find((h) => h.surfaceId === "round_table")?.implementedHere,
    ).toBe(false);
    expect(
      hooks.find((h) => h.surfaceId === "chamber_members")?.implementedHere,
    ).toBe(false);
  });

  it("builder restore and required/optional preserve stable section ids", () => {
    const sectionId = "people_to_reach";
    softDeleteBlueprintSection(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID, sectionId, {
      asNewVersion: false,
    });
    restoreBlueprintSection(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID, sectionId, {
      asNewVersion: false,
    });
    setBlueprintSectionRole(
      MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
      sectionId,
      "optional",
      { asNewVersion: false },
    );
    const bp = getBlueprint(MARKETING_PLAN_SIMPLE_BLUEPRINT_ID)!;
    const section = bp.sections.find((s) => s.id === sectionId)!;
    expect(section.id).toBe(sectionId);
    expect(section.softDeleted).toBeFalsy();
    expect(section.role).toBe("optional");
  });
});
