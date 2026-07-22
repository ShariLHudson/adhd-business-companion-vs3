"use client";

import { useEffect, useState } from "react";
import { HowSparkEstateWorksTogetherPanel } from "@/components/companion/HowSparkEstateWorksTogetherPanel";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import {
  consumePendingHowSparkEstateWorksTogether,
  subscribeHowSparkEstateWorksTogetherOpen,
  type EstateOrientationPlaceId,
  type HowSparkEstateWorksTogetherOpenDetail,
} from "@/lib/estateOrientation";
import { markFirstTimeExperienceSeen } from "@/lib/firstTimeExperience";

/**
 * Global host for How Spark Estate Works Together.
 * Mount once near the companion shell — panels open via event bridge.
 */
export function EstateOrientationHost() {
  const { user } = useCompanionAuth();
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

  function handleClose() {
    const userId = user?.id;
    if (userId) {
      markFirstTimeExperienceSeen(userId, "how-everything-works-together", {
        disposition: "completed",
      });
      if (startTour) {
        markFirstTimeExperienceSeen(userId, "estate-tour", {
          disposition: "completed",
        });
      }
    }
    setOpen(false);
    setStartTour(false);
  }

  return (
    <HowSparkEstateWorksTogetherPanel
      open={open}
      onClose={handleClose}
      focusPlaceId={focusPlaceId}
      startTour={startTour}
    />
  );
}
