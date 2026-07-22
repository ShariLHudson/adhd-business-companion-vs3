import type { ConnectedPlaceShortcut, ProjectHomeRoomId } from "./types";

/**
 * Connected Places — navigation shortcuts only.
 * Prototype display; does not open live destinations or duplicate project data.
 */
export const CONNECTED_PLACES: readonly ConnectedPlaceShortcut[] = [
  {
    id: "cartography",
    label: "Cartography",
    blurb: "Map the work when it needs to be seen.",
    destinationHint: "visual-focus",
  },
  {
    id: "chamber-of-momentum",
    label: "Chamber of Momentum",
    blurb: "Keep momentum close when the project is in motion.",
    destinationHint: "chamber-of-momentum",
  },
  {
    id: "boardroom",
    label: "Boardroom",
    blurb: "Bring hard choices to the table.",
    destinationHint: "boardroom",
  },
  {
    id: "journal-gazebo",
    label: "Journal Gazebo",
    blurb: "Reflect without forcing a finish line.",
    destinationHint: "growth-journal",
  },
  {
    id: "evidence-vault",
    label: "Evidence Vault",
    blurb: "Preserve discoveries about what is working.",
    destinationHint: "evidence-bank",
  },
  {
    id: "hall-of-accomplishment",
    label: "Hall of Accomplishment",
    blurb: "Honor wins that belong to this work.",
    destinationHint: "growth-portfolio",
  },
] as const;

/** Soft ordering hints by Project Home — still the same shortcut set. */
const ROOM_PRIORITY: Partial<Record<ProjectHomeRoomId, string[]>> = {
  "writing-room": ["journal-gazebo", "cartography", "hall-of-accomplishment"],
  "art-studio": ["cartography", "hall-of-accomplishment", "journal-gazebo"],
  "social-studio": [
    "cartography",
    "chamber-of-momentum",
    "hall-of-accomplishment",
  ],
  "strategy-conference": [
    "boardroom",
    "chamber-of-momentum",
    "cartography",
  ],
  "study-hall": ["journal-gazebo", "evidence-vault", "cartography"],
  "estate-library": ["journal-gazebo", "evidence-vault", "cartography"],
  gallery: ["hall-of-accomplishment", "cartography", "evidence-vault"],
  "music-room": ["journal-gazebo", "hall-of-accomplishment", "cartography"],
  kitchen: ["chamber-of-momentum", "journal-gazebo", "cartography"],
  sunroom: ["journal-gazebo", "chamber-of-momentum", "hall-of-accomplishment"],
  boardroom: ["boardroom", "chamber-of-momentum", "cartography"],
};

export function connectedPlacesForProjectHome(
  roomId: ProjectHomeRoomId,
): ConnectedPlaceShortcut[] {
  const priority = ROOM_PRIORITY[roomId] ?? [];
  const byId = new Map(CONNECTED_PLACES.map((p) => [p.id, p]));
  const ordered: ConnectedPlaceShortcut[] = [];
  for (const id of priority) {
    const place = byId.get(id);
    if (place) ordered.push(place);
  }
  for (const place of CONNECTED_PLACES) {
    if (!ordered.some((p) => p.id === place.id)) ordered.push(place);
  }
  return ordered;
}
