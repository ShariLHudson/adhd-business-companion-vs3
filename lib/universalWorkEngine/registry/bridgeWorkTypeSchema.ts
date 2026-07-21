/**
 * Bridge: Universal Work Type packages ↔ legacy WorkTypeSchema shape
 * used by Workshop Map bootstrap.
 */

import type { WorkTypeSchema } from "@/lib/workTypeSchema/types";
import type { WorkTypePackage } from "../types";
import {
  getWorkTypePackage,
  registerWorkTypePackage,
  requireWorkTypePackage,
} from "./universalWorkTypeRegistry";

export function workTypePackageToSchema(pkg: WorkTypePackage): WorkTypeSchema {
  return {
    workTypeId: pkg.workTypeId,
    displayName: pkg.displayName,
    sections: pkg.sections,
    defaultFocusSectionIds: pkg.defaultFocusSectionIds,
  };
}

/** Register a minimal package from an existing WorkTypeSchema (cert probe, etc.). */
export function registerSchemaAsWorkTypePackage(
  schema: WorkTypeSchema,
  extras?: Partial<
    Omit<WorkTypePackage, "workTypeId" | "displayName" | "sections">
  >,
): void {
  if (getWorkTypePackage(schema.workTypeId)) return;
  registerWorkTypePackage({
    workTypeId: schema.workTypeId,
    version: extras?.version ?? "1.0.0",
    displayName: schema.displayName,
    creationExperienceId: extras?.creationExperienceId ?? "create",
    blueprintIds: extras?.blueprintIds ?? [],
    lifecycle: extras?.lifecycle ?? { usesUniversalSectionLifecycle: true },
    sections: schema.sections,
    defaultFocusSectionIds: schema.defaultFocusSectionIds,
    questionDefinitionIds: extras?.questionDefinitionIds,
    deliverableIds: extras?.deliverableIds,
    capabilities: extras?.capabilities ?? {
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
    certificationRequirementIds: extras?.certificationRequirementIds,
  });
}

export function requireSchemaForWorkTypeId(workTypeId: string): WorkTypeSchema {
  return workTypePackageToSchema(requireWorkTypePackage(workTypeId));
}
