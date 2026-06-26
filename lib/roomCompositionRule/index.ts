export {
  evaluateRoomComposition,
  LIVING_FRAME_CLASS,
  roomCompositionHintForChat,
  validateEnvironmentalPlacement,
  validateShariPlacement,
} from "./evaluateRoomComposition";
export { placeForWorkspace } from "./mapWorkspaceToRoom";
export { roomCompositionForPlace, ROOM_COMPOSITION_CATALOG } from "./roomCatalog";
export {
  CENTER_FORBIDDEN_ELEMENTS,
  EDGE_ZONE_LIFE_HINTS,
  isCenterForbidden,
  motionAllowedInZone,
  shariPlacementAllowed,
} from "./rules";
export type {
  CompositionZone,
  EdgeZone,
  RoomCompositionEntry,
  RoomCompositionInput,
  RoomCompositionVerdict,
  SignatureFeatureSpec,
} from "./types";
export { EDGE_ZONES, ROOM_COMPOSITION_PRINCIPLE } from "./types";
