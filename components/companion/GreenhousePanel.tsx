"use client";

import { EstateCollectionRoomPanel } from "@/components/estate-collection";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
};

/** Growth Greenhouse — Spark Estate Collection Framework */
export function GreenhousePanel({ onBack, backLabel }: Props) {
  return (
    <EstateCollectionRoomPanel
      roomId="greenhouse"
      onBack={onBack}
      backLabel={backLabel}
    />
  );
}
