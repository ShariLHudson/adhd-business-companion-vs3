/**
 * Post-handoff synchronization preview — never silent sync.
 */

import type { CreationWorkspace } from "../types";
import type { CreationWorkspaceHandoffRegistryEntry } from "./contracts";
import { listHandoffRegistryEntries, updateHandoffRegistryEntry } from "./registry";

export type SyncPreviewAction =
  | "update_destination"
  | "keep_destination"
  | "create_new_version"
  | "review_differences";

export type DestinationSyncPreview = {
  workspaceId: string;
  handoffId: string;
  destination: CreationWorkspaceHandoffRegistryEntry["destination"];
  destinationEntityId: string | null;
  affectedItemIds: string[];
  affectedTitles: string[];
  destinationEditsPreserved: string[];
  actions: SyncPreviewAction[];
  message: string;
};

export function buildDestinationSyncPreview(input: {
  workspace: CreationWorkspace;
  editedItemId: string;
}): DestinationSyncPreview | null {
  const linked = listHandoffRegistryEntries().filter(
    (e) =>
      e.workspaceId === input.workspace.id &&
      (e.status === "completed" ||
        e.status === "consumed" ||
        e.status === "approved") &&
      Boolean(e.destinationEntityId),
  );
  if (!linked.length) return null;
  const item = input.workspace.items.find((i) => i.id === input.editedItemId);
  if (!item) return null;
  const primary = linked[0]!;
  return {
    workspaceId: input.workspace.id,
    handoffId: primary.handoffId,
    destination: primary.destination,
    destinationEntityId: primary.destinationEntityId,
    affectedItemIds: [item.id],
    affectedTitles: [item.title],
    destinationEditsPreserved: item.userEdited
      ? ["Destination-owned edits will be preserved until you approve an update."]
      : [],
    actions: [
      "review_differences",
      "update_destination",
      "keep_destination",
      "create_new_version",
    ],
    message: `You updated “${item.title}” after handing work to ${primary.destination}. Review differences before updating the destination.`,
  };
}

export function applySyncPreviewDecision(input: {
  handoffId: string;
  action: SyncPreviewAction;
}): { ok: true; action: SyncPreviewAction } | { ok: false; reason: string } {
  if (input.action === "keep_destination") {
    return { ok: true, action: input.action };
  }
  if (input.action === "review_differences") {
    return { ok: true, action: input.action };
  }
  if (
    input.action === "update_destination" ||
    input.action === "create_new_version"
  ) {
    updateHandoffRegistryEntry(input.handoffId, {
      lastSynchronizationAt: new Date().toISOString(),
      status:
        input.action === "create_new_version" ? "prepared" : "approved",
    });
    return { ok: true, action: input.action };
  }
  return { ok: false, reason: "Unknown sync action." };
}
