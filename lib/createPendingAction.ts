/**
 * Create pending-action helpers (P0.10.2) — yes-continuation opens Create with artifact context.
 */

import { containsVisualStructurePhrase } from "./visualStructureRouting";
import {
  detectRegistryArtifact,
  registryArtifactKindToCreateItemType,
  type RegistryArtifactKind,
} from "./artifactRegistry";
import { normalizeArtifactType, shouldLockArtifactType } from "./artifactType";
import { matchCatalogFromText } from "./createCatalog";
import {
  blankScaffoldForType,
  type ResolvedArtifact,
} from "./createInitialization";
import type { AppSection } from "./companionUi";

export type CreatePendingOpenAction = {
  type?: "open_workspace";
  target: AppSection | string;
  artifactType?: string;
  initialPrompt?: string;
};

export type CreatePendingTraceEvent =
  | "saved pending action"
  | "accepted pending action"
  | "target workspace"
  | "artifact type"
  | "workspace opened"
  | "active panel after open";

export function logCreatePendingAction(
  event: CreatePendingTraceEvent,
  detail: Record<string, string | undefined>,
): void {
  if (typeof console === "undefined") return;
  // eslint-disable-next-line no-console
  console.info("[create-pending-action]", event, detail);
}

export function inferCreateItemTypeFromText(
  userText: string,
  artifactKind?: RegistryArtifactKind | null,
): string | undefined {
  if (containsVisualStructurePhrase(userText)) return undefined;
  if (artifactKind) {
    return registryArtifactKindToCreateItemType(artifactKind);
  }
  const detected = detectRegistryArtifact(userText);
  if (detected) {
    return registryArtifactKindToCreateItemType(detected);
  }
  return matchCatalogFromText(userText)?.type ?? undefined;
}

export function isCreateFrictionlessPending(
  pending: CreatePendingOpenAction,
): boolean {
  return pending.target === "content-generator";
}

export function resolvedArtifactFromCreatePending(
  pending: CreatePendingOpenAction,
): ResolvedArtifact | null {
  if (!isCreateFrictionlessPending(pending) || !pending.artifactType) {
    return null;
  }
  const itemType = normalizeArtifactType(pending.artifactType);
  const scaffold = blankScaffoldForType(itemType);
  logCreatePendingAction("artifact type", {
    artifactType: itemType,
    initialPrompt: pending.initialPrompt,
  });
  return {
    itemType,
    title: `New ${itemType}`,
    draftContent: scaffold,
    source: "blank",
    artifactTypeLocked: shouldLockArtifactType(itemType),
  };
}
