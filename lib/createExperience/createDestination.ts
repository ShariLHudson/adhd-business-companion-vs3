/**
 * Create destination availability — split into two independent concerns:
 *
 *  1. ROOM availability: the Create room (section "create", the
 *     CreationWorkspacePanel) is ALWAYS navigable, like Projects. Navigating to
 *     it must never return blocked_unavailable or show the global
 *     "This Create room is still being prepared…" placeholder.
 *
 *  2. ARTIFACT execution availability: an individual requested artifact type
 *     (the legacy content-generator workspace) may still be unavailable. That is
 *     evaluated AFTER the room opens and surfaced as an artifact-level state —
 *     never as the room-level placeholder for simple navigation.
 *
 * The internal "content-generator" route and "creative-studio" alias may remain;
 * the user-visible destination name is "Create".
 */

import type { CreationTurnEnvelope } from "@/lib/createIntent/creationTurnEnvelope";
import { resolveLegacyCreateWorkspaceGuard } from "./blockLegacyCreateWorkspaceRouting";

/** The Create room destination is always available (room-level navigation). */
export function isCreateRoomNavigable(): boolean {
  return true;
}

/** Context carried into the Create room so the request is never lost. */
export type CreateRoomEntry = {
  intendedArtifact: string | null;
  originalUserText: string;
  turnId: string;
  routingProvenance: string;
  explicitNavigation: boolean;
  createEligible: boolean;
};

/** Build the room-entry context from the immutable turn envelope. */
export function buildCreateRoomEntry(
  envelope: CreationTurnEnvelope,
  originalUserText: string,
): CreateRoomEntry {
  return {
    intendedArtifact: envelope.intendedArtifact,
    originalUserText,
    turnId: envelope.turnId,
    routingProvenance: envelope.routingProvenance,
    explicitNavigation: envelope.explicitCreateNavigation,
    createEligible: envelope.createEligible,
  };
}

export type ArtifactExecutionOutcome =
  | "workspace_created"
  | "workspace_opened"
  | "needs_creation_input"
  | "artifact_unavailable";

/**
 * Evaluate the requested artifact AFTER the room is open. This is the
 * artifact-level guard — separate from room navigation. A blocked artifact
 * resolves to `artifact_unavailable` (surfaced inside Create), NOT the room
 * placeholder.
 */
export function resolveArtifactExecutionOutcome(input: {
  userText: string;
  itemType?: string | null;
  alreadyOpen?: boolean;
}): ArtifactExecutionOutcome {
  const guard = resolveLegacyCreateWorkspaceGuard({
    section: "content-generator",
    userText: input.userText,
    itemType: input.itemType ?? null,
    alreadyOpen: input.alreadyOpen,
  });
  if (guard.kind === "prepared_state") return "artifact_unavailable";
  // "allow"/other → the artifact workspace can open.
  return "workspace_opened";
}
