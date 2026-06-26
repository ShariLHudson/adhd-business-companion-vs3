import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { LivingBorderElementId, LivingBorderRoomCatalog } from "./types";

export const LIVING_BORDER_ROOM_CATALOG: LivingBorderRoomCatalog[] = [
  {
    placeId: "living-room",
    name: "Living Room™",
    elements: [
      "window",
      "curtain-left",
      "curtain-right",
      "trees",
      "bird-feeder",
      "flowers",
      "coffee-mug",
      "bookshelf",
      "lamp-glow",
      "kinsey",
      "candle",
      "blanket",
    ],
  },
  {
    placeId: "reading-nook",
    name: "Reading Nook™",
    elements: [
      "aquarium",
      "bookshelf",
      "lamp-glow",
      "window",
      "curtain-right",
      "blanket",
      "candle",
    ],
  },
  {
    placeId: "planning-table",
    name: "Planning Table™",
    elements: [
      "bookshelf",
      "planner",
      "lamp-glow",
      "flowers",
      "curtain-left",
      "curtain-right",
      "trees",
      "bird-feeder",
      "coffee-mug",
      "steam",
      "candle",
    ],
  },
  {
    placeId: "creative-studio",
    name: "Creative Studio™",
    elements: [
      "craft-shelves",
      "window",
      "curtain-left",
      "flowers",
      "blanket",
      "lamp-glow",
    ],
  },
  {
    placeId: "window-seat",
    name: "Window Seat™",
    elements: [
      "landscape",
      "trees",
      "bird",
      "bird-feeder",
      "flowers",
      "rain",
      "snow",
      "curtain-right",
      "curtain-left",
      "bookshelf",
      "lamp-glow",
      "candle",
      "steam",
      "blanket",
    ],
  },
  {
    placeId: "garden-path",
    name: "Garden Path™",
    elements: [
      "landscape",
      "trees",
      "flowers",
      "bird",
      "rain",
      "curtain-left",
      "curtain-right",
    ],
  },
  {
    placeId: "greenhouse",
    name: "Greenhouse™",
    elements: ["rain", "trees", "flowers", "steam", "curtain-right"],
  },
  {
    placeId: "outlook-point",
    name: "Outlook Point™",
    elements: ["landscape", "trees", "bird", "flowers"],
  },
  {
    placeId: "garden",
    name: "Garden™",
    elements: ["flowers", "trees", "bird", "landscape", "pond-water"],
  },
  {
    placeId: "sunroom-over-pond",
    name: "Sunroom Over The Pond™",
    elements: [
      "pond-water",
      "goldfish",
      "water-lilies",
      "pergola-vines",
      "trees",
      "flowers",
      "bird",
      "landscape",
      "coffee-mug",
      "steam",
      "rain",
    ],
  },
];

export function livingBorderCatalogForPlace(
  placeId: CompanionPlaceId,
): LivingBorderRoomCatalog {
  return (
    LIVING_BORDER_ROOM_CATALOG.find((r) => r.placeId === placeId) ??
    LIVING_BORDER_ROOM_CATALOG[0]!
  );
}
