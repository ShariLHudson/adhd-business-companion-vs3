/**
 * Event Plan — first certified Work Type package for the Universal Work Engine.
 * Owns Event domain configuration + section-ideas catalog only.
 * Does not mint IDs or save. Exact-section resume is a shared UWE capability.
 */

import {
  EVENT_PLAN_DEFAULT_FOCUS,
  EVENT_PLAN_MAP_SECTIONS,
  EVENT_PLAN_WORK_TYPE_ID,
} from "@/lib/workTypeSchema/schemas/eventPlanMap";
import { registerWorkTypePackage } from "../../registry/universalWorkTypeRegistry";
import { registerSchemaAsWorkTypePackage } from "../../registry/bridgeWorkTypeSchema";
import { registerWorkTypeSchema } from "@/lib/workTypeSchema/registry";
import type { WorkTypeSchema } from "@/lib/workTypeSchema/types";
import { GUIDED_WORK_TYPE_CAPABILITIES } from "../../types";
import { registerSectionIdeasCatalog } from "../../sectionRuntime/sectionIdeas";
import { EVENT_PLAN_BLUEPRINT_IDS } from "./eventBlueprintDefinitions";
import { EVENT_PLAN_MAP_GROUPS } from "./eventPlanMapGroups";
import { EVENT_PLAN_SECTION_IDEAS } from "./sectionIdeasCatalog";
import { ensureEventBlueprintsRegistered } from "./registerEventBlueprints";

export const EVENT_PLAN_PACKAGE_VERSION = "1.0.0";

const EVENT_PLAN_SCHEMA: WorkTypeSchema = {
  workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  displayName: "Event Plan",
  sections: EVENT_PLAN_MAP_SECTIONS,
  defaultFocusSectionIds: EVENT_PLAN_DEFAULT_FOCUS,
};

/** Idempotent — safe from Create boot and Event adapters. */
export function ensureEventPlanWorkTypeRegistered(): void {
  ensureEventBlueprintsRegistered();
  registerWorkTypePackage({
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
    version: EVENT_PLAN_PACKAGE_VERSION,
    displayName: "Event Plan",
    creationExperienceId: "create",
    blueprintIds: EVENT_PLAN_BLUEPRINT_IDS,
    lifecycle: {
      usesUniversalSectionLifecycle: true,
      domainPhases: [
        "spark",
        "foundation",
        "design",
        "operations",
        "promotion",
        "delivery",
        "follow_through",
        "archive_and_reuse",
        "final_review",
      ],
    },
    sections: EVENT_PLAN_MAP_SECTIONS,
    mapGroups: EVENT_PLAN_MAP_GROUPS,
    groupMapThreshold: 6,
    defaultFocusSectionIds: EVENT_PLAN_DEFAULT_FOCUS,
    questionDefinitionIds: ["event-foundation"],
    deliverableIds: ["event-plan-brief"],
    capabilities: { ...GUIDED_WORK_TYPE_CAPABILITIES },
    certificationRequirementIds: [
      "event.foundation",
      "event.map",
      "event.focus",
      "event.continue",
    ],
  });
  registerSectionIdeasCatalog(EVENT_PLAN_WORK_TYPE_ID, EVENT_PLAN_SECTION_IDEAS);
  // Keep legacy WorkTypeSchema registry in sync for existing map openers.
  registerWorkTypeSchema(EVENT_PLAN_SCHEMA);
  registerSchemaAsWorkTypePackage(EVENT_PLAN_SCHEMA, {
    version: EVENT_PLAN_PACKAGE_VERSION,
    capabilities: { ...GUIDED_WORK_TYPE_CAPABILITIES },
  });
}

ensureEventPlanWorkTypeRegistered();
