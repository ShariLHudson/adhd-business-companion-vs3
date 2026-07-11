"use client";

import { EstateCollectionRoomPanel } from "@/components/estate-collection";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
};

/** Celebration Hall — Spark Estate Collection Framework */
export function GrowthReportsPage({ onBack, backLabel }: Props) {
  return (
    <EstateCollectionRoomPanel
      roomId="celebration-hall"
      onBack={onBack}
      backLabel={backLabel}
    />
  );
}
