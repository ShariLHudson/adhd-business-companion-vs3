/**
 * 050 — Canonical Ownership Registry.
 * One primary owner per blueprint and asset type. No competing owners.
 */

import { listCreateBlueprints } from "@/lib/platformIntent/blueprintRegistry";
import { listEventAssetDefinitions } from "@/lib/eventsIntelligence";
import { enrichmentForBlueprint } from "./blueprintOwnershipTable";
import { enrichmentForAsset } from "./assetOwnershipTable";
import type {
  CreationContributorDefinition,
  CreationOwnershipDefinition,
} from "./types";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

function contributorsFrom(
  ids: readonly ChamberMemberId[],
): CreationContributorDefinition[] {
  return ids.map((chamberMemberId) => ({
    chamberMemberId,
    role: "supporting" as const,
  }));
}

function defaultRules(requiredContributorHint?: ChamberMemberId[]): {
  required: CreationOwnershipDefinition["requiredCollaborationRules"];
  optional: CreationOwnershipDefinition["optionalCollaborationRules"];
} {
  return {
    required: [
      {
        id: "specialist_review",
        description: "Engage a contributor when specialist review is needed.",
        required: true,
        trigger: "specialist_review",
        contributorIds: requiredContributorHint,
      },
      {
        id: "user_requests_perspective",
        description: "Engage when the user asks for another perspective.",
        required: true,
        trigger: "user_requests_perspective",
      },
    ],
    optional: [
      {
        id: "material_improvement",
        description: "Optional collaboration when it materially improves the result.",
        required: false,
        trigger: "material_improvement",
      },
      {
        id: "spans_domains",
        description: "Optional when the creation clearly spans domains.",
        required: false,
        trigger: "spans_domains",
      },
    ],
  };
}

function fromBlueprint(): CreationOwnershipDefinition[] {
  return listCreateBlueprints()
    .filter((bp) => bp.ownerChamberMemberId)
    .map((bp) => {
      const enrich = enrichmentForBlueprint(bp.id);
      const primary = bp.ownerChamberMemberId as ChamberMemberId;
      const supporting = (enrich?.supporting ?? []).filter((id) => id !== primary);
      const rules = defaultRules([...supporting]);
      return {
        ownershipId: `own-bp-${bp.id}`,
        objectType: "blueprint" as const,
        objectId: bp.id,
        canonicalName: bp.label,
        primaryOwner: primary,
        supportingContributors: contributorsFrom(supporting),
        boardAdvisors: (enrich?.boardAdvisors ?? []).map((advisorId) => ({
          advisorId,
          role: "advisor" as const,
        })),
        requiredCollaborationRules: rules.required,
        optionalCollaborationRules: rules.optional,
        escalationRules: [
          {
            id: "defer_owner",
            description: "Defer conflicts to the Primary Owner.",
            escalateTo: primary,
          },
        ],
        completionAuthority: primary,
        qualityCertificationAuthority: "shared_certification_pipeline" as const,
        conflictResolutionPolicy: "defer_to_primary_owner" as const,
        aliases: [...bp.aliases],
        version: "050.1",
        status: "active" as const,
        workspaceCoordinator: enrich?.workspaceCoordinator ?? null,
      };
    });
}

function fromEventAssets(): CreationOwnershipDefinition[] {
  return listEventAssetDefinitions().map((def) => {
    const enrich = enrichmentForAsset(def.assetTypeId);
    const primary =
      enrich?.primaryOwner ?? def.primaryChamberOwner;
    const supportingRaw = enrich?.supporting?.length
      ? enrich.supporting
      : def.supportingChamberMembers;
    const supporting = supportingRaw.filter((id) => id !== primary);
    const board = enrich?.boardAdvisors?.length
      ? enrich.boardAdvisors
      : def.suggestedBoardAdvisors;
    const rules = defaultRules([...supporting]);
    const aliases = [
      ...def.aliases,
      ...(enrich?.aliases ?? []),
      def.userFacingName.toLowerCase(),
      def.canonicalName.toLowerCase(),
    ];
    return {
      ownershipId: `own-asset-${def.assetTypeId}`,
      objectType: "asset_type" as const,
      objectId: def.assetTypeId,
      canonicalName: def.canonicalName,
      primaryOwner: primary,
      supportingContributors: contributorsFrom(supporting),
      boardAdvisors: [...board].map((advisorId) => ({
        advisorId: String(advisorId),
        role: "advisor" as const,
      })),
      requiredCollaborationRules: rules.required,
      optionalCollaborationRules: rules.optional,
      escalationRules: [
        {
          id: "defer_owner",
          description: "Asset conflicts defer to the asset Primary Owner.",
          escalateTo: primary,
        },
      ],
      completionAuthority: primary,
      qualityCertificationAuthority: "shared_certification_pipeline" as const,
      conflictResolutionPolicy: "owner_synthesizes_then_ask_user" as const,
      aliases: [...new Set(aliases.map((a) => a.toLowerCase()))],
      version: def.version || "050.1",
      status: def.status,
      workspaceCoordinator: enrich?.workspaceCoordinator ?? "events",
    };
  });
}

