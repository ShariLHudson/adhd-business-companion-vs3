/**
 * 051 — Blueprint resolution (wraps 046 registry).
 */

import {
  getCreateBlueprintById,
  resolveBlueprintFromText,
} from "@/lib/platformIntent/blueprintRegistry";
import type { CreateBlueprint } from "@/lib/platformIntent/types";

export function resolveCreationBlueprint(input: {
  userText: string;
  blueprintId?: string | null;
  preferred?: CreateBlueprint | null;
}): CreateBlueprint | null {
  if (input.preferred) return input.preferred;
  if (input.blueprintId) {
    const byId = getCreateBlueprintById(input.blueprintId);
    if (byId) return byId;
  }
  return resolveBlueprintFromText(input.userText);
}

export function isEventsBlueprint(blueprint: CreateBlueprint | null): boolean {
  return blueprint?.specialtyRuntime === "events";
}
