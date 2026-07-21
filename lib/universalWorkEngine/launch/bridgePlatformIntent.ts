/**
 * Bridge platformIntent CreateBlueprint aliases → Universal Launch Contract.
 * Replaces silent legacy template fallthrough with UWE Blueprint ids.
 */

import { mapLegacyCreateBlueprintToUwe } from "./inferWorkTypeAndBlueprint";
import { resolveAnywhereOriginWork } from "./resolveAnywhereOriginWork";
import type { AnywhereOriginResolution, UniversalLaunchContract } from "./types";

/**
 * When platformIntent would launch/resume Create, resolve through Anywhere-Origin.
 */
export function resolvePlatformIntentViaAnywhereOrigin(input: {
  userText: string;
  origin?: UniversalLaunchContract["origin"];
  legacyCreateBlueprintId?: string | null;
  hasActiveCreation?: boolean;
  relatedWorkId?: string | null;
  forceNew?: boolean;
}): AnywhereOriginResolution {
  const uweBlueprint = mapLegacyCreateBlueprintToUwe(
    input.legacyCreateBlueprintId,
  );

  return resolveAnywhereOriginWork({
    origin: input.origin ?? "conversation",
    originalUserMessage: input.userText,
    candidateBlueprintId: uweBlueprint,
    relatedWorkId: input.relatedWorkId ?? null,
    forceNew: input.forceNew,
    // Resume path: prefer continue when active creation exists
    ...(input.hasActiveCreation && !input.forceNew && input.relatedWorkId
      ? { relatedWorkId: input.relatedWorkId }
      : {}),
  });
}
