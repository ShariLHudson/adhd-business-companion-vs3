/**
 * Cartographer's Studio™ — ten framed wall maps (195 / 227).
 * Only Mind Map is interactive for the MVP vertical slice (221).
 */

import type { VisualFocusMode } from "@/lib/visualFocus/types";

export type CartographersFramedMapId =
  | "mind-map"
  | "decision-map"
  | "relationship-map"
  | "process-map"
  | "journey-map"
  | "timeline-map"
  | "strategy-map"
  | "project-map"
  | "opportunity-map"
  | "priority-map";

export type CartographersFramedMap = {
  id: CartographersFramedMapId;
  nameplate: string;
  /** Short learn tip (right-click / long-press). */
  learnTip: string;
  /** MVP: only mind-map starts Discovery Interview. */
  interactive: boolean;
  /** Maps to Visual Focus mode when interactive. */
  visualFocusMode?: VisualFocusMode;
};

export const CARTOGRAPHERS_FRAMED_MAPS: readonly CartographersFramedMap[] = [
  {
    id: "mind-map",
    nameplate: "Mind Map",
    learnTip:
      "Capture and expand ideas without structuring them first. Spark groups related thoughts into branches.",
    interactive: true,
    visualFocusMode: "mind-map",
  },
  {
    id: "decision-map",
    nameplate: "Decision Map",
    learnTip: "Compare choices, criteria, and tradeoffs when you need a clear decision.",
    interactive: false,
  },
  {
    id: "relationship-map",
    nameplate: "Relationship Map",
    learnTip: "Reveal how people, ideas, or systems connect and influence one another.",
    interactive: false,
  },
  {
    id: "process-map",
    nameplate: "Process Map",
    learnTip: "See steps, bottlenecks, and flow from start to finish.",
    interactive: false,
  },
  {
    id: "journey-map",
    nameplate: "Journey Map",
    learnTip: "Chart the path from where you are to where you want to go.",
    interactive: false,
  },
  {
    id: "timeline-map",
    nameplate: "Timeline Map",
    learnTip: "Sequence milestones across past, present, and future.",
    interactive: false,
  },
  {
    id: "strategy-map",
    nameplate: "Strategy Map",
    learnTip: "Connect vision, priorities, and action into one course.",
    interactive: false,
  },
  {
    id: "project-map",
    nameplate: "Project Map",
    learnTip: "Break a large initiative into phases, deliverables, and tasks.",
    interactive: false,
  },
  {
    id: "opportunity-map",
    nameplate: "Opportunity Map",
    learnTip: "Explore possibilities, benefits, risks, and first steps.",
    interactive: false,
  },
  {
    id: "priority-map",
    nameplate: "Priority Map",
    learnTip: "Sort what matters by impact, urgency, and effort.",
    interactive: false,
  },
] as const;

export function getFramedMapById(
  id: CartographersFramedMapId,
): CartographersFramedMap | undefined {
  return CARTOGRAPHERS_FRAMED_MAPS.find((m) => m.id === id);
}

export const CARTOGRAPHERS_ROOM_INTRO = {
  plaque: "Cartographer's Studio™",
  tagline: "Every map tells a story. Every story reveals a path.",
  welcome:
    "Choose a framed map on the wall, or open the Atlas when you want to learn first.",
  mindMapReady: "Mind Map is ready today. The other frames will open as we finish this path.",
} as const;

export const CARTOGRAPHERS_ATLAS_TEASER = {
  title: "Atlas of Visual Thinking™",
  body: "Learn what each map is for, then create one when you're ready.",
  mindMapAction: "Create Mind Map",
  comingSoon: "Full Atlas browsing arrives after Mind Map feels complete.",
} as const;
