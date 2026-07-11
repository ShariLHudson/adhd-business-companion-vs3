"use client";

import { EstateCollectionRoomPanel } from "@/components/estate-collection";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  /** @deprecated hub navigation — Achievement Library is a collection room */
  onOpenSection?: (section: string) => void;
  onOpenTimeline?: () => void;
};

/** Achievement Library — Spark Estate Collection Framework */
export function GrowthLibraryPanel({ onBack, backLabel }: Props) {
  return (
    <EstateCollectionRoomPanel
      roomId="achievement-library"
      onBack={onBack}
      backLabel={backLabel}
    />
  );
}
