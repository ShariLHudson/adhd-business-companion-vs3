/**
 * 051 / 053 — asset creation via Event Capability Registry + Add Asset path.
 */

import { addAssetToSection } from "@/lib/eventsIntelligence/eventCapabilityRegistry";
import { getEventAssetDefinition } from "@/lib/eventsIntelligence";
import type {
  EventAssetInstance,
  EventRecord,
  EventSectionId,
} from "@/lib/eventsIntelligence";
import { resolveCreationOwnership } from "./ownershipResolver";

export type AssetCreationCoordResult = {
  created: boolean;
  skippedDuplicate: boolean;
  instance: EventAssetInstance | null;
  owner: string;
  reasons: string[];
  relationshipRegistryKey: string | null;
  projectHomeId: string | null;
  readinessPercent: number | null;
  /** Event Record after section/lifecycle advance */
  record: EventRecord | null;
};

export function coordinateAssetCreation(input: {
  assetTypeId: string;
  record: EventRecord;
  creationWorkspaceId?: string | null;
  sectionId?: EventSectionId | null;
  templateId?: string | null;
}): AssetCreationCoordResult {
  const def = getEventAssetDefinition(input.assetTypeId);
  if (!def) {
    return {
      created: false,
      skippedDuplicate: false,
      instance: null,
      owner: "events",
      reasons: ["unknown_asset_type"],
      relationshipRegistryKey: null,
      projectHomeId: null,
      readinessPercent: null,
      record: input.record,
    };
  }

  const sectionId =
    input.sectionId ??
    (def.eventSections[0] as EventSectionId | undefined) ??
    "agenda";

  const receipt = addAssetToSection({
    record: input.record,
    sectionId,
    assetTypeId: input.assetTypeId,
    templateId: input.templateId,
  });

  const ownership = resolveCreationOwnership({
    assetTypeId: input.assetTypeId,
  });

  return {
    created: receipt.connected && !receipt.duplicated,
    skippedDuplicate: receipt.duplicated,
    instance: receipt.instance,
    owner: ownership.primaryOwner,
    reasons: receipt.reasons,
    relationshipRegistryKey: receipt.relationshipRegistryKey,
    projectHomeId: receipt.projectHomeId,
    readinessPercent: receipt.readinessPercent,
    record: receipt.record,
  };
}
