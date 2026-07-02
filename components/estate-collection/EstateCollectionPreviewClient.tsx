"use client";

import { useRouter } from "next/navigation";
import { EstateCollectionRoomEngine } from "./EstateCollectionRoomEngine";
import type { EstateCollectionRoomId } from "@/lib/estate/collectionFramework";

type Props = {
  roomId: EstateCollectionRoomId;
};

/** Standalone preview route — back returns to Companion. */
export function EstateCollectionPreviewClient({ roomId }: Props) {
  const router = useRouter();
  return (
    <EstateCollectionRoomEngine
      roomId={roomId}
      onBack={() => router.push("/companion")}
      backLabel="Companion"
    />
  );
}
