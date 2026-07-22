/**
 * Canonical Cartography map registry.
 * Derived from mapDefinitions — wall, gallery, atlas, routes, and capabilities.
 */

import { CARTOGRAPHERS_ATLAS_ENTRIES } from "./atlas";
import {
  CARTOGRAPHERS_FRAMED_MAPS,
  type CartographersFramedMapId,
} from "./framedMaps";
import {
  assertWallMapNamingConsistent,
  CARTOGRAPHY_MAP_DEFINITIONS,
  canonicalMapName,
  getCartographyMapDefinition,
  getCartographyMapDefinitionByMode,
  visualFocusModeForWallMap,
  wallMapIdForVisualFocusMode,
  type CartographyMapDefinition,
} from "./mapDefinitions";
import { VISUAL_FOCUS_STUDIO_CARDS } from "@/lib/visualFocus/studioCards";
import type { VisualFocusMode } from "@/lib/visualFocus/types";

export type CartographyProductionStatus =
  | "production"
  | "hidden-pending"
  | "legacy-alias";

export type CartographyMapRegistryEntry = {
  canonicalId: CartographersFramedMapId | VisualFocusMode | string;
  canonicalName: string;
  previousLabels: string[];
  wallLabel: string | null;
  galleryLabel: string | null;
  atlasLabel: string | null;
  route: string;
  purpose: string;
  persistenceStore: string;
  editingOps: string[];
  productionStatus: CartographyProductionStatus;
  wallSelectable: boolean;
  /** Prompt completion fields */
  builderType: CartographyMapDefinition["builderType"] | "studio-hub";
  resultRenderer: string;
  supportsPrint: boolean;
  supportsDuplicate: boolean;
  isActive: boolean;
  shortDescription: string;
  steps: CartographyMapDefinition["steps"];
  visualFocusMode?: VisualFocusMode;
};

const WALL_BY_ID = Object.fromEntries(
  CARTOGRAPHERS_FRAMED_MAPS.map((m) => [m.id, m]),
) as Record<CartographersFramedMapId, (typeof CARTOGRAPHERS_FRAMED_MAPS)[number]>;

const ATLAS_BY_ID = Object.fromEntries(
  CARTOGRAPHERS_ATLAS_ENTRIES.map((e) => [e.id, e]),
) as Record<CartographersFramedMapId, (typeof CARTOGRAPHERS_ATLAS_ENTRIES)[number]>;

/** Studio hub cards that are Visual Focus modes (not wall-only map types). */
export const STUDIO_MODE_TO_WALL: Partial<
  Record<VisualFocusMode, CartographersFramedMapId>
> = Object.fromEntries(
  CARTOGRAPHY_MAP_DEFINITIONS.map((d) => [d.visualFocusMode, d.id]),
) as Partial<Record<VisualFocusMode, CartographersFramedMapId>>;

const SHARED_EDIT_OPS = [
  "add-node",
  "add-child",
  "rename",
  "edit-description",
  "reorder",
  "reparent",
  "delete-node",
  "undo",
  "redo",
  "save",
  "archive",
  "delete-map",
  "print",
] as const;

function galleryLabelForMode(mode: VisualFocusMode, fallback: string): string {
  return (
    VISUAL_FOCUS_STUDIO_CARDS.find((c) => c.mode === mode)?.title ?? fallback
  );
}

function entryFromDefinition(
  def: CartographyMapDefinition,
  previousLabels: string[] = [],
): CartographyMapRegistryEntry {
  return {
    canonicalId: def.id,
    canonicalName: def.name,
    previousLabels,
    wallLabel: WALL_BY_ID[def.id]?.nameplate ?? def.name,
    galleryLabel: galleryLabelForMode(def.visualFocusMode, def.name),
    atlasLabel: ATLAS_BY_ID[def.id]?.name ?? def.name,
    route: def.route,
    purpose: def.shortDescription,
    persistenceStore: "localStorage visual-focus maps (VisualFocusMap)",
    editingOps: [...SHARED_EDIT_OPS],
    productionStatus: def.isActive ? "production" : "hidden-pending",
    wallSelectable: def.isActive,
    builderType: def.builderType,
    resultRenderer: def.resultRenderer,
    supportsPrint: def.supportsPrint,
    supportsDuplicate: Boolean(def.supportsDuplicate),
    isActive: def.isActive,
    shortDescription: def.shortDescription,
    steps: def.steps,
    visualFocusMode: def.visualFocusMode,
  };
}

