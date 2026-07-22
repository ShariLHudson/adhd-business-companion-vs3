"use client";

import { useEffect, useState } from "react";
import { HowSparkEstateWorksTogetherPanel } from "@/components/companion/HowSparkEstateWorksTogetherPanel";
import {
  consumePendingHowSparkEstateWorksTogether,
  subscribeHowSparkEstateWorksTogetherOpen,
  type EstateOrientationPlaceId,
  type HowSparkEstateWorksTogetherOpenDetail,
} from "@/lib/estateOrientation";

/**
 * Global host for How Spark Estate Works Together.
 * Mount once near the companion shell — panels open via event bridge.
 */
export function EstateOrientationHost() {
  const [open, setOpen] = useState(false);
  const [focusPlaceId, setFocusPlaceId] =
    useState<EstateOrientationPlaceId | null>(null);
  const [startTour, setStartTour] = useState(false);

  useEffect(() => {
    function applyDetail(detail: HowSparkEstateWorksTogetherOpenDetail) {
      setFocusPlaceId(detail.focusPlaceId ?? null);
      setStartTour(Boolean(detail.startTour));
      setOpen(true);
    }

    const pending = consumePendingHowSparkEstateWorksTogether();
    if (pending) applyDetail(pending);

    return subscribeHowSparkEstateWorksTogetherOpen(applyDetail);
  }, []);

  return (
    <HowSparkEstateWorksTogetherPanel
      open={open}
      onClose={() => setOpen(false)}
      focusPlaceId={focusPlaceId}
      startTour={startTour}
    />
  );
}
