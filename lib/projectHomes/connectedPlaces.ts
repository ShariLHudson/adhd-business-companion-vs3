import type { ConnectedPlaceShortcut, ProjectHomeRoomId } from "./types";

/**
 * Connected Places — navigation shortcuts only.
 * Each entry pairs the Estate name with a plain-language explanation so no
 * one needs to learn the metaphor before using it. Only entries marked
 * "active" are wired to a real destination today (Connected Places
 * Completion) — everything else stays honestly labeled "comingLater"
 * rather than shown as a working button.
 */
export const CONNECTED_PLACES: readonly ConnectedPlaceShortcut[] = [
  {
    id: "boardroom",
    label: "Boardroom",
    blurb: "Get multiple perspectives on an important decision.",
    destinationHint: "boardroom",
    status: "active",
  },
  {
    id: "cartography",
    label: "Visual Thinking Studio",
    blurb: "Map ideas, decisions, steps, or relationships visually.",
    destinationHint: "visual-focus",
    status: "comingLater",
  },
  {
    id: "chamber-of-momentum",
    label: "Chamber of Momentum",
    blurb: "Work with a specialist for this part of your project.",
    destinationHint: "chamber-of-momentum",
    status: "comingLater",
  },
  {
    id: "journal-gazebo",
    label: "Journal Gazebo",
    blurb: "Reflect without forcing a finish line.",
    destinationHint: "growth-journal",
    status: "comingLater",
  },
  {
    id: "evidence-vault",
    label: "Evidence Vault",
    blurb: "Preserve discoveries about what is working.",
    destinationHint: "evidence-bank",
    status: "comingLater",
  },
  {
    id: "hall-of-accomplishment",
    label: "Hall of Accomplishment",
    blurb: "Save completed milestones and accomplishments.",
    destinationHint: "growth-portfolio",
    status: "comingLater",
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

/** Genuinely wired destinations for this Project Home — safe to show as primary options. */
export function activeConnectedPlaces(
  roomId: ProjectHomeRoomId,
): ConnectedPlaceShortcut[] {
  return connectedPlacesForProjectHome(roomId).filter(
    (p) => p.status === "active",
  );
}

/** Not-yet-integrated destinations — must stay demoted, never a prominent card. */
export function comingLaterConnectedPlaces(
  roomId: ProjectHomeRoomId,
): ConnectedPlaceShortcut[] {
  return connectedPlacesForProjectHome(roomId).filter(
    (p) => p.status === "comingLater",
  );
}
