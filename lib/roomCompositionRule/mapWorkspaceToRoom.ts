import { resolvePlace } from "@/lib/companionConstitution";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";

/**
 * @deprecated Use resolveEnvironment() / resolvePlace() from companionConstitution.
 * Retained as a thin delegate — no independent room authority.
 */
export function placeForWorkspace(workspaceId?: string): CompanionPlaceId {
  return resolvePlace({ workspaceId });
}
