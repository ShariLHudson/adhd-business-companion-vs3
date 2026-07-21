/**
 * 051 — Ownership resolution (delegates to 050 Ownership Registry).
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { CreateBlueprint } from "@/lib/platformIntent/types";
import { resolveOwnership } from "@/lib/creationOwnership";

export type OwnershipResolution = {
  primaryOwner: ChamberMemberId | string;
  contributorIds: ChamberMemberId[];
  source: "blueprint" | "asset" | "events_default" | "registry";
  workspaceCoordinator?: ChamberMemberId | string | null;
  boardAdvisorIds?: string[];
};

export function resolveCreationOwnership(input: {
  blueprint?: CreateBlueprint | null;
  assetTypeId?: string | null;
}): OwnershipResolution {
  const resolved = resolveOwnership({
    blueprintId: input.blueprint?.id,
    assetTypeId: input.assetTypeId,
  });

  if (resolved.source === "default" && !input.blueprint && !input.assetTypeId) {
    return {
      primaryOwner: "events",
      contributorIds: [],
      source: "events_default",
    };
  }

  return {
    primaryOwner: resolved.primaryOwner,
    contributorIds: resolved.supportingContributorIds,
    source:
      resolved.source === "registry"
        ? "registry"
        : resolved.source === "asset"
          ? "asset"
          : resolved.source === "blueprint"
            ? "blueprint"
            : "events_default",
    workspaceCoordinator: resolved.definition?.workspaceCoordinator ?? null,
    boardAdvisorIds: resolved.boardAdvisorIds,
  };
}
