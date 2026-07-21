/**
 * Business Plan — Work Type package for Crafter / maker Business Blueprints (201–202).
 * Owns Business domain configuration only. Does not mint IDs, save, or own resume.
 */

import {
  BUSINESS_PLAN_DEFAULT_FOCUS,
  BUSINESS_PLAN_MAP_SECTIONS,
  BUSINESS_PLAN_WORK_TYPE_ID,
} from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { registerWorkTypePackage } from "../../registry/universalWorkTypeRegistry";
import { registerSchemaAsWorkTypePackage } from "../../registry/bridgeWorkTypeSchema";
import { registerWorkTypeSchema } from "@/lib/workTypeSchema/registry";
import type { WorkTypeSchema } from "@/lib/workTypeSchema/types";
import { BUSINESS_PLAN_BLUEPRINT_IDS } from "./businessBlueprintDefinitions";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";
import { ensureBusinessPlanBlueprintsRegistered } from "./registerBusinessPlanBlueprints";

export const BUSINESS_PLAN_PACKAGE_VERSION = "1.0.0";

const BUSINESS_PLAN_SCHEMA: WorkTypeSchema = {
  workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  displayName: "Business Plan",
  sections: BUSINESS_PLAN_MAP_SECTIONS,
  defaultFocusSectionIds: BUSINESS_PLAN_DEFAULT_FOCUS,
};

/** Idempotent — safe from Create boot and Anywhere-Origin. */
export function ensureBusinessPlanWorkTypeRegistered(): void {
  ensureBusinessPlanBlueprintsRegistered();
  registerWorkTypePackage({
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
    version: BUSINESS_PLAN_PACKAGE_VERSION,
    displayName: "Business Plan",
    creationExperienceId: "create",
    blueprintIds: BUSINESS_PLAN_BLUEPRINT_IDS,
    lifecycle: {
      usesUniversalSectionLifecycle: true,
      domainPhases: [
        "vision",
        "offer",
        "operations",
        "growth",
        "money",
        "review",
        "archive_and_reuse",
      ],
    },
    sections: BUSINESS_PLAN_MAP_SECTIONS,
    mapGroups: BUSINESS_PLAN_MAP_GROUPS,
    groupMapThreshold: 10,
    defaultFocusSectionIds: BUSINESS_PLAN_DEFAULT_FOCUS,
    questionDefinitionIds: ["business-plan-foundation"],
    deliverableIds: ["business-plan-crafter"],
    capabilities: {
      tasks: true,
      milestones: true,
      research: true,
      chamberRouting: true,
      boardReview: true,
      cartography: true,
      projectBridge: true,
      print: true,
      export: true,
    },
    certificationRequirementIds: [
      "business_plan.foundation",
      "business_plan.map",
      "business_plan.depth",
      "business_plan.anywhere_origin",
    ],
  });
  registerWorkTypeSchema(BUSINESS_PLAN_SCHEMA);
  registerSchemaAsWorkTypePackage(BUSINESS_PLAN_SCHEMA, {
    version: BUSINESS_PLAN_PACKAGE_VERSION,
    capabilities: {
      tasks: true,
      milestones: true,
      research: true,
      chamberRouting: true,
      boardReview: true,
      cartography: true,
      projectBridge: true,
      print: true,
      export: true,
    },
  });
}

ensureBusinessPlanWorkTypeRegistered();
