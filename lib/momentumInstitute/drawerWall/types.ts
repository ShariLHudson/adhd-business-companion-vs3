/**
 * Momentum Institute Drawer Wall — UI layout types (data-driven hotspots).
 */

import type {
  InstituteDrawerDefinition,
  KnowledgeCardDefinition,
  LearningExperienceDefinition,
} from "@/lib/sparkMomentumInstitute/types";

/** Normalized hotspot on the drawer-wall photograph (percent of wall art box). */
export type DrawerWallHotspot = {
  drawerId: string;
  /** Category label for exploration — maps to department title */
  categoryLabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Dewey-style label on drawer face (optional) */
  catalogLabel?: string;
  zIndex?: number;
};

export type DrawerWallLayout = {
  version: string;
  /** Wall art region within the viewport (percent) */
  wallRegion: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  hotspots: DrawerWallHotspot[];
};

export type InstituteDrawerWallState = {
  openDrawerId: string | null;
  openKnowledgeCardId: string | null;
  hoveredDrawerId: string | null;
};

export type ResolvedDrawerWallItem = {
  hotspot: DrawerWallHotspot;
  drawer: InstituteDrawerDefinition;
  knowledgeCards: KnowledgeCardDefinition[];
};

export type KnowledgeCardPanelModel = {
  card: KnowledgeCardDefinition;
  drawer: InstituteDrawerDefinition;
  experiences: LearningExperienceDefinition[];
};

/** Future Estate Intelligence — open a drawer by id without navigation. */
export type InstituteDrawerWallCommand =
  | { type: "open_drawer"; drawerId: string }
  | { type: "open_knowledge_card"; knowledgeCardId: string }
  | { type: "close_drawer" }
  | { type: "close_knowledge_card" };