export const CARTOGRAPHY_MAP_REGISTRY: readonly CartographyMapRegistryEntry[] = [
  entryFromDefinition(getCartographyMapDefinition("mind-map"), [
    "Mind map",
    "mindmap",
    "Visual Mind Map",
  ]),
  entryFromDefinition(getCartographyMapDefinition("decision-map"), [
    "Decision Tree",
    "decision-tree",
    "Path Map",
  ]),
  entryFromDefinition(getCartographyMapDefinition("relationship-map")),
  entryFromDefinition(getCartographyMapDefinition("process-map"), [
    "Process Flow",
    "process-flow",
  ]),
  entryFromDefinition(getCartographyMapDefinition("journey-map")),
  entryFromDefinition(getCartographyMapDefinition("timeline-map"), [
    "Timeline Map",
  ]),
  entryFromDefinition(getCartographyMapDefinition("strategy-map")),
  entryFromDefinition(getCartographyMapDefinition("project-map")),
  entryFromDefinition(getCartographyMapDefinition("opportunity-map")),
  entryFromDefinition(getCartographyMapDefinition("priority-map")),
  {
    canonicalId: "visual-kanban",
    canonicalName: "Visual Kanban",
    previousLabels: ["Kanban"],
    wallLabel: null,
    galleryLabel: "Visual Kanban",
    atlasLabel: null,
    route: "visual-focus / visual-kanban (studio hub)",
    purpose: "Sort and group ideas across columns.",
    persistenceStore: "localStorage visual-focus maps",
    editingOps: ["add-card", "rename", "move-column", "save", "archive", "delete-map", "print"],
    productionStatus: "production",
    wallSelectable: false,
    builderType: "studio-hub",
    resultRenderer: "kanban-columns",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
    shortDescription: "Sort and group ideas across columns.",
    steps: [],
    visualFocusMode: "visual-kanban",
  },
  {
    canonicalId: "business-canvas",
    canonicalName: "Business Canvas",
    previousLabels: ["Business Model Canvas"],
    wallLabel: null,
    galleryLabel: "Business Canvas",
    atlasLabel: null,
    route: "visual-focus / business-canvas (studio hub)",
    purpose: "See how the parts of a business fit together.",
    persistenceStore: "localStorage visual-focus maps",
    editingOps: [
      "edit-section",
      "generate",
      "impact-analysis",
      "save",
      "archive",
      "delete-map",
      "print",
    ],
    productionStatus: "production",
    wallSelectable: false,
    builderType: "studio-hub",
    resultRenderer: "business-canvas-grid",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
    shortDescription: "See how the parts of a business fit together.",
    steps: [],
    visualFocusMode: "business-canvas",
  },
] as const;

export function productionWallMaps(): CartographyMapRegistryEntry[] {
  return CARTOGRAPHY_MAP_REGISTRY.filter(
    (e) => e.productionStatus === "production" && e.wallSelectable,
  );
}

export function namingMatrixRow(entry: CartographyMapRegistryEntry): {
  canonicalId: string;
  canonicalName: string;
  previousLabels: string;
  wallLabel: string;
  galleryLabel: string;
  route: string;
  status: string;
} {
  return {
    canonicalId: String(entry.canonicalId),
    canonicalName: entry.canonicalName,
    previousLabels: entry.previousLabels.join("; ") || "—",
    wallLabel: entry.wallLabel ?? "—",
    galleryLabel: entry.galleryLabel ?? "—",
    route: entry.route,
    status: entry.productionStatus,
  };
}

/** Wall label must match atlas + gallery when all three exist. */
export function assertMindMapNamingConsistent(): boolean {
  const mind = CARTOGRAPHY_MAP_REGISTRY.find((e) => e.canonicalId === "mind-map");
  if (!mind) return false;
  return (
    mind.canonicalName === mind.wallLabel &&
    mind.canonicalName === mind.galleryLabel &&
    mind.canonicalName === mind.atlasLabel &&
    assertWallMapNamingConsistent()
  );
}

export function assertAllWallMapsActiveAndNamed(): boolean {
  const wallEntries = CARTOGRAPHY_MAP_REGISTRY.filter((e) => e.wallLabel);
  return wallEntries.every(
    (e) =>
      e.wallSelectable &&
      e.isActive &&
      e.canonicalName === e.wallLabel &&
      (e.atlasLabel == null || e.canonicalName === e.atlasLabel),
  );
}

export {
  canonicalMapName,
  getCartographyMapDefinition,
  getCartographyMapDefinitionByMode,
  visualFocusModeForWallMap,
  wallMapIdForVisualFocusMode,
};
