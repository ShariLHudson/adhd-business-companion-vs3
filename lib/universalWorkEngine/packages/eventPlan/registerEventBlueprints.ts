/**
 * Registers Event Plan Blueprints through the Universal Blueprint registry.
 * No private Blueprint registry or private initialization pipeline.
 */

import { registerBlueprint } from "../../blueprints/registry";
import { isBlueprintRegistered } from "../../blueprints/registry";
import { EVENT_PLAN_BLUEPRINT_DEFINITIONS } from "./eventBlueprintDefinitions";

/** Idempotent — safe from Work Type package boot. */
export function ensureEventBlueprintsRegistered(): void {
  for (const definition of EVENT_PLAN_BLUEPRINT_DEFINITIONS) {
    if (isBlueprintRegistered(definition.blueprintId)) {
      // Allow re-register of same version during tests after clear+ensure.
      registerBlueprint(definition);
      continue;
    }
    registerBlueprint(definition);
  }
}

ensureEventBlueprintsRegistered();
