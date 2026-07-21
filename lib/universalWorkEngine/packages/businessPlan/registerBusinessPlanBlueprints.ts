/**
 * Registers Business Plan Blueprints through the Universal Blueprint registry.
 * No private Blueprint registry or private initialization pipeline.
 */

import { isBlueprintRegistered, registerBlueprint } from "../../blueprints/registry";
import { BUSINESS_PLAN_BLUEPRINT_DEFINITIONS } from "./businessBlueprintDefinitions";

/** Idempotent — safe from Work Type package boot. */
export function ensureBusinessPlanBlueprintsRegistered(): void {
  for (const definition of BUSINESS_PLAN_BLUEPRINT_DEFINITIONS) {
    if (isBlueprintRegistered(definition.blueprintId)) {
      registerBlueprint(definition);
      continue;
    }
    registerBlueprint(definition);
  }
}

ensureBusinessPlanBlueprintsRegistered();
