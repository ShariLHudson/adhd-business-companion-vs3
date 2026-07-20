/**
 * 049 — Connect a generated asset into the living Creation Ecosystem.
 */

import { getCreateAssetById } from "@/lib/createAssets";
import type { CreationEcosystemRecord } from "@/lib/createAssets";
import { getCreationEcosystemById } from "@/lib/createAssets/ecosystems";
import { registerConnectedAsset } from "./relationshipRegistry";
import { computeCreationReadiness } from "./readiness";
import { runPreCreateChecks } from "./preCreateChecks";
import type { AssetRelationshipCard, CreationReadinessSnapshot } from "./types";

export type ConnectAssetResult = {
  connected: boolean;
  duplicated: boolean;
  card: AssetRelationshipCard | null;
  readiness: CreationReadinessSnapshot | null;
  reasons: string[];
};

/**
 * After an asset instance is accepted/generated — register relationships.
 * Never orphan. Never duplicate when similar already exists.
 */
export function connectGeneratedAssetToEcosystem(input: {
  ecosystem: CreationEcosystemRecord;
  assetDefId: string;
  createdBy?: string;
}): ConnectAssetResult {
  const checks = runPreCreateChecks({
    assetDefId: input.assetDefId,
    eventRecordId: input.ecosystem.eventRecordId,
    canonicalWorkId: input.ecosystem.canonicalWorkId,
    projectHomeId: input.ecosystem.projectHomeId,
    creationId: input.ecosystem.canonicalWorkId || input.ecosystem.id,
  });

  if (checks.similarExists && checks.creation) {
    // Still ensure registry card exists for the existing instance
    const def = getCreateAssetById(input.assetDefId);
    const creationId =
      checks.creation.creationId ||
      input.ecosystem.canonicalWorkId ||
      input.ecosystem.id;
    const card = registerConnectedAsset({
      creationId,
      assetDefId: input.assetDefId,
      label: def?.name ?? input.assetDefId,
      blueprintId: input.ecosystem.blueprintId,
      projectHomeId: input.ecosystem.projectHomeId,
      eventRecordId: input.ecosystem.eventRecordId,
      canonicalWorkId: input.ecosystem.canonicalWorkId,
      createdBy:
        input.createdBy ||
        def?.primaryChamberMemberId ||
        "events",
      contributorIds: def?.supportingChamberMemberIds ?? [],
      supportsSectionIds: inferSupportsSections(input.assetDefId),
      dependsOnAssetIds: def?.dependencyAssetIds ?? [],
      status: "draft",
    });
    const ecoDef = getCreationEcosystemById(input.ecosystem.ecosystemId);
    const readiness = computeCreationReadiness({
      creationId,
      ecosystem: input.ecosystem,
      expectedAssetIds: ecoDef?.assets.map((a) => a.assetId),
    });
    return {
      connected: true,
      duplicated: true,
      card,
      readiness,
      reasons: checks.reasons,
    };
  }

  if (!checks.shouldCreateNewAsset) {
    return {
      connected: false,
      duplicated: true,
      card: null,
      readiness: null,
      reasons: checks.reasons,
    };
  }

  const def = getCreateAssetById(input.assetDefId);
  const creationId =
    input.ecosystem.canonicalWorkId ||
    input.ecosystem.eventRecordId ||
    input.ecosystem.id;

  const card = registerConnectedAsset({
    creationId,
    assetDefId: input.assetDefId,
    label: def?.name ?? input.assetDefId,
    blueprintId: input.ecosystem.blueprintId,
    projectHomeId: input.ecosystem.projectHomeId,
    eventRecordId: input.ecosystem.eventRecordId,
    canonicalWorkId: input.ecosystem.canonicalWorkId,
    createdBy:
      input.createdBy || def?.primaryChamberMemberId || "events",
    contributorIds: def?.supportingChamberMemberIds ?? [],
    supportsSectionIds: inferSupportsSections(input.assetDefId),
    dependsOnAssetIds: def?.dependencyAssetIds ?? [],
    status: "draft",
  });

  const ecoDef = getCreationEcosystemById(input.ecosystem.ecosystemId);
  const readiness = computeCreationReadiness({
    creationId,
    ecosystem: input.ecosystem,
    expectedAssetIds: ecoDef?.assets.map((a) => a.assetId),
  });

  return {
    connected: true,
    duplicated: false,
    card,
    readiness,
    reasons: [
      ...checks.reasons,
      "Asset registered in Relationship Registry.",
      readiness
        ? `Readiness updated: ${readiness.overallPercent}% overall.`
        : "Readiness unchanged.",
    ],
  };
}

function inferSupportsSections(assetDefId: string): string[] {
  const map: Record<string, string[]> = {
    "asset-registration-form": ["registration"],
    "asset-confirmation-email": ["registration", "communications"],
    "asset-reminder-email": ["registration", "communications"],
    "asset-agenda": ["agenda"],
    "asset-session-plans": ["agenda"],
    "asset-speaker-packet": ["speakers"],
    "asset-budget": ["budget"],
    "asset-venue-notes": ["venue"],
    "asset-vendor-list": ["vendors"],
    "asset-volunteer-handbook": ["volunteers"],
    "asset-welcome-guide": ["attendee_experience"],
    "asset-run-of-show": ["run_of_show", "production"],
    "asset-tech-checklist": ["technology"],
    "asset-thank-you-email": ["post_event_follow_up"],
    "asset-debrief": ["measurement", "archive_and_reuse"],
  };
  return map[assetDefId] ?? [];
}
