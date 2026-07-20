/**
 * 080 — Event Plan Work Type registration (config only).
 */

import type { WorkTypeSchema } from "../types";
import { registerWorkTypeSchema } from "../registry";
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

/** Idempotent registration — call from Event adapters / Create boot. */
export function ensureEventPlanSchemaRegistered(): void {
  registerWorkTypeSchema(EVENT_PLAN_SCHEMA);
}

ensureEventPlanSchemaRegistered();
