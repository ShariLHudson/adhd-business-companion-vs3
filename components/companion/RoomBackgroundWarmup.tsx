"use client";

import { useEffect } from "react";
import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";
import { GROWTH_ROOM_BG } from "@/lib/growth/growthRoom";
import { PLAN_MY_DAY_MORNING_BG } from "@/lib/planMyDay/morningRoom";
import { scheduleHomesteadRoomBackgroundWarmup } from "@/lib/roomBackgroundPreload";

/** Idle preload — common room art after the companion shell settles. */
export function RoomBackgroundWarmup() {
  useEffect(() => {
    return scheduleHomesteadRoomBackgroundWarmup([
      CLEAR_MY_MIND_CONSERVATORY_BG,
      PLAN_MY_DAY_MORNING_BG,
      GROWTH_ROOM_BG,
    ]);
  }, []);
  return null;
}
