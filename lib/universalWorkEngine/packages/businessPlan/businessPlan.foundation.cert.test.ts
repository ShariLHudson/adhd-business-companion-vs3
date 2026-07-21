/**
 * 201–282 — Business Plan Work Type + Handmade / Service / Creator / Organizing / Retail / Commerce / Hospitality / Field / Wellness / Education Community / Regulated Professional / Manufacturing Logistics Agriculture / Tech Media Creative / Scale Location Channel / Local Consumer Service / Financial Investment Property Blueprints.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID,
  AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID,
  AUTHOR_BUSINESS_BLUEPRINT_ID,
  AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID,
  CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID,
  COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID,
  CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID,
  BUSINESS_PLAN_BLUEPRINT_IDS,
  DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID,
  COACHING_BUSINESS_BLUEPRINT_ID,
  FRANCHISE_BUSINESS_BLUEPRINT_ID,
  INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID,
  INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID,
  PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID,
  PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID,
  WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID,
  CONSULTING_BUSINESS_BLUEPRINT_ID,
  CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID,
  CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
  DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
  ECOMMERCE_BUSINESS_BLUEPRINT_ID,
  EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID,
  ETSY_BUSINESS_BLUEPRINT_ID,
  FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID,
  FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  HOME_SERVICE_BUSINESS_BLUEPRINT_ID,
  HOSPITALITY_BUSINESS_BLUEPRINT_ID,
  INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID,
  INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID,
  LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID,
  MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID,
  MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  MULTI_LOCATION_BUSINESS_BLUEPRINT_ID,
  MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
  NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID,
  PET_SERVICE_BUSINESS_BLUEPRINT_ID,
  OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
  PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID,
  PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
  PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
  PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
  REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID,
  RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID,
  RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID,
  RESTAURANT_BUSINESS_BLUEPRINT_ID,
  RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
  RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
  RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
  SERVICE_BUSINESS_BLUEPRINT_ID,
  SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID,
  SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID,
  SPEAKER_BUSINESS_BLUEPRINT_ID,
  STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
  SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
  TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
  VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
  WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID,
  WHOLESALE_BUSINESS_BLUEPRINT_ID,
  WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID,
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

  it("registers Business Plan Work Type with sixty-seven Business Blueprints", () => {
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
        ECOMMERCE_BUSINESS_BLUEPRINT_ID,
        PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
        WHOLESALE_BUSINESS_BLUEPRINT_ID,
        SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
        HOSPITALITY_BUSINESS_BLUEPRINT_ID,
        RESTAURANT_BUSINESS_BLUEPRINT_ID,
        TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
        VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
        CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
        HOME_SERVICE_BUSINESS_BLUEPRINT_ID,
        PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
        MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
        WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID,
        BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID,
        FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
        PET_SERVICE_BUSINESS_BLUEPRINT_ID,
        EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID,
        NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID,
        PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID,
        FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID,
        LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID,
        ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID,
        INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID,
        REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID,
        SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID,
        WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID,
        LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID,
        AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID,
        SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID,
        MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID,
        CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID,
        RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID,
        FRANCHISE_BUSINESS_BLUEPRINT_ID,
        MULTI_LOCATION_BUSINESS_BLUEPRINT_ID,
        RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID,
        DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID,
        PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID,
        WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID,
        CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID,
        AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID,
        INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID,
        COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID,
        PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID,
        INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID,
      ]),
    );
    expect(BUSINESS_PLAN_BLUEPRINT_IDS).toHaveLength(67);
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
      ECOMMERCE_BUSINESS_BLUEPRINT_ID,
      PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
      WHOLESALE_BUSINESS_BLUEPRINT_ID,
      SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
      HOSPITALITY_BUSINESS_BLUEPRINT_ID,
      RESTAURANT_BUSINESS_BLUEPRINT_ID,
      TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
      VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
      CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
      HOME_SERVICE_BUSINESS_BLUEPRINT_ID,
      PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
      MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
      WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID,
      BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID,
      FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
      PET_SERVICE_BUSINESS_BLUEPRINT_ID,
      EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID,
      NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID,
      PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID,
      FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID,
      LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID,
      ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID,
      INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID,
      REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID,
      SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID,
      WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID,
      LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID,
      AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID,
      SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID,
      MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID,
      CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID,
      RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID,
      FRANCHISE_BUSINESS_BLUEPRINT_ID,
      MULTI_LOCATION_BUSINESS_BLUEPRINT_ID,
      RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID,
      DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID,
      PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID,
      WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID,
      CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID,
      AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID,
      INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID,
      COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID,
      PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID,
      INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID,
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
      {
        blueprintId: ECOMMERCE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ecom_storefront",
      },
      {
        blueprintId: PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
        guidedSection: "product_validation",
      },
      {
        blueprintId: WHOLESALE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "wholesale_line_sheet",
      },
      {
        blueprintId: SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "sub_retention",
      },
      {
        blueprintId: HOSPITALITY_BUSINESS_BLUEPRINT_ID,
        guidedSection: "hosp_guest_journey",
      },
      {
        blueprintId: RESTAURANT_BUSINESS_BLUEPRINT_ID,
        guidedSection: "rest_menu",
      },
      {
        blueprintId: TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
        guidedSection: "travel_itinerary",
      },
      {
        blueprintId: VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "venue_capacity",
      },
      {
        blueprintId: CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
        guidedSection: "gc_scope",
      },
      {
        blueprintId: HOME_SERVICE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "hs_inquiry",
      },
      {
        blueprintId: PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
        guidedSection: "pm_property",
      },
      {
        blueprintId: MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
        guidedSection: "field_dispatch",
      },
      {
        blueprintId: WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "wp_service_offers",
      },
      {
        blueprintId: BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "bc_booking",
      },
      {
        blueprintId: FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "fit_programs",
      },
      {
        blueprintId: PET_SERVICE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "pet_scheduling",
      },
      {
        blueprintId: EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "et_curriculum",
      },
      {
        blueprintId: NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID,
        guidedSection: "np_program_plans",
      },
      {
        blueprintId: PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ps_engagement",
      },
      {
        blueprintId: FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID,
        guidedSection: "fm_member_onboarding",
      },
      {
        blueprintId: LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID,
        guidedSection: "legal_conflict",
      },
      {
        blueprintId: ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID,
        guidedSection: "acct_monthly",
      },
      {
        blueprintId: INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ins_renewals",
      },
      {
        blueprintId: REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID,
        guidedSection: "re_transaction",
      },
      {
        blueprintId: SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "mfg_bom",
      },
      {
        blueprintId: WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID,
        guidedSection: "wd_inventory",
      },
      {
        blueprintId: LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID,
        guidedSection: "log_dispatch",
      },
      {
        blueprintId: AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ag_enterprise",
      },
      {
        blueprintId: SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID,
        guidedSection: "saas_roadmap",
      },
      {
        blueprintId: MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "media_calendar",
      },
      {
        blueprintId: CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID,
        guidedSection: "agency_catalog",
      },
      {
        blueprintId: RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID,
        guidedSection: "lab_experiment",
      },
      {
        blueprintId: FRANCHISE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "fr_model",
      },
      {
        blueprintId: MULTI_LOCATION_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ml_standards",
      },
      {
        blueprintId: RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "rent_reservation",
      },
      {
        blueprintId: DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ch_tiers",
      },
      {
        blueprintId: PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID,
        guidedSection: "pv_offers",
      },
      {
        blueprintId: WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID,
        guidedSection: "wc_budget",
      },
      {
        blueprintId: CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID,
        guidedSection: "cl_delivery",
      },
      {
        blueprintId: AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID,
        guidedSection: "auto_inspect",
      },
      {
        blueprintId: INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID,
        guidedSection: "iw_review",
      },
      {
        blueprintId: COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID,
        guidedSection: "cre_market",
      },
      {
        blueprintId: PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID,
        guidedSection: "pd_milestones",
      },
      {
        blueprintId: INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID,
        guidedSection: "ih_pipeline",
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

    const ecommerce = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an ecommerce business",
    });
    expect(ecommerce.blueprintId).toBe(ECOMMERCE_BUSINESS_BLUEPRINT_ID);

    const handmadeStore = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a handmade online store",
    });
    expect(handmadeStore.blueprintId).toBe(HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID);

    const subscription = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me plan a subscription box business",
    });
    expect(subscription.blueprintId).toBe(
      SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
    );
    // membership business remains distinct (asserted earlier in this test)

    const restaurant = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a restaurant business",
    });
    expect(restaurant.blueprintId).toBe(RESTAURANT_BUSINESS_BLUEPRINT_ID);

    const hospitality = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a hospitality business for my inn",
    });
    expect(hospitality.blueprintId).toBe(HOSPITALITY_BUSINESS_BLUEPRINT_ID);

    const travel = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a travel and tourism business",
    });
    expect(travel.blueprintId).toBe(TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID);

    const venue = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a venue experience business",
    });
    expect(venue.blueprintId).toBe(VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID);

    const contractor = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a contractor construction business",
    });
    expect(contractor.blueprintId).toBe(
      CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
    );

    const homeService = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a home service business",
    });
    expect(homeService.blueprintId).toBe(HOME_SERVICE_BUSINESS_BLUEPRINT_ID);

    const propertyMgmt = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a property management business",
    });
    expect(propertyMgmt.blueprintId).toBe(
      PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
    );

    const fieldOps = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with mobile field service operations",
    });
    expect(fieldOps.blueprintId).toBe(
      MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
    );

    const wellness = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a wellness practice business",
    });
    expect(wellness.blueprintId).toBe(WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID);

    const beauty = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a beauty personal care business",
    });
    expect(beauty.blueprintId).toBe(BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID);

    const fitness = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a fitness studio coaching business",
    });
    expect(fitness.blueprintId).toBe(
      FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
    );

    const pet = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a pet service business",
    });
    expect(pet.blueprintId).toBe(PET_SERVICE_BUSINESS_BLUEPRINT_ID);

    const education = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an education and training business",
    });
    expect(education.blueprintId).toBe(EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID);

    const nonprofit = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with a nonprofit and foundation blueprint",
    });
    expect(nonprofit.blueprintId).toBe(
      NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID,
    );

    const publicSector = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me with a public sector and community blueprint",
    });
    expect(publicSector.blueprintId).toBe(
      PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID,
    );

    const faithOrg = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me with a faith and membership organization blueprint",
    });
    expect(faithOrg.blueprintId).toBe(
      FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID,
    );

    const legalServices = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a legal services business",
    });
    expect(legalServices.blueprintId).toBe(LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID);

    const accounting = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me with an accounting bookkeeping tax practice",
    });
    expect(accounting.blueprintId).toBe(
      ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID,
    );

    const insurance = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an insurance agency business",
    });
    expect(insurance.blueprintId).toBe(INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID);

    const realEstate = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me build a real estate brokerage agent business",
    });
    expect(realEstate.blueprintId).toBe(
      REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID,
    );

    const smallMfg = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a small manufacturing business",
    });
    expect(smallMfg.blueprintId).toBe(SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID);

    const wholesaleDist = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a wholesale distribution business",
    });
    expect(wholesaleDist.blueprintId).toBe(
      WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID,
    );

    const logistics = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a logistics transportation business",
    });
    expect(logistics.blueprintId).toBe(
      LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID,
    );

    const agriculture = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an agriculture farm rural business",
    });
    expect(agriculture.blueprintId).toBe(
      AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID,
    );

    const softwareSaas = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a software and saas business",
    });
    expect(softwareSaas.blueprintId).toBe(SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID);

    const mediaPublishing = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a media publishing business",
    });
    expect(mediaPublishing.blueprintId).toBe(
      MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID,
    );

    const creativeAgency = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a creative agency studio business",
    });
    expect(creativeAgency.blueprintId).toBe(
      CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID,
    );

    const researchLab = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me with a research and innovation lab blueprint",
    });
    expect(researchLab.blueprintId).toBe(
      RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID,
    );

    const franchise = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a franchise business",
    });
    expect(franchise.blueprintId).toBe(FRANCHISE_BUSINESS_BLUEPRINT_ID);

    const multiLocation = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a multi-location business",
    });
    expect(multiLocation.blueprintId).toBe(MULTI_LOCATION_BUSINESS_BLUEPRINT_ID);

    const rental = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a rental equipment hire business",
    });
    expect(rental.blueprintId).toBe(RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID);

    const dealer = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me with a dealer reseller and channel partner blueprint",
    });
    expect(dealer.blueprintId).toBe(
      DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID,
    );

    const photographyVideography = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me build a photography and videography business",
    });
    expect(photographyVideography.blueprintId).toBe(
      PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID,
    );

    const weddingCelebration = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a wedding planner business",
    });
    expect(weddingCelebration.blueprintId).toBe(
      WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID,
    );

    const cleaningJanitorial = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a cleaning and janitorial business",
    });
    expect(cleaningJanitorial.blueprintId).toBe(
      CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID,
    );

    const automotive = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage:
        "Help me build an automotive repair and detailing business",
    });
    expect(automotive.blueprintId).toBe(
      AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID,
    );

    const investmentWealth = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an investment and wealth business",
    });
    expect(investmentWealth.blueprintId).toBe(
      INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID,
    );

    const commercialRe = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a commercial real estate business",
    });
    expect(commercialRe.blueprintId).toBe(
      COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID,
    );

    const propertyDev = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a property development business",
    });
    expect(propertyDev.blueprintId).toBe(
      PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID,
    );

    const holding = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build an investor and holding company",
    });
    expect(holding.blueprintId).toBe(
      INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID,
    );

    expect(isBusinessPlanCreationRequest("franchise business")).toBe(true);
    expect(isBusinessPlanCreationRequest("business.multi_location")).toBe(true);
    expect(
      isBusinessPlanCreationRequest("equipment hire business"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("business.dealer_reseller_channel_partner"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("photography and videography business"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("business.wedding_celebration_professional"),
    ).toBe(true);
    expect(isBusinessPlanCreationRequest("janitorial business")).toBe(true);
    expect(
      isBusinessPlanCreationRequest("business.automotive_repair_detailing"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("investment and wealth business"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("business.commercial_real_estate"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("property development business"),
    ).toBe(true);
    expect(
      isBusinessPlanCreationRequest("business.investor_holding_company"),
    ).toBe(true);

    const genericService = inferWorkTypeAndBlueprint({
      origin: "create",
      originalUserMessage: "Help me build a service business operating system",
    });
    expect(genericService.blueprintId).toBe(SERVICE_BUSINESS_BLUEPRINT_ID);

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
