/**
 * Cartographer's Studio — ten framed wall maps (195 / 227).
 * Every active wall map opens its guided map experience.
 */

import type { VisualFocusMode } from "@/lib/visualFocus/types";
import {
  CARTOGRAPHY_MAP_DEFINITIONS,
  getCartographyMapDefinition,
  type CartographersFramedMapId,
} from "./mapDefinitions";

export type { CartographersFramedMapId };

export type CartographersFramedMap = {
  id: CartographersFramedMapId;
  nameplate: string;
  /** One-sentence hover help. */
  hoverBlurb: string;
  /** Short learn tip (right-click / long-press). */
  learnTip: string;
  /** Opens a working map experience. */
  interactive: boolean;
  /** Wall hotspot may open the map. */
  wallSelectable: boolean;
  /** Maps to Visual Focus mode. */
  visualFocusMode: VisualFocusMode;
};

const LEARN_TIPS: Record<CartographersFramedMapId, string> = {
  "mind-map":
    "Capture and expand ideas without structuring them first. Spark groups related thoughts into branches.",
  "decision-map":
    "Compare choices, criteria, and tradeoffs when you need a clear decision.",
  "relationship-map":
    "Reveal how people, ideas, or systems connect and influence one another.",
  "process-map": "See steps, bottlenecks, and flow from start to finish.",
  "journey-map": "Chart the path from where you are to where you want to go.",
  "timeline-map": "Sequence milestones across past, present, and future.",
  "strategy-map": "Connect vision, priorities, and action into one course.",
  "project-map": "Break a large initiative into phases, deliverables, and tasks.",
  "opportunity-map": "Explore possibilities, benefits, risks, and first steps.",
  "priority-map": "Sort what matters by impact, urgency, and effort.",
};

export const CARTOGRAPHERS_FRAMED_MAPS: readonly CartographersFramedMap[] =
  CARTOGRAPHY_MAP_DEFINITIONS.map((def) => ({
    id: def.id,
    nameplate: def.name,
    hoverBlurb: def.shortDescription,
    learnTip: LEARN_TIPS[def.id],
    interactive: def.isActive,
    wallSelectable: def.isActive,
    visualFocusMode: def.visualFocusMode,
  }));

/** Wall hotspots that may open a working map. */
export function wallSelectableFramedMaps(): readonly CartographersFramedMap[] {
  return CARTOGRAPHERS_FRAMED_MAPS.filter((m) => m.wallSelectable);
}

export function getFramedMapById(
  id: CartographersFramedMapId,
): CartographersFramedMap | undefined {
  return CARTOGRAPHERS_FRAMED_MAPS.find((m) => m.id === id);
}

export function framedMapForVisualFocusMode(
  mode: VisualFocusMode,
): CartographersFramedMap | undefined {
  return CARTOGRAPHERS_FRAMED_MAPS.find((m) => m.visualFocusMode === mode);
}

export const CARTOGRAPHERS_ROOM_INTRO = {
  plaque: "Cartographer's Studio",
  tagline: "Every map tells a story. Every story reveals a path.",
  welcome:
    "Choose a framed map on the wall, or open the Atlas when you want to learn first.",
  instruction: "Click any map to open it and start working.",
  mindMapReady: "Every map on the wall is ready — choose the one you need.",
} as const;

/** @deprecated Prefer CartographersAtlas overlay — kept for import compatibility. */
export const CARTOGRAPHERS_ATLAS_TEASER = {
  title: "Cartographer's Atlas",
  body: "Learn what each map is for, then create one when you're ready.",
  mindMapAction: "Create This Map",
  comingSoon: getCartographyMapDefinition("mind-map").name + " and every wall map are ready to create.",
} as const;
