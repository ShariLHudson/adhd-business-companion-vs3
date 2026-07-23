/**
 * Marketing Plan — first non-Event Work Type package for the Universal Work Engine (105).
 * Owns Marketing domain configuration + section-ideas catalog only.
 * Does not mint IDs or save. Exact-section resume and ideas runtime are shared UWE capabilities.
 */

import {
  MARKETING_PLAN_DEFAULT_FOCUS,
  MARKETING_PLAN_MAP_SECTIONS,
  MARKETING_PLAN_WORK_TYPE_ID,
} from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { registerWorkTypePackage } from "../../registry/universalWorkTypeRegistry";
import { registerSchemaAsWorkTypePackage } from "../../registry/bridgeWorkTypeSchema";
import { registerWorkTypeSchema } from "@/lib/workTypeSchema/registry";
import type { WorkTypeSchema } from "@/lib/workTypeSchema/types";
import { GUIDED_WORK_TYPE_CAPABILITIES } from "../../types";
import { registerSectionIdeasCatalog } from "../../sectionRuntime/sectionIdeas";
import { MARKETING_PLAN_BLUEPRINT_IDS } from "./marketingPlanBlueprint";
import { MARKETING_PLAN_MAP_GROUPS } from "./marketingPlanMapGroups";
import { MARKETING_PLAN_SECTION_IDEAS } from "./sectionIdeasCatalog";
import { ensureMarketingPlanBlueprintsRegistered } from "./registerMarketingPlanBlueprints";

export const MARKETING_PLAN_PACKAGE_VERSION = "1.0.0";

const MARKETING_PLAN_SCHEMA: WorkTypeSchema = {
  workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
  displayName: "Marketing Plan",
  sections: MARKETING_PLAN_MAP_SECTIONS,
  defaultFocusSectionIds: MARKETING_PLAN_DEFAULT_FOCUS,
};

/** Idempotent — safe from Create boot and Anywhere-Origin. */
export function ensureMarketingPlanWorkTypeRegistered(): void {
  ensureMarketingPlanBlueprintsRegistered();
  registerWorkTypePackage({
    workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
    version: MARKETING_PLAN_PACKAGE_VERSION,
    displayName: "Marketing Plan",
    creationExperienceId: "create",
    blueprintIds: MARKETING_PLAN_BLUEPRINT_IDS,
    lifecycle: {
      usesUniversalSectionLifecycle: true,
      domainPhases: [
        "purpose",
        "audience",
        "positioning",
        "channels",
        "implementation",
        "measurement",
        "review",
        "archive_and_reuse",
      ],
    },
    sections: MARKETING_PLAN_MAP_SECTIONS,
    mapGroups: MARKETING_PLAN_MAP_GROUPS,
    groupMapThreshold: 6,
    defaultFocusSectionIds: MARKETING_PLAN_DEFAULT_FOCUS,
    questionDefinitionIds: ["marketing-plan-foundation"],
    deliverableIds: ["marketing-plan-simple"],
    capabilities: { ...GUIDED_WORK_TYPE_CAPABILITIES },
    certificationRequirementIds: [
      "marketing_plan.foundation",
      "marketing_plan.map",
      "marketing_plan.depth",
      "marketing_plan.anywhere_origin",
    ],
  });
  registerSectionIdeasCatalog(
    MARKETING_PLAN_WORK_TYPE_ID,
    MARKETING_PLAN_SECTION_IDEAS,
  );
  registerWorkTypeSchema(MARKETING_PLAN_SCHEMA);
  registerSchemaAsWorkTypePackage(MARKETING_PLAN_SCHEMA, {
    version: MARKETING_PLAN_PACKAGE_VERSION,
    capabilities: { ...GUIDED_WORK_TYPE_CAPABILITIES },
  });
}

ensureMarketingPlanWorkTypeRegistered();
