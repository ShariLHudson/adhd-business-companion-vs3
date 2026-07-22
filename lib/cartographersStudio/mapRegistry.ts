/**
 * Canonical Cartography map registry (Prompt 140).
 * Inspected from framedMaps, atlas, studioCards, and Visual Focus modes.
 */

import { CARTOGRAPHERS_ATLAS_ENTRIES } from "./atlas";
import {
  CARTOGRAPHERS_FRAMED_MAPS,
  type CartographersFramedMapId,
} from "./framedMaps";
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
};

const WALL_BY_ID = Object.fromEntries(
  CARTOGRAPHERS_FRAMED_MAPS.map((m) => [m.id, m]),
) as Record<CartographersFramedMapId, (typeof CARTOGRAPHERS_FRAMED_MAPS)[number]>;

const ATLAS_BY_ID = Object.fromEntries(
  CARTOGRAPHERS_ATLAS_ENTRIES.map((e) => [e.id, e]),
) as Record<CartographersFramedMapId, (typeof CARTOGRAPHERS_ATLAS_ENTRIES)[number]>;

/** Studio hub cards that are Visual Focus modes (not wall-only map types). */
const STUDIO_MODE_TO_WALL: Partial<
  Record<VisualFocusMode, CartographersFramedMapId>
> = {
  "mind-map": "mind-map",
  "decision-tree": "decision-map",
  "relationship-map": "relationship-map",
  "strategy-map": "strategy-map",
  "project-map": "project-map",
};

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
] as const;

export const CARTOGRAPHY_MAP_REGISTRY: readonly CartographyMapRegistryEntry[] = [
  {
    canonicalId: "mind-map",
    canonicalName: "Mind Map",
    previousLabels: ["Mind map", "mindmap", "Visual Mind Map"],
    wallLabel: WALL_BY_ID["mind-map"]?.nameplate ?? "Mind Map",
    galleryLabel:
      VISUAL_FOCUS_STUDIO_CARDS.find((c) => c.mode === "mind-map")?.title ??
      "Mind Map",
    atlasLabel: ATLAS_BY_ID["mind-map"]?.name ?? "Mind Map",
    route: "visual-focus / cartographers-studio / mind-map",
    purpose: WALL_BY_ID["mind-map"]?.hoverBlurb ?? "",
    persistenceStore: "localStorage visual-focus maps (VisualFocusMap)",
    editingOps: [...SHARED_EDIT_OPS, "connect-relationship", "notes"],
    productionStatus: "production",
    wallSelectable: true,
  },
  {
    canonicalId: "decision-map",
    canonicalName: "Decision Map",
    previousLabels: ["Decision Tree", "decision-tree", "Path Map"],
    wallLabel: WALL_BY_ID["decision-map"]?.nameplate ?? "Decision Map",
    galleryLabel:
      VISUAL_FOCUS_STUDIO_CARDS.find((c) => c.mode === "decision-tree")?.title ??
      "Decision Tree",
    atlasLabel: ATLAS_BY_ID["decision-map"]?.name ?? "Decision Map",
    route: "visual-focus / decision-tree (studio) · wall learn-only",
    purpose: WALL_BY_ID["decision-map"]?.hoverBlurb ?? "",
    persistenceStore: "localStorage visual-focus maps when created via studio",
    editingOps: [...SHARED_EDIT_OPS],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "relationship-map",
    canonicalName: "Relationship Map",
    previousLabels: [],
    wallLabel: "Relationship Map",
    galleryLabel: "Relationship Map",
    atlasLabel: "Relationship Map",
    route: "visual-focus / relationship-map · wall learn-only",
    purpose: WALL_BY_ID["relationship-map"]?.hoverBlurb ?? "",
    persistenceStore: "localStorage visual-focus maps when created via studio",
    editingOps: [...SHARED_EDIT_OPS],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "process-map",
    canonicalName: "Process Map",
    previousLabels: ["Process Flow", "process-flow"],
    wallLabel: "Process Map",
    galleryLabel: null,
    atlasLabel: "Process Map",
    route: "wall / atlas learn-only",
    purpose: WALL_BY_ID["process-map"]?.hoverBlurb ?? "",
    persistenceStore: "none (not production)",
    editingOps: [],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "journey-map",
    canonicalName: "Journey Map",
    previousLabels: [],
    wallLabel: "Journey Map",
    galleryLabel: null,
    atlasLabel: "Journey Map",
    route: "wall / atlas learn-only",
    purpose: WALL_BY_ID["journey-map"]?.hoverBlurb ?? "",
    persistenceStore: "none (not production)",
    editingOps: [],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "timeline-map",
    canonicalName: "Timeline",
    previousLabels: ["Timeline Map"],
    wallLabel: "Timeline",
    galleryLabel: null,
    atlasLabel: ATLAS_BY_ID["timeline-map"]?.name ?? "Timeline",
    route: "wall / atlas learn-only",
    purpose: WALL_BY_ID["timeline-map"]?.hoverBlurb ?? "",
    persistenceStore: "none (not production)",
    editingOps: [],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "strategy-map",
    canonicalName: "Strategy Map",
    previousLabels: [],
    wallLabel: "Strategy Map",
    galleryLabel: "Strategy Map",
    atlasLabel: "Strategy Map",
    route: "visual-focus / strategy-map · wall learn-only",
    purpose: WALL_BY_ID["strategy-map"]?.hoverBlurb ?? "",
    persistenceStore: "localStorage visual-focus maps when created via studio",
    editingOps: [...SHARED_EDIT_OPS],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "project-map",
    canonicalName: "Project Map",
    previousLabels: [],
    wallLabel: "Project Map",
    galleryLabel: "Project Map",
    atlasLabel: "Project Map",
    route: "visual-focus / project-map · wall learn-only",
    purpose: WALL_BY_ID["project-map"]?.hoverBlurb ?? "",
    persistenceStore: "localStorage visual-focus maps when created via studio",
    editingOps: [...SHARED_EDIT_OPS],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "opportunity-map",
    canonicalName: "Opportunity Map",
    previousLabels: [],
    wallLabel: "Opportunity Map",
    galleryLabel: null,
    atlasLabel: "Opportunity Map",
    route: "wall / atlas learn-only",
    purpose: WALL_BY_ID["opportunity-map"]?.hoverBlurb ?? "",
    persistenceStore: "none (not production)",
    editingOps: [],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
  {
    canonicalId: "priority-map",
    canonicalName: "Priority Map",
    previousLabels: [],
    wallLabel: "Priority Map",
    galleryLabel: null,
    atlasLabel: "Priority Map",
    route: "wall / atlas learn-only",
    purpose: WALL_BY_ID["priority-map"]?.hoverBlurb ?? "",
    persistenceStore: "none (not production)",
    editingOps: [],
    productionStatus: "hidden-pending",
    wallSelectable: false,
  },
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
    editingOps: ["add-card", "rename", "move-column", "save", "archive", "delete-map"],
    productionStatus: "hidden-pending",
    wallSelectable: false,
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
    ],
    productionStatus: "hidden-pending",
    wallSelectable: false,
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
    mind.canonicalName === mind.atlasLabel
  );
}

export { STUDIO_MODE_TO_WALL };