/** Event Creation Workspace — coordinator is Events */
const WORKSPACE_OWNERS: CreationOwnershipDefinition[] = [
  {
    ownershipId: "own-ws-event-creation",
    objectType: "workspace_type",
    objectId: "event_creation_workspace",
    canonicalName: "Event Creation Workspace",
    primaryOwner: "events",
    supportingContributors: contributorsFrom([
      "finance",
      "marketing",
      "content",
      "project-management",
      "client-relationships",
      "leadership",
      "learning",
      "creative-studio",
    ]),
    boardAdvisors: [],
    requiredCollaborationRules: defaultRules().required,
    optionalCollaborationRules: defaultRules().optional,
    escalationRules: [
      {
        id: "defer_events",
        description: "Workspace coordination stays with Events Intelligence.",
        escalateTo: "events",
      },
    ],
    completionAuthority: "events",
    qualityCertificationAuthority: "shared_certification_pipeline",
    conflictResolutionPolicy: "defer_to_primary_owner",
    aliases: ["event workspace", "event creation workspace", "workshop workspace"],
    version: "050.1",
    status: "active",
    workspaceCoordinator: "events",
  },
];

let CACHE: CreationOwnershipDefinition[] | null = null;

export function listOwnershipDefinitions(): readonly CreationOwnershipDefinition[] {
  if (!CACHE) {
    CACHE = [...fromBlueprint(), ...fromEventAssets(), ...WORKSPACE_OWNERS];
  }
  return CACHE;
}

/** Test helper — rebuild after registry mutations */
export function clearOwnershipRegistryCache(): void {
  CACHE = null;
}

export function getOwnershipById(
  ownershipId: string,
): CreationOwnershipDefinition | null {
  return (
    listOwnershipDefinitions().find((d) => d.ownershipId === ownershipId) ??
    null
  );
}

export function getOwnershipForObject(
  objectType: CreationOwnershipDefinition["objectType"],
  objectId: string,
): CreationOwnershipDefinition | null {
  return (
    listOwnershipDefinitions().find(
      (d) => d.objectType === objectType && d.objectId === objectId,
    ) ?? null
  );
}

export function resolveOwnershipAlias(
  text: string,
): CreationOwnershipDefinition | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  let best: { def: CreationOwnershipDefinition; len: number } | null = null;
  for (const def of listOwnershipDefinitions()) {
    for (const alias of def.aliases) {
      const a = alias.toLowerCase();
      if (t === a || t.includes(a) || a.includes(t)) {
        if (!best || a.length > best.len) best = { def, len: a.length };
      }
    }
    const name = def.canonicalName.toLowerCase();
    if (t === name || t.includes(name)) {
      if (!best || name.length > best.len) best = { def, len: name.length };
    }
  }
  return best?.def ?? null;
}

/** Integrity: every active blueprint/asset ownership has exactly one primary owner */
export function assertOwnershipRegistryIntegrity(): string[] {
  const errors: string[] = [];
  const seenBp = new Set<string>();
  const seenAsset = new Set<string>();

  for (const def of listOwnershipDefinitions()) {
    if (!def.primaryOwner) {
      errors.push(`${def.ownershipId}: missing primary owner`);
    }
    if (def.objectType === "blueprint") {
      if (seenBp.has(def.objectId)) {
        errors.push(`Duplicate blueprint ownership: ${def.objectId}`);
      }
      seenBp.add(def.objectId);
    }
    if (def.objectType === "asset_type") {
      if (seenAsset.has(def.objectId)) {
        errors.push(`Duplicate asset ownership: ${def.objectId}`);
      }
      seenAsset.add(def.objectId);
    }
    const contributorAlsoOwner = def.supportingContributors.some(
      (c) => c.chamberMemberId === def.primaryOwner,
    );
    if (contributorAlsoOwner) {
      errors.push(
        `${def.ownershipId}: primary owner listed as supporting contributor`,
      );
    }
  }

  for (const bp of listCreateBlueprints()) {
    if (!bp.ownerChamberMemberId) continue;
    if (!seenBp.has(bp.id)) {
      errors.push(`Blueprint missing ownership entry: ${bp.id}`);
    }
  }

  return errors;
}
