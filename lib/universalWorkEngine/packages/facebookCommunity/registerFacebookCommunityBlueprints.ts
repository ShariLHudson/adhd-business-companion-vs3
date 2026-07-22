/**
 * Registers Facebook Community Blueprints through the Universal Blueprint registry.
 * No private Blueprint registry or private initialization pipeline.
 */

import { isBlueprintRegistered, registerBlueprint } from "../../blueprints/registry";
import { FACEBOOK_COMMUNITY_BLUEPRINT_DEFINITIONS } from "./facebookCommunityBlueprint";

/** Idempotent — safe from Work Type package boot. */
export function ensureFacebookCommunityBlueprintsRegistered(): void {
  for (const definition of FACEBOOK_COMMUNITY_BLUEPRINT_DEFINITIONS) {
    if (isBlueprintRegistered(definition.blueprintId)) {
      registerBlueprint(definition);
      continue;
    }
    registerBlueprint(definition);
  }
}

ensureFacebookCommunityBlueprintsRegistered();
