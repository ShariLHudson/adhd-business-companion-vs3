/**
 * 102 — Universal Blueprint Interface certification tests.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  applyKnownContextReuseDecision,
  browseCompatibleBlueprints,
  buildBlueprintInterfaceSession,
  buildMemberBlueprintPreview,
  defaultRecommendedBlueprintIds,
  listCompatiblePreviousWork,
  previewDepthChange,
  proposeKnownContextReuse,
  resolveBrowserBlueprint,
  resolveCompanyBlueprintAuth,
  startFromBlueprintPath,
  startFromPreviousWorkPath,
} from "@/lib/universalBlueprintInterface";
import {
  ALL_BLUEPRINT_DEPTH_MODES,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  ensureEventBlueprintsRegistered,
  EVENT_PLAN_BLUEPRINT_IDS,
  getWorkBlueprintState,
  initializeWorkFromBlueprint,
  listBlueprints,
  prepareSaveAsBlueprint,
  confirmSaveAsBlueprint,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  UnknownBlueprintError,
} from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("102 Universal Blueprint Interface", () => {
  beforeEach(() => {
    clearBlueprintRegistryForTests();
    resetWorkBlueprintStateForTests();
    resetWorkIdentityStoreForTests();
    ensureEventBlueprintsRegistered();
  });

  it("browser uses the universal registry and Event Blueprints", () => {
    const items = browseCompatibleBlueprints({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      source: "spark",
    });
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const id of EVENT_PLAN_BLUEPRINT_IDS) {
      expect(items.some((i) => i.blueprintId === id)).toBe(true);
    }
    expect(listBlueprints({ workTypeId: EVENT_PLAN_WORK_TYPE_ID }).length).toBe(
      items.length,
    );
  });

  it("excludes incompatible Blueprints and fails unknown IDs visibly", () => {
    const items = browseCompatibleBlueprints({
      workTypeId: "not_a_real_work_type",
    });
    expect(items).toEqual([]);
    expect(() =>
      resolveBrowserBlueprint("bp-does-not-exist", EVENT_PLAN_WORK_TYPE_ID),
    ).toThrow(UnknownBlueprintError);
  });

  it("preview reflects registry data in plain language", () => {
    const preview = buildMemberBlueprintPreview("bp-event-business-luncheon");
    expect(preview.title).toBe("Business Luncheon");
    expect(preview.helpsCreate.length).toBeGreaterThan(10);
    expect(preview.majorSections.length).toBeGreaterThan(3);
    expect(preview.availableDepthModes).toEqual(
      expect.arrayContaining([...ALL_BLUEPRINT_DEPTH_MODES]),
    );
    expect(JSON.stringify(preview)).not.toMatch(/hidden_system/);
  });

  it("all three start paths work without duplicating Work on depth change", () => {
    // Path: Start From Blueprint
    const fromBp = startFromBlueprintPath({
      blueprintId: "bp-event-business-luncheon",
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      depthMode: "quick_start",
      knownContext: {
        business_name: "Harbor Studio",
        audience: "Local owners",
      },
      reuseDecision: {
        approvedKeys: ["business_name"],
        declinedKeys: ["audience"],
        editedValues: {},
      },
    });
    expect(fromBp.state.knownContext.business_name).toBe("Harbor Studio");
    expect(fromBp.state.knownContext.audience).toBeUndefined();

    const guided = changeBlueprintDepthMode(fromBp.state.workId, "guided_build");
    const complete = changeBlueprintDepthMode(
      fromBp.state.workId,
      "complete_planning",
    );
    expect(guided.workId).toBe(fromBp.state.workId);
    expect(complete.workId).toBe(fromBp.state.workId);

    const depthPreview = previewDepthChange(fromBp.state.workId, "quick_start");
    expect(depthPreview.preservesWorkId).toBe(true);
    expect(depthPreview.erasesUserContent).toBe(false);

    // Seed previous work for path 3
    const source = initializeWorkFromBlueprint({
      blueprintId: "bp-event-online-workshop",
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      depthMode: "guided_build",
      knownContext: { purpose: "Teach clarity" },
    });
    expect(source.sectionContent.purpose).toBe("Teach clarity");

    const previous = listCompatiblePreviousWork(EVENT_PLAN_WORK_TYPE_ID);
    expect(previous.length).toBeGreaterThan(0);

    const fromPrev = startFromPreviousWorkPath({
      sourceWorkId: source.workId,
      targetWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      blueprintId: source.blueprintId,
      approvedSectionIds: ["purpose"],
    });
    expect(fromPrev.state.workId).not.toBe(source.workId);
    expect(fromPrev.state.provenance.kind).toBe("previous_work");
    expect(getWorkBlueprintState(source.workId)?.sectionContent.purpose).toBe(
      "Teach clarity",
    );
  });

  it("known-context reuse requires approval; declined values are not applied", () => {
    const proposals = proposeKnownContextReuse({
      blueprintId: "bp-event-book-signing",
      knownContext: {
        business_name: "Page & Pine",
        private_token: "secret-123",
      },
      inferredKeys: ["business_name"],
    });
    expect(proposals.some((p) => p.key === "business_name" && p.inferred)).toBe(
      true,
    );

    const applied = applyKnownContextReuseDecision(proposals, {
      approvedKeys: ["business_name"],
      declinedKeys: ["private_token"],
      editedValues: { business_name: "Page & Pine Books" },
    });
    expect(applied.business_name).toBe("Page & Pine Books");
    expect(applied.private_token).toBeUndefined();
  });

  it("Save as Personal requires review confirmation; Company enforces scope", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-three-day-retreat",
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    const review = prepareSaveAsBlueprint({
      workId: state.workId,
      category: "personal",
      title: "My Retreat Pattern",
    });
    const saved = confirmSaveAsBlueprint({
      workId: state.workId,
      review,
      confirm: true,
    });
    expect(saved.category).toBe("personal");
    expect(saved.blueprintId).not.toBe(state.workId);
    expect(getWorkBlueprintState(state.workId)?.workId).toBe(state.workId);

    const denied = resolveCompanyBlueprintAuth({});
    expect(denied.canSaveCompanyBlueprints).toBe(false);

    const allowed = resolveCompanyBlueprintAuth({
      companyId: "co_demo",
      role: "owner",
    });
    expect(allowed.canSaveCompanyBlueprints).toBe(true);
  });

  it("session continuity records resume location without minting IDs", () => {
    const state = initializeWorkFromBlueprint({
      blueprintId: "bp-event-one-day-workshop",
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
    });
    const session = buildBlueprintInterfaceSession({
      workId: state.workId,
      workTypeId: state.workTypeId,
      blueprintId: state.blueprintId,
      depthMode: state.depthMode,
      currentSectionId: "purpose",
      startPath: "start_from_blueprint",
    });
    expect(session.workId).toBe(state.workId);
    expect(session.currentSectionId).toBe("purpose");
  });

  it("recommended defaults come from registry Spark Blueprints", () => {
    const ids = defaultRecommendedBlueprintIds(EVENT_PLAN_WORK_TYPE_ID);
    expect(ids.length).toBeGreaterThan(0);
    expect(
      ids.every((id) =>
        (EVENT_PLAN_BLUEPRINT_IDS as readonly string[]).includes(id),
      ),
    ).toBe(true);
  });

  it("UI and interface packages do not import durable repositories", () => {
    const files = [
      "lib/universalBlueprintInterface/browseBlueprints.ts",
      "lib/universalBlueprintInterface/startFromPaths.ts",
      "lib/universalBlueprintInterface/knownContextReuse.ts",
      "components/companion/universalBlueprint/UniversalBlueprintInterface.tsx",
      "components/companion/universalBlueprint/SaveAsBlueprintReviewPanel.tsx",
    ];
    for (const rel of files) {
      const src = readFileSync(resolve(process.cwd(), rel), "utf8");
      expect(src).not.toMatch(/from ["']@\/lib\/creationDurable/);
      expect(src).not.toMatch(/from ["']@\/lib\/supabase/);
      expect(src).not.toMatch(/createClient\(/);
      expect(src).not.toMatch(/ALLOCATE_CANONICAL|allocateCanonicalWorkId/);
    }
  });

  it("Create entrance wires companion-led Customize (no Start Method)", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateEntrancePanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("UniversalBlueprintInterface");
    expect(panel).toContain("create-estate-advanced");
    expect(panel).toContain("companionLed");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).not.toContain("create-estate-blueprint-paths");
    expect(panel).not.toContain("Start with a Blueprint");
  });
});
