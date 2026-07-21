/**
 * 054 — Assemble connection + conversation context for the editor.
 */

import {
  buildCreationConversationContext,
  resolveLargerCreation,
} from "@/lib/creationEcosystem";
import { resolveOwnership } from "@/lib/creationOwnership";
import type { EventAssetInstance } from "@/lib/eventsIntelligence/eventAssetRegistry/types";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import type { ConnectedAssetConnectionBundle } from "./types";

export function assembleConnectionBundle(input: {
  instance: EventAssetInstance;
  record?: EventRecord | null;
  conversationGoal?: string | null;
}): ConnectedAssetConnectionBundle {
  const creation = resolveLargerCreation({
    eventRecordId: input.instance.eventRecordId,
    canonicalWorkId: input.instance.canonicalWorkId,
    preferActiveEvent: true,
  });
  const conv = creation
    ? buildCreationConversationContext(creation)
    : null;
  const ownership = resolveOwnership({
    assetTypeId: input.instance.assetTypeId,
  });

  const knownFacts: string[] = [];
  if (conv?.purpose) knownFacts.push(`purpose: ${conv.purpose}`);
  if (conv?.audience) knownFacts.push(`audience: ${conv.audience}`);
  if (conv?.outcomes) knownFacts.push(`outcomes: ${conv.outcomes}`);
  if (input.record?.eventTypeLabel) {
    knownFacts.push(`event_type: ${input.record.eventTypeLabel}`);
  }

  return {
    creationRecordId:
      creation?.creationId ||
      input.instance.canonicalWorkId ||
      input.instance.eventRecordId,
    eventRecordId: input.instance.eventRecordId,
    workspaceId: input.instance.creationWorkspaceId,
    projectHomeId:
      input.instance.projectHomeId ??
      creation?.projectHomeId ??
      input.record?.projectHomeId ??
      null,
    relationshipRegistryKey: input.instance.relationshipRegistryKey,
    primaryOwner: String(ownership.primaryOwner),
    supportingContributorIds: ownership.supportingContributorIds,
    knownFacts,
    doNotReask: conv?.doNotReask ?? [],
    currentPhase: input.record?.lifecyclePhase ?? null,
    sectionId: input.instance.planningSectionId,
    conversationGoal: input.conversationGoal ?? null,
  };
}
