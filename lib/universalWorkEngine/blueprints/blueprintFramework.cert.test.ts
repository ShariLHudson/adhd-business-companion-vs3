/**
 * Universal Blueprint Framework — certification suite.
 * @vitest-environment node
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  EVENT_PLAN_BLUEPRINT_IDS,
  IncompatibleBlueprintError,
  UnknownBlueprintError,
  answerBlueprintQuestion,
  buildWorkFromPreviousWork,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  confirmSaveAsBlueprint,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  evaluateAdaptiveQuestion,
  getBlueprint,
  getWorkBlueprintState,
  initializeWorkFromBlueprint,
  isBlueprintRegistered,
  listBlueprints,
  listWorkBlueprintStates,
  listWorkRelationships,
  mergeKnownContext,
  prepareSaveAsBlueprint,
  provenanceForWork,
  recoverSkippedQuestion,
  registerBlueprint,
  registerWorkTypePackage,
  requireBlueprint,
  resetBlueprintAuditForTests,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resolveActiveSections,
  skipBlueprintQuestion,
  upgradeWorkBlueprint,
  updateWorkSectionFromBlueprintState,
} from "../index";
import { EVENT_PLAN_BLUEPRINT_DEFINITIONS } from "../packages/eventPlan/eventBlueprintDefinitions";

const ROOT = process.cwd();

function walkTsFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
      out.push(full);
  }
  return out;
}

describe("Universal Blueprint Framework — certification", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkBlueprintStateForTests();
    resetBlueprintAuditForTests();
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
  });

  it("Event Blueprints use the universal registry (eleven Spark Event BPs)", () => {
    expect(EVENT_PLAN_BLUEPRINT_IDS).toHaveLength(12);
    expect(EVENT_PLAN_BLUEPRINT_DEFINITIONS).toHaveLength(12);
    for (const id of EVENT_PLAN_BLUEPRINT_IDS) {
      expect(isBlueprintRegistered(id)).toBe(true);
      const bp = requireBlueprint(id);
      expect(bp.compatibleWorkTypeIds).toContain("event_plan");
      expect(bp.category).toBe("spark");
    }
    const eventBps = listBlueprints({ workTypeId: "event_plan" });
    expect(eventBps.map((b) => b.blueprintId).sort()).toEqual(
      [...EVENT_PLAN_BLUEPRINT_IDS].sort(),
    );
  });

  it("Blueprints cannot initialize incompatible Work Types", () => {
    registerWorkTypePackage({
      workTypeId: "sop",
      version: "0.0.1",
      displayName: "SOP",
      creationExperienceId: "create",
      blueprintIds: [],
      lifecycle: { usesUniversalSectionLifecycle: true },
      sections: [{ id: "purpose", title: "Purpose" }],
      capabilities: {
        tasks: false,
        milestones: false,
        research: false,
        chamberRouting: false,
        boardReview: false,
        cartography: false,
        projectBridge: false,
        print: false,
        export: false,
      },
    });
    expect(() =>
      initializeWorkFromBlueprint({
        blueprintId: "bp-event-book-signing",
        workTypeId: "sop",
      }),
    ).toThrow(IncompatibleBlueprintError);
  });

  it("Quick Start, Guided Build, and Complete Planning share the same Work ID", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-online-workshop",
      workTypeId: "event_plan",
      depthMode: "quick_start",
    });
    const workId = state.workId;
    const guided = changeBlueprintDepthMode(workId, "guided_build");
    const complete = changeBlueprintDepthMode(workId, "complete_planning");
    expect(guided.workId).toBe(workId);
    expect(complete.workId).toBe(workId);
    expect(complete.depthMode).toBe("complete_planning");
  });

  it("changing depth does not duplicate work", () => {
    const a = initializeWorkFromBlueprint({
      blueprintId: "bp-event-business-luncheon",
      workTypeId: "event_plan",
      depthMode: "quick_start",
    });
    updateWorkSectionFromBlueprintState(
      a.workId,
      "purpose",
      "Client thank-you lunch",
    );
    changeBlueprintDepthMode(a.workId, "complete_planning");
    changeBlueprintDepthMode(a.workId, "guided_build");
    const all = listWorkBlueprintStates().filter((s) => s.workId === a.workId);
    expect(all).toHaveLength(1);
    expect(all[0]!.sectionContent.purpose).toBe("Client thank-you lunch");
  });

  it("known information is reused correctly (skip_known)", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-book-signing",
      workTypeId: "event_plan",
      knownContext: {
        book_title: "The Porch Conversations",
        purpose: "Launch signing",
      },
    });
    const bp = requireBlueprint("bp-event-book-signing");
    const q = bp.adaptiveQuestions.find((x) => x.id === "q_title")!;
    const decision = evaluateAdaptiveQuestion(state, q);
    expect(decision.action).toBe("skip_known");
    if (decision.action === "skip_known") {
      expect(decision.knownValue.length).toBeGreaterThan(0);
    }
  });

  it("skipped questions remain recoverable", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-online-workshop",
      workTypeId: "event_plan",
      depthMode: "guided_build",
    });
    skipBlueprintQuestion(state.workId, "q_record");
    expect(getWorkBlueprintState(state.workId)!.skippedQuestionIds).toContain(
      "q_record",
    );
    recoverSkippedQuestion(state.workId, "q_record");
    expect(
      getWorkBlueprintState(state.workId)!.skippedQuestionIds,
    ).not.toContain("q_record");
  });

  it("conditional sections appear only when triggered", () => {
    const bp = requireBlueprint("bp-event-business-luncheon");
    const hidden = resolveActiveSections(
      bp.sections,
      {
        knownContext: {},
        answeredQuestions: {},
        depthMode: "complete_planning",
      },
      "complete_planning",
    );
    expect(hidden.activeConditionalSectionIds).not.toContain("sponsors");

    const shown = resolveActiveSections(
      bp.sections,
      {
        knownContext: { has_sponsors: "yes" },
        answeredQuestions: {},
        depthMode: "complete_planning",
      },
      "complete_planning",
    );
    expect(shown.activeConditionalSectionIds).toContain("sponsors");
    expect(shown.visibleSectionIds).toContain("sponsors");
  });

  it("Blueprint upgrades preserve user work", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-book-signing",
      workTypeId: "event_plan",
    });
    updateWorkSectionFromBlueprintState(
      state.workId,
      "purpose",
      "Member-written purpose — keep me",
    );
    const base = requireBlueprint("bp-event-book-signing");
    registerBlueprint({
      ...base,
      version: "1.1.0",
      defaultValues: {
        ...base.defaultValues,
        purpose: "Blueprint default that must not clobber",
        venue: "Default Venue Hall",
      },
    });
    const upgraded = upgradeWorkBlueprint(state.workId, "1.1.0");
    expect(upgraded.blueprintVersion).toBe("1.1.0");
    expect(upgraded.sectionContent.purpose).toBe(
      "Member-written purpose — keep me",
    );
    expect(upgraded.pendingOverwriteApprovals?.purpose).toBe(
      "Blueprint default that must not clobber",
    );
  });

  it("save-as-Blueprint removes instance-specific information", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-business-luncheon",
      workTypeId: "event_plan",
    });
    updateWorkSectionFromBlueprintState(
      state.workId,
      "dates",
      "July 21, 2026 at 12:00pm with host Jane Client jane@example.com",
    );
    updateWorkSectionFromBlueprintState(
      state.workId,
      "purpose",
      "Lunch for Acme Corp — completed",
    );
    const review = prepareSaveAsBlueprint({
      workId: state.workId,
      category: "personal",
      title: "My Luncheon Pattern",
      confidentialTokens: ["Acme Corp", "Jane Client"],
    });
    expect(review.sanitizedSectionDefaults.dates).not.toMatch(/2026|jane@/i);
    expect(review.removedFields.length).toBeGreaterThan(0);
    const saved = confirmSaveAsBlueprint({
      workId: state.workId,
      review,
      confirm: true,
    });
    expect(saved.category).toBe("personal");
    expect(saved.blueprintId).not.toBe(state.workId);
    expect(getBlueprint(state.blueprintId)?.blueprintId).toBe(
      "bp-event-business-luncheon",
    );
    expect(getWorkBlueprintState(state.workId)!.blueprintId).toBe(
      "bp-event-business-luncheon",
    );
  });

  it("build-from-previous-work records provenance", () => {
    const source = initializeWorkFromBlueprint({
      blueprintId: "bp-event-one-day-workshop",
      workTypeId: "event_plan",
    });
    updateWorkSectionFromBlueprintState(
      source.workId,
      "purpose",
      "Reusable purpose",
    );
    updateWorkSectionFromBlueprintState(
      source.workId,
      "agenda",
      "Reusable agenda",
    );
    const next = buildWorkFromPreviousWork({
      sourceWorkId: source.workId,
      targetWorkTypeId: "event_plan",
      blueprintId: "bp-event-one-day-workshop",
      approvedSectionIds: ["purpose"],
    });
    expect(next.workId).not.toBe(source.workId);
    expect(next.sectionContent.purpose).toBe("Reusable purpose");
    expect(next.sectionContent.agenda).not.toBe("Reusable agenda");
    const prov = provenanceForWork(next.workId);
    expect(prov?.kind).toBe("previous_work");
    if (prov?.kind === "previous_work") {
      expect(prov.sourceWorkId).toBe(source.workId);
      expect(prov.reusedSectionIds).toContain("purpose");
    }
    const rels = listWorkRelationships(next.workId);
    expect(
      rels.some(
        (r) =>
          r.relationship === "reused_from" &&
          r.toRef.kind === "work" &&
          r.toRef.id === source.workId,
      ),
    ).toBe(true);
  });

  it("unknown Blueprint IDs fail safely", () => {
    expect(() => requireBlueprint("bp-does-not-exist")).toThrow(
      UnknownBlueprintError,
    );
    expect(() =>
      initializeWorkFromBlueprint({
        blueprintId: "bp-does-not-exist",
        workTypeId: "event_plan",
      }),
    ).toThrow(UnknownBlueprintError);
  });

  it("no Work Type owns a private Blueprint registry", () => {
    const packageFiles = walkTsFiles(
      join(ROOT, "lib/universalWorkEngine/packages"),
    );
    for (const file of packageFiles) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/privateBlueprintRegistry/);
      expect(src).not.toMatch(/const\s+BLUEPRINTS\s*=\s*\[/);
      expect(src).not.toMatch(/byIdVersion/);
    }
    const reg = readFileSync(
      join(
        ROOT,
        "lib/universalWorkEngine/packages/eventPlan/registerEventBlueprints.ts",
      ),
      "utf8",
    );
    expect(reg).toMatch(/registerBlueprint/);
    expect(reg).not.toMatch(/allocateCanonicalWorkId/);
  });

  it("mergeKnownContext triggers conditional sections on live Work", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-three-day-retreat",
      workTypeId: "event_plan",
      depthMode: "complete_planning",
    });
    expect(state.activeConditionalSectionIds).not.toContain("volunteers");
    const updated = mergeKnownContext(state.workId, {
      needs_volunteers: "yes",
    });
    expect(updated.activeConditionalSectionIds).toContain("volunteers");
  });

  it("answering a question records known context for reuse", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-online-workshop",
      workTypeId: "event_plan",
      depthMode: "quick_start",
    });
    answerBlueprintQuestion(state.workId, "q_platform", "Zoom");
    const after = getWorkBlueprintState(state.workId)!;
    const q = requireBlueprint(
      "bp-event-online-workshop",
    ).adaptiveQuestions.find((x) => x.id === "q_platform")!;
    expect(evaluateAdaptiveQuestion(after, q).action).toBe("skip_known");
  });
});
