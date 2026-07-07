import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { CENTER_FORBIDDEN_ELEMENTS, EDGE_ZONE_LIFE_HINTS } from "./rules";
import type { RoomCompositionEntry } from "./types";

const LIVING_ROOM: RoomCompositionEntry = {
  placeId: "living-room",
  name: "Living Room",
  signatureFeature: {
    id: "summer-window-right",
    label: "Large open summer window",
    visibleZone: "right",
    description: "Wide garden view stays visible beside conversation.",
  },
  edgeLife: EDGE_ZONE_LIFE_HINTS,
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top"],
  backgroundObjectPosition: "68% center",
  panelFrostedOpacity: 0.52,
};

const WINDOW_SEAT: RoomCompositionEntry = {
  placeId: "window-seat",
  name: "Window Seat",
  signatureFeature: {
    id: "iowa-landscape-right",
    label: "Wide Iowa landscape",
    visibleZone: "right",
    description: "Landscape beside the conversation — never behind it.",
  },
  edgeLife: {
    left: ["bookshelf", "lamp-glow", "candle", "journal-table"],
    right: ["window", "curtains", "trees", "bird", "steam-mug"],
    top: ["tree-branches", "sky", "morning-light", "rain-on-glass"],
    bottom: ["blanket", "rug", "flower-pot", "storage-basket"],
  },
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top"],
  backgroundObjectPosition: "72% 42%",
  panelFrostedOpacity: 0.52,
};

const PLANNING_TABLE: RoomCompositionEntry = {
  placeId: "planning-table",
  name: "Planning Table",
  signatureFeature: {
    id: "planning-notebook",
    label: "Planning Notebook — open beside the window",
    visibleZone: "right",
    description: "Large open window and morning light stay visible; notebook rests at the table edge.",
  },
  edgeLife: {
    left: [
      "built-in-shelves",
      "planner-collection",
      "leather-notebooks",
      "sticky-notes",
      "pen-cup",
      "table-lamp",
      "fresh-flowers",
    ],
    right: [
      "open-window",
      "linen-curtains",
      "summer-trees",
      "bird-feeder",
      "garden-flowers",
      "hummingbird",
    ],
    top: ["morning-light", "tree-branches", "changing-sunlight"],
    bottom: ["fresh-coffee", "open-planner", "reading-glasses", "comfortable-chair"],
  },
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top"],
  backgroundObjectPosition: "62% 44%",
  panelFrostedOpacity: 0.54,
};

const SUNROOM_OVER_POND: RoomCompositionEntry = {
  placeId: "sunroom-over-pond",
  name: "Sunroom Over The Pond",
  signatureFeature: {
    id: "pond-anchor",
    label: "Pond with flowing water — emotional center below the workspace",
    visibleZone: "bottom",
    description:
      "Goldfish, lilies, and water flow stay visible; workspace embeds inside the sunroom.",
  },
  edgeLife: {
    left: ["layered-plants", "vines", "dense-greenery", "lamp-glow"],
    right: ["garden-depth", "plants", "flowers", "bird", "butterflies"],
    top: ["pergola-vines", "filtered-sunlight", "pergola-shadow", "sky-reflection"],
    bottom: [
      "pond-water",
      "goldfish",
      "water-lilies",
      "coffee-mug",
      "open-journal",
    ],
  },
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top", "bottom"],
  backgroundObjectPosition: "50% 68%",
  panelFrostedOpacity: 0.42,
};

const GARDEN_PATH: RoomCompositionEntry = {
  placeId: "garden-path",
  name: "Garden Path",
  signatureFeature: {
    id: "forward-stones",
    label: "Stepping stones through morning fog",
    visibleZone: "bottom",
    description: "Path leads forward at the edge — center stays clear for one next step.",
  },
  edgeLife: {
    left: ["trees", "flowers", "landscape"],
    right: ["trees", "bird", "landscape"],
    top: ["morning-light", "tree-branches", "rain"],
    bottom: ["flowers", "landscape"],
  },
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top"],
  backgroundObjectPosition: "50% 55%",
  panelFrostedOpacity: 0.48,
};

const OUTLOOK_POINT: RoomCompositionEntry = {
  placeId: "outlook-point",
  name: "Outlook Point",
  signatureFeature: {
    id: "horizon-line",
    label: "Open horizon and long trail",
    visibleZone: "top",
    description: "Horizon and trail stay visible — no tasks, only forward movement.",
  },
  edgeLife: {
    left: ["landscape", "trees"],
    right: ["landscape", "bird"],
    top: ["sky-reflection", "changing-sunlight"],
    bottom: ["landscape", "flowers"],
  },
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top", "bottom"],
  backgroundObjectPosition: "50% 42%",
  panelFrostedOpacity: 0.38,
};

const GREENHOUSE: RoomCompositionEntry = {
  placeId: "greenhouse",
  name: "Original Sunroom",
  signatureFeature: {
    id: "sunroom-glass",
    label: "Floor-to-ceiling garden light",
    visibleZone: "right",
    description:
      "Reading chair, warm lamp, and living plants stay at the edges — one continuous sunroom.",
  },
  edgeLife: {
    left: ["indoor-plants", "ferns", "reading-chair", "throw-blanket", "natural-wood"],
    right: [
      "floor-to-ceiling-windows",
      "garden",
      "soft-glass-reflections",
      "morning-light",
    ],
    top: ["glass-panes", "filtered-sunlight", "branches"],
    bottom: ["side-table", "warm-lamp", "living-plants", "wood-floor"],
  },
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "top"],
  backgroundObjectPosition: "50% 40%",
  panelFrostedOpacity: 0.4,
};

const READING_NOOK: RoomCompositionEntry = {
  placeId: "reading-nook",
  name: "Reading Nook",
  signatureFeature: {
    id: "saltwater-aquarium-left",
    label: "Saltwater aquarium on left wall",
    visibleZone: "left",
    description: "Aquarium bubbles stay in the living frame — not behind text.",
  },
  edgeLife: EDGE_ZONE_LIFE_HINTS,
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "top"],
  backgroundObjectPosition: "28% center",
  panelFrostedOpacity: 0.55,
};

const CREATIVE_STUDIO: RoomCompositionEntry = {
  placeId: "creative-studio",
  name: "Creative Studio",
  signatureFeature: {
    id: "craft-table-lower",
    label: "Craft table wrapping lower edge",
    visibleZone: "bottom",
    description: "Creative surface frames work without covering it.",
  },
  edgeLife: EDGE_ZONE_LIFE_HINTS,
  centerForbidden: CENTER_FORBIDDEN_ELEMENTS,
  motionZones: ["left", "right", "bottom"],
  backgroundObjectPosition: "50% 65%",
  panelFrostedOpacity: 0.53,
};

export const ROOM_COMPOSITION_CATALOG: RoomCompositionEntry[] = [
  LIVING_ROOM,
  WINDOW_SEAT,
  PLANNING_TABLE,
  SUNROOM_OVER_POND,
  GARDEN_PATH,
  OUTLOOK_POINT,
  GREENHOUSE,
  READING_NOOK,
  CREATIVE_STUDIO,
];

export function roomCompositionForPlace(
  placeId: CompanionPlaceId,
): RoomCompositionEntry {
  return (
    ROOM_COMPOSITION_CATALOG.find((r) => r.placeId === placeId) ?? LIVING_ROOM
  );
}
