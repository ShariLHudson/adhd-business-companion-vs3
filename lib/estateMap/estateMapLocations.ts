import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import type { EstateMapLocation } from "./types";

/**
 * Spark Estate locations — each node uses a real environment photograph.
 * Replace image paths when dedicated estate assets ship; layout stays the same.
 */
export const DEFAULT_ESTATE_MAP_LOCATIONS: EstateMapLocation[] = [
  {
    id: "welcome-house",
    name: "Welcome House",
    image: "/backgrounds/life-experience-room.webp",
    mood: "Arrival & belonging",
    x: 50,
    y: 52,
    width: 11.5,
    rotation: -0.5,
    anchor: true,
  },
  {
    id: "conservatory",
    name: "Conservatory",
    image: ESTATE_ROOM_BG.greenhouse,
    mood: "Clarity & thinking",
    x: 28,
    y: 32,
    width: 9.5,
    rotation: -2.5,
  },
  {
    id: "library",
    name: "Library",
    image: ESTATE_ROOM_BG.library,
    mood: "Wisdom & learning",
    x: 50,
    y: 22,
    width: 9,
    rotation: 1.2,
  },
  {
    id: "coffee-house",
    name: "Coffee House",
    image: ESTATE_ROOM_BG.coffeeHouse,
    mood: "Warm focus",
    x: 74,
    y: 30,
    width: 9,
    rotation: 2,
  },
  {
    id: "reflection-garden",
    name: "Reflection Garden",
    image: "/backgrounds/peaceful-places/east-terrace-peaceful-places.png",
    mood: "Quiet insight",
    x: 18,
    y: 48,
    width: 8.5,
    rotation: -1.8,
  },
  {
    id: "orchard",
    name: "Apple Orchard",
    image: "/backgrounds/apple-orchard-kinsey-background.png",
    mood: "Fresh ideas & possibility",
    x: 78,
    y: 50,
    width: 9,
    rotation: 1.5,
  },
  {
    id: "stable",
    name: "The Stables",
    image: "/backgrounds/spark-estate-stables-background.png",
    mood: "Grounding & calm",
    x: 22,
    y: 72,
    width: 9.5,
    rotation: -2,
  },
  {
    id: "mountain-cabin",
    name: "Mountain Cabin",
    image: "/backgrounds/peaceful-places/evening-hearth-peaceful-places.png",
    mood: "Restoration",
    x: 50,
    y: 78,
    width: 9,
    rotation: 0.8,
  },
  {
    id: "observatory",
    name: "Observatory",
    image: ESTATE_ROOM_BG.observatory,
    mood: "Future thinking",
    x: 82,
    y: 18,
    width: 8.5,
    rotation: 2.5,
  },
];

export const DEFAULT_CURRENT_ESTATE_LOCATION_ID = "conservatory";
