/**
 * 053 — + Add Asset for every Workspace section.
 * Creates a connected instance — never an orphan.
 */

import {
  computeCreationReadiness,
  registerConnectedAsset,
  resolveLargerCreation,
  runPreCreateChecks,
} from "@/lib/creationEcosystem";
import { resolveOwnership } from "@/lib/creationOwnership";
import { persistCreationContinuitySnapshot } from "@/lib/creationContinuity";
import { advanceEventRecordAfterAsset } from "../advanceEventRecordAfterAsset";
import {
  createEventAssetInstance,
  getEventAssetDefinition,
  linksFromEventRecord,
  listEventAssetInstances,
} from "../eventAssetRegistry";
import { syncEventRecordToProjects } from "../projectsBridge";
import { getEventAssetTemplate } from "./templates";
import type { AddAssetConnectionReceipt, AddAssetToSectionInput } from "./types";

/**
 * Add an asset to a section with full ecosystem connection.
 */
export function addAssetToSection(
  input: AddAssetToSectionInput,
): AddAssetConnectionReceipt {
  const reasons: string[] = [];
  const def = getEventAssetDefinition(input.assetTypeId);
  if (!def || def.status === "deprecated") {
    return emptyReceipt(input, ["unknown_or_deprecated_asset_type"]);
  }

  if (!def.eventSections.includes(input.sectionId)) {
    reasons.push("asset_not_primary_for_section_but_allowed");
  }

  const template = input.templateId
    ? getEventAssetTemplate(input.templateId)
    : null;
  if (input.templateId && !template) {
    return emptyReceipt(input, ["unknown_template"]);
  }
  if (template && template.assetTypeId !== input.assetTypeId) {
    return emptyReceipt(input, ["template_asset_mismatch"]);
  }

  const creation = resolveLargerCreation({
    eventRecordId: input.record.id,
    preferActiveEvent: true,
  });

  const createAssetId = def.createAssetRegistryId ?? input.assetTypeId;
  const pre = runPreCreateChecks({
    assetDefId: createAssetId,
    eventRecordId: input.record.id,
    canonicalWorkId: input.record.canonicalWorkId,
    projectHomeId: input.record.projectHomeId,
    creationId: creation?.creationId,
  });
  reasons.push(...pre.reasons);

  const existing = listEventAssetInstances(input.record.id).find(
    (i) =>
      i.assetTypeId === input.assetTypeId &&
      i.status !== "archived" &&
      (i.planningSectionId === input.sectionId || !input.allowVariant),
  );

  if (existing && !input.allowVariant) {
    const readiness = computeCreationReadiness({
      creationId: creation?.creationId ?? input.record.id,
      ecosystem: creation?.ecosystem ?? null,
    });
    const advanced = advanceEventRecordAfterAsset({
      record: input.record,
      sectionId: input.sectionId,
      assetTypeId: input.assetTypeId,
      templateId: template?.templateId ?? existing.templateId ?? null,
    });
    persistCreationContinuitySnapshot(advanced);
    return {
      connected: true,
      duplicated: true,
      instance: existing,
      assetTypeId: input.assetTypeId,
      sectionId: input.sectionId,
      templateId: template?.templateId ?? null,
      eventRecordId: advanced.id,
      creationWorkspaceId: existing.creationWorkspaceId,
      relationshipRegistryKey: existing.relationshipRegistryKey,
      projectHomeId: existing.projectHomeId ?? advanced.projectHomeId,
      readinessPercent: readiness.overallPercent,
      cartographyEligible: def.cartographyEligible,
      reasons: [...reasons, "resumed_existing_instance", "record_advanced"],
      record: advanced,
    };
  }

  // Ensure Project Home / canonical work links exist
  let record = input.record;
  if (!record.projectHomeId || !record.canonicalWorkId) {
    record = syncEventRecordToProjects(record);
    reasons.push("synced_project_home");
  }

  const links = {
    ...linksFromEventRecord(record, {
      creationWorkspaceId: record.canonicalWorkId || record.id,
      sourceBlueprintId: creation?.blueprintId ?? null,
    }),
    planningSectionId: input.sectionId,
    templateId: template?.templateId ?? null,
    displayName:
      input.displayName?.trim() ||
      (template ? `${def.userFacingName} (${template.label})` : undefined),
  };

  const instance = createEventAssetInstance(input.assetTypeId, links);
  if (!instance) {
    return emptyReceipt(input, [...reasons, "instance_create_failed"]);
  }

  const ownership = resolveOwnership({ assetTypeId: input.assetTypeId });
  const creationId =
    creation?.creationId || record.canonicalWorkId || record.id;

  const card = registerConnectedAsset({
    creationId,
    assetDefId: createAssetId,
    label: instance.displayName,
    blueprintId: creation?.blueprintId ?? null,
    projectHomeId: record.projectHomeId,
    eventRecordId: record.id,
    canonicalWorkId: record.canonicalWorkId,
    createdBy: String(ownership.primaryOwner),
    contributorIds: ownership.supportingContributorIds,
    supportsSectionIds: [input.sectionId, ...def.eventSections],
    dependsOnAssetIds: def.dependencies.map((d) => d.assetTypeId),
    status: "draft",
  });

  const readiness = computeCreationReadiness({
    creationId,
    ecosystem: creation?.ecosystem ?? null,
  });

  reasons.push("connected_event_record");
  reasons.push("connected_creation_workspace");
  reasons.push("connected_relationship_registry");
  if (record.projectHomeId) reasons.push("connected_project_home");
  if (def.cartographyEligible) reasons.push("cartography_eligible");
  reasons.push("readiness_updated");
  reasons.push("conversation_context_preserved");

  const advanced = advanceEventRecordAfterAsset({
    record,
    sectionId: input.sectionId,
    assetTypeId: input.assetTypeId,
    templateId: template?.templateId ?? null,
  });
  persistCreationContinuitySnapshot(advanced);
  reasons.push("record_advanced");

  return {
    connected: Boolean(card),
    duplicated: false,
    instance,
    assetTypeId: input.assetTypeId,
    sectionId: input.sectionId,
    templateId: template?.templateId ?? null,
    eventRecordId: advanced.id,
    creationWorkspaceId: instance.creationWorkspaceId,
    relationshipRegistryKey: card?.assetInstanceKey ?? instance.relationshipRegistryKey,
    projectHomeId: advanced.projectHomeId,
    readinessPercent: readiness.overallPercent,
    cartographyEligible: def.cartographyEligible,
    reasons,
    record: advanced,
  };
}

function emptyReceipt(
  input: AddAssetToSectionInput,
  reasons: string[],
): AddAssetConnectionReceipt {
  return {
    connected: false,
    duplicated: false,
    instance: null,
    assetTypeId: input.assetTypeId,
    sectionId: input.sectionId,
    templateId: input.templateId ?? null,
    eventRecordId: input.record.id,
    creationWorkspaceId: input.record.id,
    relationshipRegistryKey: null,
    projectHomeId: input.record.projectHomeId,
    readinessPercent: null,
    cartographyEligible: false,
    reasons,
    record: input.record,
  };
}

/** Every workspace section supports Add Asset (structural guarantee). */
export function sectionSupportsAddAsset(_sectionId: string): true {
  return true;
}
