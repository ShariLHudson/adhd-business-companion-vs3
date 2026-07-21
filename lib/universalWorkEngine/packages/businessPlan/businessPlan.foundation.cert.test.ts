/**
 * 201–202 — Business Plan Work Type + Crafter Business Blueprints foundation.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  BUSINESS_PLAN_BLUEPRINT_IDS,
  CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  addWorkMilestone,
  addWorkTask,
  answerBlueprintQuestion,
  applyApprovedResearch,
  approveResearch,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  createResearchRecord,
  ensureBusinessPlanBlueprintsRegistered,
  ensureBusinessPlanWorkTypeRegistered,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  getBlueprint,
  getWorkBlueprintState,
  getWorkTypePackage,
  inferWorkTypeAndBlueprint,
  initializeWorkFromBlueprint,
  isBlueprintRegistered,
  isBusinessPlanCreationRequest,
  launchFromCreate,
  launchFromOrigin,
  linkWorkRelationship,
  listBlueprints,
  listWorkMilestones,
  listWorkRelationships,
  listWorkTasks,
  requireWorkTypePackage,
  resetBlueprintAuditForTests,
  resetResearchAttachmentsForTests,
  resetWorkArchiveForTests,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resetWorkTasksForTests,
  resolveActiveSections,
  submitResearchForReview,
} from "@/lib/universalWorkEngine";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/eventPlanMap";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";

const ROOT = process.cwd();
const PACKAGE_DIR = join(ROOT, "lib/universalWorkEngine/packages/businessPlan");

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
      out.push(full);
  }
  return out;
}

describe("201–202 — Business Plan Work Type foundation", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkBlueprintStateForTests();
    resetBlueprintAuditForTests();
    resetResearchAttachmentsForTests();
    resetWorkTasksForTests();
    resetWorkArchiveForTests();
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
    ensureMarketingPlanWorkTypeRegistered();
    ensureBusinessPlanWorkTypeRegistered();
    ensureBusinessPlanBlueprintsRegistered();
  });

  it("registers Business Plan Work Type with both crafter Blueprints", () => {
    const pkg = requireWorkTypePackage(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(pkg.displayName).toBe("Business Plan");
    expect(pkg.blueprintIds).toEqual(
      expect.arrayContaining([
        CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
        HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
      ]),
    );
    expect(BUSINESS_PLAN_BLUEPRINT_IDS).toHaveLength(2);
    expect(getWorkTypePackage(BUSINESS_PLAN_WORK_TYPE_ID)?.version).toBe("1.0.0");
  });

  it("registers both Blueprints on business_plan only", () => {
    for (const id of [
      CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
      HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
    ]) {
      expect(isBlueprintRegistered(id)).toBe(true);
      const bp = getBlueprint(id)!;
      expect(bp.compatibleWorkTypeIds).toEqual([BUSINESS_PLAN_WORK_TYPE_ID]);
      expect(bp.category).toBe("spark");
      expect(
        listBlueprints({ workTypeId: BUSINESS_PLAN_WORK_TYPE_ID }).some(
          (b) => b.blueprintId === id,
        ),
      ).toBe(true);
    }
  });

  it("package has no private runtime or durable store of its own", () => {
    const files = walkTsFiles(PACKAGE_DIR);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/createPrivateBusinessRuntime|businessPlanStore/);
      expect(src).not.toMatch(/localStorage\.setItem\(\s*["']business[_-]?plan/);
    }
  });

  it("craft show depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
      blueprintId: CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    changeBlueprintDepthMode(workId, "complete_planning");
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
    );
    const bp = getBlueprint(CRAFT_SHOW_BUSINESS_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      getWorkBlueprintState(workId)!,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("booth_design");
    expect(active).toContain("linked_event_work");
  });

  it("handmade store depth modes preserve one Work ID", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
      blueprintId: HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
      depthMode: "quick_start",
      origin: "create",
    });
    const workId = init.workId;
    changeBlueprintDepthMode(workId, "guided_build");
    expect(getWorkBlueprintState(workId)?.workId).toBe(workId);
    const bp = getBlueprint(HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID)!;
    const active = resolveActiveSections(
      bp.sections,
      getWorkBlueprintState(workId)!,
      "guided_build",
    ).visibleSectionIds;
    expect(active).toContain("marketplaces");
    expect(active).toContain("listings_seo");
  });

  it("tasks, milestones, research, and projects use universal infrastructure", () => {
    const init = initializeWorkFromBlueprint({
      workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
      blueprintId: CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
      depthMode: "guided_build",
      origin: "projects",
    });
    addWorkTask({
      workId: init.workId,
      title: "Build or update annual show calendar",
      sectionId: "annual_calendar",
    });
    addWorkMilestone({
      workId: init.workId,
      title: "Vision and products clear",
    });
    expect(listWorkTasks(init.workId).length).toBeGreaterThanOrEqual(1);
    expect(listWorkMilestones(init.workId).length).toBeGreaterThanOrEqual(1);

    const draft = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "show_discovery",
      },
      researchQuestion: "Which holiday markets fit ceramic makers?",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Indoor holiday markets with higher booth fees often convert better.",
    });
    submitResearchForReview(draft.id);
    expect(() => applyApprovedResearch(draft.id, ["change"])).toThrow();
    const approved = createResearchRecord({
      target: {
        kind: "section",
        workId: init.workId,
        sectionId: "pricing",
      },
      researchQuestion: "Pricing against booth fees",
      researchMode: "quick_check",
      originatingExperience: "create",
      findings: "Target 4x booth fee in projected weekend sales.",
      proposedActions: ["Set weekend sales target at 4x booth fee"],
    });
    submitResearchForReview(approved.id);
    approveResearch(approved.id);
    expect(
      applyApprovedResearch(approved.id, [
        "Set weekend sales target at 4x booth fee",
      ]).approvalStatus,
    ).toBe("applied");

    linkWorkRelationship({
      fromWorkId: init.workId,
      toRef: { kind: "project", id: "proj-maker-season" },
      relationship: "supports",
      note: "Maker season",
    });
    expect(
      listWorkRelationships(init.workId).some((r) => r.toRef.kind === "project"),
    ).toBe(true);
  });

  it("NL resolves craft show business and handmade store; Event and Marketing stay distinct", () => {
    expect(isBusinessPlanCreationRequest("Help me build a craft show business")).toBe(
      true,
    );
    expect(isBusinessPlanCreationRequest("Plan a craft show")).toBe(false);
    expect(isBusinessPlanCreationRequest("Write a business plan")).toBe(false);

    const craft = inferWorkTypeAndBlueprint({
      origin: "conversation",
      originalUserMessage: "Help me build a craft show business",
    });
    expect(craft.workTypeId).toBe(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(craft.blueprintId).toBe(CRAFT_SHOW_BUSINESS_BLUEPRINT_ID);

    const store = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a handmade online store",
    });
    expect(store.workTypeId).toBe(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(store.blueprintId).toBe(HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID);

    const marketing = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me make a marketing plan",
    });
    expect(marketing.workTypeId).toBe(MARKETING_PLAN_WORK_TYPE_ID);

    const workshop = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a workshop",
    });
    expect(workshop.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);

    const fromCreate = launchFromCreate({
      originalUserMessage: "Use the Craft Show Business Blueprint",
      candidateBlueprintId: CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
      candidateWorkTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(fromCreate.workId).toBeTruthy();
    expect(getWorkBlueprintState(fromCreate.workId!)?.blueprintId).toBe(
      CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
    );

    answerBlueprintQuestion(
      fromCreate.workId!,
      "q_vision",
      "A ceramic booth business that grows through holiday markets",
    );
    expect(
      getWorkBlueprintState(fromCreate.workId!)?.answeredQuestions.q_vision,
    ).toMatch(/ceramic/i);

    const chamber = launchFromOrigin("chamber", {
      originalUserMessage: "Ask Marketing Intelligence to review positioning",
      relatedWorkId: fromCreate.workId!,
      chamberMemberId: "marketing",
      applyApproved: true,
    });
    expect(chamber.workId ?? fromCreate.workId).toBe(fromCreate.workId);
  });

  it("Event and Marketing Work Types remain registered alongside Business Plan", () => {
    expect(isBlueprintRegistered("bp-event-business-luncheon")).toBe(true);
    expect(requireWorkTypePackage(EVENT_PLAN_WORK_TYPE_ID).workTypeId).toBe(
      EVENT_PLAN_WORK_TYPE_ID,
    );
    expect(requireWorkTypePackage(MARKETING_PLAN_WORK_TYPE_ID).workTypeId).toBe(
      MARKETING_PLAN_WORK_TYPE_ID,
    );
    expect(requireWorkTypePackage(BUSINESS_PLAN_WORK_TYPE_ID).workTypeId).toBe(
      BUSINESS_PLAN_WORK_TYPE_ID,
    );
  });
});
