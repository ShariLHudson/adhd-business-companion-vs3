"use client";

import { EstateCollectionRoomPanel } from "@/components/estate-collection";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

/** Journal (White Gazebo) — Spark Estate Collection Framework™ */
export function GrowthJournalPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  return <EstateCollectionRoomPanel roomId="journal" nav={nav} />;
}
