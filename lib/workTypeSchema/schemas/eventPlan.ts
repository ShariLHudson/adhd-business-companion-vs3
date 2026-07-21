/**
 * 080 — Event Plan Work Type registration (config only).
 * Authoritative registration lives in the Universal Work Engine Event package.
 */

import type { WorkTypeSchema } from "../types";
import { ensureEventPlanWorkTypeRegistered } from "@/lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType";
import {
  EVENT_PLAN_DEFAULT_FOCUS,
  EVENT_PLAN_MAP_SECTIONS,
  EVENT_PLAN_WORK_TYPE_ID,
} from "./eventPlanMap";

export {
  EVENT_PLAN_DEFAULT_FOCUS,
  EVENT_PLAN_MAP_SECTIONS,
  EVENT_PLAN_WORK_TYPE_ID,
} from "./eventPlanMap";

export const EVENT_PLAN_SCHEMA: WorkTypeSchema = {
  workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  displayName: "Event Plan",
  sections: EVENT_PLAN_MAP_SECTIONS,
  defaultFocusSectionIds: EVENT_PLAN_DEFAULT_FOCUS,
};

/** Idempotent — delegates to Universal Work Engine Event package. */
export function ensureEventPlanSchemaRegistered(): void {
  ensureEventPlanWorkTypeRegistered();
}

ensureEventPlanSchemaRegistered();
