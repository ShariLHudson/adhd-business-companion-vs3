/**
 * 050 — Resolve primary owner for blueprints, assets, and aliases.
 */

import {
  getCreateBlueprintById,
  resolveBlueprintFromText,
} from "@/lib/platformIntent/blueprintRegistry";
import { getEventAssetDefinition } from "@/lib/eventsIntelligence";
import {
  getOwnershipForObject,
  resolveOwnershipAlias,
} from "./ownershipRegistry";
import { enrichmentForAsset } from "./assetOwnershipTable";
import type { OwnershipResolutionResult } from "./types";

export function resolveOwnership(input: {
  blueprintId?: string | null;
  assetTypeId?: string | null;
  workspaceTypeId?: string | null;
  text?: string | null;
}): OwnershipResolutionResult {
  if (input.assetTypeId) {
    const reg = getOwnershipForObject("asset_type", input.assetTypeId);
    if (reg) {
      return fromDef(reg, "registry");
    }
    const def = getEventAssetDefinition(input.assetTypeId);
    const enrich = enrichmentForAsset(input.assetTypeId);
    if (def) {
      return {
        definition: null,
        primaryOwner: enrich?.primaryOwner ?? def.primaryChamberOwner,
        supportingContributorIds: [
          ...(enrich?.supporting ?? def.supportingChamberMembers),
        ].filter(
          (id) => id !== (enrich?.primaryOwner ?? def.primaryChamberOwner),
        ),
        boardAdvisorIds: def.suggestedBoardAdvisors.map(String),
        completionAuthority: enrich?.primaryOwner ?? def.primaryChamberOwner,
        conflictPolicy: "owner_synthesizes_then_ask_user",
        source: "asset",
        singleOwner: true,
      };
    }
  }

  if (input.blueprintId) {
    const reg = getOwnershipForObject("blueprint", input.blueprintId);
    if (reg) return fromDef(reg, "registry");
    const bp = getCreateBlueprintById(input.blueprintId);
    if (bp?.ownerChamberMemberId) {
      return {
        definition: null,
        primaryOwner: bp.ownerChamberMemberId,
        supportingContributorIds: [],
        boardAdvisorIds: [],
        completionAuthority: bp.ownerChamberMemberId,
        conflictPolicy: "defer_to_primary_owner",
        source: "blueprint",
        singleOwner: true,
      };
    }
  }

  if (input.workspaceTypeId) {
    const reg = getOwnershipForObject("workspace_type", input.workspaceTypeId);
    if (reg) return fromDef(reg, "registry");
  }

  if (input.text?.trim()) {
    const byAlias = resolveOwnershipAlias(input.text);
    if (byAlias) return fromDef(byAlias, "registry");
    const bp = resolveBlueprintFromText(input.text);
    if (bp?.ownerChamberMemberId) {
      const reg = getOwnershipForObject("blueprint", bp.id);
      if (reg) return fromDef(reg, "registry");
      return {
        definition: null,
        primaryOwner: bp.ownerChamberMemberId,
        supportingContributorIds: [],
        boardAdvisorIds: [],
        completionAuthority: bp.ownerChamberMemberId,
        conflictPolicy: "defer_to_primary_owner",
        source: "blueprint",
        singleOwner: true,
      };
    }
  }

  return {
    definition: null,
    primaryOwner: "shari",
    supportingContributorIds: [],
    boardAdvisorIds: [],
    completionAuthority: "shari",
    conflictPolicy: "evidence_and_user_context",
    source: "default",
    singleOwner: true,
  };
}

function fromDef(
  reg: NonNullable<ReturnType<typeof getOwnershipForObject>>,
  source: OwnershipResolutionResult["source"],
): OwnershipResolutionResult {
  return {
    definition: reg,
    primaryOwner: reg.primaryOwner,
    supportingContributorIds: reg.supportingContributors.map(
      (c) => c.chamberMemberId,
    ),
    boardAdvisorIds: reg.boardAdvisors.map((b) => String(b.advisorId)),
    completionAuthority: reg.completionAuthority,
    conflictPolicy: reg.conflictResolutionPolicy,
    source,
    singleOwner: true,
  };
}
