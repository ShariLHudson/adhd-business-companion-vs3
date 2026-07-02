import { notFound } from "next/navigation";
import { EstateCollectionPreviewClient } from "@/components/estate-collection";
import {
  ESTATE_COLLECTION_ROOM_IDS,
  type EstateCollectionRoomId,
} from "@/lib/estate/collectionFramework";

type Props = {
  params: Promise<{ roomId: string }>;
};

export function generateStaticParams() {
  return ESTATE_COLLECTION_ROOM_IDS.map((roomId) => ({ roomId }));
}

export default async function EstateCollectionRoomPage({ params }: Props) {
  const { roomId } = await params;
  if (!ESTATE_COLLECTION_ROOM_IDS.includes(roomId as EstateCollectionRoomId)) {
    notFound();
  }

  return (
    <EstateCollectionPreviewClient roomId={roomId as EstateCollectionRoomId} />
  );
}
