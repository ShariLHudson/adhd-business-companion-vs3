/**
 * 099 — Blueprint Builder, grouped maps, structure, connections.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  addBlueprintGroup,
  addBlueprintSection,
  buildWorkshopMapGroups,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  DEFAULT_GROUP_MAP_THRESHOLD,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  EVENT_PLAN_MAP_GROUPS,
  initializeWorkFromBlueprint,
  linkWorkRelationship,
  listWorkRelationships,
  moveBlueprintSection,
  previewBlueprintStructureUpdate,
  registerBlueprint,
  requireBlueprint,
  resetBlueprintAuditForTests,
  resetStructureUndoForTests,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resolveWorkshopMapForWorkflow,
  saveStructureAsBlueprint,
  softDeleteBlueprintSection,
  undoBlueprintStructure,
  unlinkWorkRelationship,
  shouldUseGroupedMap,
} from "../index";
import { ALL_BLUEPRINT_DEPTH_MODES } from "./types";
import type { BlueprintDefinition } from "./types";

function minimalBlueprint(
  overrides: Partial<BlueprintDefinition> = {},
): BlueprintDefinition {
  return {
    blueprintId: "bp-test-structure",
    version: "1.0.0",
    category: "personal",
    compatibleWorkTypeIds: ["event_plan"],
    title: "Test Structure",
    description: "test",
    intendedUse: "test",
    complexity: "simple",
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    sections: [
      { id: "a", title: "A", role: "required", groupId: "g1", order: 0 },
      { id: "b", title: "B", role: "required", groupId: "g1", order: 1 },
      { id: "c", title: "C", role: "optional", groupId: "g2", order: 2 },
    ],
    groups: [
      {
        groupId: "g1",
        title: "Group One",
        order: 0,
        sectionIds: ["a", "b"],
      },
      {
        groupId: "g2",
        title: "Group Two",
        order: 1,
        collapsedByDefault: true,
        sectionIds: ["c"],
      },
    ],
    adaptiveQuestions: [],
    suggestedTasks: [],
    suggestedMilestones: [],
    commonlyForgottenItems: [],
    riskPrompts: [],
    researchPrompts: [],
    deliverables: [],
    chamberRoutingRecommendations: [],
    boardReviewRecommendations: [],
    projectBridgeRecommendations: [],
    cartographyRelationshipRecommendations: [],
    completionCriteria: [],
    certificationRules: [],
    ...overrides,
  };
}

describe("099 Blueprint Builder foundation", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkBlueprintStateForTests();
    resetBlueprintAuditForTests();
    resetStructureUndoForTests();
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
  });

  it("long maps group; short maps stay flat", () => {
    expect(
      shouldUseGroupedMap(33, {
        threshold: DEFAULT_GROUP_MAP_THRESHOLD,
        groups: EVENT_PLAN_MAP_GROUPS,
      }),
    ).toBe(true);
    expect(
      shouldUseGroupedMap(5, {
        threshold: DEFAULT_GROUP_MAP_THRESHOLD,
        groups: EVENT_PLAN_MAP_GROUPS,
      }),
    ).toBe(false);

    const eventWf = {
      ...initializeWorkspaceV2Workflow("Event Plan"),
      sessionId: "work-event-map-1",
      creationWorkspaceKind: "event" as const,
      showAllWorkspaceSections: true,
    };
    const eventMap = resolveWorkshopMapForWorkflow(eventWf);
    expect(eventMap.mode).toBe("grouped");
    expect(eventMap.groups.length).toBeGreaterThanOrEqual(5);
    expect(eventMap.groups[0]?.title).toMatch(/foundation/i);

    const campaign = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-campaign-map-1",
    };
    const shortMap = resolveWorkshopMapForWorkflow(campaign);
    expect(shortMap.mode).toBe("flat");
  });

  it("collapsing groups does not change section content", () => {
    const sections = [
      { id: "a", label: "A", content: "keep me", skipped: false },
      { id: "b", label: "B", content: "", skipped: false },
    ];
    const built = buildWorkshopMapGroups({
      sections,
      groups: [
        {
          groupId: "g1",
          title: "G",
          order: 0,
          sectionIds: ["a", "b"],
        },
      ],
      threshold: 2,
    });
    expect(built.mode).toBe("grouped");
    expect(sections[0]!.content).toBe("keep me");
  });

  it("structure edit keeps stable ids; soft-delete + undo restore", () => {
    registerBlueprint(minimalBlueprint());
    const moved = moveBlueprintSection("bp-test-structure", "b", "up");
    expect(moved.groups?.[0]?.sectionIds).toEqual(["b", "a"]);
    const deleted = softDeleteBlueprintSection(
      "bp-test-structure",
      "c",
    );
    expect(deleted.sections.find((s) => s.id === "c")?.softDeleted).toBe(true);
    const undone = undoBlueprintStructure("bp-test-structure");
    expect(undone?.sections.find((s) => s.id === "c")?.softDeleted).not.toBe(
      true,
    );
  });

  it("add section and group without duplicating content", () => {
    registerBlueprint(minimalBlueprint());
    const withGroup = addBlueprintGroup("bp-test-structure", "Extras");
    const gId = withGroup.groups!.find((g) => g.title === "Extras")!.groupId;
    const withSec = addBlueprintSection("bp-test-structure", {
      title: "New piece",
      groupId: gId,
    });
    const added = withSec.sections.find((s) => s.title === "New piece");
    expect(added?.id).toBeTruthy();
    expect(withSec.defaultValues?.[added!.id] ?? "").toBe("");
  });

  it("save structure as blueprint and create Work with empty sections + version pin", () => {
    const wf = {
      ...initializeWorkspaceV2Workflow("Event Plan"),
      sessionId: "work-struct-save-1",
      creationWorkspaceKind: "event" as const,
    };
    const saved = saveStructureAsBlueprint({
      workflow: wf,
      name: "My Event Shell",
      description: "Reusable",
      category: "personal",
      workId: wf.sessionId,
    });
    expect(saved.groups?.length).toBeGreaterThan(0);
    const work = initializeWorkFromBlueprint({
      blueprintId: saved.blueprintId,
      workTypeId: "event_plan",
      depthMode: "quick_start",
    });
    expect(work.workId).not.toBe(wf.sessionId);
    expect(work.blueprintVersion).toBe(saved.version);
    for (const value of Object.values(work.sectionContent)) {
      expect(value).toBe("");
    }
  });

  it("future blueprint version does not mutate existing Work content", () => {
    registerBlueprint(minimalBlueprint());
    const work = initializeWorkFromBlueprint({
      blueprintId: "bp-test-structure",
      workTypeId: "event_plan",
    });
    work.sectionContent.a = "Member text";
    addBlueprintSection("bp-test-structure", { title: "Later section" });
    const latest = requireBlueprint("bp-test-structure");
    expect(latest.version).not.toBe("1.0.0");
    expect(work.blueprintVersion).toBe("1.0.0");
    expect(work.sectionContent.a).toBe("Member text");
    const preview = previewBlueprintStructureUpdate(
      "bp-test-structure",
      "1.0.0",
    );
    expect(preview.addedSectionIds.length).toBeGreaterThan(0);
  });

  it("relationships link/unlink without deleting targets; dedupe", () => {
    const a = linkWorkRelationship({
      fromWorkId: "work-rel-1",
      sourceEntityType: "section",
      sourceEntityId: "purpose",
      toRef: { kind: "project", id: "proj-1" },
      relationship: "related_to",
    });
    const b = linkWorkRelationship({
      fromWorkId: "work-rel-1",
      sourceEntityType: "section",
      sourceEntityId: "purpose",
      toRef: { kind: "project", id: "proj-1" },
      relationship: "related_to",
    });
    expect(b.id).toBe(a.id);
    linkWorkRelationship({
      fromWorkId: "work-rel-1",
      sourceEntityType: "section",
      sourceEntityId: "purpose",
      toRef: { kind: "calendar-event", id: "cal-1" },
      relationship: "related_to",
    });
    expect(listWorkRelationships("work-rel-1").length).toBe(2);
    expect(unlinkWorkRelationship(a.id)).toBe(true);
    expect(
      listWorkRelationships("work-rel-1", { targetKind: "project" }),
    ).toHaveLength(0);
    expect(
      listWorkRelationships("work-rel-1", { targetKind: "calendar-event" }),
    ).toHaveLength(1);
  });

  it("Event Spark Blueprints carry groups via universal registry", () => {
    const lunch = requireBlueprint("bp-event-business-luncheon");
    expect(lunch.groups?.length).toBeGreaterThan(0);
    expect(lunch.groups!.some((g) => g.groupId === "foundation")).toBe(true);
  });
});
