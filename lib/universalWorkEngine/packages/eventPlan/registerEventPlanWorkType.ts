/**
 * Event Plan — first certified Work Type package for the Universal Work Engine.
 * Owns Event domain configuration only. Does not mint IDs, save, or own resume.
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

export const EVENT_PLAN_PACKAGE_VERSION = "1.0.0";

const EVENT_PLAN_SCHEMA: WorkTypeSchema = {
  workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  displayName: "Event Plan",
  sections: EVENT_PLAN_MAP_SECTIONS,
  defaultFocusSectionIds: EVENT_PLAN_DEFAULT_FOCUS,
};

/** Idempotent — safe from Create boot and Event adapters. */
export function ensureEventPlanWorkTypeRegistered(): void {
  registerWorkTypePackage({
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
    version: EVENT_PLAN_PACKAGE_VERSION,
    displayName: "Event Plan",
    creationExperienceId: "create",
    blueprintIds: ["bp-event-plan", "bp-workshop", "bp-retreat-event"],
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
    defaultFocusSectionIds: EVENT_PLAN_DEFAULT_FOCUS,
    questionDefinitionIds: ["event-foundation"],
    deliverableIds: ["event-plan-brief"],
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
      "event.foundation",
      "event.map",
      "event.focus",
      "event.continue",
    ],
  });
  // Keep legacy WorkTypeSchema registry in sync for existing map openers.
  registerWorkTypeSchema(EVENT_PLAN_SCHEMA);
  registerSchemaAsWorkTypePackage(EVENT_PLAN_SCHEMA, {
    version: EVENT_PLAN_PACKAGE_VERSION,
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

ensureEventPlanWorkTypeRegistered();
