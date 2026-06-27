import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { SceneWorkspaceId } from "@/lib/sceneRenderContract";
import { placeById } from "@/lib/companionUniverse/libraries/placeLibrary";
import { roomCompositionForPlace } from "@/lib/roomCompositionRule/roomCatalog";
import { livingBorderCatalogForPlace } from "@/lib/livingBorder/borderCatalog";

export type RoomRegistryEntry = {
  placeId: CompanionPlaceId;
  name: string;
  emotionalPromise: string;
  signatureObjectId?: string;
  signatureZone: "left" | "right" | "top" | "bottom";
  cameraCrop: string;
  defaultLighting: string;
  livingBorderProfile: CompanionPlaceId;
  supportedWorkspaces: readonly string[];
  hasComposition: boolean;
  hasLivingBorder: boolean;
  status: "registered" | "partial" | "future";
};

const WORKSPACES_BY_PLACE: Partial<Record<CompanionPlaceId, readonly string[]>> =
  {
    "living-room": ["home", "today", "default"],
    "window-seat": [],
    "greenhouse": [
      "clear-my-mind",
      "clear-my-mind-thoughts",
      "brain-dump",
    ],
    "planning-table": ["plan-my-day"],
    "sunroom-over-pond": ["focus-hub", "focus"],
    "garden-path": ["focus-category"],
    "reading-nook": ["breathe", "focus-audio", "growth", "my-journey"],
    "creative-studio": ["content-generator", "my-work"],
    workshop: ["projects", "templates-library", "snippets", "saved-work"],
    "focus-studio": ["visual-focus"],
    library: ["how-do-i"],
    "business-office": ["business-profile", "decision-compass"],
    "kitchen-table": ["energy"],
  };

const REGISTERED_PLACES: CompanionPlaceId[] = [
  "living-room",
  "window-seat",
  "planning-table",
  "sunroom-over-pond",
  "garden-path",
  "outlook-point",
  "greenhouse",
  "reading-nook",
  "creative-studio",
  "garden",
];

function registryStatus(placeId: CompanionPlaceId): RoomRegistryEntry["status"] {
  if (REGISTERED_PLACES.includes(placeId)) {
    const composition = roomCompositionForPlace(placeId);
    const border = livingBorderCatalogForPlace(placeId);
    if (
      composition.placeId === placeId &&
      border.placeId === placeId
    ) {
      return "registered";
    }
    return "partial";
  }
  return "future";
}

export function roomRegistryEntry(
  placeId: CompanionPlaceId,
): RoomRegistryEntry {
  const place = placeById(placeId);
  const composition = roomCompositionForPlace(placeId);
  const border = livingBorderCatalogForPlace(placeId);

  return {
    placeId,
    name: place.name,
    emotionalPromise: place.emotionalPromise,
    signatureObjectId: composition.signatureFeature?.id,
    signatureZone: composition.signatureFeature?.visibleZone ?? "right",
    cameraCrop: composition.backgroundObjectPosition,
    defaultLighting: place.lightingProfile,
    livingBorderProfile: border.placeId,
    supportedWorkspaces: WORKSPACES_BY_PLACE[placeId] ?? [],
    hasComposition: composition.placeId === placeId,
    hasLivingBorder: border.placeId === placeId,
    status: registryStatus(placeId),
  };
}

export function roomRegistryForWorkspace(
  workspaceId: SceneWorkspaceId | string,
): RoomRegistryEntry {
  return roomRegistryEntry(placeForWorkspaceFromRegistry(workspaceId));
}

/** Internal base map — superseded by resolveEnvironment() at runtime. */
export function placeForWorkspaceFromRegistry(
  workspaceId?: string,
): CompanionPlaceId {
  const map: Partial<Record<SceneWorkspaceId, CompanionPlaceId>> = {
    "clear-my-mind": "greenhouse",
    "clear-my-mind-thoughts": "greenhouse",
    "plan-my-day": "planning-table",
    "focus-hub": "sunroom-over-pond",
    "focus-category": "sunroom-over-pond",
    breathe: "reading-nook",
    "focus-audio": "reading-nook",
    default: "living-room",
  };
  if (!workspaceId) return "living-room";
  return map[workspaceId as SceneWorkspaceId] ?? "living-room";
}

export const ROOM_REGISTRY_PLACE_IDS: readonly CompanionPlaceId[] = [
  ...new Set<CompanionPlaceId>([
    ...REGISTERED_PLACES,
    "kitchen-table",
    "business-office",
    "workshop",
    "focus-studio",
    "library",
    "back-deck",
    "fire-circle",
    "front-porch",
    "barn",
    "adventure-room",
    "future-wings",
  ]),
];

export function allRoomRegistryEntries(): RoomRegistryEntry[] {
  return ROOM_REGISTRY_PLACE_IDS.map((placeId) => roomRegistryEntry(placeId));
}
