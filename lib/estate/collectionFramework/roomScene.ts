import type { EstateCollectionRoomConfig } from "./types";

/** In-panel room photograph — same plate paths as full-bleed background. */
export function resolveCollectionRoomScene(
  room: Pick<
    EstateCollectionRoomConfig,
    "placeId" | "imagePlaceId" | "backgroundImage" | "roomName" | "roomSceneImage" | "roomSceneAlt"
  >,
) {
  return {
    placeId: room.imagePlaceId ?? room.placeId,
    imageUrl: room.roomSceneImage ?? room.backgroundImage,
    alt: room.roomSceneAlt ?? room.roomName,
  };
}
