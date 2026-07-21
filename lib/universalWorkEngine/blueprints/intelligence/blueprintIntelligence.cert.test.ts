/**
 * 100 Phase A — Spark Blueprint Intelligence foundation.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  assertHealthDoesNotMutate,
  buildSparkBlueprintHome,
  certifyBlueprint,
  clearBlueprintIntelligencePackagesForTests,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  evaluateBlueprintHealth,
  ensureEventBlueprintsRegistered,
  ensureEventBlueprintIntelligenceRegistered,
  ensureEventPlanWorkTypeRegistered,
  initializeWorkFromBlueprint,
  linkWorkRelationship,
  previewBlueprintImpact,
  publishBlueprintVersion,
  registerBlueprint,
  requireBlueprint,
  resetBlueprintAuditForTests,
  resetBlueprintProfilesForTests,
  resetBlueprintSuggestionDispositionsForTests,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  setBlueprintSuggestionDisposition,
  summarizeBlueprintUsage,
  ALL_BLUEPRINT_DEPTH_MODES,
} from "../../index";
import type { BlueprintDefinition } from "../types";

function sampleBlueprint(
  overrides: Partial<BlueprintDefinition> = {},
): BlueprintDefinition {
  return {
    blueprintId: "bp-intel-test",
    version: "1.0.0",
    category: "personal",
    compatibleWorkTypeIds: ["event_plan"],
    title: "Workshop Shell",
    description: "Reusable workshop structure",
    intendedUse: "Plan a workshop without starting from scratch",
    complexity: "moderate",
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        role: "required",
        required: true,
        outputHeading: "Purpose",
        starterPrompt: "Why this workshop?",
      },
      {
        id: "marketing",
        title: "Marketing",
        role: "optional",
        required: false,
      },
      {
        id: "agenda",
        title: "Agenda",
        role: "required",
        required: true,
        outputHeading: "Agenda",
      },
    ],
    groups: [
      {
        groupId: "foundation",
        title: "Foundation",
        order: 0,
        sectionIds: ["purpose"],
      },
      {
        groupId: "program",
        title: "Program",
        order: 1,
        sectionIds: ["agenda"],
      },
      {
        groupId: "promo",
        title: "Promotion",
        order: 2,
        sectionIds: ["marketing"],
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

describe("100 Spark Blueprint Intelligence Phase A", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkBlueprintStateForTests();
    resetBlueprintAuditForTests();
    resetBlueprintSuggestionDispositionsForTests();
    resetBlueprintProfilesForTests();
    clearBlueprintIntelligencePackagesForTests();
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintIntelligenceRegistered();
    ensureEventBlueprintsRegistered();
  });

  it("health identifies broad sections and does not mutate blueprint", () => {
    registerBlueprint(sampleBlueprint());
    const before = requireBlueprint("bp-intel-test");
    const snapshot = structuredClone(before);
    const health = evaluateBlueprintHealth(before);
    expect(health.summaryLine).toMatch(/good|attention|structure/i);
    expect(
      health.findings.some((f) => f.id === "broad-marketing"),
    ).toBe(true);
    const after = requireBlueprint("bp-intel-test");
    expect(assertHealthDoesNotMutate(snapshot, after)).toBe(true);
  });

  it("dismissed suggestions stay quiet until evidence changes", () => {
    registerBlueprint(sampleBlueprint());
    const bp = requireBlueprint("bp-intel-test");
    const health = evaluateBlueprintHealth(bp);
    const finding = health.findings.find((f) => f.id === "broad-marketing");
    expect(finding).toBeTruthy();
    setBlueprintSuggestionDisposition({
      blueprintId: "bp-intel-test",
      finding: finding!,
      status: "dismissed",
    });
    const again = evaluateBlueprintHealth(requireBlueprint("bp-intel-test"));
    expect(again.findings.some((f) => f.id === "broad-marketing")).toBe(false);
  });

  it("domain package suggests event follow-up when missing", () => {
    registerBlueprint(sampleBlueprint());
    const health = evaluateBlueprintHealth(requireBlueprint("bp-intel-test"));
    expect(
      health.findings.some((f) => f.id === "event-suggest-followup"),
    ).toBe(true);
  });

  it("usage counts real relationships and version pins", () => {
    registerBlueprint(sampleBlueprint());
    const work = initializeWorkFromBlueprint({
      blueprintId: "bp-intel-test",
      workTypeId: "event_plan",
    });
    linkWorkRelationship({
      fromWorkId: work.workId,
      toRef: { kind: "project", id: "proj-a" },
      relationship: "related_to",
    });
    linkWorkRelationship({
      fromWorkId: work.workId,
      sourceEntityType: "section",
      sourceEntityId: "purpose",
      toRef: { kind: "calendar-event", id: "cal-1" },
      relationship: "related_to",
    });
    const usage = summarizeBlueprintUsage("bp-intel-test");
    expect(usage.activeWorkCount).toBe(1);
    expect(usage.worksByVersion["1.0.0"]).toBe(1);
    expect(usage.linkedProjects).toBe(1);
    expect(usage.linkedCalendar).toBe(1);
  });

  it("impact preview explains existing works stay on prior version", () => {
    registerBlueprint(sampleBlueprint());
    initializeWorkFromBlueprint({
      blueprintId: "bp-intel-test",
      workTypeId: "event_plan",
    });
    const impact = previewBlueprintImpact({ blueprintId: "bp-intel-test" });
    expect(impact.activeWorksUsingBlueprint).toBe(1);
    expect(impact.memberMessage).toMatch(/remain/i);
  });

  it("registry rejects empty structure before certification", () => {
    expect(() =>
      registerBlueprint(
        sampleBlueprint({
          blueprintId: "bp-empty-bad",
          sections: [],
        }),
      ),
    ).toThrow(/sections/i);
  });

  it("certification ready_with_suggestions for advisory-only issues", () => {
    registerBlueprint(sampleBlueprint());
    const cert = certifyBlueprint("bp-intel-test");
    expect(cert.status).toBe("ready_with_suggestions");
    expect(cert.existingWorksProtected).toBe(true);
    expect(cert.canCreateWork).toBe(true);
  });

  it("certification not_ready when duplicate section ids", () => {
    registerBlueprint(
      sampleBlueprint({
        blueprintId: "bp-dup",
        sections: [
          { id: "a", title: "A", role: "required" },
          { id: "a", title: "A2", role: "required" },
        ],
      }),
    );
    const cert = certifyBlueprint("bp-dup");
    expect(cert.status).toBe("not_ready");
    expect(cert.blockers.length).toBeGreaterThan(0);
  });

  it("Blueprint Home composes primary view without dashboard noise", () => {
    registerBlueprint(sampleBlueprint());
    publishBlueprintVersion("bp-intel-test");
    const home = buildSparkBlueprintHome("bp-intel-test");
    expect(home.name).toBe("Workshop Shell");
    expect(home.currentVersion).toBe("1.0.0");
    expect(home.quietSummary.healthLabel).toBeTruthy();
    expect(home.certification.status).not.toBe("not_ready");
  });
});
