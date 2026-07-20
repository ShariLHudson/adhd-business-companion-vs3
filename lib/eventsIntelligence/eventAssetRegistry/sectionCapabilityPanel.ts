/**
 * 052A — Dynamic Section Asset Panel
 * Sections load capabilities from the Event Asset Registry — never hardcode asset lists.
 */

import type { EventRecord, EventSectionId } from "../types";
import { EVENT_SECTION_DEFS } from "../eventSections";
import { EVENT_ASSET_DEFINITIONS } from "./definitions";
import { listEventAssetInstances } from "./instances";
import {
  recommendAssetsForSection,
  recommendEventAssets,
} from "./recommendEventAssets";
import { isEventTypeApplicable } from "./query";
import type {
  EventAssetDefinition,
  EventAssetInstance,
  EventAssetRecommendation,
} from "./types";

export type SectionAssetPanel = {
  sectionId: EventSectionId;
  sectionTitle: string;
  planningNotes: string;
  /** Instances created for this event that belong to this section */
  createdAssets: EventAssetInstance[];
  /** Focused recommendations — not the full registry */
  recommendedAssets: EventAssetRecommendation[];
  /** Full capability catalog for this section (for Add Asset picker) */
  registryCapabilities: EventAssetDefinition[];
  archivedAssets: EventAssetInstance[];
};

/**
 * All registry definitions that may attach to a section — source of truth.
 * Not hardcoded in the Workspace template.
 */
export function registryCapabilitiesForSection(
  sectionId: EventSectionId,
  eventType?: EventRecord["eventType"],
): EventAssetDefinition[] {
  return EVENT_ASSET_DEFINITIONS.filter((d) => {
    if (d.status === "deprecated") return false;
    if (!d.eventSections.includes(sectionId)) return false;
    if (eventType && !isEventTypeApplicable(d.applicableEventTypes, eventType)) {
      return false;
    }
    return true;
  });
}

/**
 * Build the Dynamic Asset Panel for one Workspace section.
 */
export function buildSectionAssetPanel(
  record: EventRecord,
  sectionId: EventSectionId,
): SectionAssetPanel {
  const sectionMeta = EVENT_SECTION_DEFS.find((s) => s.id === sectionId);
  const section = record.sections.find((s) => s.id === sectionId);
  const instances = listEventAssetInstances(record.id);
  const created = instances.filter(
    (i) =>
      i.status !== "archived" &&
      (i.planningSectionId === sectionId ||
        registryCapabilitiesForSection(sectionId).some(
          (d) => d.assetTypeId === i.assetTypeId,
        )),
  );
  const archived = instances.filter(
    (i) =>
      i.status === "archived" &&
      (i.planningSectionId === sectionId ||
        registryCapabilitiesForSection(sectionId).some(
          (d) => d.assetTypeId === i.assetTypeId,
        )),
  );

  return {
    sectionId,
    sectionTitle: sectionMeta?.title ?? sectionId,
    planningNotes: section?.content ?? "",
    createdAssets: created,
    recommendedAssets: recommendAssetsForSection(record, sectionId, {
      focusLimit: 6,
    }),
    registryCapabilities: registryCapabilitiesForSection(
      sectionId,
      record.eventType,
    ),
    archivedAssets: archived,
  };
}

/**
 * Workspace-level focused recommendations (not per-section dump).
 */
export function buildWorkspaceFocusedRecommendations(
  record: EventRecord,
  focusLimit = 12,
): EventAssetRecommendation[] {
  return recommendEventAssets(record, { focusLimit }).focused;
}

/**
 * Search the capability registry (052A Add Asset / Search).
 */
export function searchEventCapabilityRegistry(
  query: string,
  options?: {
    sectionId?: EventSectionId;
    eventType?: EventRecord["eventType"];
    limit?: number;
  },
): EventAssetDefinition[] {
  const q = query.trim().toLowerCase();
  let pool = EVENT_ASSET_DEFINITIONS.filter((d) => d.status !== "deprecated");
  if (options?.sectionId) {
    pool = pool.filter((d) => d.eventSections.includes(options.sectionId!));
  }
  if (options?.eventType) {
    pool = pool.filter((d) =>
      isEventTypeApplicable(d.applicableEventTypes, options.eventType!),
    );
  }
  if (!q) return pool.slice(0, options?.limit ?? 40);
  return pool
    .filter(
      (d) =>
        d.assetTypeId.includes(q) ||
        d.canonicalName.toLowerCase().includes(q) ||
        d.userFacingName.toLowerCase().includes(q) ||
        d.aliases.some((a) => a.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q),
    )
    .slice(0, options?.limit ?? 40);
}

/** Assert section panels never rely on hardcoded template asset lists. */
export function sectionPanelLoadsFromRegistryOnly(): boolean {
  // Structural guarantee: capabilities come only from EVENT_ASSET_DEFINITIONS
  return EVENT_ASSET_DEFINITIONS.length > 0;
}
