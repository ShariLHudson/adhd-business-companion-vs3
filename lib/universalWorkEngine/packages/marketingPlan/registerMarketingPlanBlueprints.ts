/**
 * Registers Marketing Plan Blueprints through the Universal Blueprint registry.
 * No private Blueprint registry or private initialization pipeline.
 */

import { isBlueprintRegistered, registerBlueprint } from "../../blueprints/registry";
import { MARKETING_PLAN_BLUEPRINT_DEFINITIONS } from "./marketingPlanBlueprint";

/** Idempotent — safe from Work Type package boot. */
export function ensureMarketingPlanBlueprintsRegistered(): void {
  for (const definition of MARKETING_PLAN_BLUEPRINT_DEFINITIONS) {
    if (isBlueprintRegistered(definition.blueprintId)) {
      registerBlueprint(definition);
      continue;
    }
    registerBlueprint(definition);
  }
}

ensureMarketingPlanBlueprintsRegistered();
