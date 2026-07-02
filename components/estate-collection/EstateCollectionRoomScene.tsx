import { EstateGuideSpreadPlate } from "@/components/estate-guide/EstateGuideSpreadPlate";
import { resolveCollectionRoomScene } from "@/lib/estate/collectionFramework/roomScene";
import type { EstateCollectionRoomConfig } from "@/lib/estate/collectionFramework/types";

type Props = {
  room: Pick<
    EstateCollectionRoomConfig,
    | "placeId"
    | "imagePlaceId"
    | "backgroundImage"
    | "roomName"
    | "roomSceneImage"
    | "roomSceneAlt"
  >;
};

/** Room photograph inside the collection panel — you are here. */
export function EstateCollectionRoomScene({ room }: Props) {
  const scene = resolveCollectionRoomScene(room);

  return (
    <EstateGuideSpreadPlate
      placeId={scene.placeId}
      imageUrl={scene.imageUrl}
      alt={scene.alt}
      className="estate-collection-panel__scene"
    />
  );
}
