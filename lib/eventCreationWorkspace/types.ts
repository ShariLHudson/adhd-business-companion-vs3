/**
 * Event Creation Workspace — purpose-built creation surface (not generic Project Home).
 */

import type { SectionAssetPanel } from "@/lib/eventsIntelligence/eventAssetRegistry/sectionCapabilityPanel";
import type { EventAssetRecommendation } from "@/lib/eventsIntelligence/eventAssetRegistry/types";
import type { DynamicSectionRuntimePanel } from "@/lib/eventsIntelligence/eventCapabilityRegistry";
import type { EventSectionId, EventTypeId } from "@/lib/eventsIntelligence/types";

export type WorkspaceSectionVisibility = "focus" | "available" | "later";

export type EventWorkspaceSectionDef = {
  id: EventSectionId;
  title: string;
  /**
   * @deprecated Prefer registryAssetTypeIds from Event Capability Registry (052A).
   * Create Asset Registry (047) bridge ids when present.
   */
  linkedAssetIds: readonly string[];
  /** Canonical Event Asset Registry type ids for this section — dynamic, not hardcoded */
  registryAssetTypeIds: readonly string[];
  /** Primary Chamber contributor for this section */
  chamberMemberId: string | null;
};

export type EventWorkspaceSectionView = EventWorkspaceSectionDef & {
  content: string;
  status: "empty" | "drafting" | "confirmed" | "skipped";
  visibility: WorkspaceSectionVisibility;
  order: number;
};

export type EventCreationWorkspaceSnapshot = {
  eventRecordId: string;
  eventType: EventTypeId;
  title: string;
  /** Human label for the workspace, e.g. "Retreat Creation Workspace" */
  workspaceLabel: string;
  sections: EventWorkspaceSectionView[];
  focusSectionIds: EventSectionId[];
  establishedSummary: string[];
  nextDecisionSectionId: EventSectionId | null;
  /** 052A — focused registry recommendations (not full dump) */
  focusedAssetRecommendations: EventAssetRecommendation[];
  /** 052A — dynamic panels for focus sections only */
  sectionAssetPanels: SectionAssetPanel[];
  /** 053 — three-layer runtime panels (Capabilities · Asset Types · Templates) */
  sectionRuntimePanels: DynamicSectionRuntimePanel[];
};
