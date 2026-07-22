/**
 * Maps workspace / destination ids to estate orientation places.
 * Consumed by WorkspaceAreaWorksGuide and room "how this fits" links.
 */

import { getEstateOrientationPlace } from "./howSparkEstateWorksTogether";
import type { EstateOrientationPlace, EstateOrientationPlaceId } from "./types";

/** Known help / shell / destination keys → orientation place */
const AREA_TO_PLACE: Record<string, EstateOrientationPlaceId> = {
  // Create
  create: "create",
  "content-generator": "create",
  "creative-studio": "create",
  // Projects
  projects: "projects",
  "project-homes": "projects",
  "my-work": "projects",
  build: "projects",
  // Cartography
  cartography: "cartography",
  "cartographers-studio": "cartography",
  "visual-focus": "cartography",
  // Strategies
  strategies: "strategies",
  playbook: "strategies",
  // Chamber
  chamber: "chamber",
  "chamber-of-momentum": "chamber",
  // Board
  board: "board",
  boardroom: "board",
  "board-of-directors": "board",
  // Business Pulse
  "business-pulse": "business-pulse",
  // Evidence
  evidence: "evidence",
  "evidence-bank": "evidence",
  "evidence-vault": "evidence",
  // Wins
  wins: "wins",
  "wins-this-week": "wins",
  "celebration-garden": "wins",
  // Hall
  hall: "hall",
  "hall-of-accomplishments": "hall",
  "growth-portfolio": "hall",
};

export function resolveEstateOrientationPlaceId(
  areaOrPlaceId: string | null | undefined,
): EstateOrientationPlaceId | null {
  if (!areaOrPlaceId) return null;
  const key = areaOrPlaceId.trim().toLowerCase();
  return AREA_TO_PLACE[key] ?? null;
}

export function getRoomOrientation(
  areaOrPlaceId: string | null | undefined,
): EstateOrientationPlace | null {
  const placeId = resolveEstateOrientationPlaceId(areaOrPlaceId);
  if (!placeId) return null;
  return getEstateOrientationPlace(placeId);
}

/** Areas that should offer "Show me how this fits together" */
export function hasHowThisFitsTogetherLink(
  areaOrPlaceId: string | null | undefined,
): boolean {
  return resolveEstateOrientationPlaceId(areaOrPlaceId) !== null;
}
