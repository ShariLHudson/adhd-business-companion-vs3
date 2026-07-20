/**
 * 050 — Every contributor receives Creation Context (no re-ask / no restart).
 */

import {
  buildCreationConversationContext,
  resolveLargerCreation,
} from "@/lib/creationEcosystem";
import { resolveOwnership } from "./resolveOwnership";
import type { ContributorContextPacket } from "./types";

export function buildContributorContextPacket(input: {
  eventRecordId?: string | null;
  creationId?: string | null;
  assetTypeId?: string | null;
  blueprintId?: string | null;
  latestUserGoal?: string;
  requestedContributionScope?: string;
}): ContributorContextPacket | null {
  const creation = resolveLargerCreation({
    eventRecordId: input.eventRecordId,
    creationId: input.creationId,
    preferActiveEvent: true,
  });
  if (!creation) return null;

  const conv = buildCreationConversationContext(creation);
  const ownership = resolveOwnership({
    assetTypeId: input.assetTypeId,
    blueprintId: input.blueprintId ?? creation.blueprintId,
  });
  const event = creation.eventRecord;

  const knownFacts = [
    conv.purpose ? `purpose: ${conv.purpose}` : null,
    conv.audience ? `audience: ${conv.audience}` : null,
    conv.outcomes ? `outcomes: ${conv.outcomes}` : null,
    event?.eventTypeLabel ? `event_type: ${event.eventTypeLabel}` : null,
    event?.dates?.trim() ? `dates: ${event.dates}` : null,
  ].filter(Boolean) as string[];

  return {
    creationId: creation.creationId,
    creationName: conv.creationName,
    creationType: conv.creationType,
    purpose: conv.purpose,
    audience: conv.audience,
    outcomes: conv.outcomes,
    currentPhase: event?.lifecyclePhase ?? conv.completedPhases[0] ?? "discovery",
    currentAssetId: input.assetTypeId ?? null,
    knownFacts,
    priorDecisions: conv.knownDecisions,
    completedSections: conv.completedPhases,
    existingAssets: conv.existingAssetLabels,
    doNotReask: conv.doNotReask,
    latestUserGoal: input.latestUserGoal?.trim() || "Continue this creation",
    requestedContributionScope:
      input.requestedContributionScope?.trim() ||
      "Contribute within owner guidance — do not restart discovery",
    primaryOwner: String(ownership.primaryOwner),
    workspaceCoordinator:
      ownership.definition?.workspaceCoordinator ??
      (creation.eventRecord ? "events" : null),
  };
}

/** Compact block for Chamber / Board contributor prompts */
export function formatContributorContextForPrompt(
  packet: ContributorContextPacket,
): string {
  return [
    `Creation: ${packet.creationName} (${packet.creationType})`,
    `Primary owner: ${packet.primaryOwner}`,
    packet.workspaceCoordinator
      ? `Workspace coordinator: ${packet.workspaceCoordinator}`
      : null,
    packet.purpose ? `Purpose: ${packet.purpose}` : null,
    packet.audience ? `Audience: ${packet.audience}` : null,
    `Phase: ${packet.currentPhase}`,
    packet.currentAssetId ? `Current asset: ${packet.currentAssetId}` : null,
    packet.existingAssets.length
      ? `Existing assets: ${packet.existingAssets.join(", ")}`
      : null,
    `Do not re-ask: ${packet.doNotReask.join(", ") || "nothing established yet"}`,
    `Contribution scope: ${packet.requestedContributionScope}`,
    `User goal: ${packet.latestUserGoal}`,
    "Rules: one connected result · no separate Creation Record · no competing draft · Shari voice",
  ]
    .filter(Boolean)
    .join("\n");
}
