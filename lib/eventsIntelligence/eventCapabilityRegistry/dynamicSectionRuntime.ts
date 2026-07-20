/**
 * 053 — Dynamic Section Runtime
 * Loads Capabilities · Asset Types · Templates per section — never hardcodes lists.
 */

import { EVENT_SECTION_DEFS } from "../eventSections";
import type { EventRecord, EventSectionId } from "../types";
import { getEventAssetDefinition } from "../eventAssetRegistry/query";
import {
  buildSectionAssetPanel,
  registryCapabilitiesForSection,
} from "../eventAssetRegistry/sectionCapabilityPanel";
import { capabilitiesForSection } from "./capabilityCatalog";
import { templatesForSectionAssetTypes } from "./templates";
import type { DynamicSectionRuntimePanel } from "./types";

/**
 * Build the full three-layer panel for one Workspace section.
 */
export function buildDynamicSectionRuntimePanel(
  record: EventRecord,
  sectionId: EventSectionId,
): DynamicSectionRuntimePanel {
  const base = buildSectionAssetPanel(record, sectionId);
  const capabilities = capabilitiesForSection(sectionId, {
    format: record.format,
    eventType: record.eventType,
  });

  // Asset types: union of section registry assets + capability-linked assets
  const fromRegistry = registryCapabilitiesForSection(
    sectionId,
    record.eventType,
  );
  const fromCapabilities = capabilities.flatMap((c) =>
    c.assetTypeIds
      .map((id) => getEventAssetDefinition(id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d && d.status !== "deprecated")),
  );

  const byId = new Map<string, (typeof fromRegistry)[number]>();
  for (const d of [...fromRegistry, ...fromCapabilities]) {
    byId.set(d.assetTypeId, d);
  }
  const assetTypes = [...byId.values()];

  const templates = templatesForSectionAssetTypes(
    assetTypes.map((a) => a.assetTypeId),
  );

  return {
    sectionId,
    sectionTitle:
      EVENT_SECTION_DEFS.find((s) => s.id === sectionId)?.title ?? sectionId,
    planningNotes: base.planningNotes,
    capabilities,
    assetTypes,
    templates,
    createdAssets: base.createdAssets,
    recommendedAssets: base.recommendedAssets,
    archivedAssets: base.archivedAssets,
    supportsAddAsset: true,
  };
}

/**
 * Build runtime panels for focus sections (workspace clean — not every section at once).
 */
export function buildFocusSectionRuntimePanels(
  record: EventRecord,
  focusSectionIds: readonly EventSectionId[],
): DynamicSectionRuntimePanel[] {
  return focusSectionIds.map((id) =>
    buildDynamicSectionRuntimePanel(record, id),
  );
}

/** Structural: no section template may ship a hardcoded asset dump. */
export function dynamicSectionsLoadFromRegistryOnly(): boolean {
  return (
    capabilitiesForSection("agenda").length > 0 &&
    registryCapabilitiesForSection("agenda").length > 0
  );
}
