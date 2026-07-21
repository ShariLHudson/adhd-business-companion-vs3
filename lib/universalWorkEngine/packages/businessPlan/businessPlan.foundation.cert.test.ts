/**
 * 201–228 — Business Plan Work Type + Handmade / Service / Creator / Organizing / Retail Blueprints.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AUTHOR_BUSINESS_BLUEPRINT_ID,
  BUSINESS_PLAN_BLUEPRINT_IDS,
  COACHING_BUSINESS_BLUEPRINT_ID,
  CONSULTING_BUSINESS_BLUEPRINT_ID,
  CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
  ETSY_BUSINESS_BLUEPRINT_ID,
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
  PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
  PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
  RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
  RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
  SERVICE_BUSINESS_BLUEPRINT_ID,
  SPEAKER_BUSINESS_BLUEPRINT_ID,
  STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
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

describe("201–206 — Business Plan Work Type foundation", () => {
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

  it("registers Business Plan Work Type with twenty-three Business Blueprints", () => {
    const pkg = requireWorkTypePackage(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(pkg.displayName).toBe("Business Plan");
    expect(pkg.blueprintIds).toEqual(
      expect.arrayContaining([
        CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
        HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
        ETSY_BUSINESS_BLUEPRINT_ID,
        PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
        INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
        HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
        SPEAKER_BUSINESS_BLUEPRINT_ID,
        COACHING_BUSINESS_BLUEPRINT_ID,
        CONSULTING_BUSINESS_BLUEPRINT_ID,
        SERVICE_BUSINESS_BLUEPRINT_ID,
        AUTHOR_BUSINESS_BLUEPRINT_ID,
        COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
        MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
        CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
        PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
        PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
        DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
        OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
        STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
        RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
        RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
        RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
        RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
      ]),
    );
    expect(BUSINESS_PLAN_BLUEPRINT_IDS).toHaveLength(23);
    expect(getWorkTypePackage(BUSINESS_PLAN_WORK_TYPE_ID)?.version).toBe("1.0.0");
  });

  it("registers all Business Blueprints on business_plan only", () => {
    for (const id of [
      CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
      HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
      ETSY_BUSINESS_BLUEPRINT_ID,
      PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
      INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
      HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
      SPEAKER_BUSINESS_BLUEPRINT_ID,
      COACHING_BUSINESS_BLUEPRINT_ID,
      CONSULTING_BUSINESS_BLUEPRINT_ID,
      SERVICE_BUSINESS_BLUEPRINT_ID,
      AUTHOR_BUSINESS_BLUEPRINT_ID,
      COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
      MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
      CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
      PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
      PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
      DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
      OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
      STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
      RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
      RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
      RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
      RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
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

  it("203–224 depth modes preserve one Work ID and reveal domain sections", () => {
    const cases: {
      blueprintId: string;
      guidedSection: string;
    }[] = [
      { blueprintId: ETSY_BUSINESS_BLUEPRINT_ID, guidedSection: "listings_seo" },
      {
        blueprintId: PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
        guidedSection: "lighting",
      },
      {
        blueprintId: INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "reorder_points",
      },
      {
        blueprintId: HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
        guidedSection: "seasonal_campaigns",
      },
      {
        blueprintId: SPEAKER_BUSINESS_BLUEPRINT_ID,
        guidedSection: "speaker_marketing",
      },
      {
        blueprintId: COACHING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "discovery_enrollment",
      },
      {
        blueprintId: CONSULTING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "diagnostic_method",
      },
      {
        blueprintId: SERVICE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "inquiry_qualification",
      },
      {
        blueprintId: AUTHOR_BUSINESS_BLUEPRINT_ID,
        guidedSection: "author_platform",
      },
      {
        blueprintId: COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
        guidedSection: "curriculum_sequence",
      },
      {
        blueprintId: MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
        guidedSection: "member_onboarding",
      },
      {
        blueprintId: CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
        guidedSection: "content_production_system",
      },
      {
        blueprintId: PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "organizing_inquiry",
      },
      {
        blueprintId: PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
        guidedSection: "space_design",
      },
      {
        blueprintId: DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
        guidedSection: "naming_structure",
      },
      {
        blueprintId: OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
        guidedSection: "sop_design",
      },
      {
        blueprintId: STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
        guidedSection: "meeting_rhythms",
      },
      {
        blueprintId: RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "retail_layout_flow",
      },
      {
        blueprintId: RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
        guidedSection: "retail_scheduling",
      },
      {
        blueprintId: RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
        guidedSection: "retail_reorder_points",
      },
      {
        blueprintId: RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
        guidedSection: "retail_promotions",
      },
    ];
    for (const c of cases) {
      const init = initializeWorkFromBlueprint({
        workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
        blueprintId: c.blueprintId,
        depthMode: "quick_start",
        origin: "create",
      });
      changeBlueprintDepthMode(init.workId, "guided_build");
      expect(getWorkBlueprintState(init.workId)?.workId).toBe(init.workId);
      const bp = getBlueprint(c.blueprintId)!;
      const active = resolveActiveSections(
        bp.sections,
        getWorkBlueprintState(init.workId)!,
        "guided_build",
      ).visibleSectionIds;
      expect(active).toContain(c.guidedSection);
    }
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

  it("NL resolves handmade Business Blueprints; Event and Marketing stay distinct", () => {
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

    const etsy = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me grow my Etsy shop",
    });
    expect(etsy.workTypeId).toBe(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(etsy.blueprintId).toBe(ETSY_BUSINESS_BLUEPRINT_ID);

    const photo = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan product photography for my listings",
    });
    expect(photo.blueprintId).toBe(PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID);

    const inventory = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with inventory and pricing",
    });
    expect(inventory.blueprintId).toBe(INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID);

    const holiday = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me use the holiday product planner",
    });
    expect(holiday.blueprintId).toBe(HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID);

    const speaker = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a speaker business",
    });
    expect(speaker.workTypeId).toBe(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(speaker.blueprintId).toBe(SPEAKER_BUSINESS_BLUEPRINT_ID);

    const coaching = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan my coaching business",
    });
    expect(coaching.blueprintId).toBe(COACHING_BUSINESS_BLUEPRINT_ID);

    const consulting = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a consulting business",
    });
    expect(consulting.blueprintId).toBe(CONSULTING_BUSINESS_BLUEPRINT_ID);

    const service = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me create a service business operating blueprint",
    });
    expect(service.blueprintId).toBe(SERVICE_BUSINESS_BLUEPRINT_ID);

    expect(isBusinessPlanCreationRequest("Help me build a speaker business")).toBe(
      true,
    );
    expect(isBusinessPlanCreationRequest("speaker business")).toBe(true);

    const author = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an author business",
    });
    expect(author.workTypeId).toBe(BUSINESS_PLAN_WORK_TYPE_ID);
    expect(author.blueprintId).toBe(AUTHOR_BUSINESS_BLUEPRINT_ID);

    const course = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a course creator business",
    });
    expect(course.blueprintId).toBe(COURSE_CREATOR_BUSINESS_BLUEPRINT_ID);

    const membership = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a membership business",
    });
    expect(membership.blueprintId).toBe(MEMBERSHIP_BUSINESS_BLUEPRINT_ID);

    const contentCreator = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me create a content creator business",
    });
    expect(contentCreator.blueprintId).toBe(CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID);

    // Author business stays distinct from Event book launch
    const bookLaunch = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a book launch",
    });
    expect(bookLaunch.blueprintId).not.toBe(AUTHOR_BUSINESS_BLUEPRINT_ID);

    const physical = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with physical space organizing for my home office",
    });
    expect(physical.blueprintId).toBe(PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID);

    const organizingBiz = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a professional organizing business",
    });
    expect(organizingBiz.blueprintId).toBe(
      PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
    );

    const retailInventory = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with retail inventory and purchasing vendors",
    });
    expect(retailInventory.blueprintId).toBe(
      RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
    );

    const handmadePricing = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with inventory pricing for my handmade products",
    });
    expect(handmadePricing.blueprintId).toBe(INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID);

    const retailStore = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a retail store business",
    });
    expect(retailStore.blueprintId).toBe(RETAIL_STORE_BUSINESS_BLUEPRINT_ID);

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
