"use client";

import { EstateCollectionRoomEngine } from "./EstateCollectionRoomEngine";
import { JournalGazeboExperience } from "@/components/journal-gazebo/JournalGazeboExperience";
import type { EstateCollectionRoomId } from "@/lib/estate/collectionFramework";

type Nav = {
  onBack: () => void;
  backLabel?: string | null;
};

type Props = {
  roomId: EstateCollectionRoomId;
  nav?: Nav;
  onBack?: () => void;
  backLabel?: string | null;
};

/** Thin wrapper — panels delegate here; engine owns all UI. */
export function EstateCollectionRoomPanel({
  roomId,
  nav,
  onBack,
  backLabel,
}: Props) {
  const back = nav?.onBack ?? onBack ?? (() => {});
  const label = nav?.backLabel ?? backLabel ?? "Companion";

  if (roomId === "journal") {
    return <JournalGazeboExperience onBack={back} backLabel={label} />;
  }

  return (
    <EstateCollectionRoomEngine
      roomId={roomId}
      onBack={back}
      backLabel={label}
    />
  );
}
