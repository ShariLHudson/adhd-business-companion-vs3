/**
 * Learning lifecycle — shared flow for every Institute experience.
 */

import type { InstituteLifecycleStageId } from "@/lib/sparkMomentumInstitute/types";
import {
  AUTOMATIC_LIFECYCLE_STAGES,
  INSTITUTE_LIFECYCLE_ORDER,
  PERMISSION_GATED_LIFECYCLE_STAGES,
} from "@/lib/sparkMomentumInstitute/types";

export function nextLifecycleStage(
  current: InstituteLifecycleStageId,
  supportedStages: readonly InstituteLifecycleStageId[],
): InstituteLifecycleStageId | null {
  const order = INSTITUTE_LIFECYCLE_ORDER.filter((s) =>
    supportedStages.includes(s),
  );
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1] ?? null;
}

export function isPermissionGatedStage(stage: InstituteLifecycleStageId): boolean {
  return (PERMISSION_GATED_LIFECYCLE_STAGES as readonly string[]).includes(
    stage,
  );
}

export function isAutomaticStage(stage: InstituteLifecycleStageId): boolean {
  return (AUTOMATIC_LIFECYCLE_STAGES as readonly string[]).includes(stage);
}

export function defaultLifecycleStagesForExperienceType(
  experienceType: string,
): InstituteLifecycleStageId[] {
  const base: InstituteLifecycleStageId[] = [
    "discover",
    "learn",
    "reflect",
    "make_it_mine",
    "coach_with_shari",
    "apply_in_my_business",
    "return_and_share",
    "growth_profile",
  ];

  if (experienceType === "reflection") {
    return ["discover", "learn", "reflect", "make_it_mine", "return_and_share", "growth_profile"];
  }

  if (experienceType === "business_mastery_minute") {
    return [
      "discover",
      "learn",
      "reflect",
      "make_it_mine",
      "apply_in_my_business",
      "return_and_share",
      "growth_profile",
    ];
  }

  if (
    experienceType === "apprenticeship" ||
    experienceType === "simulation" ||
    experienceType === "business_lab"
  ) {
    return [
      ...base,
      "evidence_vault",
    ];
  }

  return base;
}

export function canAdvanceLifecycle(
  from: InstituteLifecycleStageId,
  to: InstituteLifecycleStageId,
  supportedStages: readonly InstituteLifecycleStageId[],
): boolean {
  if (!supportedStages.includes(to)) return false;
  const order = INSTITUTE_LIFECYCLE_ORDER.filter((s) =>
    supportedStages.includes(s),
  );
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  return toIdx === fromIdx + 1;
}
