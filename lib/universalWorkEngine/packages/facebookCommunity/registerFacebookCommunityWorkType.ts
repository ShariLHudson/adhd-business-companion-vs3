/**
 * Facebook Community — Work Type package for the Universal Work Engine (587–598).
 * Owns Facebook Community domain configuration only. Does not mint IDs, save,
 * or own resume. Reuses canonical Marketing / Client Relationships / Content /
 * Creative Studio / Events / Create / Projects ownership — does not fork a
 * parallel Create runtime, router, image engine, or content-calendar engine.
 */

import {
  FACEBOOK_COMMUNITY_DEFAULT_FOCUS,
  FACEBOOK_COMMUNITY_MAP_SECTIONS,
  FACEBOOK_COMMUNITY_WORK_TYPE_ID,
} from "@/lib/workTypeSchema/schemas/facebookCommunityMap";
import { registerWorkTypePackage } from "../../registry/universalWorkTypeRegistry";
import { registerSchemaAsWorkTypePackage } from "../../registry/bridgeWorkTypeSchema";
import { registerWorkTypeSchema } from "@/lib/workTypeSchema/registry";
import type { WorkTypeSchema } from "@/lib/workTypeSchema/types";
import { FACEBOOK_COMMUNITY_BLUEPRINT_IDS } from "./facebookCommunityBlueprint";
import { FACEBOOK_COMMUNITY_MAP_GROUPS } from "./facebookCommunityMapGroups";
import { ensureFacebookCommunityBlueprintsRegistered } from "./registerFacebookCommunityBlueprints";

export const FACEBOOK_COMMUNITY_PACKAGE_VERSION = "1.0.0";

const FACEBOOK_COMMUNITY_SCHEMA: WorkTypeSchema = {
  workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
  displayName: "Facebook Community",
  sections: FACEBOOK_COMMUNITY_MAP_SECTIONS,
  defaultFocusSectionIds: FACEBOOK_COMMUNITY_DEFAULT_FOCUS,
};

/** Idempotent — safe from Create boot and Anywhere-Origin. */
export function ensureFacebookCommunityWorkTypeRegistered(): void {
  ensureFacebookCommunityBlueprintsRegistered();
  registerWorkTypePackage({
    workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
    version: FACEBOOK_COMMUNITY_PACKAGE_VERSION,
    displayName: "Facebook Community",
    creationExperienceId: "create",
    blueprintIds: FACEBOOK_COMMUNITY_BLUEPRINT_IDS,
    lifecycle: {
      usesUniversalSectionLifecycle: true,
      domainPhases: [
        "discover",
        "position",
        "name",
        "design",
        "configure",
        "welcome",
        "seed",
        "launch",
        "grow",
        "engage",
        "moderate",
        "measure",
        "operate",
        "improve",
      ],
    },
    sections: FACEBOOK_COMMUNITY_MAP_SECTIONS,
    mapGroups: FACEBOOK_COMMUNITY_MAP_GROUPS,
    groupMapThreshold: 6,
    defaultFocusSectionIds: FACEBOOK_COMMUNITY_DEFAULT_FOCUS,
    questionDefinitionIds: ["facebook-community-foundation"],
    deliverableIds: ["facebook-community-simple"],
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
      "facebook_community.foundation",
      "facebook_community.map",
      "facebook_community.depth",
      "facebook_community.anywhere_origin",
    ],
  });
  registerWorkTypeSchema(FACEBOOK_COMMUNITY_SCHEMA);
  registerSchemaAsWorkTypePackage(FACEBOOK_COMMUNITY_SCHEMA, {
    version: FACEBOOK_COMMUNITY_PACKAGE_VERSION,
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

ensureFacebookCommunityWorkTypeRegistered();
